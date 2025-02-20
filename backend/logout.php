<?php
session_start();

include 'config/database.php';
include 'config/handle_cors.php';

if (isset($_SESSION)) {
    $_SESSION = [];

    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(), 
            '', 
            time() - 3600,
            $params["path"],
            $params["domain"], 
            $params["secure"], 
            $params["httponly"]
        );
    }
    session_unset();
    session_destroy();

    echo json_encode([
        'success' => true,
        'message' => 'User logged out successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No active session to log out from'
    ]);
}

exit;

?>
