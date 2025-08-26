<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'testshop');
define('DB_USER', 'root');
define('DB_PASS', '');
define('CLOUDFLARE_TURNSTILE_SECRET', '0x4AAAAAABi621wRGdLN-NPG9tMJCYxdgyw');
define("WHATSAPP_NUMBER", "+919999999999");


$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>