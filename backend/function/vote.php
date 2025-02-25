<?php
session_start();

// **Enforce HTTPS to secure session data**
// if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
//     echo json_encode(["success" => false, "message" => "HTTPS is required."]);
//     exit;
// }

// **Set session cookie to secure to prevent interception**
// ini_set('session.cookie_secure', 1);

include '../config/database.php';
include '../config/mail_config.php';
include '../config/handle_cors.php';
include '../config/encryption.php'; 

header('Content-Type: application/json');

if (!isset($_SESSION['voter_id']) || $_SESSION['role'] !== 0) {
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

if (!is_int($election_id)) {
    echo json_encode(["success" => false, "message" => "Invalid election_id"]);
    exit;
}

foreach ($votes as $vote) {
    if (!isset($vote['post_id']) || !is_int($vote['post_id'])) {
        echo json_encode(["success" => false, "message" => "Invalid post_id"]);
        exit;
    }
    if (isset($vote['candidate_id'])) {
        if (is_array($vote['candidate_id'])) {
            foreach ($vote['candidate_id'] as $cid) {
                if (!is_int($cid)) {
                    echo json_encode(["success" => false, "message" => "Invalid candidate_id"]);
                    exit;
                }
            }
        } else if (!is_int($vote['candidate_id'])) {
            echo json_encode(["success" => false, "message" => "Invalid candidate_id"]);
            exit;
        }
    } else {
        echo json_encode(["success" => false, "message" => "Missing candidate_id"]);
        exit;
    }
}

if (empty($voter_id) || empty($election_id) || !is_array($votes) || count($votes) === 0) {
    echo json_encode(["success" => false, "message" => "Missing required fields or empty vote data"]);
    exit;
}

$voter_check = $conn->prepare("SELECT email, is_voted FROM users WHERE voter_id = ?");
$voter_check->bind_param("s", $voter_id);
$voter_check->execute();
$voter_result = $voter_check->get_result();

if ($voter_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Voter not found"]);
    exit;
}

$voter_data = $voter_result->fetch_assoc();
$voter_email = $voter_data['email'];

if ($voter_data['is_voted'] == 1) {
    echo json_encode(["success" => false, "message" => "You have already voted."]);
    exit;
}

$vote_check = $conn->prepare("SELECT COUNT(*) FROM votes WHERE voter_id = ? AND election_id = ?");
$vote_check->bind_param("si", $voter_id, $election_id);
$vote_check->execute();
$vote_result = $vote_check->get_result();
$vote_count = $vote_result->fetch_row()[0];
if ($vote_count > 0) {
    echo json_encode(["success" => false, "message" => "You have already voted in this election."]);
    exit;
}

$election_check = $conn->prepare("SELECT name, start_date, end_date, status FROM elections WHERE election_id = ?");
$election_check->bind_param("i", $election_id);
$election_check->execute();
$election_result = $election_check->get_result();

if ($election_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Election not found"]);
    exit;
}

$election_data = $election_result->fetch_assoc();
$election_name = $election_data['name'];
$current_date = date("Y-m-d");

if ($election_data['status'] !== 'Ongoing' || $current_date < $election_data['start_date'] || $current_date > $election_data['end_date']) {
    echo json_encode(["success" => false, "message" => "This election is not active or has expired"]);
    exit;
}

$flattened_votes = [];
foreach ($votes as $vote) {
    $post_id = $vote['post_id'];
    $candidate_ids = is_array($vote['candidate_id']) ? $vote['candidate_id'] : [$vote['candidate_id']];

    $post_query = $conn->prepare("SELECT post_name FROM posts WHERE post_id = ?");
    $post_query->bind_param("i", $post_id);
    $post_query->execute();
    $post_result = $post_query->get_result();
    if ($post_result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Post not found"]);
        exit;
    }
    $post_name = $post_result->fetch_assoc()['post_name'];

    if ($post_name !== 'Ward Member' && count($candidate_ids) > 1) {
        echo json_encode(["success" => false, "message" => "Only one candidate can be selected for post: " . $post_name]);
        exit;
    }

    foreach ($candidate_ids as $single_candidate_id) {
        $flattened_votes[] = [
            'post_id' => $post_id,
            'candidate_id' => $single_candidate_id,
            'post_name' => $post_name
        ];
    }
}

$ward_member_votes = array_filter($flattened_votes, function ($vote) {
    return $vote['post_id'] === 4;
});
if (count($ward_member_votes) !== 4) {
    echo json_encode(["success" => false, "message" => "You must select exactly 4 Ward Members."]);
    exit;
}

$ward_member_candidate_ids = array_column($ward_member_votes, 'candidate_id');
if (count($ward_member_candidate_ids) !== count(array_unique($ward_member_candidate_ids))) {
    echo json_encode(["success" => false, "message" => "Duplicate candidates selected for Ward Member."]);
    exit;
}

$success_votes = [];
$failed_votes = [];

$conn->begin_transaction();
try {
    foreach ($flattened_votes as $vote) {
        $candidate_id = $vote['candidate_id'];
        $post_id = $vote['post_id'];

        $candidate_check = $conn->prepare("SELECT candidate_id FROM candidates WHERE candidate_id = ? AND post_id = ?");
        $candidate_check->bind_param("ii", $candidate_id, $post_id);
        $candidate_check->execute();
        $candidate_result = $candidate_check->get_result();

        if ($candidate_result->num_rows === 0) {
            $failed_votes[] = ["post_id" => $post_id, "candidate_id" => $candidate_id, "message" => "Candidate not found"];

            $log_stmt = $conn->prepare("INSERT INTO vote_logs (voter_id, election_id, post_id, candidate_id, encrypted_candidate_id, salt, vote_hash, status, message) VALUES (?, ?, ?, ?, '', '', '', 'FAILED', ?)");
            $log_stmt->bind_param("siiss", $voter_id, $election_id, $post_id, $candidate_id, $failed_votes[count($failed_votes) - 1]['message']);
            $log_stmt->execute();

            continue;
        }

        $random_salt = bin2hex(random_bytes(8));
        $vote_data_string = "$voter_id$election_id$post_id$candidate_id";
        $signature = hash_hmac("sha256", $vote_data_string, $secret_key);
        $vote_hash = hash("sha256", $vote_data_string . $random_salt);

        $encrypted_candidate_id = encryptData((string)$candidate_id);
        if ($encrypted_candidate_id === false) {
            throw new Exception("Encryption failed for candidate_id: " . $candidate_id);
        }

        $insert_vote = $conn->prepare("INSERT INTO votes (voter_id, election_id, post_id, encrypted_candidate_id, salt, vote_hash, signature) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $insert_vote->bind_param("siissss", $voter_id, $election_id, $post_id, $encrypted_candidate_id, $random_salt, $vote_hash, $signature);

        if ($insert_vote->execute()) {
            $success_votes[] = $vote;

            $log_stmt = $conn->prepare("INSERT INTO vote_logs (voter_id, election_id, post_id, candidate_id, encrypted_candidate_id, salt, vote_hash, status, message) VALUES (?, ?, ?, ?, ?, ?, ?, 'SUCCESS', 'Vote recorded successfully')");
            $log_stmt->bind_param("siissss", $voter_id, $election_id, $post_id, $candidate_id, $encrypted_candidate_id, $random_salt, $vote_hash);
            $log_stmt->execute();
        } else {
            $failed_votes[] = ["post_id" => $post_id, "candidate_id" => $candidate_id, "message" => "Failed to cast vote"];

            $log_stmt = $conn->prepare("INSERT INTO vote_logs (voter_id, election_id, post_id, candidate_id, encrypted_candidate_id, salt, vote_hash, status, message) VALUES (?, ?, ?, ?, '', '', '', 'FAILED', ?)");
            $log_stmt->bind_param("siiss", $voter_id, $election_id, $post_id, $candidate_id, $failed_votes[count($failed_votes) - 1]['message']);
            $log_stmt->execute();
        }
    }

    if (count($success_votes) > 0) {
        $update_voted = $conn->prepare("UPDATE users SET is_voted = 1 WHERE voter_id = ?");
        $update_voted->bind_param("s", $voter_id);
        $update_voted->execute();
    }

    $conn->commit();
} catch (Exception $e) {
    $conn->rollback();

    $log_stmt = $conn->prepare("INSERT INTO vote_logs (voter_id, election_id, post_id, candidate_id, encrypted_candidate_id, salt, vote_hash, status, message) VALUES (?, ?, 0, '', '', '', '', 'INVALID_ATTEMPT', ?)");
    $log_stmt->bind_param("sis", $voter_id, $election_id, $e->getMessage());
    $log_stmt->execute();

    echo json_encode(["success" => false, "message" => "Voting failed. Error: " . $e->getMessage()]);
    exit;
}

$conn->query("UPDATE users u JOIN votes v ON u.voter_id = v.voter_id JOIN elections e ON v.election_id = e.election_id SET u.is_voted = 0 WHERE e.status = 'Completed'");

if (count($success_votes) > 0) {
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
    'ward_member_votes' => array_column($ward_member_votes, 'candidate_id')
];

echo json_encode($response);
?>