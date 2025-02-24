<?php

$secret_key = "8703eed875b2c832dfe2583a34851212805df7b1b778f8981b3fd67a32fdc630";

define('ENCRYPTION_KEY', hex2bin('ee51a202c256f7bffc9bdccba2db14584204cca30c4c1c6cb96a20f4ffbeae97'));

function generateIV() {
    return openssl_random_pseudo_bytes(16); 
}

function encryptData($data) {
    $iv = generateIV();

    $encryptedData = openssl_encrypt($data, "AES-256-CBC", ENCRYPTION_KEY, 0, $iv);

    return base64_encode($iv . $encryptedData);
}

function decryptData($encryptedData) {

    $data = base64_decode($encryptedData);

    $iv = substr($data, 0, 16);
    $encryptedData = substr($data, 16); 

    return openssl_decrypt($encryptedData, "AES-256-CBC", ENCRYPTION_KEY, 0, $iv);
}

?>