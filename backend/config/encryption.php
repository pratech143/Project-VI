<?php

define('ENCRYPTION_KEY', hex2bin('ee51a202c256f7bffc9bdccba2db14584204cca30c4c1c6cb96a20f4ffbeae97'));
define('ENCRYPTION_IV', hex2bin('ecab21247310c35c8ec3474391ba7932'));

function encryptData($data) {
    return base64_encode(openssl_encrypt($data, "AES-256-CBC", ENCRYPTION_KEY, 0, ENCRYPTION_IV));
}

function decryptData($encryptedData) {
    return openssl_decrypt(base64_decode($encryptedData), "AES-256-CBC", ENCRYPTION_KEY, 0, ENCRYPTION_IV);
}

?>