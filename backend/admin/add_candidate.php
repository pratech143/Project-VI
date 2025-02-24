<?php
session_start();
include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized. Please log in."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$user_query = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
$user_query->bind_param("i", $user_id);
$user_query->execute();
$user_result = $user_query->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit;
}

$user = $user_result->fetch_assoc();
if ($_SESSION['role'] != 1) {
    echo json_encode(["success" => false, "message" => "Access denied. Only admins can add candidates."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid data format."]);
    exit;
}

$errors = [];
$successCount = 0;

$post_mapping = [
    1 => "Mayor",
    2 => "Deputy Mayor",
    3 => "Ward Chairperson",
    4 => "Ward Member"
];

foreach ($data as $post_id => $candidates) {
    if (!is_array($candidates)) {
        continue;
    }

    $post_name = isset($post_mapping[$post_id]) ? $post_mapping[$post_id] : null;

    if (!$post_name) {
        $errors[] = "Unknown post ID: $post_id";
        continue;
    }

    foreach ($candidates as $candidate) {
        $candidate_name = $candidate['name'] ?? null;
        $party_name = $candidate['party'] ?? null;
        $location_name = $candidate['locationId'] ?? null;
        $location_type = $candidate['location_type'] ?? null;
        $ward = $candidate['ward'] ?? null;

        if (!$candidate_name || !$party_name || !$location_name || !$location_type || !$ward || !$post_name) {
            $errors[] = "Missing fields for candidate: " . json_encode($candidate);
            continue;
        }

        $location_query = $conn->prepare("
            SELECT location_id FROM locations 
            WHERE location_name = ? AND location_type = ? 
            LIMIT 1
        ");
        $location_query->bind_param("ss", $location_name, $location_type);
        $location_query->execute();
        $location_result = $location_query->get_result();

        if ($location_result->num_rows === 0) {
            $errors[] = "Location not found: " . $location_name;
            continue;
        }

        $location_data = $location_result->fetch_assoc();
        $location_id = $location_data['location_id'];

        $insert_query = $conn->prepare("
            INSERT INTO candidates (candidate_name, party_name, location_id, ward, post_id)
            VALUES (?, ?, ?, ?, ?)
        ");
        $insert_query->bind_param("ssiii", $candidate_name, $party_name, $location_id, $ward, $post_id);

        if ($insert_query->execute()) {
            $successCount++;
        } else {
            $errors[] = "Failed to add candidate: " . $candidate_name;
        }
    }
}

$response = [
    "success" => $successCount > 0,
    "message" => $successCount > 0 ? "$successCount candidates added successfully." : "No candidates were added.",
    "errors" => $errors,
];

echo json_encode($response);
?>
