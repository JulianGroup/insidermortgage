<?php
/**
 * Native DreamHost Branded HTML Scenario Emailer for Rental Property Investment Analyzer
 *
 * Dispatches Investment Property Analyzer HTML reports (1 or multiple scenarios)
 * to the user, optional extra recipients, and optionally dsrj@insidermtg.com.
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
$rateFile = sys_get_temp_dir() . '/im_ra_email_' . md5($clientIp) . '.json';
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

function fmt_pct($val, $decimals = 2) {
    return number_format((float)$val, $decimals) . '%';
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

$rawScenarios = is_array($data['scenarios'] ?? null) ? array_slice($data['scenarios'], 0, 10) : [];
if (count($rawScenarios) === 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please select at least one scenario to email.']);
    exit;
}

$note = trim((string)($data['note'] ?? ''));
if (strlen($note) > 1000) {
    $note = substr($note, 0, 1000);
}

$fallbackUrl = 'https://insidermortgage.com/tools/rental-analyzer/';

$noteHtml = '';
if ($note !== '') {
    $safeNote = nl2br(esc($note));
    $noteHtml = "<div style=\"margin:0 0 20px;padding:12px 14px;background:#EFF6FF;border-left:4px solid #0468E9;border-radius:0 8px 8px 0;font-size:14px;color:#1E293B;\">"
        . "<strong style=\"color:#060A2D;\">Note from " . esc($senderEmail) . ":</strong><br/>{$safeNote}"
        . "</div>";
}

$scenarioCount = count($rawScenarios);
$firstName = clean_text($rawScenarios[0]['propertyAddress'] ?? $rawScenarios[0]['name'] ?? 'Investment Property Scenario');
if ($firstName === '') {
    $firstName = 'Investment Property Scenario';
}

$headerTitle = ($scenarioCount === 1)
    ? esc($firstName)
    : "Investment Property Scenarios ({$scenarioCount} Properties)";

$subject = ($scenarioCount === 1)
    ? "Investment Property Scenario: {$firstName}"
    : "Investment Property Scenarios ({$scenarioCount} Properties) - Insider Mortgage";

// Build optional comparison table when 2+ scenarios are included
$comparisonHtml = '';
if ($scenarioCount > 1) {
    $compRows = '';
    foreach ($rawScenarios as $idx => $sc) {
        if (!is_array($sc)) continue;
        $label = clean_text($sc['name'] ?? $sc['propertyAddress'] ?? ('Property ' . ($idx + 1)));
        $price = (float)($sc['purchasePrice'] ?? 0);
        $rent = (float)($sc['totalMonthlyRent'] ?? 0);
        $coc = (float)($sc['cocPct'] ?? 0);
        $dscr = (float)($sc['dscr'] ?? 0);
        $cap = (float)($sc['capRate'] ?? 0);
        $irr10 = (float)($sc['irr10Pct'] ?? 0);
        $cocColor = $coc >= 0 ? '#15803D' : '#B91C1C';
        $rowBg = ($idx % 2 === 0) ? '#FFFFFF' : '#F8FAFC';

        $compRows .= "<tr style=\"background:{$rowBg};\">"
            . "<td style=\"padding:8px 9px;border-bottom:1px solid #E2E8F0;font-weight:700;color:#060A2D;\">" . esc($label) . "</td>"
            . "<td style=\"padding:8px 9px;border-bottom:1px solid #E2E8F0;text-align:right;color:#0F172A;\">" . fmt_currency($price) . "</td>"
            . "<td style=\"padding:8px 9px;border-bottom:1px solid #E2E8F0;text-align:right;color:#0F172A;\">" . fmt_currency($rent) . "/mo</td>"
            . "<td style=\"padding:8px 9px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:{$cocColor};\">" . fmt_pct($coc, 2) . "</td>"
            . "<td style=\"padding:8px 9px;border-bottom:1px solid #E2E8F0;text-align:right;color:#0F172A;\">" . fmt_pct($dscr, 2) . "</td>"
            . "<td style=\"padding:8px 9px;border-bottom:1px solid #E2E8F0;text-align:right;color:#0F172A;\">" . fmt_pct($cap, 2) . "</td>"
            . "<td style=\"padding:8px 9px;border-bottom:1px solid #E2E8F0;text-align:right;font-weight:700;color:#060A2D;\">" . fmt_pct($irr10, 2) . "</td>"
            . "</tr>";
    }

    $comparisonHtml = "<h2 style=\"margin:0 0 10px;font-size:14px;color:#060A2D;text-transform:uppercase;letter-spacing:0.5px;\">"
        . "Side-by-Side Scenario Summary"
        . "</h2>"
        . "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;border:1px solid #E2E8F0;font-size:12px;margin-bottom:22px;\">"
        . "<thead><tr style=\"background-color:#060A2D;color:#FFFFFF;\">"
        . "<th style=\"padding:8px 9px;text-align:left;\">Property</th>"
        . "<th style=\"padding:8px 9px;text-align:right;\">Price</th>"
        . "<th style=\"padding:8px 9px;text-align:right;\">Rent</th>"
        . "<th style=\"padding:8px 9px;text-align:right;\">COC</th>"
        . "<th style=\"padding:8px 9px;text-align:right;\">DSCR</th>"
        . "<th style=\"padding:8px 9px;text-align:right;\">Cap</th>"
        . "<th style=\"padding:8px 9px;text-align:right;\">10-Yr IRR</th>"
        . "</tr></thead>"
        . "<tbody>{$compRows}</tbody>"
        . "</table>";
}

// Build individual scenario detail cards
$scenarioCardsHtml = '';
foreach ($rawScenarios as $idx => $sc) {
    if (!is_array($sc)) continue;

    $name = clean_text($sc['name'] ?? '');
    $address = clean_text($sc['propertyAddress'] ?? $name);
    if ($address === '') $address = 'Investment Property ' . ($idx + 1);
    $unitCount = max(1, (int)($sc['unitCount'] ?? 1));
    $unitLabel = $unitCount === 1 ? '1 Unit' : "{$unitCount} Units";

    $purchasePrice = (float)($sc['purchasePrice'] ?? 0);
    $downPaymentPct = (float)($sc['downPaymentPct'] ?? 0);
    $interestRate = (float)($sc['interestRate'] ?? 0);
    $loanAmount = (float)($sc['loanAmount'] ?? 0);
    $initialCash = (float)($sc['initialCashInvested'] ?? 0);
    $totalMonthlyRent = (float)($sc['totalMonthlyRent'] ?? 0);
    $totalPitia = (float)($sc['totalMonthlyPitia'] ?? 0);

    $cocPct = (float)($sc['cocPct'] ?? 0);
    $year1CashFlow = (float)($sc['year1CashFlow'] ?? 0);
    $dscr = (float)($sc['dscr'] ?? 0);
    $year1Noi = (float)($sc['year1Noi'] ?? 0);
    $capRate = (float)($sc['capRate'] ?? 0);

    $irr5Pct = (float)($sc['irr5Pct'] ?? 0);
    $profit5 = (float)($sc['profit5'] ?? 0);
    $roi5Pct = (float)($sc['roi5Pct'] ?? 0);
    $irr10Pct = (float)($sc['irr10Pct'] ?? 0);
    $profit10 = (float)($sc['profit10'] ?? 0);
    $roi10Pct = (float)($sc['roi10Pct'] ?? 0);

    $refiNote = clean_text($sc['refiNote'] ?? '');
    $aduNote = clean_text($sc['aduNote'] ?? '');
    $agentInfo = clean_text($sc['agentInfo'] ?? '');
    $listingUrl = trim((string)($sc['listingUrl'] ?? ''));

    $rawUrl = trim((string)($sc['shareUrl'] ?? ''));
    $shareUrl = (strpos($rawUrl, 'https://insidermortgage.com/') === 0) ? $rawUrl : $fallbackUrl;

    $cocColor = $cocPct >= 0 ? '#15803D' : '#B91C1C';
    $dscrColor = $dscr >= 1.0 ? '#15803D' : '#B45309';

    $extrasHtml = '';
    if ($refiNote !== '' || $aduNote !== '') {
        $pills = [];
        if ($refiNote !== '') $pills[] = 'Refinance: ' . esc($refiNote);
        if ($aduNote !== '') $pills[] = 'ADU: ' . esc($aduNote);
        $extrasHtml = "<div style=\"margin-top:10px;padding:8px 10px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:6px;font-size:12px;color:#92400E;\">"
            . "<strong>Active What-If Modeling:</strong> " . implode(' &nbsp;|&nbsp; ', $pills)
            . "</div>";
    }

    $agentHtml = '';
    if ($agentInfo !== '') {
        $listingLinkHtml = (strpos($listingUrl, 'https://') === 0 || strpos($listingUrl, 'http://') === 0)
            ? " &nbsp;·&nbsp; <a href=\"" . esc($listingUrl) . "\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:#0468E9;font-weight:bold;\">View Listing →</a>"
            : '';
        $agentHtml = "<div style=\"margin-top:8px;font-size:12px;color:#475569;\">"
            . "<strong>Curated Deal:</strong> " . esc($agentInfo) . $listingLinkHtml
            . "</div>";
    }

    $cardNumberPrefix = $scenarioCount > 1 ? ($idx + 1) . '. ' : '';

    $scenarioCardsHtml .= "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;border:1px solid #CBD5E1;border-radius:10px;overflow:hidden;margin-bottom:20px;\">"
        // Card header
        . "<tr><td style=\"background-color:#F8FAFC;padding:12px 16px;border-bottom:1px solid #E2E8F0;\">"
        . "<div style=\"font-size:16px;font-weight:800;color:#060A2D;\">{$cardNumberPrefix}" . esc($address) . "</div>"
        . "<div style=\"margin-top:3px;font-size:12px;color:#475569;\">"
        . "<strong>" . fmt_currency($purchasePrice) . "</strong> &nbsp;·&nbsp; {$unitLabel} &nbsp;·&nbsp; "
        . fmt_pct($downPaymentPct * 100, 1) . " Down &nbsp;·&nbsp; "
        . fmt_pct($interestRate * 100, 3) . " Rate &nbsp;·&nbsp; "
        . "Loan: " . fmt_currency($loanAmount) . " &nbsp;·&nbsp; "
        . "Cash Invested: <strong>" . fmt_currency($initialCash) . "</strong>"
        . "</div>"
        . "</td></tr>"
        // Metrics body
        . "<tr><td style=\"padding:14px 16px;background-color:#FFFFFF;\">"
        . "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;font-size:13px;\">"
        . "<tr>"
        . "<td width=\"50%\" style=\"padding:8px 10px;background:#F8FAFC;border:1px solid #E2E8F0;\">"
        . "<div style=\"font-size:11px;font-weight:bold;color:#64748B;text-transform:uppercase;\">Cash on Cash (COC)</div>"
        . "<div style=\"font-size:17px;font-weight:800;color:{$cocColor};margin-top:2px;\">" . fmt_pct($cocPct, 2) . "</div>"
        . "<div style=\"font-size:11px;color:#475569;\">" . fmt_currency($year1CashFlow) . "/yr on " . fmt_currency($initialCash) . "</div>"
        . "</td>"
        . "<td width=\"50%\" style=\"padding:8px 10px;background:#F8FAFC;border:1px solid #E2E8F0;\">"
        . "<div style=\"font-size:11px;font-weight:bold;color:#64748B;text-transform:uppercase;\">DSCR</div>"
        . "<div style=\"font-size:17px;font-weight:800;color:{$dscrColor};margin-top:2px;\">" . fmt_pct($dscr, 2) . "</div>"
        . "<div style=\"font-size:11px;color:#475569;\">" . fmt_currency($totalMonthlyRent) . "/mo Rent ÷ " . fmt_currency($totalPitia) . "/mo PITIA</div>"
        . "</td>"
        . "</tr>"
        . "<tr>"
        . "<td width=\"50%\" style=\"padding:8px 10px;background:#FFFFFF;border:1px solid #E2E8F0;\">"
        . "<div style=\"font-size:11px;font-weight:bold;color:#64748B;text-transform:uppercase;\">Net Operating Income (NOI)</div>"
        . "<div style=\"font-size:17px;font-weight:800;color:#060A2D;margin-top:2px;\">" . fmt_currency($year1Noi) . "/yr</div>"
        . "<div style=\"font-size:11px;color:#475569;\">Year 1 Operating Income</div>"
        . "</td>"
        . "<td width=\"50%\" style=\"padding:8px 10px;background:#FFFFFF;border:1px solid #E2E8F0;\">"
        . "<div style=\"font-size:11px;font-weight:bold;color:#64748B;text-transform:uppercase;\">Cap Rate</div>"
        . "<div style=\"font-size:17px;font-weight:800;color:#060A2D;margin-top:2px;\">" . fmt_pct($capRate, 2) . "</div>"
        . "<div style=\"font-size:11px;color:#475569;\">Year 1 NOI ÷ Cost Basis</div>"
        . "</td>"
        . "</tr>"
        . "<tr>"
        . "<td width=\"50%\" style=\"padding:9px 10px;background:#FFFBEB;border:1px solid #FDE68A;\">"
        . "<div style=\"font-size:11px;font-weight:bold;color:#92400E;text-transform:uppercase;\">5-Year Horizon</div>"
        . "<div style=\"font-size:15px;font-weight:800;color:#060A2D;margin-top:2px;\">" . fmt_pct($irr5Pct, 2) . " IRR</div>"
        . "<div style=\"font-size:11px;color:#334155;\">Net Profit: <strong>" . fmt_currency($profit5) . "</strong> (" . fmt_pct($roi5Pct, 1) . " ROI)</div>"
        . "</td>"
        . "<td width=\"50%\" style=\"padding:9px 10px;background:#FFFBEB;border:1px solid #FDE68A;\">"
        . "<div style=\"font-size:11px;font-weight:bold;color:#92400E;text-transform:uppercase;\">10-Year Horizon</div>"
        . "<div style=\"font-size:15px;font-weight:800;color:#060A2D;margin-top:2px;\">" . fmt_pct($irr10Pct, 2) . " IRR</div>"
        . "<div style=\"font-size:11px;color:#334155;\">Net Profit: <strong>" . fmt_currency($profit10) . "</strong> (" . fmt_pct($roi10Pct, 1) . " ROI)</div>"
        . "</td>"
        . "</tr>"
        . "</table>"
        . $extrasHtml
        . $agentHtml
        . "<div style=\"text-align:center;margin-top:14px;\">"
        . "<a href=\"" . esc($shareUrl) . "\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"display:inline-block;background-color:#060A2D;color:#EFB51E;text-decoration:none;font-weight:bold;font-size:13px;padding:10px 22px;border-radius:999px;border:2px solid #EFB51E;\">"
        . "Open Scenario in Calculator →"
        . "</a>"
        . "</div>"
        . "</td></tr>"
        . "</table>";
}

$htmlBody = "<!DOCTYPE html>
<html>
<body style=\"margin:0;padding:0;background-color:#F1F5F9;font-family:Arial,Helvetica,sans-serif;color:#1E293B;\">
  <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#F1F5F9;padding:24px 12px;\">
    <tr>
      <td align=\"center\">
        <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:680px;background-color:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #CBD5E1;\">
          <!-- Header -->
          <tr>
            <td style=\"background-color:#060A2D;padding:24px 26px;border-bottom:4px solid #EFB51E;\">
              <div style=\"font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#EFB51E;margin-bottom:6px;\">
                INSIDER MORTGAGE &middot; INVESTMENT PROPERTY ANALYZER
              </div>
              <h1 style=\"margin:0;font-size:21px;line-height:1.25;color:#FFFFFF;\">
                {$headerTitle}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style=\"padding:24px 26px;\">
              {$noteHtml}
              {$comparisonHtml}
              {$scenarioCardsHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=\"background-color:#F8FAFC;padding:16px 26px;border-top:1px solid #E2E8F0;font-size:12px;color:#475569;line-height:1.5;\">
              <strong style=\"color:#060A2D;\">David Sider</strong> (NMLS #254108 &middot; CA DRE #01193796) &amp;
              <strong style=\"color:#060A2D;\">Rakesh Jain</strong> (NMLS #240594 &middot; CA DRE #01336748)<br/>
              Insider Mortgage powered by C2 Financial Corporation (NMLS #135622) &middot; (858) 848-5653 &middot;
              <a href=\"mailto:dsrj@insidermtg.com\" style=\"color:#0468E9;\">dsrj@insidermtg.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

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
        error_log('send-rental-scenario.php: SMTP password file missing or empty');
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
    $msgId = '<ra-' . bin2hex(random_bytes(8)) . '@insidermortgage.com>';
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
