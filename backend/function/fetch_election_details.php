<?php
session_start();
include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if (!isset($_SESSION['voter_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized access"]);
    exit;
}

$user_id = $_SESSION['user_id']; 
$voter_id = $_SESSION['voter_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Please use POST."]);
    exit;
}

$update_status_query = "
    UPDATE elections 
    SET status = 
        CASE 
            WHEN end_date < CURDATE() THEN 'Completed'
            WHEN start_date <= CURDATE() AND end_date >= CURDATE() THEN 'Ongoing'
        END
    WHERE status IN ('Upcoming', 'Ongoing')
";
$conn->query($update_status_query);

$user_query = $conn->prepare("SELECT u.role, g.location_id, g.ward FROM users u 
                              JOIN government_voters g ON u.voter_id = g.voter_id
                              WHERE u.voter_id = ?");
$user_query->bind_param("s", $voter_id);
$user_query->execute();
$user_result = $user_query->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User details not found"]);
    exit;
}

$user_data = $user_result->fetch_assoc();
$role = $user_data['role'];
$location_id = $user_data['location_id'];
$ward = $user_data['ward'];

if ($role === 1) { 
    $elections_query = $conn->prepare("SELECT e.election_id, e.name, e.description, e.ward, e.start_date, e.end_date, e.status, 
                                              l.location_name, l.district_name
                                       FROM elections e
                                       JOIN locations l ON e.location_id = l.location_id");
} else { 
    $elections_query = $conn->prepare("SELECT e.election_id, e.name, e.description, e.ward, e.start_date, e.end_date, e.status, 
                                              l.location_name, l.district_name
                                       FROM elections e
                                       JOIN locations l ON e.location_id = l.location_id
                                       WHERE e.location_id = ? AND (e.ward = 0 OR e.ward = ?)");
    $elections_query->bind_param("ii", $location_id, $ward);
}

$elections_query->execute();
$elections_result = $elections_query->get_result();

$elections = [];

while ($election = $elections_result->fetch_assoc()) {
    $election_id = $election['election_id'];

    $candidates_query = $conn->prepare("SELECT c.candidate_id, c.candidate_name, c.party_name, c.post_id
                                        FROM candidates c
                                        WHERE c.location_id = ? AND (c.ward = 0 OR c.ward = ?)
                                        ORDER BY c.post_id ASC");

    if ($role === 1) {
        $candidates_query->bind_param("ii", $location_id, $election['ward']); 
    } else { 
        $candidates_query->bind_param("ii", $location_id, $ward);
    }

    $candidates_query->execute();
    $candidates_result = $candidates_query->get_result();

    $candidates_by_post = [
        "Mayor" => [],
        "Deputy Mayor" => [],
        "Ward Chairperson" => [],
        "Ward Member" => []
    ];

    while ($candidate = $candidates_result->fetch_assoc()) {
        if ($candidate['post_id'] == 1) {
            $candidates_by_post["Mayor"][] = $candidate;
        } elseif ($candidate['post_id'] == 2) {
            $candidates_by_post["Deputy Mayor"][] = $candidate;
        } elseif ($candidate['post_id'] == 3) {
            $candidates_by_post["Ward Chairperson"][] = $candidate;
        } elseif ($candidate['post_id'] == 4) {
            $candidates_by_post["Ward Member"][] = $candidate;
        }
    }

    $elections[] = [
        "election_id" => $election_id,
        "name" => $election['name'],
        "description" => $election['description'],
        "location" => $election['location_name'] . " (" . $election['district_name'] . ")",
        "ward" => $election['ward'] == 0 ? "All Wards" : $election['ward'],
        "start_date" => $election['start_date'],
        "end_date" => $election['end_date'],
        "status" => $election['status'],
        "candidates" => $candidates_by_post
    ];
}

echo json_encode([
    "success" => true,
    "elections" => $elections
]);
?>