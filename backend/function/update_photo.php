<?php
include '../config/database.php';
include '../config/mail_config.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Data not received"]);
    exit;
}

$user_id = $data['user_id'] ?? null;
$profile_photo = $_FILES['profile_photo'] ?? null;

if (empty($user_id)) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit;
}

if (!$profile_photo || !isset($profile_photo['tmp_name'])) {
    echo json_encode(["success" => false, "message" => "Profile photo required"]);
    exit;
}

$image_info = getimagesize($profile_photo['tmp_name']);
if ($image_info === false) {
    echo json_encode(["success" => false, "message" => "Invalid image file"]);
    exit;
}

if ($profile_photo['size'] > 12 * 1024 * 1024) {
    echo json_encode(["success" => false, "message" => "File size > 12 MB"]);
    exit;
}

$image_data = file_get_contents($profile_photo['tmp_name']);

$stmt = $conn->prepare("UPDATE users SET profile_photo = ? WHERE user_id = ?");
$stmt->bind_param("bi", $null_value = NULL, $user_id);
$stmt->send_long_data(0, $image_data); 
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode([
        "success" => true,
        "message" => "Profile updated successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update profile. Try again."
    ]);
}
?>