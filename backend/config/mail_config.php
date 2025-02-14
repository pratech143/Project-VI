<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/autoload.php';  

define('SMTP_HOST', 'smtp.gmail.com'); 
define('SMTP_PORT', 587);  
define('SMTP_USER', 'aprabhat80@gmail.com'); 
define('SMTP_PASS', 'awimdzjtnpdizano');  
define('SMTP_FROM_EMAIL', 'no-reply@electionsystem.com'); 
define('SMTP_FROM_NAME', 'e-मत Team'); 

function sendEmail($to, $subject, $message) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;

        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($to);

        $mail->Subject = $subject;
        $mail->Body = $message;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Emal to $to failed: " . $e->getMessage());
        return false;
    }
}
?>