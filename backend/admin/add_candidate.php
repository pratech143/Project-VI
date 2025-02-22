<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized. Please log in."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$user_query = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
$user_query->bind_param("i", $user_id);
$user_query->execute();
$user_result = $user_query->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit;
}

$user = $user_result->fetch_assoc();

if ($user['role'] != 1) { 
    echo json_encode(["success" => false, "message" => "Access denied. Only admins can add candidates."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "No data received."]);
    exit;
}

$candidate_name = $data['candidate_name'] ?? null;
$party_name = $data['party_name'] ?? null;
$district_name = $data['district_name'] ?? null;
$location_name = $data['location_name'] ?? null;
$location_type = $data['location_type'] ?? null;
$ward = $data['ward'] ?? null;
$post_name = $data['post_name'] ?? null;

if (!$candidate_name || !$party_name || !$district_name || !$location_name || !$location_type || !$post_name) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

$location_query = $conn->prepare("
    SELECT location_id FROM locations 
    WHERE district_name = ? AND location_name = ? AND location_type = ? 
    LIMIT 1
");
$location_query->bind_param("sss", $district_name, $location_name, $location_type);
$location_query->execute();
$location_result = $location_query->get_result();

if ($location_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Location not found."]);
    exit;
}

$location_data = $location_result->fetch_assoc();
$location_id = $location_data['location_id'];

$post_query = $conn->prepare("SELECT post_id FROM posts WHERE post_name = ? LIMIT 1");
$post_query->bind_param("s", $post_name);
$post_query->execute();
$post_result = $post_query->get_result();

if ($post_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Post not found."]);
    exit;
}

$post_data = $post_result->fetch_assoc();
$post_id = $post_data['post_id'];

if ($post_id == 1 || $post_id == 2) {
    $ward = 0;
} elseif (!$ward) {
    echo json_encode(["success" => false, "message" => "Ward is required for this post."]);
    exit;
}

$insert_query = $conn->prepare("
    INSERT INTO candidates (candidate_name, party_name, location_id, ward, post_id)
    VALUES (?, ?, ?, ?, ?)
");
$insert_query->bind_param("ssiii", $candidate_name, $party_name, $location_id, $ward, $post_id);

if ($insert_query->execute()) {
    echo json_encode(["success" => true, "message" => "Candidate added successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add candidate."]);
}

?>