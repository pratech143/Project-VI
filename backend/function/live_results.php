<?php
session_start();

include '../config/database.php';
include '../config/mail_config.php';
include '../config/handle_cors.php';
include '../config/encryption.php';

header('Content-Type: application/json');

// Uncomment the session validation check for security
// if (!isset($_SESSION['user_id'])) {
//     echo json_encode(["success" => false, "message" => "Unauthorized access. Please log in."]);
//     exit;
// }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Please use POST."]);
    exit;
}

$election_query = $conn->prepare("
    SELECT 
        e.election_id, 
        e.name AS election_name, 
        e.location_id, 
        e.location_type, 
        e.ward, 
        e.start_date, 
        e.end_date, 
        e.status,
        l.location_name, 
        l.district_name
    FROM elections e
    JOIN locations l ON e.location_id = l.location_id
    WHERE e.status = 'Ongoing'
");

$election_query->execute();
$election_result = $election_query->get_result();

if ($election_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No ongoing elections found"]);
    exit;
}

$ongoing_elections = [];
$location_wards = [];

while ($row = $election_result->fetch_assoc()) {
    $ongoing_elections[$row['election_id']] = [
        "election_id" => $row['election_id'],
        "election_name" => $row['election_name'],
        "location" => $row['district_name'] . ', ' . $row['location_name'] . ', Ward: ' . $row['ward'],
        "date" => $row['start_date'] . " TO " . $row['end_date'],
        "status" => $row['status'],
        "results" => []
    ];

    $location_wards[$row['location_id']][] = $row['election_id'];
}

$query = "SELECT 
            e.election_id, 
            e.location_id, 
            e.ward,
            l.location_type,
            c.candidate_id, 
            c.candidate_name, 
            c.party_name, 
            c.post_id, 
            p.post_name, 
            v.encrypted_candidate_id, 
            COUNT(v.vote_id) AS vote_count
            FROM elections e
            JOIN candidates c 
            ON c.location_id = e.location_id 
            AND (c.ward = e.ward OR c.post_id IN (SELECT post_id FROM posts WHERE post_name IN ('Mayor', 'Deputy Mayor')))
            JOIN posts p ON c.post_id = p.post_id
            JOIN locations l ON e.location_id = l.location_id
            LEFT JOIN votes v 
            ON v.election_id = e.election_id 
            AND v.post_id = c.post_id 
            WHERE e.status = 'Ongoing'
            GROUP BY 
            e.election_id, c.candidate_id, c.candidate_name, c.party_name, c.post_id, p.post_name, e.ward, 
            l.location_type, 
            v.encrypted_candidate_id 
            ORDER BY e.election_id, c.post_id, vote_count DESC " ;

$stmt = $conn->prepare($query);
$stmt->execute();
$result = $stmt->get_result();

$mayor_deputy_results = [];

while ($row = $result->fetch_assoc()) {
    $election_id = $row['election_id'];
    $post_id = $row['post_id'];
    $location_id = $row['location_id'];
    $candidate_id = $row['candidate_id'];
    $ward = $row['ward'];
    
    // Decrypt the encrypted_candidate_id using your decryptData function
    $decrypted_candidate_id = decryptData($row['encrypted_candidate_id']);

    // Debugging: log the decrypted candidate_id and candidate_id
    error_log("Decrypted Candidate ID: " . $decrypted_candidate_id);
    error_log("Original Candidate ID: " . $candidate_id);
    
    // Check if the decrypted ID matches the candidate ID
    if ($decrypted_candidate_id !== (string)$candidate_id) {
        error_log("Mismatch! Decrypted ID doesn't match candidate ID.");
        continue; // Skip this record if IDs do not match
    }

    if ($row['post_name'] === 'Mayor' || $row['post_name'] === 'Deputy Mayor') {
        $key = "{$location_id}_{$post_id}_{$candidate_id}";

        if (!isset($mayor_deputy_results[$key])) {
            $mayor_deputy_results[$key] = [
                "candidate_id" => $candidate_id,
                "candidate_name" => $row['candidate_name'],
                "party_name" => $row['party_name'],
                "vote_count" => 0,
                "post_name" => $row['post_name'],
                "location_id" => $location_id
            ];
        }

        $mayor_deputy_results[$key]["vote_count"] += intval($row['vote_count']);
    } else {
        if (!isset($ongoing_elections[$election_id]['results'][$post_id])) {
            $ongoing_elections[$election_id]['results'][$post_id] = [
                "post_name" => $row['post_name'],
                "candidates" => []
            ];
        }

        $ongoing_elections[$election_id]['results'][$post_id]['candidates'][] = [
            "candidate_id" => $candidate_id,
            "candidate_name" => $row['candidate_name'],
            "party_name" => $row['party_name'],
            "vote_count" => intval($row['vote_count'])
        ];
    }
}

foreach ($mayor_deputy_results as $key => $data) {
    $location_id = $data['location_id'];

    if (!isset($location_wards[$location_id])) {
        continue;
    }

    foreach ($location_wards[$location_id] as $election_id) {
        if (!isset($ongoing_elections[$election_id]['results'][$data["post_name"]])) {
            $ongoing_elections[$election_id]['results'][$data["post_name"]] = [
                "post_name" => $data["post_name"],
                "candidates" => []
            ];
        }

        $ongoing_elections[$election_id]['results'][$data["post_name"]]["candidates"][] = [
            "candidate_id" => $data["candidate_id"],
            "candidate_name" => $data["candidate_name"],
            "party_name" => $data["party_name"],
            "vote_count" => $data["vote_count"]
        ];
    }
}

$final_results = array_values($ongoing_elections);

echo json_encode(["success" => true, "elections" => $final_results]);
?>
