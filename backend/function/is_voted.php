<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "No active session"]);
    exit();
}

$user_id = $_SESSION['user_id'];

$user_check = $conn->prepare("SELECT voter_id, is_voted FROM users WHERE user_id = ?");
$user_check->bind_param("s", $user_id);
$user_check->execute();
$user_result = $user_check->get_result();

if ($row = $user_result->fetch_assoc()) {
    $_SESSION['is_voted'] = $row['is_voted'];
    
    echo json_encode([
        "success" => true, 
        "is_voted" => $_SESSION['is_voted'],
    ]);
} else {
    echo json_encode(["success" => false, "message" => "User not found"]);
}
?>