<?php

header("Content-Type: application/json");

if (!isset($_FILES["image"])) {

    http_response_code(400);

    echo json_encode([
        "error" => "No image uploaded."
    ]);

    exit;

}

$targetFolder = "images/";

$filename = basename($_FILES["image"]["name"]);

if (!move_uploaded_file(
    $_FILES["image"]["tmp_name"],
    $targetFolder . $filename
)) {

    http_response_code(500);

    echo json_encode([
        "error" => "Unable to save image."
    ]);

    exit;

}

echo json_encode([
    "filename" => $filename
]);

?>