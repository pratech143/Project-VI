<?php
include '../config/database.php';
include '../config/handle_cors.php';

session_start();

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
$location_id = $data['location_id'] ?? null;
$ward = $data['ward'] ?? null;
$post_id = $data['post_id'] ?? null;

if (!$candidate_name || !$party_name || !$location_id || !$ward || !$post_id) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
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