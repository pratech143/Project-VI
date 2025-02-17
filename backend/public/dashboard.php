<?php
include '../config/database.php';
include '../config/handle_cors.php';

session_start();

// if (!isset($_SESSION['user_id'])) {
//     echo json_encode(["success" => false]);
//     exit;
// }

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

if (!$email) {
    echo json_encode(["success" => false, "message" => "Email is required"]);
    exit;
}

$user_query = $conn->prepare("
    SELECT u.user_id, u.email, u.password, u.is_email_verified, 
           g.name, g.dob, g.gender, g.voter_id, 
           g.location_id, g.ward, l.district_name, l.location_name
    FROM users u
    JOIN government_voters g ON u.voter_id = g.voter_id
    JOIN locations l ON g.location_id = l.location_id
    WHERE u.email = ?
");

$user_query->bind_param("s", $email); 
$user_query->execute();
$user_result = $user_query->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$user = $user_result->fetch_assoc();

$dashboard_data = [
    "user_info" => [
        "user_id" => $user['user_id'],
        "voter_id" => $user['voter_id'],
        "name" => $user['name'],
        "dob" => $user['dob'],
        "gender" => $user['gender'],
        "location" => $user['location_name'] . ', ' . $user['district_name'],
        "ward" => $user['ward'],
        "email" => $user['email'],
    ],
    "role" => ($user['user_id'] == 1) ? "admin" : "voter",
    "options" => [
        "View Elections",
        "Vote in Elections",
        "View Voting History"
    ]
];

echo json_encode([
    "success" => true,
    "data" => $dashboard_data
]);
exit;