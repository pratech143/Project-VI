<?php
include '../config/database.php';
include '../config/handle_cors.php';


session_start();


if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "You are not logged in."]);
    exit;
}
?>