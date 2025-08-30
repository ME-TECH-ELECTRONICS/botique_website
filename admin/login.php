<?php 
session_start();
require_once "../config.php";
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["username"]) && isset($_POST["password"]) && isset($_POST["captcha"])) {
    // Simulate user authentication
    $username = $_POST["username"];
    $password = $_POST["password"];
    $captcha = $_POST["captcha"];

    if(!verifyCaptcha($captcha)) {
        echo json_encode(["success" => false, "message" => "Invalid captcha."]);
        exit;
    }
    //prepare sql statement 
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    if ($row && password_verify($password, $row['password'])) {
        $_SESSION["admin_logged_in"] = true;
        $_SESSION["username"] = $username;
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid username or password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid username or password."]);
}

function verifyCaptcha($token) {
    $secret = CLOUDFLARE_TURNSTILE_SECRET;
    $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    
    $data = [
        'secret' => $secret,
        'response' => $token
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    $response = json_decode($result);

    return $response->success ?? false;
}
?>