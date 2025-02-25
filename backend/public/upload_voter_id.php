<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');
if (!isset($_SESSION['user_id']) || !isset($_SESSION['voter_id']) || !isset($_SESSION['email'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["success" => false, "message" => "You are not logged in."]);
    exit;
}

$voter_id = $_SESSION['voter_id'];
$email = $_SESSION['email'];
$user_id = $_SESSION['user_id'];
if (!isset($_FILES['voter_id_image'])) {
    error_log("No file uploaded in \$_FILES['voter_id_image']. Request headers: " . print_r(getallheaders(), true));
    echo json_encode(["success" => false, "message" => "No file data received."]);
    exit;
}

$file = $_FILES['voter_id_image'];
$imageData = file_get_contents($file['tmp_name']);

if ($imageData === false) {
    error_log("Failed to read uploaded file: " . $file['tmp_name']);
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Failed to read uploaded file."]);
    exit;
}

error_log("Uploaded file size: " . strlen($imageData));

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

    // Update database with BLOB data
    $stmt = $conn->prepare("UPDATE users SET voter_id_image = ?, is_verified = 0 WHERE voter_id = ?");
    $stmt->bind_param("bs", $imageData, $voter_id);
    $stmt->send_long_data(0, $imageData); // For large BLOBs
    $stmt->execute();

    if ($stmt->affected_rows <= 0) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update database. Please try again."]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Voter ID uploaded successfully. Pending admin approval."
    ]);

} catch (Exception $e) {
    // Log error for debugging
    error_log("Error uploading voter ID for voter_id $voter_id: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "An error occurred while uploading the voter ID. Please try again."]);
}
?>