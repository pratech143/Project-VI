<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';

if (!isset($_SESSION['email'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized access"]);
    exit;
}

$email = $_SESSION['email']; 

$query = "SELECT 
    u.user_id, u.voter_id, g.name, g.dob, g.gender, u.email,
    u.profile_photo, 
    l.location_name, l.district_name, g.ward, u.role 
FROM users u
JOIN government_voters g ON u.voter_id = g.voter_id
JOIN locations l ON g.location_id = l.location_id
WHERE u.email = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$profile_photo_base64 = $user['profile_photo'] ? base64_encode($user['profile_photo']) : null;

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
        "profile_photo" => $profile_photo_base64 ? "data:image/jpeg;base64," . $profile_photo_base64 : null,
    ],
    "role" => $user['role'],
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
?>