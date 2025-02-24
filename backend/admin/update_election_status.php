<?php
include '../config/database.php'; // Make sure the database connection file is correct

// Get the current date and time
$currentDate = date('Y-m-d H:i:s');

// Query to update elections that have ended
$update_query = "UPDATE elections SET status = 'completed' WHERE end_date < ? AND status = 'Ongoing'";

$update_status = $conn->prepare($update_query);
$update_status->bind_param("s", $currentDate);

// Execute the query
if ($update_status->execute()) {
    echo json_encode(["success" => true, "message" => "Elections updated successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update elections."]);
}
?>
