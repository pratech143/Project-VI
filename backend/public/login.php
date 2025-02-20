<?php
include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Please use POST."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Data not received"]);
    exit;
}

$email = $data['email'] ?? null;
$password = $data['password'] ?? null;

if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

$user_check = $conn->prepare("SELECT user_id, email, password, is_email_verified, role, voter_id, is_voted FROM users WHERE email = ?");
$user_check->bind_param("s", $email);
$user_check->execute();
$user_result = $user_check->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not found"]);
    exit;
}

$user = $user_result->fetch_assoc();

if (!password_verify($password, $user['password'])) {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
    exit;
}

if (!$user['is_email_verified']) {
    echo json_encode(["success" => false, "message" => "Email not verified. Please verify your email before logging in."]);
    exit;
}

if ($user['role'] == 1) {$role = 'admin';} 
else {$role = 'voter';}

session_start();
$_SESSION['user_id'] = $user['user_id'];
$_SESSION['role'] = $role;
$_SESSION['email'] = $email;
$_SESSION['voter_id'] = $user['voter_id'] ?? null; 
$_SESSION['is_voted'] = $user['is_voted'];

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "role" => $role,
    "user_id" => $user['user_id'],
    "email" => $user['email'],
    "voter_id" => $user['voter_id'] ?? null,
]);

?>