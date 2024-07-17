<?php
// tests/api/posts.php
header("Content-Type: application/json");
require_once 'json_helper.php';

$method = $_SERVER['REQUEST_METHOD'];
$postId = isset($_GET['id']) ? $_GET['id'] : null;
$postsFile = 'posts.json';

switch ($method) {
    case 'GET':
        $posts = readJsonFile($postsFile);
        if ($postId) {
            $post = isset($posts[$postId]) ? $posts[$postId] : null;
            if ($post) {
                echo json_encode($post);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Post not found"]);
            }
        } else {
            echo json_encode(array_values($posts));
        }
        break;

    case 'POST':
        $posts = readJsonFile($postsFile);
        $data = json_decode(file_get_contents("php://input"), true);
        $newId = (string)(count($posts) + 1);
        $posts[$newId] = $data + ['id' => $newId];
        writeJsonFile($postsFile, $posts);
        echo json_encode($posts[$newId]);
        break;

    case 'PUT':
        if ($postId) {
            $posts = readJsonFile($postsFile);
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($posts[$postId])) {
                $posts[$postId] = $data + ['id' => $postId];
                writeJsonFile($postsFile, $posts);
                echo json_encode($posts[$postId]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Post not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Post ID is required"]);
        }
        break;

    case 'DELETE':
        if ($postId) {
            $posts = readJsonFile($postsFile);
            if (isset($posts[$postId])) {
                unset($posts[$postId]);
                writeJsonFile($postsFile, $posts);
                echo json_encode(["message" => "Post deleted"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Post not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Post ID is required"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}