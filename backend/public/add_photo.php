<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if (!isset($_SESSION['email'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized access"]);
    exit;
}

$email = $_SESSION['email'];
$query = "SELECT user_id, profile_photo FROM users WHERE email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$user_id = $user['user_id'];
$old_photo = $user['profile_photo'];

if (!isset($_FILES['profile_photo']) || $_FILES['profile_photo']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "No file uploaded or upload error"]);
    exit;
}

$profile_photo = $_FILES['profile_photo'];
$image_info = getimagesize($profile_photo['tmp_name']);

if (!$image_info) {
    echo json_encode(["success" => false, "message" => "Invalid image file"]);
    exit;
}

$allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($image_info['mime'], $allowed_types)) {
    echo json_encode(["success" => false, "message" => "Only JPG, PNG, and GIF images are allowed"]);
    exit;
}

if ($profile_photo['size'] > 12 * 1024 * 1024) { 
    echo json_encode(["success" => false, "message" => "File size exceeds 12MB"]);
    exit;
}

try {
    $image_data = file_get_contents($profile_photo['tmp_name']);

    $stmt = $conn->prepare("UPDATE users SET profile_photo = ? WHERE user_id = ?");
    $stmt->bind_param("bi", $null, $user_id); 
    $stmt->send_long_data(0, $image_data); 
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Profile photo uploaded successfully."
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to save photo in database."]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error uploading profile photo: " . $e->getMessage()]);
}
?>