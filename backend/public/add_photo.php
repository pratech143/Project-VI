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

if ($profile_photo['size'] > 12 * 1024 * 1024) { // 12MB limit
    echo json_encode(["success" => false, "message" => "File size exceeds 12MB"]);
    exit;
}

$upload_dir = __DIR__ . "/uploads/";
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$file_ext = strtolower(pathinfo($profile_photo["name"], PATHINFO_EXTENSION));
$file_name = "profile_" . $user_id . "_" . time() . "." . $file_ext;
$file_path = $upload_dir . $file_name;

if (!move_uploaded_file($profile_photo["tmp_name"], $file_path)) {
    echo json_encode(["success" => false, "message" => "Failed to upload photo. Try again."]);
    exit;
}

// Remove old profile photo if it exists
if ($old_photo && file_exists($upload_dir . $old_photo)) {
    unlink($upload_dir . $old_photo);
}

$stmt = $conn->prepare("UPDATE users SET profile_photo = ? WHERE user_id = ?");
$stmt->bind_param("si", $file_name, $user_id);
$stmt->execute();

$file_url = "http://localhost/Project-VI/Project-VI/backend/public/uploads/" . $file_name;

if ($stmt->affected_rows > 0) {
    echo json_encode([
        "success" => true,
        "message" => "Profile uploaded successfully.",
        "file_url" => $file_url
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to save photo in database."]);
}
?>