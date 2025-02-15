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

if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Email is required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit;
}

$stmt = $conn->prepare("SELECT email FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not found"]);
    exit;
}

$otp = rand(100000, 999999);
$otp_expiry = date('Y-m-d H:i:s', strtotime('+15 minutes'));

$stmt = $conn->prepare("UPDATE users SET password_reset_token = ?, password_reset_expiry = ? WHERE email = ?");
$stmt->bind_param("sss", $otp, $otp_expiry, $email);
$stmt->execute();

$subject = "Password Reset OTP for Election System";
$message = "Your OTP code is: $otp. It will expire in 15 minutes.";

if (sendEmail($email, $subject, $message)) {
    echo json_encode([
        "success" => true,
        "message" => "OTP has been sent to your email. Please check your inbox."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to send OTP. Please try again later."
    ]);
}
?>