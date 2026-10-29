<?php
/**
 * Native DreamHost Consultation Lead Emailer for insidermortgage.com
 *
 * Note on DreamHost Sender Domain Policy:
 * DreamHost shared hosting requires the "From:" address (noreply@insidermortgage.com)
 * to be an active mailbox hosted under insidermortgage.com in the DreamHost panel.
 * Once Jason creates noreply@insidermortgage.com in DreamHost -> Manage Email,
 * this endpoint delivers instant HTML lead notifications with zero third-party services.
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

$sent = @mail($to, $subject, $htmlBody, $headers, "-f{$fromAddress}");

if ($sent) {
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server mail dispatch failed']);
}
