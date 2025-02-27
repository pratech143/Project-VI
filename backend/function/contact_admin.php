<?php
include '../config/database.php';
include '../config/mail_config.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email']) || !isset($data['voter_id']) || !isset($data['message'])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid data. Email, Voter ID, and message are required."
    ]);
    exit;
}

$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$voter_id = htmlspecialchars($data['voter_id'], ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($data['message'], ENT_QUOTES, 'UTF-8');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email format."
    ]);
    exit;
}

if (empty($voter_id)) {
    echo json_encode([
        "success" => false,
        "message" => "Voter ID cannot be empty."
    ]);
    exit;
}

if (strlen($message) < 10) {
    echo json_encode([
        "success" => false,
        "message" => "Message must be at least 10 characters long."
    ]);
    exit;
}

$to = 'aprabhat80@gmail.com'; 
$subject = "Assistance Request: Voter ID Issue - " . $voter_id;
$email_body = "From: " . $email . "\n";
$email_body .= "Voter ID: " . $voter_id . "\n";
$email_body .= "Message: " . $message . "\n\n";
$email_body .= "Please assist this user with their login issue.";

if (sendEmail($to, $subject, $email_body)) {
    echo json_encode([
        "success" => true,
        "message" => "Your request has been sent to the admin. We’ll get back to you soon."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to send your request. Please try again later."
    ]);
}
?>