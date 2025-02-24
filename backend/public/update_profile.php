<?php
// update_profile.php
include '../config/database.php';
include '../config/handle_cors.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "You are not logged in."]);
    exit;
}

$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['profilePhoto'])) {
        // Handle image upload
        $file = $_FILES['profilePhoto'];
        $allowed_types = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!in_array($file['type'], $allowed_types)) {
            echo json_encode(["success" => false, "message" => "Invalid file type. Only JPG, JPEG, and PNG are allowed."]);
            exit;
        }

        if ($file['size'] > 5 * 1024 * 1024) { // 5MB limit
            echo json_encode(["success" => false, "message" => "File size exceeds 5MB limit."]);
            exit;
        }

        $fileName = uniqid() . '_' . basename($file['name']);
        $uploadDir = '../uploads/profiles/'; // Ensure this directory exists and is writable
        $uploadPath = $uploadDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $stmt = $conn->prepare("UPDATE users SET profile_photo = ? WHERE user_id = ?");
            $stmt->bind_param("si", $fileName, $userId);
            $stmt->execute();

            echo json_encode(["success" => true, "message" => "Profile picture updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to upload file"]);
        }
    } elseif (isset($_POST['action']) && $_POST['action'] === 'remove_profile_photo') {
        // Handle profile picture removal
        $stmt = $conn->prepare("UPDATE users SET profile_photo = NULL WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Profile picture removed"]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid request"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>