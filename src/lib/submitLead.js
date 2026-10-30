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
  '/home-v2': 'Home V2',
  '/home-v4': 'Home V4',
  '/home-v5': 'Home V5',
  '/home-v6': 'Home V6',
  '/home-v7': 'Home V7',
  '/home-v8': 'Home V8',
  '/home-with-dog': 'Home (Surfing Dog)',
  '/home-backup': 'Home (Backup)',
  '/refinance': 'Refinance Consultation Page',
  '/pre-approval': 'Purchase Pre-Approval Page',
  '/retirees': 'Mortgages for Retirees',
  '/self-employed-programs': 'Self-Employed Programs',
  '/bank-statement-loans': 'Bank Statement Loans',
  '/1099-loans': '1099 Loans',
  '/dscr-loans': 'DSCR Investor Loans',
  '/first-time': 'First-Time Home Buyers',
  '/mortgage-for-contractors': 'Mortgages for Contractors',
  '/mortgage-for-gig-workers': 'Mortgages for Gig Workers',
  '/mortgage-for-llc': 'Mortgages for LLCs',
  '/mortgage-for-realtors': 'Mortgages for Realtors',
  '/mortgage-for-scorp': 'Mortgages for S-Corps',
  '/mortgage-for-small-business': 'Mortgages for Small Business Owners',
  '/CAprop-19-calculator': 'CA Prop 19 Calculator'
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
  movingHomes: 'Selling Current Home?'
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
