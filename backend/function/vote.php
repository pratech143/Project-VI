<?php
session_start();

include '../config/database.php';
include '../config/mail_config.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if (!isset($_SESSION['voter_id']) || $_SESSION['role'] !== 'voter') {
    echo json_encode(["success" => false, "message" => "Unauthorized access."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method. Use POST."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

$voter_id = $_SESSION['voter_id'];
$election_id = $data['election_id'] ?? null;
$votes = $data['votes'] ?? [];

if (empty($voter_id) || empty($election_id) || !is_array($votes) || count($votes) === 0) {
    echo json_encode(["success" => false, "message" => "Missing required fields or empty vote data"]);
    exit;
}

$voter_check = $conn->prepare("
    SELECT g.voter_id 
    FROM government_voters g
    JOIN users u ON g.voter_id = u.voter_id
    WHERE u.voter_id = ?
");

$voter_check->bind_param("s", $voter_id);
$voter_check->execute();
$voter_result = $voter_check->get_result();

if ($voter_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Voter not found"]);
    exit;
}

$email_query = $conn->prepare("SELECT email FROM users WHERE voter_id = ?");
$email_query->bind_param("s", $voter_id);
$email_query->execute();
$email_result = $email_query->get_result();

if ($email_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Voter email not found"]);
    exit;
}

$voter_email = $email_result->fetch_assoc()['email'];


// Check if election is active
$election_check = $conn->prepare("
    SELECT election_id, name, start_date, end_date, status 
    FROM elections 
    WHERE election_id = ?
");
$election_check->bind_param("i", $election_id);
$election_check->execute();
$election_result = $election_check->get_result();

if ($election_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Election not found"]);
    exit;
}

$election_data = $election_result->fetch_assoc();
$current_date = date("Y-m-d");

if ($election_data['status'] !== 'Ongoing' || $current_date < $election_data['start_date'] || $current_date > $election_data['end_date']) {
    echo json_encode(["success" => false, "message" => "This election is not active or has expired"]);
    exit;
}
//change
$flattened_votes = [];
foreach ($votes as $vote) {
    if (is_array($vote['candidate_id'])) {
        foreach ($vote['candidate_id'] as $single_candidate_id) {
            $flattened_votes[] = [
                'post_id' => $vote['post_id'],
                'candidate_id' => $single_candidate_id
            ];
        }
    } else {
        $flattened_votes[] = $vote;
    }
}
$votes = $flattened_votes;

$post_counts = [
    'Ward Member' => []
];

$valid_votes = [];

foreach ($votes as $vote) {
    $candidate_id = $vote['candidate_id'];
    $post_id = $vote['post_id'];

    $post_query = $conn->prepare("SELECT post_name FROM posts WHERE post_id = ?");
    $post_query->bind_param("i", $post_id);
    $post_query->execute();
    $post_result = $post_query->get_result();
    $post_name = $post_result->fetch_assoc()['post_name'];

    // Handle "Ward Member" votes with a limit of 4 candidates
    if ($post_name === 'Ward Member') {
        if (count($post_counts['Ward Member']) >= 4) {
            continue;
        }
        $post_counts['Ward Member'][] = $candidate_id;
    } else {
        $post_counts[$post_name][] = $candidate_id;
    }

    $valid_votes[] = $vote;
}

if (count($post_counts['Ward Member']) !== 4) {
    echo json_encode(["success" => false, "message" => "You must select exactly 4 Ward Members."]);
    exit;
}

$success_votes = [];
$failed_votes = [];

$conn->begin_transaction();
try {
    foreach ($valid_votes as $vote) {
        $candidate_id = $vote['candidate_id'];
        $post_id = $vote['post_id'];

        $candidate_check = $conn->prepare("
            SELECT candidate_id FROM candidates WHERE candidate_id = ? AND post_id = ?
        ");
        $candidate_check->bind_param("ii", $candidate_id, $post_id);
        $candidate_check->execute();
        $candidate_result = $candidate_check->get_result();

        if ($candidate_result->num_rows === 0) {
            $failed_votes[] = ["post_id" => $post_id, "candidate_id" => $candidate_id, "message" => "Candidate not found for this post"];
            continue;
        }

        $vote_check = $conn->prepare("
            SELECT vote_id FROM votes WHERE voter_id = ? AND election_id = ? AND post_id = ?
        ");
        $vote_check->bind_param("sii", $voter_id, $election_id, $post_id);
        $vote_check->execute();
        $vote_result = $vote_check->get_result();

    if ($post_name == 'Ward Member') {
            
        if ($vote_result->num_rows >= 4) {
            // If the user has already voted for this post, mark it as failed
            $failed_votes[] = ["post_id" => $post_id, "candidate_id" => $candidate_id, "message" => "You have already voted for this post"];
            continue;
        }
    }
        elseif ($vote_result->num_rows > 0){
            $failed_votes[] = ["post_id" => $post_id, "candidate_id" => $candidate_id, "message" => "You have already voted for this post"];
            continue;
        }

        $random_salt = bin2hex(random_bytes(8));
        $vote_data_string = $voter_id . $election_id . $candidate_id . $post_id . $random_salt;
        $vote_hash = hash("sha256", $vote_data_string);

        $insert_vote = $conn->prepare("
            INSERT INTO votes (voter_id, election_id, candidate_id, post_id, vote_hash) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $insert_vote->bind_param("siiis", $voter_id, $election_id, $candidate_id, $post_id, $vote_hash);

        if ($insert_vote->execute()) {
            $success_votes[] = ["post_id" => $post_id, "candidate_id" => $candidate_id, "message" => "Vote cast successfully"];
        } else {
            $failed_votes[] = ["post_id" => $post_id, "candidate_id" => $candidate_id, "message" => "Failed to cast vote"];
        }
    }

    $conn->commit();
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Voting failed. Error: " . $e->getMessage()]);
    exit;
}

foreach ($success_votes as &$vote) {
    $post_id = $vote['post_id'];
    $post_query = $conn->prepare("SELECT post_name FROM posts WHERE post_id = ?");
    $post_query->bind_param("i", $post_id);
    $post_query->execute();
    $post_result = $post_query->get_result();
    
    $vote['post_name'] = ($post_result->num_rows > 0) ? $post_result->fetch_assoc()['post_name'] : "Unknown Position";
}

$election_name = $election_data['name'];

if (count($success_votes) > 0) {

    $update_voted = $conn->prepare("UPDATE users SET is_voted = 1 WHERE voter_id = ?");
    $update_voted->bind_param("s", $voter_id);
    $update_voted->execute();

    $subject = "Vote Confirmation - $election_name";
    
    $message = "Dear Voter,\n\nYou have successfully voted in the $election_name election.\n\n";
    foreach ($success_votes as $vote) {
        $message .= "You have voted for the position of {$vote['post_name']}.\n";
    }
    $message .= "\nThank you for participating in the democratic process.\n\nRegards,\ne-मत Team";

    sendEmail($voter_email, $subject, $message);
}

$response = [
    'success' => true,
    'message' => 'Voting process completed',
    'is_voted' => 1,
    'successful_votes' => $success_votes,
    'failed_votes' => $failed_votes,
    'ward_member_votes' => $post_counts['Ward Member'] 
];

echo json_encode($response);
?>