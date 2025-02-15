<?php
//upload voter_id_image
include '../config/database.php';
include '../config/handle_cors.php';
include '../config/mail_config.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id']) || !isset($_SESSION['voter_id']) || !isset($_SESSION['email'])) {
    echo json_encode(["success" => false, "message" => "You are not logged in."]);
    exit;
}

$voter_id = $_SESSION['voter_id'];

if (!isset($_FILES['voter_id_image']) || $_FILES['voter_id_image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "No file uploaded or an error occurred."]);
    exit;
}

$file = $_FILES['voter_id_image'];
$allowed_types = ['image/jpeg', 'image/png', 'image/jpg'];

if (!in_array($file['type'], $allowed_types)) {
    echo json_encode(["success" => false, "message" => "Invalid file type. Only JPG, JPEG, and PNG are allowed."]);
    exit;
}

if ($file['size'] > 12 * 1024 * 1024) {
    echo json_encode(["success" => false, "message" => "File size exceeds 12MB limit."]);
    exit;
}

$stmt = $conn->prepare("SELECT is_verified FROM users WHERE voter_id = ?");
$stmt->bind_param("s", $voter_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user['is_verified'] == 1) {
    echo json_encode(["success" => false, "message" => "You are already verified. No need to upload again."]);
    exit;
}

$imageData = file_get_contents($file['tmp_name']);

$stmt = $conn->prepare("UPDATE users SET voter_id_image = ?, is_verified = 0 WHERE voter_id = ?");
$stmt->bind_param("bs", $imageData, $voter_id);
$stmt->send_long_data(0, $imageData);
$stmt->execute();

echo json_encode(["success" => true, "message" => "Voter ID uploaded successfully. Pending admin approval."]);
?>