<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized access. Please log in."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Please use POST."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

$location_name = $data['location_name'] ?? null;
$ward_number = $data['ward_number'] ?? null;

if (empty($location_name) || empty($ward_number)) {
    echo json_encode(["success" => false, "message" => "Missing required fields: location_name and ward_number"]);
    exit;
}

$location_stmt = $conn->prepare("SELECT location_id FROM locations WHERE location_name = ?");
$location_stmt->bind_param("s", $location_name);
$location_stmt->execute();
$location_result = $location_stmt->get_result();

if ($location_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Location not found"]);
    exit;
}

$location_data = $location_result->fetch_assoc();
$location_id = $location_data['location_id'];

$ward_stmt = $conn->prepare("SELECT ward FROM wards WHERE ward = ?");
$ward_stmt->bind_param("i", $ward_number);
$ward_stmt->execute();
$ward_result = $ward_stmt->get_result();

if ($ward_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Ward not found"]);
    exit;
}

$election_check = $conn->prepare("SELECT election_id, status FROM elections WHERE location_id = ? AND status = 'Completed'");
$election_check->bind_param("i", $location_id);
$election_check->execute();
$election_result = $election_check->get_result();

if ($election_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No completed election found for this location"]);
    exit;
}

$election = $election_result->fetch_assoc();
$election_id = $election['election_id'];

$data = [];

$total_votes_query = "
    SELECT COUNT(v.vote_id) AS total_votes 
    FROM votes v
    JOIN candidates c ON v.candidate_id = c.candidate_id
    WHERE v.election_id = ? AND c.location_id = ? AND c.ward = ?";
$stmt = $conn->prepare($total_votes_query);
$stmt->bind_param("iii", $election_id, $location_id, $ward_number);
$stmt->execute();
$total_votes_result = $stmt->get_result()->fetch_assoc();
$data['total_votes'] = $total_votes_result['total_votes'];

$post_votes_query = "
    SELECT p.post_id, p.post_name, COUNT(v.vote_id) AS vote_count
    FROM posts p
    LEFT JOIN votes v ON p.post_id = v.post_id AND v.election_id = ?
    JOIN candidates c ON v.candidate_id = c.candidate_id
    WHERE c.location_id = ? AND c.ward = ?
    GROUP BY p.post_id, p.post_name
    ORDER BY vote_count DESC";
$stmt = $conn->prepare($post_votes_query);
$stmt->bind_param("iii", $election_id, $location_id, $ward_number);
$stmt->execute();
$post_votes_result = $stmt->get_result();
$data['votes_per_post'] = [];
while ($row = $post_votes_result->fetch_assoc()) {
    $data['votes_per_post'][] = $row;
}

$candidate_votes_query = "
    SELECT c.candidate_id, c.candidate_name, c.party_name, p.post_name, COUNT(v.vote_id) AS vote_count
    FROM candidates c
    LEFT JOIN votes v ON c.candidate_id = v.candidate_id AND v.election_id = ?
    JOIN posts p ON c.post_id = p.post_id
    WHERE c.location_id = ? AND c.ward = ?
    GROUP BY c.candidate_id, c.candidate_name, c.party_name, p.post_name
    ORDER BY p.post_id, vote_count DESC";
$stmt = $conn->prepare($candidate_votes_query);
$stmt->bind_param("iii", $election_id, $location_id, $ward_number);
$stmt->execute();
$candidate_votes_result = $stmt->get_result();
$data['votes_per_candidate'] = [];
while ($row = $candidate_votes_result->fetch_assoc()) {
    $data['votes_per_candidate'][] = $row;
}

$party_votes_query = "
    SELECT c.party_name, COUNT(v.vote_id) AS vote_count
    FROM candidates c
    LEFT JOIN votes v ON c.candidate_id = v.candidate_id AND v.election_id = ?
    WHERE c.location_id = ? AND c.ward = ?
    GROUP BY c.party_name
    ORDER BY vote_count DESC";
$stmt = $conn->prepare($party_votes_query);
$stmt->bind_param("iii", $election_id, $location_id, $ward_number);
$stmt->execute();
$party_votes_result = $stmt->get_result();
$data['votes_per_party'] = [];
while ($row = $party_votes_result->fetch_assoc()) {
    $data['votes_per_party'][] = $row;
}

$gender_votes_query = "
    SELECT g.gender, COUNT(v.vote_id) AS vote_count
    FROM government_voters g
    JOIN users u ON g.voter_id = u.voter_id
    JOIN votes v ON u.voter_id = v.voter_id
    JOIN candidates c ON v.candidate_id = c.candidate_id
    WHERE v.election_id = ? AND c.location_id = ? AND c.ward = ?
    GROUP BY g.gender";
$stmt = $conn->prepare($gender_votes_query);
$stmt->bind_param("iii", $election_id, $location_id, $ward_number);
$stmt->execute();
$gender_votes_result = $stmt->get_result();
$data['votes_by_gender'] = [];
while ($row = $gender_votes_result->fetch_assoc()) {
    $data['votes_by_gender'][] = $row;
}

echo json_encode(["success" => true, "data" => $data]);
?>