<?php

if (!isset($_POST["rooms"])) {

    http_response_code(400);
    exit("No room data received.");

}

$json = $_POST["rooms"];

file_put_contents(
    "buildings/stbenedicts/rooms.json",
    $json
);

echo "OK";

?>