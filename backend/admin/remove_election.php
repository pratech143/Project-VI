<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    echo json_encode(["success" => false, "message" => "Unauthorized access."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Use DELETE."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$election_id = $data['election_id'] ?? null;

if (!$election_id) {
    echo json_encode(["success" => false, "message" => "Election ID is required."]);
    exit;
}

$check_election = $conn->prepare("SELECT status FROM elections WHERE election_id = ?");
$check_election->bind_param("i", $election_id);
$check_election->execute();
$election_result = $check_election->get_result();

if ($election_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Election not found."]);
    exit;
}

$election = $election_result->fetch_assoc();

if ($election['status'] !== 'Upcoming') {
    echo json_encode(["success" => false, "message" => "Only upcoming can be deleted."]);
    exit;
}

$delete_election = $conn->prepare("DELETE FROM elections WHERE election_id = ?");
$delete_election->bind_param("i", $election_id);
$delete_election->execute();

if ($delete_election->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Election deleted successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete election."]);
}
?>