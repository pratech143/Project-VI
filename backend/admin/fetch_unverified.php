<?php
session_start();

include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) {
    echo json_encode(["success" => false, "message" => "Unauthorized access."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->prepare("
            SELECT 
                u.user_id, u.voter_id, u.email, u.is_verified, 
                gv.name AS voter_name, gv.dob, gv.ward, 
                l.location_name, l.district_name, l.location_type, u.voter_id_image
            FROM users u
            JOIN government_voters gv ON u.voter_id = gv.voter_id
            JOIN locations l ON gv.location_id = l.location_id
            WHERE u.is_verified = 0
        ");
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $pendingVoters = [];

            while ($row = $result->fetch_assoc()) {
                if ($row['voter_id_image']) {
                    $row['voter_id_image'] = base64_encode($row['voter_id_image']);
                }

                if (!$row['is_verified']) {
                    $pendingVoters[] = $row;
                }
            }

            echo json_encode([
                "success" => true,
                "pending_voters" => $pendingVoters
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "No unverified voters found."
            ]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error fetching voters: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>