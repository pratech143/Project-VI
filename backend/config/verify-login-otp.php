<?php
session_start();
include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json'); 

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Please use POST."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? null;
$otp = $data['otp'] ?? null;

if (empty($email) || empty($otp)) {
    echo json_encode(["success" => false, "message" => "Email and OTP are required"]);
    exit;
}

$stmt = $conn->prepare("SELECT user_id, role, voter_id, is_voted, otp, otp_expiry FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$user = $result->fetch_assoc();

if ($user['otp_expiry'] && strtotime($user['otp_expiry']) < time()) {
    $clear_expired_otp_stmt = $conn->prepare("UPDATE users SET otp = NULL, otp_expiry = NULL WHERE email = ?");
    $clear_expired_otp_stmt->bind_param("s", $email);
    $clear_expired_otp_stmt->execute();

    echo json_encode(["success" => false, "message" => "OTP expired. Please log in again."]);
    exit;
}

if ($user['otp'] != $otp) {
    echo json_encode(["success" => false, "message" => "Invalid OTP"]);
    exit;
}

$clear_otp_stmt = $conn->prepare("UPDATE users SET otp = NULL, otp_expiry = NULL WHERE email = ?");
$clear_otp_stmt->bind_param("s", $email);
$clear_otp_stmt->execute();

$_SESSION['user_id'] = $user['user_id'];
$_SESSION['role'] = ($user['role'] == 1) ? 'admin' : 'voter';
$_SESSION['email'] = $email;
$_SESSION['voter_id'] = $user['voter_id'] ?? null;
$_SESSION['is_voted'] = $user['is_voted'];

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "role" => $_SESSION['role'],
    "user_id" => $_SESSION['user_id'],
    "email" => $_SESSION['email'],
    "voter_id" => $_SESSION['voter_id'] ?? null,
]);
?>