<?php
include '../config/database.php';
include '../config/mail_config.php'; 
include '../config/handle_cors.php';

header('Content-Type: application/json');

// session_start();

// if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) {
//     echo json_encode(["success" => false, "message" => "Unauthorized access."]);
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

$name = $data['name'] ?? null;
$description = $data['description'] ?? null;
$district_name = $data['district_name'] ?? null;
$location_name = $data['location_name'] ?? null;
$location_type = $data['location_type'] ?? null;
$ward = $data['ward'] ?? null;
$start_date = $data['start_date'] ?? null;
$end_date = $data['end_date'] ?? null;
$status = $data['status'] ?? 'Upcoming';

if (empty($name) || empty($description) || empty($district_name) || empty($location_name) || empty($location_type) || empty($start_date) || empty($end_date)) {
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

$location_check = $conn->prepare("SELECT location_id, location_type FROM locations WHERE district_name = ? AND location_name = ? LIMIT 1");
$location_check->bind_param("ss", $district_name, $location_name);
$location_check->execute();
$location_result = $location_check->get_result();

if ($location_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Location not found"]);
    exit;
}

$location_data = $location_result->fetch_assoc();
$location_id = $location_data['location_id'];
$location_type = $location_data['location_type'];

$available_posts = [];
if (in_array($location_type, ['Metropolitan City', 'Sub-Metropolitan City', 'Municipality'])) {
    $available_posts = [1, 2, 3, 4]; 
} else if ($location_type === 'Rural Municipality/VDC') {
    $available_posts = [3, 4];
}

$election_ids = [];

foreach ($available_posts as $post_id) {
    $post_ward = ($post_id == 1 || $post_id == 2) ? 0 : $ward;

    if ($location_type === 'Rural Municipality/VDC' && in_array($post_id, [1, 2])) {
        continue;
    }

    $insert_election = $conn->prepare("INSERT INTO elections (name, description, location_id, ward, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $insert_election->bind_param("ssiisss", $name, $description, $location_id, $post_ward, $start_date, $end_date, $status);

    if ($insert_election->execute()) {
        $election_id = $conn->insert_id;

        $fetch_candidates = $conn->prepare("SELECT candidate_id FROM candidates WHERE location_id = ? AND ward = ? AND post_id = ?");
        $fetch_candidates->bind_param("iii", $location_id, $post_ward, $post_id);
        $fetch_candidates->execute();
        $candidate_result = $fetch_candidates->get_result();

        $candidates = [];
        while ($row = $candidate_result->fetch_assoc()) {
            $candidates[] = $row['candidate_id'];
        }

        $election_ids[] = [
            "election_id" => $election_id,
            "post_id" => $post_id,
            "candidates" => $candidates
        ];

        $send_email = $conn->prepare("SELECT email FROM users WHERE voter_id IN (SELECT voter_id FROM government_voters WHERE location_id = ? AND ward = ?)");
        $send_email->bind_param("ii", $location_id, $ward);
        $send_email->execute();
        $email_result = $send_email->get_result();

        $subject = "Election Notification: Upcoming Election in Your Ward";
        $message = "Dear Voter,\n\nWe would like to inform you that an election is taking place in your ward.\n";
        $message .= "Election Details:\n";
        $message .= "Name: " . $name . "\n";
        $message .= "Description: " . $description . "\n";
        $message .= "Location: " . $location_name . " (" . $district_name . ")\n";
        $message .= "Ward: " . ($post_ward == 0 ? "All Wards" : $ward) . "\n";
        $message .= "Start Date: " . $start_date . "\n";
        $message .= "End Date: " . $end_date . "\n\n";
        $message .= "Please be prepared to vote for the candidates running for the following positions:\n";

        foreach ($available_posts as $post_id) {
            if ($post_id == 1) $message .= "- Mayor\n";
            if ($post_id == 2) $message .= "- Deputy Mayor\n";
            if ($post_id == 3) $message .= "- Ward Chairperson\n";
            if ($post_id == 4) $message .= "- Ward Member\n";
        }

        $message .= "\nThank you for your participation in the democratic process.\nBest regards,\nElection Team";

        while ($email_row = $email_result->fetch_assoc()) {
            $to = $email_row['email'];
            if (!sendEmail($to, $subject, $message)) {  
                echo json_encode(["success" => false, "message" => "Election created but failed to send emails."]);
                exit;
            }
        }
    } else {
        echo json_encode(["success" => false, "message" => "Failed to create election. Please try again."]);
        exit;
    }
}

echo json_encode([
    "success" => true,
    "message" => "Elections created successfully and emails sent to voters!",
    "elections" => $election_ids
]);
?>