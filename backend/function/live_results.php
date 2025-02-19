<?php
include '../config/database.php';
include '../config/mail_config.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if (!isset($_GET['election_id']) || empty($_GET['election_id'])) {
    echo json_encode(["success" => false, "message" => "Missing election ID"]);
    exit;
}

$election_id = intval($_GET['election_id']);

$election_check = $conn->prepare("
    SELECT status FROM elections WHERE election_id = ?x
");
$election_check->bind_param("i", $election_id);
$election_check->execute();
$election_result = $election_check->get_result();

if ($election_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Election not found"]);
    exit;
}

$election = $election_result->fetch_assoc();
if ($election['status'] !== 'Ongoing') {
    echo json_encode(["success" => false, "message" => "Live results are only available for ongoing elections"]);
    exit;
}

$query = "
    SELECT c.candidate_id, c.candidate_name, c.party_name, c.post_id, p.post_name, COUNT(v.vote_id) AS vote_count
    FROM candidates c
    LEFT JOIN votes v ON c.candidate_id = v.candidate_id AND v.election_id = ?
    JOIN posts p ON c.post_id = p.post_id
    WHERE c.location_id = (SELECT location_id FROM elections WHERE election_id = ?)
    GROUP BY c.candidate_id, c.candidate_name, c.party_name, c.post_id, p.post_name
    ORDER BY c.post_id, vote_count DESC
";

$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $election_id, $election_id);
$stmt->execute();
$result = $stmt->get_result();

$live_results = [];
while ($row = $result->fetch_assoc()) {
    $post_id = $row['post_id'];
    if (!isset($live_results[$post_id])) {
        $live_results[$post_id] = [
            "post_name" => $row['post_name'],
            "candidates" => []
        ];
    }
    $live_results[$post_id]['candidates'][] = [
        "candidate_id" => $row['candidate_id'],
        "candidate_name" => $row['candidate_name'],
        "party_name" => $row['party_name'],
        "vote_count" => $row['vote_count']
    ];
}

echo json_encode(["success" => true, "live_results" => array_values($live_results)]);
?>