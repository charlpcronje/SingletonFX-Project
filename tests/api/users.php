<?php
// tests/api/users.php
header("Content-Type: application/json");
require_once 'json_helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = isset($_GET['id']) ? $_GET['id'] : null;
$usersFile = 'users.json';

switch ($method) {
    case 'GET':
        $users = readJsonFile($usersFile);
        if ($userId) {
            $user = isset($users[$userId]) ? $users[$userId] : null;
            if ($user) {
                echo json_encode($user);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "User not found"]);
            }
        } else {
            echo json_encode(array_values($users));
        }
        break;

    case 'POST':
        $users = readJsonFile($usersFile);
        $data = json_decode(file_get_contents("php://input"), true);
        $newId = (string)(count($users) + 1);
        $users[$newId] = $data + ['id' => $newId];
        writeJsonFile($usersFile, $users);
        echo json_encode($users[$newId]);
        break;

    case 'PUT':
        if ($userId) {
            $users = readJsonFile($usersFile);
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($users[$userId])) {
                $users[$userId] = $data + ['id' => $userId];
                writeJsonFile($usersFile, $users);
                echo json_encode($users[$userId]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "User not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required"]);
        }
        break;

    case 'DELETE':
        if ($userId) {
            $users = readJsonFile($usersFile);
            if (isset($users[$userId])) {
                unset($users[$userId]);
                writeJsonFile($usersFile, $users);
                echo json_encode(["message" => "User deleted"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "User not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}