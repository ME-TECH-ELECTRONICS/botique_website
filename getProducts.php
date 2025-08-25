<?php
// Prevent browser from caching the JSON
header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
// Database connection
$host = "localhost";
$user = "root";
$pass = "";
$db   = "testshop"; //

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM products";
$result = $conn->query($sql);

$products = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['sizes']  = $row['sizes'] ? explode(",", $row['sizes']) : [];
        $row['images'] = $row['images'] ? explode(",", $row['images']) : [];
        $products[] = $row;
    }
}

header('Content-Type: application/json');
echo json_encode(["products" => $products], JSON_PRETTY_PRINT);
$conn->close();
?>