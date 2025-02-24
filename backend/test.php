<?php
include "config/database.php";
include 'config/handle_cors.php';
include 'config/encryption.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Password you are testing
$plain_password = "Password@123";

$encrypted_password = encryptData($plain_password);
echo "Encrypted Entered Password: " . $encrypted_password . "\n";

$decrypted_password = decryptData($encrypted_password);
echo "Decrypted Password: ". $decrypted_password. "\n";

if($plain_password == $decrypted_password){
    echo "Password Match!";
}
else{
     echo"go to hell";
}
?>