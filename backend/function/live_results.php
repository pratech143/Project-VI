<?php
session_start();

include '../config/database.php';
include '../config/mail_config.php';
include '../config/handle_cors.php';
include '../config/encryption.php';

header('Content-Type: application/json');

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
if ($election_query === false) {
    echo json_encode(["success" => false, "message" => "Election query preparation failed: " . $conn->error]);
    exit;
}
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
        "location" => $row['district_name'] . ', ' . $row['location_name'].',Ward:'.$row['ward'],
        "date" => $row['start_date']." TO ".$row['end_date'],
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
            COALESCE(COUNT(v.vote_id), 0) AS vote_count
          FROM elections e
          JOIN locations l ON e.location_id = l.location_id
          JOIN candidates c 
            ON c.location_id = e.location_id 
            AND (c.ward = e.ward OR c.post_id IN (SELECT post_id FROM posts WHERE post_name IN ('Mayor', 'Deputy Mayor')))
          JOIN posts p ON c.post_id = p.post_id
          LEFT JOIN votes v 
            ON v.election_id = e.election_id 
            AND v.post_id = c.post_id
          WHERE e.status = 'Ongoing'
          GROUP BY 
            e.election_id, 
            c.candidate_id, 
            c.candidate_name, 
            c.party_name, 
            c.post_id, 
            p.post_name, 
            e.ward, 
            l.location_type,
            v.encrypted_candidate_id
          ORDER BY e.election_id, c.post_id, vote_count DESC";

$stmt = $conn->prepare($query);
if ($stmt === false) {
    echo json_encode([
        "success" => false, 
        "message" => "Main query preparation failed: " . $conn->error
    ]);
    exit;
}
$stmt->execute();
$result = $stmt->get_result();

$mayor_deputy_results = [];
$candidate_votes = [];

while ($row = $result->fetch_assoc()) {
    $election_id = $row['election_id'];
    $post_id = $row['post_id'];
    $location_id = $row['location_id'];
    $candidate_id = $row['candidate_id'];
    $post_name = $row['post_name'];

    $vote_key = "{$election_id}_{$post_id}_{$candidate_id}";
    if (!isset($candidate_votes[$vote_key])) {
        $candidate_votes[$vote_key] = [
            'votes' => 0,
            'processed' => false
        ];
    }

    if ($row['encrypted_candidate_id'] && $row['vote_count'] > 0) {
        $decrypted_candidate_id = decryptData($row['encrypted_candidate_id']);
        if ($decrypted_candidate_id && (int)$decrypted_candidate_id === (int)$candidate_id) {
            $candidate_votes[$vote_key]['votes'] += intval($row['vote_count']);
        }
    }

    if ($post_name === 'Mayor' || $post_name === 'Deputy Mayor') {
        $mayor_key = "{$location_id}_{$post_id}_{$candidate_id}";
        if (!isset($mayor_deputy_results[$mayor_key])) {
            $mayor_deputy_results[$mayor_key] = [
                "candidate_id" => $candidate_id,
                "candidate_name" => $row['candidate_name'],
                "party_name" => $row['party_name'],
                "vote_count" => 0,
                "post_name" => $post_name,
                "location_id" => $location_id
            ];
        }
    } else {
        if (!isset($ongoing_elections[$election_id]['results'][$post_id])) {
            $ongoing_elections[$election_id]['results'][$post_id] = [
                "post_name" => $post_name,
                "candidates" => []
            ];
        }

        $candidate_exists = false;
        foreach ($ongoing_elections[$election_id]['results'][$post_id]['candidates'] as $existing) {
            if ($existing['candidate_id'] === $candidate_id) {
                $candidate_exists = true;
                break;
            }
        }

        if (!$candidate_exists) {
            $ongoing_elections[$election_id]['results'][$post_id]['candidates'][] = [
                "candidate_id" => $candidate_id,
                "candidate_name" => $row['candidate_name'],
                "party_name" => $row['party_name'],
                "vote_count" => 0 
            ];
        }
    }
}

foreach ($candidate_votes as $vote_key => $data) {
    list($election_id, $post_id, $candidate_id) = explode('_', $vote_key);
    $election_id = (int)$election_id;
    $post_id = (int)$post_id;
    $candidate_id = (int)$candidate_id;

    if (isset($ongoing_elections[$election_id]['results'][$post_id])) {
        foreach ($ongoing_elections[$election_id]['results'][$post_id]['candidates'] as &$candidate) {
            if ($candidate['candidate_id'] === $candidate_id) {
                $candidate['vote_count'] = $data['votes'];
                break;
            }
        }
    }
    
    foreach ($mayor_deputy_results as &$mayor_data) {
        if ($mayor_data['candidate_id'] === $candidate_id && 
            $mayor_data['post_name'] === ($post_id == 1 ? 'Mayor' : 'Deputy Mayor')) {
            $mayor_data['vote_count'] = $data['votes'];
            break;
        }
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

        $candidate_exists = false;
        foreach ($ongoing_elections[$election_id]['results'][$data["post_name"]]['candidates'] as $existing) {
            if ($existing['candidate_id'] === $data['candidate_id']) {
                $candidate_exists = true;
                break;
            }
        }
        
        if (!$candidate_exists) {
            $ongoing_elections[$election_id]['results'][$data["post_name"]]["candidates"][] = [
                "candidate_id" => $data["candidate_id"],
                "candidate_name" => $data["candidate_name"],
                "party_name" => $data["party_name"],
                "vote_count" => $data["vote_count"]
            ];
        }
    }
}

$final_results = array_values($ongoing_elections);

echo json_encode(["success" => true, "elections" => $final_results]);
?>