<?php
/**
 * Cards state API for BeeePro Timeline.
 * GET: return current state (cards) from file.
 * POST: save state (JSON body) to file.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$file = __DIR__ . '/cards.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  if (!is_file($file)) {
    echo json_encode(['cards' => []]);
    exit;
  }
  $raw = file_get_contents($file);
  $data = $raw !== false ? json_decode($raw, true) : null;
  if (!is_array($data) || !array_key_exists('cards', $data)) {
    echo json_encode(['cards' => []]);
    exit;
  }
  echo json_encode($data);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $body = file_get_contents('php://input');
  $data = json_decode($body, true);
  if (!is_array($data) || !array_key_exists('cards', $data) || !is_array($data['cards'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON or missing cards array']);
    exit;
  }
  $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  if (file_put_contents($file, $json) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write file']);
    exit;
  }
  echo json_encode(['ok' => true]);
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
