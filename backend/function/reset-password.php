<?php
include '../config/database.php';
include '../config/mail_config.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Please use POST."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Data not received"]);
    exit;
}

$email = $data['email'] ?? null;
$otp = $data['otp'] ?? null;
$new_password = $data['new_password'] ?? null;

if (empty($email) || empty($otp) || empty($new_password)) {
    echo json_encode(["success" => false, "message" => "Email, OTP, and new password are required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit;
}

$stmt = $conn->prepare("SELECT password_reset_token, password_reset_expiry FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not found"]);
    exit;
}

$user = $result->fetch_assoc();
$stored_otp = $user['password_reset_token'];
$otp_expiry = $user['password_reset_expiry'];

if ($otp !== $stored_otp) {
    echo json_encode(["success" => false, "message" => "Invalid OTP"]);
    exit;
}

if (strtotime($otp_expiry) < time()) {
    echo json_encode(["success" => false, "message" => "OTP has expired"]);
    exit;
}

$password_hash = password_hash($new_password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expiry = NULL WHERE email = ?");
$stmt->bind_param("ss", $password_hash, $email);
$stmt->execute();

echo json_encode([
    "success" => true,
    "message" => "Password updated successfully."
]);
?>