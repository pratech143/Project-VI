<?php
include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) {
    echo json_encode(["success" => false, "message" => "Unauthorized access."]);
    exit;
}

$stmt = $conn->prepare("SELECT user_id, voter_id, email, is_verified FROM users WHERE is_verified = 0");
$stmt->execute();
$result = $stmt->get_result();

$pending_voters = [];
while ($row = $result->fetch_assoc()) {
    $pending_voters[] = $row;
}

echo json_encode(["success" => true, "pending_voters" => $pending_voters]);
?>