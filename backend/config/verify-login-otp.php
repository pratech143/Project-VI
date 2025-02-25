<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit;
}

$email = $data['email'] ?? null;
$token = $data['token'] ?? null;

if (empty($email) || empty($token)) {
    echo json_encode(["success" => false, "message" => "Email and OTP are required"]);
    exit;
}

$check_attempts = $conn->prepare("SELECT failed_count, last_attempt FROM failed_attempts WHERE email = ?");
$check_attempts->bind_param("s", $email);
$check_attempts->execute();
$attempts_result = $check_attempts->get_result();

$failed_attempts = 0;
$last_attempt_time = null;

if ($attempts_result->num_rows > 0) {
    $row = $attempts_result->fetch_assoc();
    $failed_attempts = $row['failed_count'];
    $last_attempt_time = strtotime($row['last_attempt']);
}

if ($failed_attempts >= 5 && (time() - $last_attempt_time) < 600) {
    echo json_encode(["success" => false, "message" => "Too many failed attempts. Try again in 10 minutes."]);
    exit;
}

if (!isset($_SESSION['token'][$email])) {
    echo json_encode(["success" => false, "message" => "No OTP found for this email. Please log in again."]);
    exit;
}

if ($_SESSION['token'][$email]['token'] != $token) {

    if ($failed_attempts == 0) {
        $insert_attempt = $conn->prepare("INSERT INTO failed_attempts (email, failed_count) VALUES (?, 1)");
        $insert_attempt->bind_param("s", $email);
        $insert_attempt->execute();
    } else {
        $update_attempt = $conn->prepare("UPDATE failed_attempts SET failed_count = failed_count + 1, last_attempt = NOW() WHERE email = ?");
        $update_attempt->bind_param("s", $email);
        $update_attempt->execute();
    }

    echo json_encode(["success" => false, "message" => "Invalid OTP"]);
    exit;
}

if ($_SESSION['token'][$email]['expiry'] < time()) {
    unset($_SESSION['token'][$email]);
    echo json_encode(["success" => false, "message" => "OTP has expired. Please log in again."]);
    exit;
}

if (!isset($_SESSION['login_data'])) {
    echo json_encode(["success" => false, "message" => "Session expired. Please log in again."]);
    exit;
}

$user_id = $_SESSION['login_data']['user_id'];
$email = $_SESSION['login_data']['email'];
$voter_id = $_SESSION['login_data']['voter_id'];
$role = $_SESSION['login_data']['role'];

$_SESSION['user_id'] = $user_id;
$_SESSION['email'] = $email;
$_SESSION['voter_id'] = $voter_id;
$_SESSION['role'] = $role;

unset($_SESSION['token'][$email]);
unset($_SESSION['login_data']);

$reset_attempts = $conn->prepare("DELETE FROM failed_attempts WHERE email = ?");
$reset_attempts->bind_param("s", $email);
$reset_attempts->execute();

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "user" => [
        "user_id" => $user_id,
        "email" => $email,
        "voter_id" => $voter_id,
        "role" => $role,
    ]
]);
?>