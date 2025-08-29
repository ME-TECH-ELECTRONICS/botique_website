<?php
// create_product.php
require_once 'config.php';

// Get product data from request
$data = json_decode(file_get_contents("php://input"), true);

$productName       = isset($data['name']) ? trim($data['name']) : "";
$productCategory   = isset($data['category']) ? trim($data['category']) : "";
$productSizes      = isset($data['sizes']) ? trim($data['sizes']) : ""; // comma separated string
$productPrice      = isset($data['price']) ? floatval($data['price']) : 0.0;
$productMRP        = isset($data['mrp']) ? floatval($data['mrp']) : 0.0;
$productStock      = isset($data['stock']) ? intval($data['stock']) : 0;
$productThumbnail  = isset($data['thumbnail']) ? trim($data['thumbnail']) : "";
$productImages     = isset($data['images']) ? trim($data['images']) : ""; // comma separated string

if ($productName !== "" && $productPrice >= 0) {
    $stmt = $conn->prepare("
        INSERT INTO products 
        (name, category, sizes, price, mrp, stock, thumbnail, images) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param(
        "sssddiis", 
        $productName,
        $productCategory,
        $productSizes,
        $productPrice,
        $productMRP,
        $productStock,
        $productThumbnail,
        $productImages
    );

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Product created successfully",
            "id" => $stmt->insert_id // return new product ID
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Insert failed: " . $stmt->error]);
    }

    $stmt->close();
} else {

    echo json_encode(["success" => false, "message" => "Invalid input"]);
}

$conn->close();
?>
