<?php
// upload_voter_id_image.php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';
include '../config/mail_config.php'; // For potential email notifications

header('Content-Type: application/json');

// Authentication check
if (!isset($_SESSION['user_id']) || !isset($_SESSION['voter_id']) || !isset($_SESSION['email'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["success" => false, "message" => "You are not logged in."]);
    exit;
}

$voter_id = $_SESSION['voter_id'];
$email = $_SESSION['email'];
$user_id = $_SESSION['user_id'];

// Check if file is uploaded and valid
if (!isset($_FILES['voter_id_image']) || $_FILES['voter_id_image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => "No file uploaded or an error occurred."]);
    exit;
}

$file = $_FILES['voter_id_image'];

// Validate file type and size
$allowed_types = ['image/jpeg', 'image/png', 'image/jpg'];
if (!in_array($file['type'], $allowed_types)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid file type. Only JPG, JPEG, and PNG are allowed."]);
    exit;
}

if ($file['size'] > 12 * 1024 * 1024) { // 12MB limit
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "File size exceeds 12MB limit."]);
    exit;
}

// Additional validation: Check image dimensions and integrity
$image_info = getimagesize($file['tmp_name']);
if (!$image_info) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid image file."]);
    exit;
}

// Optional: Limit image dimensions (e.g., max 2000x2000 pixels)
$max_width = 2000;
$max_height = 2000;
if ($image_info[0] > $max_width || $image_info[1] > $max_height) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Image dimensions exceed maximum allowed size (2000x2000 pixels)."]);
    exit;
}

try {
    // Check if user is already verified
    $stmt = $conn->prepare("SELECT is_verified FROM users WHERE voter_id = ?");
    $stmt->bind_param("s", $voter_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found."]);
        exit;
    }

    if ($user['is_verified'] == 1) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "You are already verified. No need to upload again."]);
        exit;
    }

    // Read and store image as BLOB
    $imageData = file_get_contents($file['tmp_name']);

    // Update database with BLOB data
    $stmt = $conn->prepare("UPDATE users SET voter_id_image = ?, is_verified = 0 WHERE voter_id = ?");
    $stmt->bind_param("bs", $imageData, $voter_id);
    $stmt->send_long_data(0, $imageData);
    $stmt->execute();

    if ($stmt->affected_rows <= 0) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update database. Please try again."]);
        exit;
    }

    // Notify admin via email about the new upload
    sendEmail(
        "admin@example.com", // Replace with actual admin email
        "New Voter ID Upload Pending",
        "A new voter ID has been uploaded by voter ID $voter_id (Email: $email). Please review it at the admin panel."
    );

    // Return success response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Voter ID uploaded successfully. Pending admin approval."
    ]);

} catch (Exception $e) {
    // Log error for debugging (without exposing to client)
    error_log("Error uploading voter ID for voter_id $voter_id: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "An error occurred while uploading the voter ID. Please try again."]);
}