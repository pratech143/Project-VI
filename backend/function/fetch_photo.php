<?php
session_start();
include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User ID is required"]);
    exit;
}

$user_id = intval($_SESSION['user_id']);

$query = "SELECT profile_photo FROM users WHERE user_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

if ($user['profile_photo']) {
    $profile_photo_base64 = base64_encode($user['profile_photo']);
} else {
    $profile_photo_base64 = null; 
}

echo json_encode([
    "success" => true,
    "profile_photo" => $profile_photo_base64
]);
?>