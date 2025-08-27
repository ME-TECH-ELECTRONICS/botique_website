<?php
require_once '../config.php'; // fixed path (remove starting slash if same dir)

// Set appropriate headers
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get product name from form data
$productName = isset($_POST['title']) ? $_POST['title'] : 'product';
$sanitizedProductName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $productName);

// Define allowed file types and maximum size
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxFileSize = 1048576; // 1MB in bytes
$uploadDir = 'uploads/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$uploadedFiles = [];
$errors = [];
$thumbnailPath = "";
$imagePaths = [];

// -------------------------
// Process Thumbnail
// -------------------------
if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['thumbnail'];
    $fileName = $file['name'];
    $fileSize = $file['size'];
    $fileType = $file['type'];

    if (!in_array($fileType, $allowedTypes)) {
        $errors[] = "Thumbnail $fileName is not an allowed image type";
    } elseif ($fileSize > $maxFileSize) {
        $errors[] = "Thumbnail $fileName exceeds the 1MB size limit";
    } else {
        $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
        $newFileName = $sanitizedProductName . '_thumbnail.' . $fileExtension;
        $destination = $uploadDir . $newFileName;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            $thumbnailPath = $destination;
            $uploadedFiles[] = [
                'originalName' => $fileName,
                'savedName' => $newFileName,
                'path' => $destination,
                'type' => 'thumbnail'
            ];
        } else {
            $errors[] = "Failed to move uploaded thumbnail $fileName";
        }
    }
} else {
    $errors[] = "No thumbnail image uploaded";
}

// -------------------------
// Process Additional Images
// -------------------------
if (isset($_FILES['images']) && count($_FILES['images']['tmp_name']) > 0) {
    $imageCount = 1;
    foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
        if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
            $fileName = $_FILES['images']['name'][$key];
            $fileSize = $_FILES['images']['size'][$key];
            $fileType = $_FILES['images']['type'][$key];

            if (!in_array($fileType, $allowedTypes)) {
                $errors[] = "File $fileName is not an allowed image type";
                continue;
            }
            if ($fileSize > $maxFileSize) {
                $errors[] = "File $fileName exceeds the 1MB size limit";
                continue;
            }

            $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
            $newFileName = $sanitizedProductName . '_img_' . $imageCount . '.' . $fileExtension;
            $destination = $uploadDir . $newFileName;

            if (move_uploaded_file($tmpName, $destination)) {
                $imagePaths[] = $destination;
                $uploadedFiles[] = [
                    'originalName' => $fileName,
                    'savedName' => $newFileName,
                    'path' => $destination,
                    'type' => 'image'
                ];
                $imageCount++;
            } else {
                $errors[] = "Failed to move uploaded file $fileName";
            }
        }
    }
}

// -------------------------
// Collect Product Data
// -------------------------
$productData = [
    'title' => $productName,
    'description' => $_POST['description'] ?? '',
    'price' => $_POST['price'] ?? 0,
    'mrp' => $_POST['mrp'] ?? 0,
    'category' => ($_POST['category'] === 'other') ? ($_POST['newCategory'] ?? 'Other') : $_POST['category'],
    'stockStatus' => $_POST['stockStatus'] ?? 'InStock',
    'sizes' => isset($_POST['sizes']) ? explode(',', $_POST['sizes']) : []
];

// -------------------------
// Insert into DB if no errors
// -------------------------
if (count($errors) === 0) {
    $stmt = $conn->prepare("INSERT INTO products 
        (title, price, mrp, stock, category, sizes, thumbnail, images, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $sizesStr = implode(',', $productData['sizes']);
    $imagesStr = implode(',', $imagePaths); // store paths as CSV

    $stmt->bind_param(
        "sdddssssd",
        $productData['title'],
        $productData['price'],
        $productData['mrp'],
        $productData['stockStatus'],
        $productData['category'],
        $sizesStr,
        $thumbnailPath,
        $imagesStr,
        $productData['description']
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Product created successfully',
            'productId' => $stmt->insert_id,
            // 'product' => $productData,
            // 'uploadedFiles' => $uploadedFiles
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'DB insert failed: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Product created but some files had errors',
        'product' => $productData,
        'uploadedFiles' => $uploadedFiles,
        'errors' => $errors
    ]);
}

$conn->close();
?>
