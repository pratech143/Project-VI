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
$otp = $data['otp'] ?? null;

if (empty($email) || empty($otp)) {
    echo json_encode(["success" => false, "message" => "Email and OTP are required"]);
    exit;
}

if (!isset($_SESSION['otp'][$email])) {
    echo json_encode(["success" => false, "message" => "No OTP found for this email. Please register again."]);
    exit;
}

if ($_SESSION['otp'][$email]['otp'] != $otp) {
    echo json_encode(["success" => false, "message" => "Invalid OTP"]);
    exit;
}

if ($_SESSION['otp'][$email]['expiry'] < time()) {
    unset($_SESSION['otp'][$email]);
    echo json_encode(["success" => false, "message" => "OTP has expired. Please request a new one."]);
    exit;
}

if (!isset($_SESSION['registration_data'])) {
    echo json_encode(["success" => false, "message" => "Session expired. Please register again."]);
    exit;
}

$voter_id = $_SESSION['registration_data']['voter_id'];
$email = $_SESSION['registration_data']['email'];
$password_hash = $_SESSION['registration_data']['password'];

try {
    $stmt = $conn->prepare("INSERT INTO users (email, password, voter_id, is_email_verified, role) VALUES (?, ?, ?, TRUE, 0)");
    $stmt->bind_param("sss", $email, $password_hash, $voter_id);
    $stmt->execute();

    unset($_SESSION['otp'][$email]);
    unset($_SESSION['registration_data']);

    echo json_encode([
        "success" => true,
        "message" => "OTP verified successfully. Your account has been created."
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error verifying OTP: " . $e->getMessage()]);
}
?>