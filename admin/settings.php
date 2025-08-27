<?php
require_once '../config.php';
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['whatsappNumber'])) {
       //save to database $conn
       $whatsappNumber = $input['whatsappNumber'];
       $stmt = $conn->prepare("UPDATE settings SET whatsapp_number = ? WHERE id = 1");
       $stmt->bind_param("s", $whatsappNumber);
       if ($stmt->execute()) {
           echo json_encode(['status' => 'success', 'message' => 'Settings updated successfully.']);
       } else {
           echo json_encode(['status' => 'error', 'message' => 'Failed to update settings.']);
       }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Whatsapp number is required.']);
    }
} else if($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT whatsapp_number FROM settings WHERE id = 1");
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(['status' => 'success', 'whatsappNumber' => $row['whatsapp_number']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Settings not found.']);
    }
}
?>