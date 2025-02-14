<?php
$servername = 'localhost';
$dbname = 'OnlineVotingSystem';
$username = 'root';
$password = '';

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$allowed_origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_domains = ['http://localhost:5173'];

if (in_array($allowed_origin, $allowed_domains)) {
    header('Access-Control-Allow-Origin: ' . $allowed_origin); 
    header('Access-Control-Allow-Credentials: true'); 
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS'); 
    header('Access-Control-Allow-Headers: Content-Type, Authorization'); 
} else {
    header('HTTP/1.1 403 Forbidden'); 
    echo json_encode(["message" => "Origin not allowed"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    http_response_code(200);
    exit();
}

?>