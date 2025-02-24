<?php
include '../config/database.php';
include '../config/handle_cors.php';
include '../config/mail_config.php';

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
$password = $data['password'] ?? null;

if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

$clear_expired_stmt = $conn->prepare("UPDATE users SET otp = NULL, otp_expiry = NULL WHERE otp_expiry < NOW()");
$clear_expired_stmt->execute();

$user_check = $conn->prepare("SELECT user_id, email, password, is_email_verified FROM users WHERE email = ?");
$user_check->bind_param("s", $email);
$user_check->execute();
$user_result = $user_check->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not found"]);
    exit;
}

$user = $user_result->fetch_assoc();

if (!password_verify($password, $user['password'])) {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
    exit;
}

if (!$user['is_email_verified']) {
    echo json_encode(["success" => false, "message" => "Email not verified. Please verify your email before logging in."]);
    exit;
}

$otp = rand(100000, 999999);
$otp_expiry = date('Y-m-d H:i:s', strtotime('+5 minutes'));

$otp_stmt = $conn->prepare("UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?");
$otp_stmt->bind_param("sss", $otp, $otp_expiry, $email);
$otp_stmt->execute();

$subject = "Your Login OTP for Election System";
$message = "Your OTP for login is: $otp. It will expire in 5 minutes.";

if (sendEmail($email, $subject, $message)) {
    echo json_encode([
        "success" => true,
        "message" => "OTP sent to $email. Please verify."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to send OTP email."
    ]);
}
?>