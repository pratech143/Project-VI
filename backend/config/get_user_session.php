<?php
session_start();

include '../config/database.php';
include '../config/mail_config.php';
include '../config/handle_cors.php';

header("Content-Type: application/json");


if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "No active session"]);
    exit();
}

echo json_encode([
    "success" => true,
    "user_id" => $_SESSION['user_id'],
    "email" => $_SESSION['email'] ?? null,
    "role" => $_SESSION['role'], 
    "voter_id" => $_SESSION['voter_id'] ?? null
]);
?>