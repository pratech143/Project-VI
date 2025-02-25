<?php
// public/get_voter_id.php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');


// Authentication check
if (!isset($_SESSION['user_id']) || !isset($_SESSION['voter_id']) || !isset($_SESSION['email'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["success" => false, "message" => "You are not logged in."]);
    exit;
}

$voter_id = $_SESSION['voter_id'];

try {
    // Fetch voter_id_image from the database
    $stmt = $conn->prepare("SELECT voter_id_image FROM users WHERE voter_id = ?");
    $stmt->bind_param("s", $voter_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found."]);
        exit;
    }

    if (empty($user['voter_id_image'])) {
        http_response_code(200);
        echo json_encode(["success" => true, "voter_id_image" => null, "message" => "No voter ID image uploaded."]);
        exit;
    }

    // Convert BLOB to Base64
    $base64Image = base64_encode($user['voter_id_image']);

    // Return success response with Base64 data
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "voter_id_image" => $base64Image,
        "message" => "Voter ID image retrieved successfully."
    ]);

} catch (Exception $e) {
    // Log error for debugging (without exposing to client)
    error_log("Error fetching voter ID image for voter_id $voter_id: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "An error occurred while fetching the voter ID image. Please try again."]);
}