<?php
/**
 * Native DreamHost Branded HTML Scenario Emailer for insidermortgage.com
 *
 * Dispatches Weighted Average & HELOC consolidation HTML reports to the user,
 * optional extra recipients, and optionally dsrj@insidermtg.com.
 * Uses native PHP mail() with -fnoreply@insidermortgage.com, and automatically
 * falls back to authenticated SSL SMTP via smtp.dreamhost.com:465.
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON payload']);
    exit;
}

// Honeypot check: silently succeed for bots
if (!empty($data['website'])) {
    echo json_encode(['status' => 'success']);
    exit;
}

// Basic per-IP rate limiting (max 10 requests per 10 minutes)
$clientIp = preg_replace('/[^a-fA-F0-9\.\:]/', '_', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$rateFile = sys_get_temp_dir() . '/im_wa_email_' . md5($clientIp) . '.json';
$now = time();
$window = 600;
$maxRequests = 10;
$timestamps = [];
if (is_readable($rateFile)) {
    $decoded = json_decode((string)file_get_contents($rateFile), true);
    if (is_array($decoded)) {
        $timestamps = array_values(array_filter($decoded, function ($ts) use ($now, $window) {
            return is_int($ts) && ($now - $ts) < $window;
        }));
    }
}
if (count($timestamps) >= $maxRequests) {
    http_response_code(429);
    echo json_encode(['status' => 'error', 'message' => 'Too many email requests. Please wait a few minutes and try again.']);
    exit;
}
$timestamps[] = $now;
@file_put_contents($rateFile, json_encode($timestamps));

function clean_text($val) {
    return trim(str_replace(["\r", "\n"], ' ', (string)$val));
}

function esc($val) {
    return htmlspecialchars((string)$val, ENT_QUOTES, 'UTF-8');
}

function fmt_currency($val) {
    $num = (float)$val;
    if ($num < 0) {
        return '-$' . number_format(abs($num), 0);
    }
    return '$' . number_format($num, 0);
}

$senderEmail = filter_var(clean_text($data['senderEmail'] ?? ''), FILTER_VALIDATE_EMAIL);
if (!$senderEmail) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please enter a valid email address.']);
    exit;
}

$recipients = [$senderEmail];

if (!empty($data['otherEmails']) && is_array($data['otherEmails'])) {
    foreach ($data['otherEmails'] as $rawOther) {
        $cleaned = clean_text($rawOther);
        if ($cleaned === '') continue;
        $validOther = filter_var($cleaned, FILTER_VALIDATE_EMAIL);
        if (!$validOther) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => "Invalid recipient email: {$cleaned}"]);
            exit;
        }
        $recipients[] = $validOther;
    }
}

$shareWithTeam = !empty($data['shareWithTeam']);
if ($shareWithTeam) {
    $recipients[] = 'dsrj@insidermtg.com';
}

// Deduplicate (case-insensitive) and cap at 5 recipients
$uniqueMap = [];
foreach ($recipients as $rcpt) {
    $key = strtolower($rcpt);
    if (!isset($uniqueMap[$key])) {
        $uniqueMap[$key] = $rcpt;
    }
}
$finalRecipients = array_values($uniqueMap);

if (count($finalRecipients) > 5) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Maximum of 5 recipients per email.']);
    exit;
}

$scenarioName = clean_text($data['scenarioName'] ?? '');
if ($scenarioName === '') {
    $scenarioName = 'Debt & HELOC Scenario';
}
$note = trim((string)($data['note'] ?? ''));
if (strlen($note) > 1000) {
    $note = substr($note, 0, 1000);
}

$rawShareUrl = trim((string)($data['shareUrl'] ?? ''));
$fallbackUrl = 'https://insidermortgage.com/geek-out/weighted-average/';
$shareUrl = (strpos($rawShareUrl, 'https://insidermortgage.com/') === 0) ? $rawShareUrl : $fallbackUrl;

$rows = is_array($data['rows'] ?? null) ? array_slice($data['rows'], 0, 10) : [];
$loanType = (($data['loanType'] ?? 'heloc') === 'fixed') ? 'fixed' : 'heloc';
$loanTypeLabel = ($loanType === 'fixed') ? 'Fixed 2nd (30-Yr Amort P&amp;I)' : 'HELOC 2nd (Interest-Only)';
$loanBadgeText = ($loanType === 'fixed') ? 'Fixed 2nd Payoff' : 'HELOC Payoff';
$helocRate = (float)($data['helocRate'] ?? 0);
$totals = is_array($data['totals'] ?? null) ? $data['totals'] : [];

$totalPayment = (float)($totals['totalPayment'] ?? 0);
$weightedAvgRate = (float)($totals['weightedAverageRate'] ?? 0);
$totalBalance = (float)($totals['totalBalance'] ?? 0);
$payoffPayment = (float)($totals['payoffPayment'] ?? 0);
$payoffWeightedRate = (float)($totals['payoffWeightedAverageRate'] ?? 0);
$helocBalance = (float)($totals['helocBalance'] ?? 0);
$helocPayment = (float)($totals['helocPayment'] ?? 0);
$newTotalPayment = (float)($totals['newTotalPayment'] ?? 0);
$newWeightedRate = (float)($totals['newWeightedAverageRate'] ?? 0);
$monthlySavings = $totalPayment - $newTotalPayment;

// Build Debt Table Rows HTML
$debtRowsHtml = '';
foreach ($rows as $idx => $r) {
    if (!is_array($r)) continue;
    $bal = (float)($r['balance'] ?? 0);
    $pmt = (float)($r['payment'] ?? 0);
    $rate = (float)($r['rate'] ?? 0);
    $desc = clean_text($r['description'] ?? '');
    if ($desc === '' && $bal <= 0 && $pmt <= 0) continue;
    if ($desc === '') $desc = 'Debt ' . ($idx + 1);
    $isPayoff = !empty($r['payoff']);
    $rowBg = $isPayoff ? '#FEF2F2' : '#FFFFFF';
    $badgeHtml = $isPayoff
        ? "<span style=\"display:inline-block;background:#EFB51E;color:#060A2D;font-size:11px;font-weight:bold;padding:2px 7px;border-radius:999px;\">{$loanBadgeText}</span>"
        : '<span style="color:#64748B;font-size:12px;">Keep</span>';

    $debtRowsHtml .= "<tr style=\"background:{$rowBg};\">"
        . "<td style=\"padding:9px 10px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#0F172A;\">" . esc($desc) . "</td>"
        . "<td style=\"padding:9px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:600;color:#0F172A;\">" . fmt_currency($bal) . "</td>"
        . "<td style=\"padding:9px 10px;border-bottom:1px solid #E2E8F0;text-align:right;color:#334155;\">" . fmt_currency($pmt) . "/mo</td>"
        . "<td style=\"padding:9px 10px;border-bottom:1px solid #E2E8F0;text-align:right;color:#334155;\">" . number_format($rate, 3) . "%</td>"
        . "<td style=\"padding:9px 10px;border-bottom:1px solid #E2E8F0;text-align:center;\">{$badgeHtml}</td>"
        . "</tr>";
}

if ($debtRowsHtml === '') {
    $debtRowsHtml = '<tr><td colspan="5" style="padding:12px;text-align:center;color:#64748B;">No debt rows entered.</td></tr>';
}

$noteHtml = '';
if ($note !== '') {
    $safeNote = nl2br(esc($note));
    $noteHtml = "<div style=\"margin:0 0 18px;padding:12px 14px;background:#EFF6FF;border-left:4px solid #0468E9;border-radius:0 8px 8px 0;font-size:14px;color:#1E293B;\">"
        . "<strong style=\"color:#060A2D;\">Note from " . esc($senderEmail) . ":</strong><br/>{$safeNote}"
        . "</div>";
}

$savingsBadge = $monthlySavings > 0
    ? "<span style=\"display:inline-block;margin-left:8px;background:#10B981;color:#FFFFFF;font-size:12px;font-weight:bold;padding:3px 9px;border-radius:999px;\">Save " . fmt_currency($monthlySavings) . "/mo</span>"
    : '';

$safeScenarioTitle = esc($scenarioName);
$safeShareUrl = esc($shareUrl);
$helocRateStr = number_format($helocRate, 3);
$rateDrop = $weightedAvgRate - $newWeightedRate;
$rateDropText = $rateDrop > 0.001
    ? " <span style=\"color:#15803D;font-size:12px;font-weight:bold;\">(Drop of " . number_format($rateDrop, 2) . "%)</span>"
    : '';

$htmlBody = "<!DOCTYPE html>
<html>
<body style=\"margin:0;padding:0;background-color:#F1F5F9;font-family:Arial,Helvetica,sans-serif;color:#1E293B;\">
  <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#F1F5F9;padding:24px 12px;\">
    <tr>
      <td align=\"center\">
        <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:660px;background-color:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #CBD5E1;\">
          <!-- Header -->
          <tr>
            <td style=\"background-color:#060A2D;padding:24px 26px;border-bottom:4px solid #EFB51E;\">
              <div style=\"font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#EFB51E;margin-bottom:6px;\">
                Insider Mortgage · Blended Rate &amp; HELOC Analyzer
              </div>
              <h1 style=\"margin:0;font-size:22px;line-height:1.25;color:#FFFFFF;\">
                {$safeScenarioTitle}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style=\"padding:24px 26px;\">
              {$noteHtml}

              <h2 style=\"margin:0 0 10px;font-size:15px;color:#060A2D;text-transform:uppercase;letter-spacing:0.5px;\">
                1. Debt Schedule Breakdown
              </h2>
              <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;border:1px solid #E2E8F0;font-size:13px;margin-bottom:22px;\">
                <thead>
                  <tr style=\"background-color:#F8FAFC;\">
                    <th style=\"padding:9px 10px;text-align:left;border-bottom:2px solid #CBD5E1;color:#060A2D;\">Description</th>
                    <th style=\"padding:9px 10px;text-align:right;border-bottom:2px solid #CBD5E1;color:#060A2D;\">Balance</th>
                    <th style=\"padding:9px 10px;text-align:right;border-bottom:2px solid #CBD5E1;color:#060A2D;\">Payment /mo</th>
                    <th style=\"padding:9px 10px;text-align:right;border-bottom:2px solid #CBD5E1;color:#060A2D;\">Rate</th>
                    <th style=\"padding:9px 10px;text-align:center;border-bottom:2px solid #CBD5E1;color:#060A2D;\">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {$debtRowsHtml}
                </tbody>
              </table>

              <h2 style=\"margin:0 0 10px;font-size:15px;color:#060A2D;text-transform:uppercase;letter-spacing:0.5px;\">
                2. Before &amp; After HELOC Consolidation
              </h2>
              <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;margin-bottom:22px;\">
                <tr>
                  <td style=\"padding:12px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;\">
                    <div style=\"font-size:12px;font-weight:bold;color:#64748B;text-transform:uppercase;\">Current Debt Summary</div>
                    <div style=\"margin-top:6px;font-size:14px;color:#0F172A;\">
                      Total Balance: <strong>" . fmt_currency($totalBalance) . "</strong> &nbsp;|&nbsp;
                      Total Payment: <strong>" . fmt_currency($totalPayment) . "/mo</strong> &nbsp;|&nbsp;
                      Blended Rate: <strong>" . number_format($weightedAvgRate, 3) . "%</strong>
                    </div>
                  </td>
                </tr>
                <tr><td style=\"height:10px;\"></td></tr>
                <tr>
                  <td style=\"padding:12px 14px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;\">
                    <div style=\"font-size:12px;font-weight:bold;color:#B91C1C;text-transform:uppercase;\">Debt Being Paid Off (with New Consolidation Loan)</div>
                    <div style=\"margin-top:6px;font-size:14px;color:#0F172A;\">
                      Total Payoff: <strong>" . fmt_currency($helocBalance) . "</strong> &nbsp;|&nbsp;
                      Current Payments: <strong>" . fmt_currency($payoffPayment) . "/mo</strong> &nbsp;|&nbsp;
                      Blended Rate: <strong>" . number_format($payoffWeightedRate, 3) . "%</strong>
                    </div>
                  </td>
                </tr>
                <tr><td style=\"height:10px;\"></td></tr>
                <tr>
                  <td style=\"padding:14px;background:#FFFBEB;border:2px solid #EFB51E;border-radius:8px;\">
                    <div style=\"font-size:12px;font-weight:bold;color:#92400E;text-transform:uppercase;\">
                      NEW Debt Summary · {$loanTypeLabel} @ {$helocRateStr}% {$savingsBadge}
                    </div>
                    <div style=\"margin-top:6px;font-size:15px;color:#060A2D;\">
                      Total Debt: <strong>" . fmt_currency($totalBalance) . "</strong> &nbsp;|&nbsp;
                      New Total Payments: <strong>" . fmt_currency($newTotalPayment) . "/mo</strong> &nbsp;|&nbsp;
                      New Blended Rate: <strong>" . number_format($newWeightedRate, 3) . "%</strong>{$rateDropText}
                    </div>
                    <div style=\"margin-top:4px;font-size:12px;color:#475569;\">
                      New consolidation loan payment on " . fmt_currency($helocBalance) . ": " . fmt_currency($helocPayment) . "/mo ({$loanTypeLabel})
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
                <tr>
                  <td align=\"center\" style=\"padding:8px 0 6px;\">
                    <a href=\"{$safeShareUrl}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"display:inline-block;background-color:#060A2D;color:#EFB51E;text-decoration:none;font-weight:bold;font-size:15px;padding:13px 26px;border-radius:999px;border:2px solid #EFB51E;\">
                      Open Blended Rate Scenario →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=\"background-color:#F8FAFC;padding:16px 26px;border-top:1px solid #E2E8F0;font-size:12px;color:#475569;line-height:1.5;\">
              <strong style=\"color:#060A2D;\">David Sider</strong> (NMLS #254108 · CA DRE #01193796) &amp;
              <strong style=\"color:#060A2D;\">Rakesh Jain</strong> (NMLS #240594 · CA DRE #01336748)<br/>
              Insider Mortgage powered by C2 Financial Corporation (NMLS #135622) · (858) 848-5653 ·
              <a href=\"mailto:dsrj@insidermtg.com\" style=\"color:#0468E9;\">dsrj@insidermtg.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

$subject = "Blended Rate & HELOC Scenario: {$scenarioName}";
$fromAddress = 'noreply@insidermortgage.com';
$replyTo = $shareWithTeam ? $senderEmail : 'dsrj@insidermtg.com';
$toHeader = implode(', ', $finalRecipients);

// 1. Prefer authenticated SSL SMTP via smtp.dreamhost.com:465 (proper SPF/DKIM & real 250 delivery)
$smtpError = '';
$sent = send_smtp_direct($finalRecipients, $toHeader, $subject, $htmlBody, $replyTo, $smtpError);
$transport = $sent ? 'smtp' : '';

// 2. Fallback to native PHP mail() if SMTP password is unavailable
if (!$sent) {
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Insider Mortgage <{$fromAddress}>\r\n";
    $headers .= "Reply-To: {$replyTo}\r\n";
    $sent = @mail($toHeader, $subject, $htmlBody, $headers, "-f{$fromAddress}");
    if ($sent) {
        $transport = 'mail';
    }
}

if ($sent) {
    echo json_encode(['status' => 'success', 'recipients' => $finalRecipients, 'transport' => $transport]);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unable to send email right now. Please try again.',
        'detail' => $smtpError,
    ]);
}

function send_smtp_direct($recipientList, $toHeader, $subject, $htmlBody, $replyTo, &$errorOut = '') {
    $host = 'smtp.dreamhost.com';
    $port = 465;
    $user = 'noreply@insidermortgage.com';
    $passFile = dirname(__DIR__) . '/insidermortgage-secrets/smtp.password';
    $pass = is_readable($passFile) ? trim((string) file_get_contents($passFile)) : '';
    if ($pass === '') {
        $errorOut = 'smtp.password missing or unreadable';
        error_log('send-scenario.php: SMTP password file missing or empty');
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
        $errorOut = "connect failed: {$errstr}";
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
    if (substr($res, 0, 3) !== '220') { $errorOut = "banner: {$res}"; fclose($socket); return false; }

    $send("EHLO insidermortgage.com");
    $read();

    $send("AUTH LOGIN");
    $res = $read();
    if (substr($res, 0, 3) !== '334') { $errorOut = "auth: {$res}"; fclose($socket); return false; }

    $send(base64_encode($user));
    $res = $read();
    if (substr($res, 0, 3) !== '334') { $errorOut = "user: {$res}"; fclose($socket); return false; }

    $send(base64_encode($pass));
    $res = $read();
    if (substr($res, 0, 3) !== '235') { $errorOut = "pass: {$res}"; fclose($socket); return false; }

    $send("MAIL FROM:<{$user}>");
    $res = $read();
    if (substr($res, 0, 3) !== '250') { $errorOut = "mail_from: {$res}"; fclose($socket); return false; }

    $acceptedRcpts = 0;
    foreach ($recipientList as $rcpt) {
        $send("RCPT TO:<{$rcpt}>");
        $rcptRes = $read();
        $code = substr($rcptRes, 0, 3);
        if ($code === '250' || $code === '251') {
            $acceptedRcpts++;
        } else {
            $errorOut = "rcpt_to ({$rcpt}): {$rcptRes}";
        }
    }
    if ($acceptedRcpts === 0) {
        fclose($socket);
        return false;
    }

    $send("DATA");
    $res = $read();
    if (substr($res, 0, 3) !== '354') { $errorOut = "data: {$res}"; fclose($socket); return false; }

    $dateHeader = gmdate('D, d M Y H:i:s +0000');
    $msgId = '<wa-' . bin2hex(random_bytes(8)) . '@insidermortgage.com>';
    $msg = "Date: {$dateHeader}\r\n";
    $msg .= "Message-ID: {$msgId}\r\n";
    $msg .= "From: Insider Mortgage <{$user}>\r\n";
    $msg .= "To: {$toHeader}\r\n";
    if ($replyTo) {
        $msg .= "Reply-To: {$replyTo}\r\n";
    }
    $msg .= "Subject: {$subject}\r\n";
    $msg .= "MIME-Version: 1.0\r\n";
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
    $msg .= $htmlBody . "\r\n.\r\n";

    $send($msg);
    $res = $read();
    if (substr($res, 0, 3) !== '250') {
        $errorOut = "send_data: {$res}";
    }

    $send("QUIT");
    fclose($socket);

    return (substr($res, 0, 3) === '250');
}
