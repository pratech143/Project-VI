<?php
header('Content-Type: application/json');
include '../config/database.php';
include '../config/handle_cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

    try {

        $stmt = $conn->prepare("SELECT otp, otp_expiry FROM users WHERE email = ? AND otp = ?");
        $stmt->bind_param("ss", $email, $otp);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if (!$user) {
            echo json_encode(["success" => false, "message" => "Invalid OTP or email."]);
            exit;
        }

        if (strtotime($user['otp_expiry']) < time()) {
            echo json_encode(["success" => false, "message" => "OTP has expired. Please request a new one."]);
            exit;
        }

        $update_stmt = $conn->prepare("UPDATE users SET is_email_verified = TRUE, otp = NULL, otp_expiry = NULL WHERE email = ?");
        $update_stmt->bind_param("s", $email);
        $update_stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "OTP verified successfully. Your email has been verified."
        ]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error verifying OTP: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>