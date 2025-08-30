<?php
require_once '../config.php'; // fixed path (remove starting slash if same dir)
// Set appropriate headers
header('Content-Type: application/json');

function productExists(mysqli $conn, int $id): bool
{
    $stmt = $conn->prepare("SELECT 1 FROM products WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->store_result();

    $exists = $stmt->num_rows > 0;

    $stmt->free_result();
    $stmt->close();

    return $exists;
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

enum ActionType: string
{
    case Create = 'create';
    case Edit = 'edit';
    case Delete = 'delete';
    case NoAction = 'no_action';
}

//get action type
$actionTypeStr = $_POST['action_type'] ?? ActionType::NoAction->value;

if ($actionTypeStr === ActionType::NoAction->value) {
    echo json_encode(['success' => false, 'message' => 'No action type provided']);
    exit;
}

//switch based on $actionTypeStr 
switch ($actionTypeStr) {
    case ActionType::Create->value: {
            if (!isset($_POST['title']) && !isset($_POST['description']) && !isset($_POST['price']) && !isset($_POST['mrp']) && !isset($_POST['category']) && !isset($_POST['stockStatus']) && !isset($_POST['sizes'])) {
                
                exit();
            }
            // Get product name from form data
            $productName = $_POST['title'];
            $sanitizedProductName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $productName);

            // Define allowed file types and maximum size
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $maxFileSize = 1048576; // 1MB in bytes
            $uploadDir = '../assets/img/';

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
                    "sddisssss",
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
            exit;
        }
    case ActionType::Edit->value: {
            if (!isset($_POST['id']) && !isset($_POST['title']) && !isset($_POST['description']) && !isset($_POST['price']) && !isset($_POST['mrp']) && !isset($_POST['category']) && !isset($_POST['stockStatus']) && !isset($_POST['sizes'])) {
                exit();
            }

            // Get product name from form data
            $productId = isset($_POST['id']);
            $productName = isset($_POST['title']);
            $sanitizedProductName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $productName);
            if (!productExists($conn, $productId)) {
                echo json_encode(['success' => false, 'message' => 'Product not found']);
                exit();
            }
            // -------------------------
            // Collect Product Data
            // ------------------------
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

            $stmt = $conn->prepare("UPDATE products 
        SET title = ?, price = ?, mrp = ?, stock = ?, category = ?, sizes = ?, description = ?
        WHERE id = ?");

            $sizesStr = implode(',', $productData['sizes']);
            $stmt->bind_param(
                "sddisssi",
                $productData['title'],
                $productData['price'],
                $productData['mrp'],
                $productData['stockStatus'],
                $productData['category'],
                $sizesStr,
                $productData['description'],
                $productId
            );
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Product updated successfully',
                    'productId' => $productId
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'DB update failed: ' . $stmt->error]);
            }

            $stmt->close();
            $conn->close();
            exit;
        }
    case ActionType::Delete->value: {
            if (!isset($_POST['id'])) {
                echo json_encode(['success' => false, 'message' => 'No id provided']);
                exit();
            }
            $id = $_POST['id'];


            if (!productExists($conn, $productId)) {
                echo json_encode(['success' => false, 'message' => 'Product not found']);
                exit();
            }

            $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to delete product']);
            }
            $conn->close();
            exit;
        }
    default: {
            //invalid action type
            echo json_encode(['success' => false, 'message' => 'Invalid action type']);
            $conn->close();
            exit;
        }
        break;
}
