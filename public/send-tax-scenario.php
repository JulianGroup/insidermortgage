<?php
/**
 * Native DreamHost Branded HTML Scenario Emailer for First-Time Home Buyer Tax Savings Calculator
 *
 * Dispatches 2026 Tax Savings & Net Monthly Payment HTML reports to the user,
 * optional extra recipients, and optionally dsrj@insidermtg.com.
 * Uses authenticated SSL SMTP via smtp.dreamhost.com:465, with fallback to native mail().
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
$rateFile = sys_get_temp_dir() . '/im_tax_email_' . md5($clientIp) . '.json';
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
    $scenarioName = 'First-Time Buyer 2026 Tax Savings Scenario';
}

$note = trim((string)($data['note'] ?? ''));
if (strlen($note) > 1000) {
    $note = substr($note, 0, 1000);
}

$rawShareUrl = trim((string)($data['shareUrl'] ?? ''));
$fallbackUrl = 'https://insidermortgage.com/geek-out/first-time-buyer-tax-savings/';
$shareUrl = (strpos($rawShareUrl, 'https://insidermortgage.com/') === 0) ? $rawShareUrl : $fallbackUrl;

$sc = is_array($data['scenario'] ?? null) ? $data['scenario'] : [];

$purchasePrice = (float)($sc['purchasePrice'] ?? 0);
$downPaymentAmount = (float)($sc['downPaymentAmount'] ?? 0);
$downPaymentPct = (float)($sc['downPaymentPct'] ?? 0);
$loanAmount = (float)($sc['loanAmount'] ?? 0);
$interestRate = (float)($sc['interestRate'] ?? 0);
$loanTermYears = (int)($sc['loanTermYears'] ?? 30);
$stateLabel = clean_text($sc['stateLabel'] ?? 'California (CA)');
$filingStatus = clean_text($sc['filingStatus'] ?? 'Single');
$monthsInTaxYear = max(1, min(12, (int)($sc['monthsInTaxYear'] ?? 12)));
$horizonLabel = clean_text($sc['horizonLabel'] ?? 'First Full Calendar Year (12 Months)');
$w2Wages = (float)($sc['w2Wages'] ?? 0);

$grossMonthlyPitia = (float)($sc['grossMonthlyPitia'] ?? 0);
$netMonthlyCashFlow = (float)($sc['netMonthlyCashFlow'] ?? 0);
$monthlyTaxSavings = (float)($sc['monthlyTaxSavings'] ?? 0);
$annualTaxSavings = (float)($sc['annualTaxSavings'] ?? 0);
$fedTaxSavingsMonthly = (float)($sc['fedTaxSavingsMonthly'] ?? 0);
$stateTaxSavingsMonthly = (float)($sc['stateTaxSavingsMonthly'] ?? 0);
$monthlyPi = (float)($sc['monthlyPi'] ?? 0);
$monthlyPropertyTax = (float)($sc['monthlyPropertyTax'] ?? 0);
$otherHousingMonthly = (float)($sc['otherHousingMonthly'] ?? 0);

$betterOffStandardDeduction = !empty($sc['betterOffStandardDeduction']) || ($annualTaxSavings <= 0);
$fedBuyerItemizes = !empty($sc['fedBuyerItemizes']);
$stateBuyerItemizes = !empty($sc['stateBuyerItemizes']);

$filingLabel = $filingStatus === 'MFJ'
    ? 'Married Filing Jointly'
    : ($filingStatus === 'HOH' ? 'Head of Household' : 'Single');

$noteHtml = '';
if ($note !== '') {
    $safeNote = nl2br(esc($note));
    $noteHtml = "<div style=\"margin:0 0 18px;padding:12px 14px;background:#EFF6FF;border-left:4px solid #0468E9;border-radius:0 8px 8px 0;font-size:14px;color:#1E293B;\">"
        . "<strong style=\"color:#060A2D;\">Note from " . esc($senderEmail) . ":</strong><br/>{$safeNote}"
        . "</div>";
}

$stdDedHtml = '';
if ($betterOffStandardDeduction) {
    $stdDedHtml = "<div style=\"margin:0 0 18px;padding:12px 14px;background:#FFFBEB;border:1px solid #F59E0B;border-left:4px solid #D97706;border-radius:0 8px 8px 0;font-size:13px;color:#78350F;line-height:1.45;\">"
        . "<strong>Standard Deduction Applies:</strong> You are better off taking the Standard Deduction, which means there are no tax benefits with buying this house during this period."
        . "</div>";
} elseif (!$fedBuyerItemizes && $stateTaxSavingsMonthly > 0) {
    $stdDedHtml = "<div style=\"margin:0 0 18px;padding:12px 14px;background:#EFF6FF;border:1px solid #BFDBFE;border-left:4px solid #0468E9;border-radius:0 8px 8px 0;font-size:13px;color:#1E3A8A;line-height:1.45;\">"
        . "<strong>Federal Standard Deduction Applies:</strong> You are better off taking the Federal Standard Deduction (\$0 Federal tax savings), while still receiving state tax savings."
        . "</div>";
}

$savingsHeadlineHtml = $annualTaxSavings > 0
    ? "<div style=\"margin-top:12px;padding:10px 12px;background:#ECFDF5;border:1px solid #86EFAC;border-radius:8px;color:#166534;font-size:14px;font-weight:bold;\">"
      . "+" . fmt_currency($monthlyTaxSavings) . "/mo (" . fmt_currency($annualTaxSavings) . " over {$monthsInTaxYear} mos) Estimated Tax Savings"
      . "</div>"
    : "<div style=\"margin-top:12px;padding:10px 12px;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:8px;color:#475569;font-size:14px;font-weight:bold;\">"
      . "\$0/mo (\$0 for period) Estimated Tax Savings — Standard Deduction is higher"
      . "</div>";

$safeScenarioTitle = esc($scenarioName);
$safeShareUrl = esc($shareUrl);
$rateStr = number_format($interestRate * 100, 3);
$downPctStr = number_format($downPaymentPct * 100, 1);

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
                INSIDER MORTGAGE &middot; 2026 TAX SAVINGS CALCULATOR
              </div>
              <h1 style=\"margin:0;font-size:21px;line-height:1.25;color:#FFFFFF;\">
                {$safeScenarioTitle}
              </h1>
              <div style=\"margin-top:5px;font-size:12px;color:#CBD5E1;\">
                " . esc($stateLabel) . " &middot; " . esc($filingLabel) . " &middot; " . esc($horizonLabel) . "
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style=\"padding:24px 26px;\">
              {$noteHtml}
              {$stdDedHtml}

              <!-- Hero Cash Outflow Summary -->
              <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;margin-bottom:14px;\">
                <tr>
                  <td width=\"50%\" style=\"padding:14px;background:#060A2D;border:2px solid #EFB51E;border-radius:10px 0 0 10px;color:#FFFFFF;\">
                    <div style=\"font-size:11px;font-weight:bold;color:#CBD5E1;text-transform:uppercase;\">Net Monthly Cash Outflow</div>
                    <div style=\"font-size:11px;color:#94A3B8;\">(After-Tax PITIA)</div>
                    <div style=\"font-size:24px;font-weight:800;color:#EFB51E;margin-top:4px;\">" . fmt_currency($netMonthlyCashFlow) . "<span style=\"font-size:13px;color:#FDE68A;\">/mo</span></div>
                  </td>
                  <td width=\"50%\" style=\"padding:14px;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:0 10px 10px 0;color:#060A2D;\">
                    <div style=\"font-size:11px;font-weight:bold;color:#64748B;text-transform:uppercase;\">Gross Monthly PITIA</div>
                    <div style=\"font-size:11px;color:#64748B;\">(Before Tax Savings)</div>
                    <div style=\"font-size:22px;font-weight:800;color:#060A2D;margin-top:4px;\">" . fmt_currency($grossMonthlyPitia) . "<span style=\"font-size:13px;color:#475569;\">/mo</span></div>
                  </td>
                </tr>
              </table>

              {$savingsHeadlineHtml}

              <p style=\"margin:10px 0 20px;font-size:12px;color:#475569;line-height:1.45;\">
                Tax savings are realized when filing tax returns or by updating your W-4 withholding.
              </p>

              <h2 style=\"margin:0 0 10px;font-size:14px;color:#060A2D;text-transform:uppercase;letter-spacing:0.5px;\">
                1. Monthly Housing &amp; Tax Breakdown
              </h2>
              <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;border:1px solid #E2E8F0;font-size:13px;margin-bottom:20px;\">
                <tbody>
                  <tr style=\"background:#FFFFFF;\">
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;color:#334155;\">Principal &amp; Interest (P&amp;I)</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:#060A2D;\">" . fmt_currency($monthlyPi) . "/mo</td>
                  </tr>
                  <tr style=\"background:#F8FAFC;\">
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;color:#334155;\">Property Taxes</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:#060A2D;\">" . fmt_currency($monthlyPropertyTax) . "/mo</td>
                  </tr>
                  <tr style=\"background:#FFFFFF;\">
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;color:#334155;\">Insurance + PMI + HOA</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:#060A2D;\">" . fmt_currency($otherHousingMonthly) . "/mo</td>
                  </tr>
                  <tr style=\"background:#F0FDF4;\">
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;color:#166534;font-weight:600;\">Minus: Federal Income Tax Savings (" . ($fedBuyerItemizes ? 'Itemized' : 'Std Ded') . ")</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:#15803D;\">-" . fmt_currency($fedTaxSavingsMonthly) . "/mo</td>
                  </tr>
                  <tr style=\"background:#F0FDF4;\">
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;color:#166534;font-weight:600;\">Minus: State Income Tax Savings (" . ($stateBuyerItemizes ? 'Itemized' : 'Std/0%') . ")</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:#15803D;\">-" . fmt_currency($stateTaxSavingsMonthly) . "/mo</td>
                  </tr>
                  <tr style=\"background:#FFFBEB;\">
                    <td style=\"padding:10px;font-weight:800;color:#060A2D;\">Net Monthly Cash Outflow (After-Tax PITIA)</td>
                    <td style=\"padding:10px;text-align:right;font-weight:800;font-size:15px;color:#060A2D;\">" . fmt_currency($netMonthlyCashFlow) . "/mo</td>
                  </tr>
                </tbody>
              </table>

              <h2 style=\"margin:0 0 10px;font-size:14px;color:#060A2D;text-transform:uppercase;letter-spacing:0.5px;\">
                2. Home, Loan &amp; 2026 Tax Profile Inputs
              </h2>
              <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;border:1px solid #E2E8F0;font-size:13px;margin-bottom:22px;\">
                <tbody>
                  <tr style=\"background:#F8FAFC;\">
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;color:#475569;\">Purchase Price</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:#0F172A;\">" . fmt_currency($purchasePrice) . "</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;color:#475569;\">Down Payment</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:#0F172A;\">" . fmt_currency($downPaymentAmount) . " ({$downPctStr}%)</td>
                  </tr>
                  <tr style=\"background:#FFFFFF;\">
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;color:#475569;\">Loan Amount</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:#0F172A;\">" . fmt_currency($loanAmount) . "</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;color:#475569;\">Rate / Term</td>
                    <td style=\"padding:8px 10px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:#0F172A;\">{$rateStr}% / {$loanTermYears}-Yr Fixed</td>
                  </tr>
                  <tr style=\"background:#F8FAFC;\">
                    <td style=\"padding:8px 10px;color:#475569;\">W-2 Box 1 Wages</td>
                    <td style=\"padding:8px 10px;text-align:right;font-weight:700;color:#0F172A;\">" . fmt_currency($w2Wages) . "</td>
                    <td style=\"padding:8px 10px;color:#475569;\">Analysis Period</td>
                    <td style=\"padding:8px 10px;text-align:right;font-weight:700;color:#0F172A;\">{$monthsInTaxYear} Months</td>
                  </tr>
                </tbody>
              </table>

              <!-- CTA Button -->
              <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
                <tr>
                  <td align=\"center\" style=\"padding:6px 0 4px;\">
                    <a href=\"{$safeShareUrl}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"display:inline-block;background-color:#060A2D;color:#EFB51E;text-decoration:none;font-weight:bold;font-size:15px;padding:13px 26px;border-radius:999px;border:2px solid #EFB51E;\">
                      Open Tax Savings Scenario →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=\"background-color:#F8FAFC;padding:16px 26px;border-top:1px solid #E2E8F0;font-size:12px;color:#475569;line-height:1.5;\">
              <strong style=\"color:#060A2D;\">David Sider</strong> (NMLS #254108 &middot; CA DRE #01193796) &amp;
              <strong style=\"color:#060A2D;\">Rakesh Jain</strong> (NMLS #240594 &middot; CA DRE #01336748)<br/>
              Insider Mortgage powered by C2 Financial Corporation (NMLS #135622 &middot; CA DRE #01821025) &middot; (858) 848-5653 &middot;
              <a href=\"mailto:dsrj@insidermtg.com\" style=\"color:#0468E9;\">dsrj@insidermtg.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

$subject = "2026 Home Buyer Tax Savings Scenario: {$scenarioName}";
$fromAddress = 'noreply@insidermortgage.com';
$replyTo = $shareWithTeam ? $senderEmail : 'dsrj@insidermtg.com';
$toHeader = implode(', ', $finalRecipients);

// 1. Prefer authenticated SSL SMTP via smtp.dreamhost.com:465
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
        error_log('send-tax-scenario.php: SMTP password file missing or empty');
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
    $msgId = '<tax-' . bin2hex(random_bytes(8)) . '@insidermortgage.com>';
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
