<?php
// tests/api/json_helper.php

/**
 * Reads a JSON file and returns its contents as an associative array.
 * If the file doesn't exist, it creates an empty JSON file.
 *
 * @param string $filename The name of the JSON file to read
 * @return array The contents of the JSON file as an associative array
 */
function readJsonFile($filename) {
    if (!file_exists($filename)) {
        file_put_contents($filename, json_encode([]));
    }
    return json_decode(file_get_contents($filename), true);
}

/**
 * Writes data to a JSON file.
 *
 * @param string $filename The name of the JSON file to write to
 * @param array $data The data to write to the file
 */
function writeJsonFile($filename, $data) {
    file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
}