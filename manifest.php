<?php
/**
 * This script reads the manifest.json file, converts it to manifest.js format, and echoes the content.
 */

$manifestJsonPath = 'manifest.json'; // Path to the manifest.json file
$manifestJsPath = 'manifest.js'; // Path to the manifest.js file

// Function to convert JSON to JS format
function convertJsonToJs($jsonContent) {
    $jsContent = "export const manifest = " . json_encode($jsonContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . ";\n";
    // Replace double quotes with single quotes for JS format
    $jsContent = str_replace('"', "'", $jsContent);
    // Fix colons and commas to follow JS object syntax
    $jsContent = preg_replace("/'(\\w+)':/", '$1:', $jsContent);
    return $jsContent;
}

// Read the JSON file
$jsonContent = file_get_contents($manifestJsonPath);
if ($jsonContent === false) {
    die("Error reading manifest.json file.");
}

// Decode the JSON content
$manifestArray = json_decode($jsonContent, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    die("Error decoding JSON: " . json_last_error_msg());
}

// Convert JSON to JS format
$jsContent = convertJsonToJs($manifestArray);

// Save the JS content to manifest.js
file_put_contents($manifestJsPath, $jsContent);

// Echo the JS content
header('Content-Type: application/javascript');
echo $jsContent;
