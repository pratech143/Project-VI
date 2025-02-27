<?php
include '../config/database.php'; 
include '../config/handle_cors.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) {
    echo json_encode(["success" => false, "message" => "Unauthorized. Admin access required."]);
    exit;
}

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['voter_id'])) {
    echo json_encode(["success" => false, "message" => "Voter ID is required."]);
    exit;
}

$voter_id = $data['voter_id'];

// Fetch voter details
$query = $conn->prepare("
    SELECT 
        u.voter_id,
        g.name,
        l.district_name AS district,
        l.location_name AS location,
        g.ward
    FROM users u
    JOIN government_voters g ON u.voter_id = g.voter_id
    JOIN locations l ON g.location_id = l.location_id
    WHERE u.voter_id = ?
");
$query->bind_param("s", $voter_id);
$query->execute();
$result = $query->get_result();

if ($result->num_rows > 0) {
    $voter = $result->fetch_assoc();
    echo json_encode([
        "success" => true,
        "data" => [
            "id" => $voter['voter_id'],
            "name" => $voter['name'],
            "district" => $voter['district'],
            "location" => $voter['location'],
            "ward" => $voter['ward']
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Voter not found."]);
}

$query->close();
$conn->close();
?>