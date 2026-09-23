<?php

header("Content-Type: application/json");

// --- 1. Basic validation -----------------------------------------------

if (!isset($_FILES["image"])) {
    http_response_code(400);
    echo json_encode(["error" => "No image uploaded."]);
    exit;
}

if ($_FILES["image"]["error"] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode([
        "error"      => "Upload error.",
        "php_error"  => $_FILES["image"]["error"] // see UPLOAD_ERR_* constants
    ]);
    exit;
}

$targetFolder = __DIR__ . "/images/";

// --- 2. Diagnostics: confirm folder state before trying anything --------

clearstatcache(true, $targetFolder);

if (!is_dir($targetFolder)) {
    http_response_code(500);
    echo json_encode([
        "error" => "Images folder does not exist.",
        "path"  => $targetFolder
    ]);
    exit;
}

// Don't just trust is_writable() on Windows/IIS - it can be unreliable
// with FastCGI. Attempt an actual write to get a real Windows error.
$probe = $targetFolder . ".write_test_" . uniqid();
$probeHandle = @fopen($probe, "w");

if ($probeHandle === false) {
    $lastError = error_get_last();
    http_response_code(500);
    echo json_encode([
        "error"       => "Images folder is not writable.",
        "path"        => $targetFolder,
        "php_message" => $lastError["message"] ?? null,
        "running_as"  => trim((string) @shell_exec("whoami"))
    ]);
    exit;
}

fclose($probeHandle);
@unlink($probe);

// --- 3. Sanitize filename and avoid collisions ---------------------------

$originalName = basename($_FILES["image"]["name"]);

// Strip anything that isn't alphanumeric, dot, dash or underscore
$safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName);

$ext  = pathinfo($safeName, PATHINFO_EXTENSION);
$base = pathinfo($safeName, PATHINFO_FILENAME);

// Guarantee uniqueness so simultaneous/multi uploads never overwrite
// each other (e.g. two rooms both uploading "photo.jpg")
$finalName = $base . "_" . uniqid() . ($ext !== "" ? "." . $ext : "");

$destination = $targetFolder . $finalName;

// --- 4. Move the uploaded file -------------------------------------------

if (!move_uploaded_file($_FILES["image"]["tmp_name"], $destination)) {
    $lastError = error_get_last();
    http_response_code(500);
    echo json_encode([
        "error"       => "Unable to save image.",
        "destination" => $destination,
        "php_message" => $lastError["message"] ?? null
    ]);
    exit;
}

echo json_encode([
    "filename" => $finalName
]);