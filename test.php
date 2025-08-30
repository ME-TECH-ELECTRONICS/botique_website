<?php
// Example password (in real case, this comes from user input)
$password = "CrushTheBottleAfterUse64@@";

// Create a hash
$hash = password_hash($password, PASSWORD_DEFAULT);

// Show the original password and the hash
echo "Password: " . $password . "<br>";
echo "Hashed: " . $hash . "<br><br>";

// Verify password
$check1 = password_verify("CrushTheBottleAfterUse64@@", $hash);
$check2 = password_verify("WrongPassword", $hash);

echo "Correct password? " . ($check1 ? "✅ Yes" : "❌ No") . "<br>";
echo "Wrong password? " . ($check2 ? "✅ Yes" : "❌ No") . "<br>";
?>
