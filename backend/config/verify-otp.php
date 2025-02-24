<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';
include '../config/encryption.php';

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
$encrypted_password = $_SESSION['registration_data']['password'];

try {
    $conn->begin_transaction();

    // Prepare the insert statement
    $stmt = $conn->prepare("INSERT INTO users (email, password, voter_id, is_email_verified, role) VALUES (?, ?, ?, TRUE, 0)");

    if ($stmt === false) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    // Bind the parameters for the prepared statement
    $stmt->bind_param("sss", $email, $encrypted_password, $voter_id);

    if (!$stmt->execute()) {
        throw new Exception("Failed to execute statement: " . $stmt->error);
    }

    $conn->commit();

    unset($_SESSION['otp'][$email]);
    unset($_SESSION['registration_data']);

    echo json_encode([
        "success" => true,
        "message" => "OTP verified successfully. Your account has been created."
    ]);
} catch (Exception $e) {
    $conn->rollback();

    error_log("Error: " . $e->getMessage());

    echo json_encode(["success" => false, "message" => "Error verifying OTP: " . $e->getMessage()]);
}
?>