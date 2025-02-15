<?php
include '../config/database.php';
include '../config/handle_cors.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "You are not logged in."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];
$email = $_SESSION['email'];
$voter_id = $_SESSION['voter_id'] ?? null;

$user_query = $conn->prepare("
    SELECT u.user_id, u.email, u.password, u.is_email_verified, g.name, g.dob, g.gender, g.voter_id, 
           g.location_id, g.ward, l.district_name, l.location_name
    FROM users u
    JOIN government_voters g ON u.voter_id = g.voter_id
    JOIN locations l ON g.location_id = l.location_id
    WHERE u.user_id = ?
");
$user_query->bind_param("i", $user_id);
$user_query->execute();
$user_result = $user_query->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$user = $user_result->fetch_assoc();

if ($role === 'admin') {
    $dashboard_data = [
        "message" => "Welcome Admin, $email",
        "user_info" => $user,
        "role" => $role,
        "options" => [
            "Manage Elections",
            "Manage Candidates",
            "View Results"
        ]
    ];
} else {
    $dashboard_data = [
        "message" => "Welcome Voter, $email",
        "user_info" => [
            "voter_id" => $user['voter_id'],
            "name" => $user['name'],
            "dob" => $user['dob'],
            "gender" => $user['gender'],
            "location" => $user['location_name'] . ', ' . $user['district_name'],
            "ward" => $user['ward'],
            "email" => $user['email'],
        ],
        "role" => $role,
        "options" => [
            "View Elections",
            "Vote in Elections",
            "View Voting History"
        ]
    ];
}

echo json_encode([
    "success" => true,
    "message" => "Dashboard loaded successfully",
    "data" => $dashboard_data
]);
?>