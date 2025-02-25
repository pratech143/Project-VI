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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Please use POST."]);
    exit;
}

if (empty($_FILES) || !isset($_FILES['profile_photo'])) {
    error_log("No file uploaded in \$_FILES['profile_photo']. Request headers: " . print_r(getallheaders(), true));
    echo json_encode(["success" => false, "message" => "No file data received."]);
    exit;
}

$file = $_FILES['profile_photo'];
$allowed_types = ['image/jpeg', 'image/png', 'image/jpg']; // Match upload_profile_photo.php

if (!in_array($file['type'], $allowed_types)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid file type. Only JPG, JPEG, and PNG are allowed."]);
    exit;
}

if ($file['size'] > 5 * 1024 * 1024) { // Match upload_profile_photo.php's 5MB limit
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "File size exceeds 5MB limit."]);
    exit;
}

$imageData = file_get_contents($file['tmp_name']);

if ($imageData === false) {
    error_log("Failed to read uploaded file: " . $file['tmp_name']);
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Failed to read uploaded file."]);
    exit;
}

error_log("Uploaded profile photo size: " . strlen($imageData));

try {
    $stmt = $conn->prepare("UPDATE users SET profile_photo = ? WHERE user_id = ?");
    $stmt->bind_param("bi", $imageData, $user_id);
    $stmt->send_long_data(0, $imageData); // For large BLOBs
    $stmt->execute();

    if ($stmt->affected_rows <= 0) {
        echo json_encode(["success" => false, "message" => "Failed to update database. Please try again."]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Profile photo uploaded successfully."
    ]);

} catch (Exception $e) {
    error_log("Error uploading profile photo for user_id $user_id: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "An error occurred while uploading the profile photo. Please try again."]);
}
?>