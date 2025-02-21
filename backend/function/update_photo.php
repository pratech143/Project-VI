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
$query = "SELECT user_id FROM users WHERE email = ?";
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

if (!isset($_FILES['profile_photo']) || !isset($_FILES['profile_photo']['tmp_name'])) {
    echo json_encode(["success" => false, "message" => "Profile photo required"]);
    exit;
}

$profile_photo = $_FILES['profile_photo'];

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