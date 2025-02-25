<?php
include '../config/database.php';

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="vote_logs.csv"');

$output = fopen('php://output', 'w');
fputcsv($output, ['Log ID', 'Voter ID', 'Election ID', 'Post ID', 'Candidate ID', 'Encrypted Candidate ID', 'Salt', 'Vote Hash', 'Status', 'Message', 'Timestamp']);

$result = $conn->query("SELECT * FROM vote_logs ORDER BY created_at DESC");
while ($row = $result->fetch_assoc()) {
    fputcsv($output, $row);
}

fclose($output);
?>