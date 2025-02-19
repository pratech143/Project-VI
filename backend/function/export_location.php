<?php
include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

$stmt = $conn->prepare("SELECT district_name, location_name, location_type, wards FROM locations");
$stmt->execute();
$result = $stmt->get_result();

$locations = [];

while ($row = $result->fetch_assoc()) {
    $district = $row['district_name'];

    if (!isset($locations[$district])) {
        $locations[$district] = [];
    }
    
    $locations[$district][] = [
        "location_name" => $row['location_name'],
        "location_type" => $row['location_type'],
        "wards" => $row['wards']
    ];
}

echo json_encode(["success" => true, "locations" => $locations], JSON_PRETTY_PRINT);
?>