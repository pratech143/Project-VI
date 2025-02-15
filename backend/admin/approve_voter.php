<?php
include '../config/database.php';
include '../config/handle_cors.php';
include '../config/mail_config.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) {
    echo json_encode(["success" => false, "message" => "Unauthorized access."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$voter_id = $data['voter_id'] ?? null;
$action = $data['action'] ?? null;

if (!$voter_id || !in_array($action, ["approve", "reject"])) {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

$stmt = $conn->prepare("SELECT email FROM users WHERE voter_id = ?");
$stmt->bind_param("s", $voter_id);
$stmt->execute();
$result = $stmt->get_result();
$voter = $result->fetch_assoc();

if (!$voter) {
    echo json_encode(["success" => false, "message" => "Voter not found."]);
    exit;
}

$email = $voter['email'];

if ($action === "approve") {
    $stmt = $conn->prepare("UPDATE users SET is_verified = 1 WHERE voter_id = ?");
    $message = "Congratulations! Your voter ID has been successfully verified. You are now eligible to vote.";
} else {
    $stmt = $conn->prepare("UPDATE users SET is_verified = -1 WHERE voter_id = ?");
    $message = "Unfortunately, your voter ID verification was rejected. You may re-upload your voter ID image.";
}

$stmt->bind_param("s", $voter_id);
$stmt->execute();

$subject = ($action === "approve") ? "Voter Verification Approved" : "Voter Verification Rejected";
sendEmail($email, $subject, $message);

echo json_encode(["success" => true, "message" => "Voter $action successfully. Email sent."]);
?>