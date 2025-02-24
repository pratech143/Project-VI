<?php
session_start();
include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

// Check if user_id is provided
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User ID is required"]);
    exit;
}

$user_id = intval($_SESSION['user_id']); // Convert to integer for security

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

// Construct full image URL if profile photo exists
if ($user['profile_photo']) {
    $file_url = "http://localhost/Project-VI/Project-VI/backend/public/uploads/" . $user['profile_photo'];
} else {
    $file_url = null; // User has no profile photo
}

echo json_encode([
    "success" => true,
    "profile_photo" => $file_url
]);
?>