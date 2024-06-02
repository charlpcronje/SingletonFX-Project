<?php
/**
 * This script generates MD5 hashes for files specified in the manifest and tracks changes.
 * Adjust the $modulesDirectory and $manifestPath to point to your directories.
 */

// Configuration: Path to the modules directory and manifest file
$modulesDirectory = '/path/to/your/modules'; // Replace with the actual path
$manifestPath = '/path/to/your/manifest.js'; // Replace with the actual path
$hashFilePath = 'hashes.json'; // Path to save the hashes

// Read the manifest file and parse it
function readManifest($manifestPath) {
    $manifestContent = file_get_contents($manifestPath);
    // Strip the export statement to get the JSON-like structure
    $jsonContent = preg_replace('/export\s+const\s+\w+\s+=\s+/', '', $manifestContent);
    $jsonContent = rtrim($jsonContent, ';');
    return json_decode($jsonContent, true);
}

/**
 * Function to generate MD5 hashes for specified files based on the manifest.
 *
 * @param string $directory The base directory where modules are located.
 * @param array $manifest The manifest array containing module paths.
 * @return array An associative array of relative paths and their MD5 hashes.
 */
function generateHashes($directory, $manifest) {
    $hashes = array();

    foreach ($manifest as $module) {
        if (isset($module['path'])) {
            $filePath = $directory . DIRECTORY_SEPARATOR . $module['path'];
            if (file_exists($filePath)) {
                $fileContent = file_get_contents($filePath);
                $hash = md5($fileContent);
                // Use relative path for the file key in the JSON
                $relativePath = str_replace($directory . DIRECTORY_SEPARATOR, '', $filePath);
                $hashes[$relativePath] = $hash;
            }
        }
    }

    return $hashes;
}

// Function to load the previous hashes from the file
function loadPreviousHashes($hashFilePath) {
    if (file_exists($hashFilePath)) {
        $hashesContent = file_get_contents($hashFilePath);
        return json_decode($hashesContent, true);
    }
    return array();
}

// Function to save the current hashes to the file
function saveHashes($hashes, $hashFilePath) {
    file_put_contents($hashFilePath, json_encode($hashes, JSON_PRETTY_PRINT));
}

// Read the manifest and generate the current hashes
$manifest = readManifest($manifestPath);
$currentHashes = generateHashes($modulesDirectory, $manifest);

// Load the previous hashes
$previousHashes = loadPreviousHashes($hashFilePath);

// Compare the hashes to find the modules that need to be invalidated
$invalidatedModules = array();
foreach ($currentHashes as $module => $hash) {
    if (!isset($previousHashes[$module]) || $previousHashes[$module] !== $hash) {
        $invalidatedModules[] = $module;
    }
}

// Save the current hashes for future comparison
saveHashes($currentHashes, $hashFilePath);

// Respond with the modules that need to be invalidated
header('Content-Type: application/json');
echo json_encode($invalidatedModules, JSON_PRETTY_PRINT);
