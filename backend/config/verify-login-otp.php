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

if (empty($email) ) {
    echo json_encode(["success" => false, "message" => "Email and OTP are required"]);
    exit;
}

if (!isset($_SESSION['token'][$email])) {
    echo json_encode(["success" => false, "message" => "No OTP found for this email. Please log in again."]);
    exit;
} else {
    echo json_encode(["success" => true, "message" => "OTP found in session", "Token" => $_SESSION['token'][$email]]);
}

if ($_SESSION['token'][$email]['token'] != $token) {
    echo json_encode(["success" => false, "message" => "Invalid OTP"]);
    exit;
}

if ($_SESSION['token'][$email]['expiry'] < time()) {
    unset($_SESSION['token'][$email]);
    echo json_encode(["success" => false, "message" => "OTP has expired. Please log in again."]);
    exit;
}

$user_id = $_SESSION['login_data']['user_id'];
$email = $_SESSION['login_data']['email'];
$voter_id = $_SESSION['login_data']['voter_id'];

$_SESSION['user_id'] = $user_id;
$_SESSION['email'] = $email;
$_SESSION['voter_id'] = $voter_id;

unset($_SESSION['token'][$email]);
unset($_SESSION['login_data']);

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "user" => [
        "user_id" => $user_id,
        "email" => $email,
        "voter_id" => $voter_id
    ]
]);
?>