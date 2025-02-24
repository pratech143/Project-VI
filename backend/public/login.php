<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';
include '../config/mail_config.php';
include '../config/encryption.php'; 

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

$user_check = $conn->prepare("SELECT user_id, email, password, voter_id, is_email_verified, role FROM users WHERE email = ?");
$user_check->bind_param("s", $email);
$user_check->execute();
$user_result = $user_check->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not found"]);
    exit;
}

$user = $user_result->fetch_assoc();

$decrypted_password = decryptData($user['password']);

if (trim($password) !== trim($decrypted_password)) {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
    exit;
}

if (!$user['is_email_verified']) {
    echo json_encode(["success" => false, "message" => "Email not verified. Please verify your email before logging in."]);
    exit;
}

if ($user['role'] === 'admin') {
    $_SESSION['login_data'] = [
        'user_id' => $user['user_id'],
        'email' => $email,
        'voter_id' => $user['voter_id'],
        'role' => $user['role'],
    ];

    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['voter_id'] = $user['voter_id'];
    $_SESSION['role'] = $user['role'];

    echo json_encode([
        "success" => true,
        "message" => "Admin logged in successfully. Redirecting to the dashboard.",
        "role" => $_SESSION['role']
    ]);
    exit;
}

$token = rand(100000, 999999);
$_SESSION['token'][$email] = [
    'token' => $token,
    'expiry' => time() + (5 * 60) 
];

$_SESSION['login_data'] = [
    'user_id' => $user['user_id'],
    'email' => $email,
    'voter_id' => $user['voter_id'],
    'role' => $user['role']
];

$_SESSION['user_id'] = $user['user_id'];
$_SESSION['email'] = $user['email'];
$_SESSION['voter_id'] = $user['voter_id'];
$_SESSION['role'] = $user['role'];

$subject = "Your Login OTP for Election System";
$message = "Your OTP for login is: $token. It will expire in 5 minutes.";

if (sendEmail($email, $subject, $message)) {
    echo json_encode([
        "success" => true,
        "message" => "OTP sent to $email. Please verify to complete login."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to send OTP email."
    ]);
}
?>