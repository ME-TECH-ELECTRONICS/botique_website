<?php
// Prevent browser from caching the JSON
header("Content-Type: application/json");
require_once "config.php";

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM products";
$result = $conn->query($sql);

$products = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['id']    = (int)$row['id'];                         // Cast id to integer
        $row['price'] = (float)$row['price'];                   // Cast price to float
        $row['mrp']   = (float)$row['mrp'];                     // Cast mrp to float
        $row['stock'] = (bool)$row['stock'];                    // Cast stock to boolean
        $row['sizes'] = $row['sizes'] ? explode(",", $row['sizes']) : [];
        $row['images'] = $row['images'] ? explode(",", $row['images']) : [];
        $products[] = $row;
    }
}

echo json_encode($products, JSON_PRETTY_PRINT);

$conn->close();
?>
