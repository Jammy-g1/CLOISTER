<?php

header("Content-Type: application/json");

if (!isset($_POST["rooms"])) {

    http_response_code(400);

    echo json_encode([
        "error" => "No room data received."
    ]);

    exit;

}

$json = $_POST["rooms"];

$file = "buildings/stbenedicts/rooms.json";

if (!file_put_contents($file, $json)) {

    http_response_code(500);

    echo json_encode([
        "error" => "Unable to save rooms."
    ]);

    exit;

}

echo json_encode([
    "success" => true
]);

?>