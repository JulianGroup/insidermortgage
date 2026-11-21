<?php
/**
 * Native DreamHost Consultation Lead Emailer for insidermortgage.com
 *
 * Dispatches consultation form leads to rjain@insidermtg.com and dsider@insidermtg.com.
 * Uses native PHP mail() with -fnoreply@insidermortgage.com, and automatically
 * falls back to authenticated SSL SMTP via smtp.dreamhost.com:465. The SMTP
 * password lives on the server, outside the web root, in
 * ~/insidermortgage-secrets/smtp.password; never commit it to this repo.
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || empty($data['email']) || empty($data['name'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

function clean_text($val) {
    return trim(str_replace(["\r", "\n"], ' ', (string)$val));
}

function row_html($label, $value) {
    $safeLabel = htmlspecialchars((string)$label, ENT_QUOTES, 'UTF-8');
    $safeVal = htmlspecialchars($value !== '' ? (string)$value : '—', ENT_QUOTES, 'UTF-8');
    return "<tr>"
        . "<td style=\"padding:8px 12px;border:1px solid #cbd5e1;font-weight:bold;background:#f8fafc;width:40%;\">{$safeLabel}</td>"
        . "<td style=\"padding:8px 12px;border:1px solid #cbd5e1;\">{$safeVal}</td>"
        . "</tr>";
}

$to = 'rjain@insidermtg.com, dsider@insidermtg.com';
$fromAddress = 'noreply@insidermortgage.com';

$name = clean_text($data['name'] ?? '');
$email = filter_var(clean_text($data['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone = clean_text($data['phone'] ?? 'Not provided');
$category = clean_text($data['category'] ?? 'Website Consultation');
$shortPage = clean_text($data['shortPageName'] ?? 'Website');
$pageName = clean_text($data['pageName'] ?? '');
$pageUrl = clean_text($data['pageUrl'] ?? '');
$preferredDay = clean_text($data['preferredDay'] ?? '');
$preferredTime = clean_text($data['preferredTime'] ?? '');
$submittedAt = clean_text($data['submittedAtPacific'] ?? date('M j, Y g:i A'));

$subject = "New Lead [{$shortPage}]: {$name}" . ($category ? " ({$category})" : '');

$rows = '';
$rows .= row_html('Submitted From Page', $pageName);
$rows .= row_html('Page URL', $pageUrl);
$rows .= row_html('Full Name', $name);
$rows .= row_html('Email Address', $email);
$rows .= row_html('Phone Number', $phone);
$rows .= row_html('Borrower Profile / Form', $category);

if ($preferredDay !== '') {
    $rows .= row_html('Preferred Day(s)', $preferredDay);
}
if ($preferredTime !== '') {
    $rows .= row_html('Preferred Time (Pacific Time)', $preferredTime);
}
if (array_key_exists('smsConsent', $data) && is_bool($data['smsConsent'])) {
    $rows .= row_html('SMS Text Consent', $data['smsConsent'] ? 'Yes, you may text me' : 'No');
}

if (!empty($data['extraFields']) && is_array($data['extraFields'])) {
    foreach ($data['extraFields'] as $label => $val) {
        if (trim((string)$val) !== '') {
            $rows .= row_html((string)$label, (string)$val);
        }
    }
}

$rows .= row_html('Submitted At (PT)', "{$submittedAt} PT");

$htmlBody = "<!DOCTYPE html><html><body style=\"font-family:Arial,sans-serif;color:#1e293b;\">"
    . "<div style=\"max-width:620px;\">"
    . "<h2 style=\"color:#060a2d;margin-bottom:14px;\">New Website Consultation Request</h2>"
    . "<table style=\"width:100%;border-collapse:collapse;\">{$rows}</table>"
    . "</div></body></html>";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Insider Mortgage Website <{$fromAddress}>\r\n";
if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers .= "Reply-To: {$email}\r\n";
}

// 1. Try native PHP mail() first
$sent = @mail($to, $subject, $htmlBody, $headers, "-f{$fromAddress}");

// 2. Fallback to direct authenticated SSL SMTP if mail() fails
if (!$sent) {
    $sent = send_smtp_direct($to, $subject, $htmlBody, $email);
}

if ($sent) {
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server mail dispatch failed']);
}

function send_smtp_direct($to, $subject, $htmlBody, $replyTo) {
    $host = 'smtp.dreamhost.com';
    $port = 465;
    $user = 'noreply@insidermortgage.com';
    $passFile = dirname(__DIR__) . '/insidermortgage-secrets/smtp.password';
    $pass = is_readable($passFile) ? trim((string) file_get_contents($passFile)) : '';
    if ($pass === '') {
        error_log('send-lead.php: SMTP password file missing or empty');
        return false;
    }

    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ]
    ]);

    $socket = @stream_socket_client("ssl://{$host}:{$port}", $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
    if (!$socket) {
        return false;
    }

    $read = function() use ($socket) {
        $res = '';
        while ($line = fgets($socket, 512)) {
            $res .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        return $res;
    };

    $send = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    $res = $read();
    if (substr($res, 0, 3) !== '220') { fclose($socket); return false; }

    $send("EHLO insidermortgage.com");
    $res = $read();

    $send("AUTH LOGIN");
    $res = $read();
    if (substr($res, 0, 3) !== '334') { fclose($socket); return false; }

    $send(base64_encode($user));
    $res = $read();
    if (substr($res, 0, 3) !== '334') { fclose($socket); return false; }

    $send(base64_encode($pass));
    $res = $read();
    if (substr($res, 0, 3) !== '235') { fclose($socket); return false; }

    $send("MAIL FROM:<{$user}>");
    $res = $read();
    if (substr($res, 0, 3) !== '250') { fclose($socket); return false; }

    $recipients = array_map('trim', explode(',', $to));
    foreach ($recipients as $rcpt) {
        $send("RCPT TO:<{$rcpt}>");
        $res = $read();
    }

    $send("DATA");
    $res = $read();
    if (substr($res, 0, 3) !== '354') { fclose($socket); return false; }

    $msg = "From: Insider Mortgage Website <{$user}>\r\n";
    $msg .= "To: {$to}\r\n";
    if ($replyTo) {
        $msg .= "Reply-To: {$replyTo}\r\n";
    }
    $msg .= "Subject: {$subject}\r\n";
    $msg .= "MIME-Version: 1.0\r\n";
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
    $msg .= $htmlBody . "\r\n.\r\n";

    $send($msg);
    $res = $read();

    $send("QUIT");
    fclose($socket);

    return (substr($res, 0, 3) === '250');
}
