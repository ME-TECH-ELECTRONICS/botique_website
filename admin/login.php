<?php 
    session_start();
    //check if post method and email and password is there 
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email']) && isset($_POST['password'])) {
        $email = $_POST['email'];
        $password = $_POST['password'];

        // Validate email and password (you should implement your own validation)
        if (filter_var($email, FILTER_VALIDATE_EMAIL) && !empty($password)) {
            // Check credentials (you should implement your own authentication)
            if ($email === 'admin@example.com' && $password === 'password') {
                $_SESSION['loggedin'] = true;
                $_SESSION['user_name'] = 'Admin';
                $_SESSION['email'] = $email;
                header('Location: /admin/');
                exit;
            } else {
                $error = 'Invalid email or password';
            }
        } else {
            $error = 'Please enter a valid email and password';
        }
    }
?>
