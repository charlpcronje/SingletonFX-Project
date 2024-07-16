<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * This script generates MD5 hashes for files specified in the manifest and tracks changes.
 * Adjust the $modulesDirectory and $manifestPath to point to your directories.
 */

// Configuration: Path to the modules directory and manifest file
$modulesDirectory = 'modules'; // Replace with the actual path
$manifestPath = 'manifest.json'; // Replace with the actual path
$hashFilePath = 'hashes.json'; // Path to save the hashes
$logFilePath = 'script.log'; // Path to save the log file

// Overwrite the log file at the beginning of each run
file_put_contents($logFilePath, ""); // Reset log file

// Log function to write messages to the log file
function logMessage($message) {
    global $logFilePath;
    file_put_contents($logFilePath, $message . PHP_EOL, FILE_APPEND);
}

// Read the manifest file and parse it
function readManifest($manifestPath) {
    logMessage("Reading manifest file: $manifestPath");
    $manifestContent = file_get_contents($manifestPath);
    if ($manifestContent === false) {
        logMessage("Error reading manifest file.");
        return [];
    }
    logMessage("Manifest content: $manifestContent");
    $manifestArray = json_decode($manifestContent, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        logMessage("Error decoding JSON: " . json_last_error_msg());
        return [];
    }
    logMessage("Successfully read and decoded manifest file.");
    return $manifestArray;
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
    logMessage("Generating hashes for files in directory: $directory");

    foreach ($manifest as $key => $module) {
        if (isset($module['path'])) {
            // Ensure the path is relative to the base directory
            $filePath = ltrim($module['path'], '/'); // Removed redundant directory prefix
            logMessage("Processing file: $filePath");
            if (file_exists($filePath)) {
                logMessage("File exists: $filePath");
                $fileContent = file_get_contents($filePath);
                if ($fileContent === false) {
                    logMessage("Error reading file: $filePath");
                    continue;
                }
                logMessage("Successfully read file: $filePath");
                $hash = md5($fileContent);
                $relativePath = str_replace($directory . DIRECTORY_SEPARATOR, '', $filePath);
                $hashes[$relativePath] = $hash;
                logMessage("Generated hash for $relativePath: $hash");
            } else {
                logMessage("File not found: $filePath");
            }
        } else {
            logMessage("No path specified for module: $key");
        }
    }

    return $hashes;
}

// Function to load the previous hashes from the file
function loadPreviousHashes($hashFilePath) {
    logMessage("Loading previous hashes from file: $hashFilePath");
    if (file_exists($hashFilePath)) {
        $hashesContent = file_get_contents($hashFilePath);
        if ($hashesContent === false) {
            logMessage("Error reading hashes file.");
            return [];
        }
        $previousHashes = json_decode($hashesContent, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            logMessage("Error decoding JSON: " . json_last_error_msg());
            return [];
        }
        logMessage("Successfully loaded previous hashes.");
        return $previousHashes;
    }
    logMessage("No previous hashes file found.");
    return array();
}

// Function to save the current hashes to the file
function saveHashes($hashes, $hashFilePath) {
    logMessage("Saving current hashes to file: $hashFilePath");
    $jsonContent = json_encode($hashes, JSON_PRETTY_PRINT);
    if ($jsonContent === false) {
        logMessage("Error encoding JSON: " . json_last_error_msg());
        return false;
    }
    $result = file_put_contents($hashFilePath, $jsonContent);
    if ($result === false) {
        logMessage("Error writing to hashes file.");
        return false;
    }
    logMessage("Successfully saved current hashes.");
    return true;
}

// Start of script execution
logMessage("Script execution started.");

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
        logMessage("Module invalidated: $module");
    } else {
        logMessage("Module unchanged: $module");
    }
}

// Save the current hashes for future comparison
saveHashes($currentHashes, $hashFilePath);

// Respond with the modules that need to be invalidated
header('Content-Type: application/json');
echo json_encode($invalidatedModules, JSON_PRETTY_PRINT);
logMessage("Invalidated modules: " . json_encode($invalidatedModules, JSON_PRETTY_PRINT));
logMessage("Script execution completed.");
