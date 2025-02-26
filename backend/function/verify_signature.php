<?php
// validate_signature.php
session_start();

include '../config/database.php';
include '../config/encryption.php'; 
include '../config/handle_cors.php'; 

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Please use POST."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['vote_id'])) {
    echo json_encode(["success" => false, "message" => "Vote ID is required"]);
    exit;
}

$vote_id = $data['vote_id'];

if (!is_int($vote_id) || $vote_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid vote_id - must be a positive integer"]);
    exit;
}

function validateSignature($vote_id, $conn, $secret_key) {
    $stmt = $conn->prepare("SELECT voter_id, election_id, post_id, encrypted_candidate_id, signature FROM votes WHERE vote_id = ?");
    $stmt->bind_param("i", $vote_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        return ["valid" => false, "message" => "Vote not found"];
    }

    $vote = $result->fetch_assoc();
    $voter_id = $vote['voter_id'];
    $election_id = $vote['election_id'];
    $post_id = $vote['post_id'];
    $encrypted_candidate_id = $vote['encrypted_candidate_id'];
    $stored_signature = $vote['signature'];

    $candidate_id = decryptData($encrypted_candidate_id);
    if ($candidate_id === false) {
        return ["valid" => false, "message" => "Failed to decrypt candidate_id"];
    }

    $vote_data_string = "$voter_id$election_id$post_id$candidate_id";

    $recalculated_signature = hash_hmac("sha256", $vote_data_string, $secret_key);

    if ($recalculated_signature === $stored_signature) {
        return ["valid" => true, "message" => "Signature matches - Vote is authentic"];
    } else {
        return ["valid" => false, "message" => "Signature mismatch - Vote may be tampered or fake"];
    }
}

function validateHash($vote_id, $conn) {
    $stmt = $conn->prepare("SELECT voter_id, election_id, post_id, encrypted_candidate_id, salt, vote_hash FROM votes WHERE vote_id = ?");
    $stmt->bind_param("i", $vote_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        return ["valid" => false, "message" => "Vote not found"];
    }

    $vote = $result->fetch_assoc();
    $voter_id = $vote['voter_id'];
    $election_id = $vote['election_id'];
    $post_id = $vote['post_id'];
    $encrypted_candidate_id = $vote['encrypted_candidate_id'];
    $salt = $vote['salt'];
    $stored_hash = $vote['vote_hash'];

    $candidate_id = decryptData($encrypted_candidate_id);
    if ($candidate_id === false) {
        return ["valid" => false, "message" => "Failed to decrypt candidate_id"];
    }

    $vote_data_string = "$voter_id$election_id$post_id$candidate_id" . $salt;

    $recalculated_hash = hash("sha256", $vote_data_string);

    if ($recalculated_hash === $stored_hash) {
        return ["valid" => true, "message" => "Hash matches - Vote integrity intact"];
    } else {
        return ["valid" => false, "message" => "Hash mismatch - Vote data has been altered"];
    }
}

$result_signature = validateSignature($vote_id, $conn, $secret_key);
$result_hash = validateHash($vote_id, $conn);
echo json_encode([
    "signature" => $result_signature,
    "hash" => $result_hash
]);

?>