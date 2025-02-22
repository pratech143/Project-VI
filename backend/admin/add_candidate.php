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
if ($_SESSION['role'] != 'admin') {
    echo json_encode(["success" => false, "message" => "Access denied. Only admins can add candidates."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data ) {
    echo json_encode(["success" => false, "message" => "Invalid data format."]);
    exit;
}

$errors = [];
$successCount = 0;

// Loop through each ward key
foreach ($data as $wardNumber => $candidates) {
    if (!is_array($candidates)) {
        continue;
    }

    foreach ($candidates as $candidate) {
        $candidate_name = $candidate['name'] ?? null;
        $party_name = $candidate['party'] ?? null;
        $location_name = $candidate['locationId'] ?? null;
        $location_type = $candidate['location_type'] ?? null;
        $ward = $candidate['ward'] ?? null;
        
        // Dynamically determine post_id based on post_type or other conditions
        $post_id = null;
        if (isset($candidate['post_type'])) {
            // Example: Dynamically determine post_id from the post_type
            switch ($candidate['post_type']) {
                case 'Mayor':
                    $post_id = 1; // Post ID for Mayor
                    break;
                case 'Deputy Mayor':
                    $post_id = 2; // Post ID for Deputy Mayor
                    break;
                case 'Ward Member':
                    $post_id = 3; // Post ID for Ward Member (default or if not specified)
                    break;
                default:
                    $errors[] = "Unknown post type: " . $candidate['post_type'];
                    continue 2;
            }
        } else {
            $post_id = 3; // Default to Ward Member if post_type is not specified
        }

        if (!$candidate_name || !$party_name || !$location_name || !$location_type || !$ward || !$post_id) {
            $errors[] = "Missing fields for candidate: " . json_encode($candidate);
            continue;
        }

        // Get location_id
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

        // Insert candidate
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