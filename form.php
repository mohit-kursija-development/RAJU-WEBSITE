<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
include_once('../config.php');

//Load Composer's autoloader
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] != "POST"){ 
    header("refresh:0; url=index.html"); 
}

//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer(true);

try{
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $name = $_POST["name"];
    $email = $_POST["email"];
    $phone = $_POST["phone"];
    $query = $_POST["query"];
    if ($phone != " " && $phone != "9876543210" ){

    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = 'bom1plzcpnl503634.prod.bom1.secureserver.net';                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = 'admin@rajuenterprise.in';                     //SMTP username
    $mail->Password   = $ema;                               //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    //Recipients
    $mail->setFrom('admin@rajuenterprise.in', 'Admin');
    $mail->addAddress('admin@rajuenterprise.in','Contact Form'); 
    


    $mail->isHTML(true);                                  //Set email format to HTML
    $mail->Subject = 'New Query';
    $mail->Body    = '<h1>New Query</h1>'.'<br/>'.'Name: '.$name.'<br/>'.'<br/>'.'Email: '.$email.'<br/>'.'<br/>'.'Phone: '.$phone.'<br/>'.'<br/>'.'Query: '.$query;
    
    $mail->send();


    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

        $result = mysqli_query($mysqli, "INSERT INTO queries (name, email, phone, query) VALUES ('$name', '$email', '$phone','$query')");


        header("refresh:5; url=index.html");
    }
    }

}

catch (Exception $e) {
    $err_msg = 'Email could not be sent. Please call us for your query.';
    
}
?>

<html>
    <style>
        .block{
            display: flex;
            border: 5px solid black;
            width:100%;
            height:100%;
            padding: 15px;
            text-align:center;
            justify-content: center;
            align-items: center;
        }
    </style>
<body>
    <div class="block">
        <h1>Thank you for contacting us.</h1><br>
        <h2>We will revert to you in minimum time possible.</h2>
    </div>
</body>
</html>

