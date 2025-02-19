<?php
include '../config/database.php';
include '../config/mail_config.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Please use POST."]);
    exit;
}

$election_query = $conn->prepare("
    SELECT election_id, name FROM elections WHERE status = 'Ongoing'
");
$election_query->execute();
$election_result = $election_query->get_result();

if ($election_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "No ongoing elections found"]);
    exit;
}

$ongoing_elections = [];
while ($row = $election_result->fetch_assoc()) {
    $ongoing_elections[$row['election_id']] = [
        "election_id" => $row['election_id'],
        "election_name" => $row['name'],
        "results" => []
    ];
}

$query = "
    SELECT 
        e.election_id,
        e.name AS election_name,
        c.candidate_id, 
        c.candidate_name, 
        c.party_name, 
        c.post_id, 
        p.post_name, 
        COUNT(v.vote_id) AS vote_count
    FROM elections e
    JOIN candidates c ON c.location_id = e.location_id
    JOIN posts p ON c.post_id = p.post_id
    LEFT JOIN votes v ON c.candidate_id = v.candidate_id AND v.election_id = e.election_id
    WHERE e.status = 'Ongoing'
    GROUP BY e.election_id, c.candidate_id, c.candidate_name, c.party_name, c.post_id, p.post_name
    ORDER BY e.election_id, c.post_id, vote_count DESC
";

$stmt = $conn->prepare($query);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $election_id = $row['election_id'];
    $post_id = $row['post_id'];

    if (!isset($ongoing_elections[$election_id]['results'][$post_id])) {
        $ongoing_elections[$election_id]['results'][$post_id] = [
            "post_name" => $row['post_name'],
            "candidates" => []
        ];
    }

    $ongoing_elections[$election_id]['results'][$post_id]['candidates'][] = [
        "candidate_id" => $row['candidate_id'],
        "candidate_name" => $row['candidate_name'],
        "party_name" => $row['party_name'],
        "vote_count" => intval($row['vote_count'])
    ];
}

$final_results = array_values($ongoing_elections);

echo json_encode(["success" => true, "elections" => $final_results]);
?>