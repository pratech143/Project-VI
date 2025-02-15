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

$voter_id = $data['voter_id'] ?? null;
$email = $data['email'] ?? null;
$password = $data['password'] ?? null;

if (empty($voter_id) || empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit;
}

$voter_check = $conn->prepare("SELECT voter_id FROM government_voters WHERE voter_id = ?");
$voter_check->bind_param("s", $voter_id);
$voter_check->execute();
$voter_result = $voter_check->get_result();

if ($voter_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Voter ID not found"]);
    exit;
}

$user_check = $conn->prepare("SELECT voter_id FROM users WHERE voter_id = ?");
$user_check->bind_param("s", $voter_id);
$user_check->execute();
$user_result = $user_check->get_result();

if ($user_result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "User already registered"]);
    exit;
}

$password_hash = password_hash($password, PASSWORD_DEFAULT);
$otp = rand(100000, 999999);
$otp_expiry = date('Y-m-d H:i:s', strtotime('+15 minutes'));

try {
    $stmt = $conn->prepare("INSERT INTO users (email, password, voter_id, otp, otp_expiry, role) VALUES (?, ?, ?, ?, ?, 0)");
    $stmt->bind_param("sssss", $email, $password_hash, $voter_id, $otp, $otp_expiry);
    $stmt->execute();

    $subject = "Email Verification for Election System";
    $message = "Your OTP code is: $otp. It will expire in 15 minutes.";

    if (sendEmail($email, $subject, $message)) {
        echo json_encode([
            "success" => true,
            "message" => "Registration successful. Please verify your email using the OTP sent to $email"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Registration successful, but failed to send OTP email"
        ]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error during registration: " . $e->getMessage()]);
}
?>