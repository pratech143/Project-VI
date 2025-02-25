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

if (!isset($_SESSION['otp'][$email])) {
    echo json_encode(["success" => false, "message" => "No OTP found for this email. Please register again."]);
    exit;
}

if ($_SESSION['otp'][$email]['otp'] != $otp) {
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

    $stmt = $conn->prepare("INSERT INTO users (email, password, voter_id, is_email_verified, role) VALUES (?, ?, ?, TRUE, 0)");
    if ($stmt === false) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    $stmt->bind_param("sss", $email, $encrypted_password, $voter_id);
    if (!$stmt->execute()) {
        throw new Exception("Failed to execute statement: " . $stmt->error);
    }

    $conn->commit();

    unset($_SESSION['otp'][$email]);
    unset($_SESSION['registration_data']);

    $delete_attempts = $conn->prepare("DELETE FROM failed_attempts WHERE email = ?");
    $delete_attempts->bind_param("s", $email);
    $delete_attempts->execute();

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