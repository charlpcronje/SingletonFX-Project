<?php
// tests/api/comments.php
header("Content-Type: application/json");
require_once 'json_helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$commentId = isset($_GET['id']) ? $_GET['id'] : null;
$commentsFile = 'comments.json';

switch ($method) {
    case 'GET':
        $comments = readJsonFile($commentsFile);
        if ($commentId) {
            $comment = isset($comments[$commentId]) ? $comments[$commentId] : null;
            if ($comment) {
                echo json_encode($comment);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Comment not found"]);
            }
        } else {
            echo json_encode(array_values($comments));
        }
        break;

    case 'POST':
        $comments = readJsonFile($commentsFile);
        $data = json_decode(file_get_contents("php://input"), true);
        $newId = (string)(count($comments) + 1);
        $comments[$newId] = $data + ['id' => $newId];
        writeJsonFile($commentsFile, $comments);
        echo json_encode($comments[$newId]);
        break;

    case 'PUT':
        if ($commentId) {
            $comments = readJsonFile($commentsFile);
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($comments[$commentId])) {
                $comments[$commentId] = $data + ['id' => $commentId];
                writeJsonFile($commentsFile, $comments);
                echo json_encode($comments[$commentId]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Comment not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Comment ID is required"]);
        }
        break;

    case 'DELETE':
        if ($commentId) {
            $comments = readJsonFile($commentsFile);
            if (isset($comments[$commentId])) {
                unset($comments[$commentId]);
                writeJsonFile($commentsFile, $comments);
                echo json_encode(["message" => "Comment deleted"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Comment not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Comment ID is required"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}