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

// Read raw file data from php://input
$rawData = file_get_contents('php://input');
if (empty($rawData)) {
    error_log("No raw data received in php://input. Request headers: " . print_r(getallheaders(), true));
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => "No file data received or an error occurred."]);
    exit;
}

// Log raw data length for debugging (optional, careful with large files)
error_log("Raw data length: " . strlen($rawData));

// Simulate temporary file handling (since $_FILES isn't used)
$tempDir = sys_get_temp_dir();
if (!is_writable($tempDir)) {
    error_log("Temporary directory $tempDir is not writable");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Temporary directory not writable."]);
    exit;
}

$tempFile = tempnam($tempDir, 'voterid_');
if ($tempFile === false) {
    error_log("Failed to create temporary file in $tempDir");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Failed to create temporary file."]);
    exit;
}

if (file_put_contents($tempFile, $rawData) === false) {
    error_log("Failed to write raw data to temporary file: $tempFile");
    if (file_exists($tempFile)) unlink($tempFile);
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Failed to store temporary file."]);
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
        unlink($tempFile); // Clean up temporary file
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found."]);
        exit;
    }

    if ($user['is_verified'] == 1) {
        unlink($tempFile); // Clean up temporary file
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "You are already verified. No need to upload again."]);
        exit;
    }

    // Read and store data as BLOB from temporary file (no type or size checks)
    $data = file_get_contents($tempFile);

    // Update database with BLOB data
    $stmt = $conn->prepare("UPDATE users SET voter_id_image = ?, is_verified = 0 WHERE voter_id = ?");
    $stmt->bind_param("bs", $data, $voter_id);
    $stmt->send_long_data(0, $data);
    $stmt->execute();

    if ($stmt->affected_rows <= 0) {
        unlink($tempFile); // Clean up temporary file
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update database. Please try again."]);
        exit;
    }

    // Notify admin via email about the new upload
    sendEmail(
        "prtkchapagain@gmail.com", // Replace with actual admin email
        "New Voter ID Upload Pending",
        "A new voter ID has been uploaded by voter ID $voter_id (Email: $email). Please review it at the admin panel."
    );

    // Clean up temporary file
    unlink($tempFile);

    // Return success response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Voter ID uploaded successfully. Pending admin approval."
    ]);

} catch (Exception $e) {
    // Clean up temporary file in case of error
    if (file_exists($tempFile)) {
        unlink($tempFile);
    }
    // Log error for debugging (without exposing to client)
    error_log("Error uploading voter ID for voter_id $voter_id: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "An error occurred while uploading the voter ID. Please try again."]);
}