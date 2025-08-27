<?php
// delete_product.php
require_once '../config.php';
// Database connection

// Check connection
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Get product ID from request
$data = json_decode(file_get_contents("php://input"), true);
$productId = isset($data['id']) ? intval($data['id']) : 0;

if ($productId > 0) {
    $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    $stmt->bind_param("i", $productId);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Product deleted successfully"]);
    } else {

        echo json_encode(["success" => false, "message" => "Delete failed"]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid product ID"]);
}

$conn->close();
?>