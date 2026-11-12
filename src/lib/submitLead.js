/* global process */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const PRIMARY_LEAD_EMAIL = 'rjain@insidermtg.com';
export const CC_LEAD_EMAIL = 'dsider@insidermtg.com';

const DREAMHOST_PHP_ENDPOINT = '/send-lead.php';
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${PRIMARY_LEAD_EMAIL}`;
const GOOGLE_SCRIPT_WEBHOOK_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

const ROUTE_LABELS = {
  '/': 'Homepage (Home V6)',
  '/home-v8': 'Home V8',
  '/home-with-dog': 'Home (Surfing Dog)',
  '/refinance': 'Refinance Consultation Page',
  '/pre-approval': 'Purchase Pre-Approval Page',
  '/retirees': 'Mortgages for Retirees',
  '/self-employed-programs': 'Self-Employed Programs',
  '/bank-statement-loans': 'Bank Statement Loans',
  '/1099-loans': '1099 Loans',
  '/investor-loans': 'Investor Loans Page',
  '/dscr-loans': 'Investor Loans Page',
  '/first-time': 'First-Time Home Buyers',
  '/mortgage-for-contractors': 'Mortgages for Contractors',
  '/mortgage-for-gig-workers': 'Mortgages for Gig Workers',
  '/mortgage-for-llc': 'Mortgages for LLCs',
  '/mortgage-for-realtors': 'Mortgages for Realtors',
  '/mortgage-for-scorp': 'Mortgages for S-Corps',
  '/mortgage-for-small-business': 'Mortgages for Small Business Owners',
  '/CAprop-19-calculator': 'CA Prop 19 Calculator',
  '/geek-out/prime-rate-history': 'U.S. Prime Rate History',
  '/tools/rental-analyzer': '1–4 Unit Rental & ADU Investment Analyzer',
  '/admin/tools/rental-analyzer': 'Admin Rental & ADU Investment Analyzer'
};

function getPageContext(defaultSource) {
  if (typeof window === 'undefined') {
    return {
      pageName: defaultSource,
      shortPageName: defaultSource,
      pathname: '/',
      pageUrl: defaultSource
    };
  }

  const rawPath = window.location?.pathname || '/';
  const normalizedPath =
    rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
  const pageTitle = typeof document !== 'undefined' ? document.title : '';
  const friendlyName =
    ROUTE_LABELS[normalizedPath] || pageTitle || defaultSource || normalizedPath;

  return {
    pageName: `${friendlyName} (${rawPath})`,
    shortPageName: friendlyName,
    pathname: rawPath,
    pageUrl: window.location?.href || rawPath
  };
}

const OPTIONAL_DETAIL_LABELS = {
  propertyAddress: 'Property Address',
  propertyValue: 'Estimated Property Value',
  loanBalance: 'Current Loan Balance',
  interestRate: 'Current Interest Rate',
  piPayment: 'Monthly P&I Payment',
  miAmount: 'Monthly Mortgage Insurance',
  impounds: 'Taxes & Insurance Impounded',
  occupancy: 'Property Occupancy',
  notes: 'Borrower Notes / Goals',
  firstTimeBuyer: 'First-Time Home Buyer?',
  vaEligible: 'VA Loan Eligible?',
  movingHomes: 'Selling Current Home?',
  unitCount: 'Property Unit Count',
  purchasePrice: 'Purchase Price',
  downPayment: 'Down Payment / Initial Cash',
  loanAmount: 'Estimated Loan Amount',
  totalMonthlyRent: 'Total Monthly Scheduled Rent',
  unitScheduleSummary: 'Unit Rent Schedule',
  year1Noi: 'Year 1 Net Operating Income (NOI)',
  monthlyCashFlow: 'Estimated Year 1 Monthly Cash Flow',
  year1CashFlow: 'Estimated Year 1 Annual Cash Flow',
  fiveYearIrr: '5-Year Projected IRR / ROI',
  tenYearIrr: '10-Year Projected IRR / ROI',
  selectedLoanOption: 'Selected Financing Option',
  whatIfScenario: 'What-If Scenario (Refi / ADU)'
};

/**
 * Saves a consultation/lead form submission to Firestore and emails formatted
 * results to rjain@insidermtg.com and dsider@insidermtg.com, including the
 * exact page where the visitor completed the form.
 */
export async function submitConsultationLead(formData, defaultSource = 'Website Form') {
  const hasScheduleFields =
    Array.isArray(formData.preferredDays) || Boolean(formData.preferredTime);

  const preferredDay =
    Array.isArray(formData.preferredDays) && formData.preferredDays.length > 0
      ? formData.preferredDays.join(', ')
      : hasScheduleFields
      ? 'Flexible'
      : '';

  const { pageName, shortPageName, pathname, pageUrl } = getPageContext(defaultSource);

  const submittedAtIso = new Date().toISOString();
  const submittedAtPacific = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const cleanName = String(formData.name || '').trim();
  const cleanEmail = String(formData.email || '').trim();
  const cleanPhone = String(formData.phone || '').trim();
  const cleanCategory = String(formData.category || defaultSource).trim();

  const extraFields = {};
  for (const [fieldKey, label] of Object.entries(OPTIONAL_DETAIL_LABELS)) {
    const val = formData[fieldKey];
    if (val !== undefined && String(val).trim() !== '') {
      extraFields[label] = String(val).trim();
    }
  }

  // 1. Always save a permanent copy in Firestore
  const firestoreTask = addDoc(collection(db, 'leads'), {
    ...formData,
    notifyEmails: [PRIMARY_LEAD_EMAIL, CC_LEAD_EMAIL],
    ...(preferredDay ? { preferredDay } : {}),
    pageName,
    pathname,
    pageUrl,
    source: pageName,
    submittedAt: serverTimestamp(),
    submittedAtIso
  });

  const structuredPayload = {
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    category: cleanCategory,
    preferredDay,
    preferredTime: hasScheduleFields ? formData.preferredTime || "I'm flexible" : '',
    ...(typeof formData.smsConsent === 'boolean' ? { smsConsent: formData.smsConsent } : {}),
    shortPageName,
    pageName,
    pageUrl,
    source: pageName,
    extraFields,
    submittedAtPacific,
    notifyEmails: [PRIMARY_LEAD_EMAIL, CC_LEAD_EMAIL]
  };

  // 2. Native DreamHost server-side PHP mailer (/send-lead.php)
  const dreamhostMailTask = fetch(DREAMHOST_PHP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(structuredPayload)
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(`DreamHost mail HTTP ${res.status}`);
    }
    return res.json();
  });

  const tasks = [firestoreTask, dreamhostMailTask];

  // 3. Google Workspace Apps Script mailer (if configured) or FormSubmit fallback
  if (GOOGLE_SCRIPT_WEBHOOK_URL) {
    tasks.push(
      fetch(GOOGLE_SCRIPT_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(structuredPayload)
      })
    );
  } else {
    const formSubmitPayload = {
      _subject: `New Lead [${shortPageName}]: ${cleanName}${cleanCategory ? ` (${cleanCategory})` : ''}`,
      _cc: CC_LEAD_EMAIL,
      _replyto: cleanEmail,
      _template: 'table',
      _captcha: 'false',
      'Submitted From Page': pageName,
      'Page URL': pageUrl,
      'Full Name': cleanName,
      'Email Address': cleanEmail,
      'Phone Number': cleanPhone || 'Not provided',
      'Borrower Profile / Form': cleanCategory,
      ...(hasScheduleFields
        ? {
            'Preferred Day(s)': preferredDay,
            'Preferred Time (Pacific Time)': formData.preferredTime || "I'm flexible"
          }
        : {}),
      ...(typeof formData.smsConsent === 'boolean'
        ? { 'SMS Text Consent': formData.smsConsent ? 'Yes, you may text me' : 'No' }
        : {}),
      ...extraFields,
      'Submitted At (PT)': `${submittedAtPacific} PT`
    };

    tasks.push(
      fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formSubmitPayload)
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error(`FormSubmit HTTP ${res.status}`);
        }
        return res.json();
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  const anySucceeded = results.some((r) => r.status === 'fulfilled');
  if (!anySucceeded) {
    throw new Error('Submission failed across all channels');
  }
}

/**
 * Formats and dispatches a 1–4 Unit Rental & ADU Investment Analyzer lead
 * with complete property underwriting numbers included in both structured rows
 * and the message/notes payload for David Sider and Rakesh Jain.
 */
export async function submitInvestmentAnalysisLead(leadInput) {
  const fmtCurrency = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(Number(n) || 0);

  const fmtPct = (n, digits = 2) => `${(Number(n) || 0).toFixed(digits)}%`;

  const {
    name,
    email,
    phone,
    selectedLoanOption = 'DSCR / Investment Property Loan',
    smsConsent = false,
    notes: userNotes = '',
    inputs = {},
    summary = {}
  } = leadInput || {};

  const unitScheduleSummary = Array.isArray(inputs.units)
    ? inputs.units
        .map(
          (u, idx) =>
            `${u.label || `Unit ${idx + 1}`}${u.subAddress ? ` (${u.subAddress})` : ''}: ${fmtCurrency(u.monthlyRent)}/mo`
        )
        .join(' | ')
    : '';

  const whatIfParts = [];
  if (inputs.refiEnabled) {
    whatIfParts.push(
      `Refi in Year ${inputs.refiYear || 3} @ ${fmtPct((inputs.refiNewRate || 0.0625) * 100)} (${
        inputs.refiReset30 ? '30-Yr Reset' : 'Remaining Term'
      })`
    );
  }
  if (inputs.aduEnabled) {
    const aduCount = inputs.unitCount > 1 && inputs.aduCount === 2 ? 2 : 1;
    whatIfParts.push(
      `${aduCount} ADU(s) — Budget ${fmtCurrency((inputs.aduCost || 0) * aduCount)}, Rent ${fmtCurrency(
        (inputs.aduRentMonthly || 0) * aduCount
      )}/mo`
    );
  }
  const whatIfScenario = whatIfParts.length > 0 ? whatIfParts.join('; ') : 'Baseline (No Refi / No ADU)';

  const purchasePriceStr = fmtCurrency(inputs.purchasePrice);
  const downPaymentDollar = (Number(inputs.purchasePrice) || 0) * (Number(inputs.downPaymentPct) || 0.25);
  const downPaymentStr = `${fmtCurrency(downPaymentDollar)} (${fmtPct(
    (inputs.downPaymentPct || 0.25) * 100,
    0
  )}) + ${fmtCurrency(inputs.makeReadyCost)} Make-Ready = ${fmtCurrency(summary.initialCashInvested)} Total Cash`;
  const loanAmountStr = `${fmtCurrency(summary.loanAmount)} @ ${fmtPct(
    (inputs.interestRate || 0.075) * 100,
    3
  )}`;
  const piPaymentStr = `${fmtCurrency(summary.monthlyPmt)}/mo`;
  const totalMonthlyRentStr = `${fmtCurrency(summary.totalMonthlyRent)}/mo`;
  const year1NoiStr = `${fmtCurrency(summary.year1Noi)}/yr`;
  const monthlyCashFlowStr = `${fmtCurrency((Number(summary.year1CashFlow) || 0) / 12)}/mo`;
  const year1CashFlowStr = `${fmtCurrency(summary.year1CashFlow)}/yr`;
  const fiveYearIrrStr = summary.fiveYear
    ? `${fmtPct(summary.fiveYear.irrPct)} IRR | ${fmtPct(summary.fiveYear.totalRoiPct, 1)} Total ROI (${fmtCurrency(
        summary.fiveYear.totalProfit
      )} Profit)`
    : '';
  const tenYearIrrStr = summary.tenYear
    ? `${fmtPct(summary.tenYear.irrPct)} IRR | ${fmtPct(summary.tenYear.totalRoiPct, 1)} Total ROI (${fmtCurrency(
        summary.tenYear.totalProfit
      )} Profit)`
    : '';

  const combinedNotes = [
    userNotes ? `Borrower Note: ${userNotes}` : null,
    `Property: ${inputs.propertyAddress || 'Not specified'} (${inputs.unitCount || 1} Unit${
      (inputs.unitCount || 1) > 1 ? 's' : ''
    })`,
    `Purchase Price: ${purchasePriceStr} | Loan: ${loanAmountStr} | P&I: ${piPaymentStr}`,
    `Initial Cash Outlay: ${downPaymentStr}`,
    `Scheduled Rent: ${totalMonthlyRentStr} (${unitScheduleSummary})`,
    `Year 1 NOI: ${year1NoiStr} | Monthly CF: ${monthlyCashFlowStr} | Annual CF: ${year1CashFlowStr}`,
    `5-Yr Return: ${fiveYearIrrStr}`,
    `10-Yr Return: ${tenYearIrrStr}`,
    `Scenario: ${whatIfScenario}`,
    `Financing Goal: ${selectedLoanOption}`
  ]
    .filter(Boolean)
    .join(' || ');

  return submitConsultationLead(
    {
      name,
      email,
      phone,
      smsConsent,
      category: `1–4 Unit Rental Analyzer (${selectedLoanOption})`,
      propertyAddress: inputs.propertyAddress || 'Not specified',
      unitCount: `${inputs.unitCount || 1} Unit${(inputs.unitCount || 1) > 1 ? 's' : ''}`,
      purchasePrice: purchasePriceStr,
      downPayment: downPaymentStr,
      loanAmount: loanAmountStr,
      interestRate: fmtPct((inputs.interestRate || 0.075) * 100, 3),
      piPayment: piPaymentStr,
      totalMonthlyRent: totalMonthlyRentStr,
      unitScheduleSummary,
      year1Noi: year1NoiStr,
      monthlyCashFlow: monthlyCashFlowStr,
      year1CashFlow: year1CashFlowStr,
      fiveYearIrr: fiveYearIrrStr,
      tenYearIrr: tenYearIrrStr,
      selectedLoanOption,
      whatIfScenario,
      notes: combinedNotes,
      message: combinedNotes
    },
    '1–4 Unit Rental & ADU Investment Analyzer'
  );
}
