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
    echo json_encode(["success" => false, "message" => "Access denied. Only admins can delete users."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['voter_id'])) {
    echo json_encode(["success" => false, "message" => "Invalid data format. Voter ID is required."]);
    exit;
}

$target_voter_id = $data['voter_id'];

$check_query = $conn->prepare("SELECT is_voted FROM users WHERE voter_id = ?");
$check_query->bind_param("s", $target_voter_id);
$check_query->execute();
$check_result = $check_query->get_result();

if ($check_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User with Voter ID $target_voter_id not found."]);
    exit;
}

$user_data = $check_result->fetch_assoc();
if ($user_data['is_voted']) {
    echo json_encode(["success" => false, "message" => "Cannot delete user with Voter ID $target_voter_id. They have already voted."]);
    exit;
}

$delete_query = $conn->prepare("DELETE FROM users WHERE voter_id = ?");
$delete_query->bind_param("s", $target_voter_id);

if ($delete_query->execute()) {
    echo json_encode(["success" => true, "message" => "User with Voter ID $target_voter_id deleted successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete user with Voter ID $target_voter_id."]);
}

$check_query->close();
$delete_query->close();
$conn->close();
?>