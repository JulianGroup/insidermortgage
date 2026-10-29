/* global process */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const LEAD_NOTIFICATION_EMAIL = 'DSRJ@InsiderMtg.com';

const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${LEAD_NOTIFICATION_EMAIL.toLowerCase()}`;
const GOOGLE_SCRIPT_WEBHOOK_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

/**
 * Saves a consultation request to Firestore and emails the formatted results
 * to DSRJ@InsiderMtg.com.
 */
export async function submitConsultationLead(formData, defaultSource = 'LeadCapture') {
  const preferredDay =
    Array.isArray(formData.preferredDays) && formData.preferredDays.length > 0
      ? formData.preferredDays.join(', ')
      : 'Flexible';

  const source =
    typeof window !== 'undefined' && window.location?.pathname
      ? `${defaultSource} (${window.location.pathname})`
      : defaultSource;

  const submittedAtIso = new Date().toISOString();
  const submittedAtPacific = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const firestoreTask = addDoc(collection(db, 'leads'), {
    ...formData,
    notifyEmail: LEAD_NOTIFICATION_EMAIL,
    preferredDay,
    source,
    submittedAt: serverTimestamp(),
    submittedAtIso
  });

  const emailPayload = {
    _subject: `New Consultation Request: ${formData.name.trim()} (${formData.category})`,
    _replyto: formData.email.trim(),
    _template: 'table',
    _captcha: 'false',
    'Full Name': formData.name.trim(),
    'Email Address': formData.email.trim(),
    'Phone Number': formData.phone.trim(),
    'Borrower Profile': formData.category,
    'Preferred Day(s)': preferredDay,
    'Preferred Time (Pacific Time)': formData.preferredTime || "I'm flexible",
    'SMS Text Consent': formData.smsConsent ? 'Yes, you may text me' : 'No',
    'Submitted From': source,
    'Submitted At (PT)': `${submittedAtPacific} PT`
  };

  const emailTask = fetch(FORMSUBMIT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(emailPayload)
  }).then(async (res) => {
    if (!res.ok) {
      const bodyText = await res.text().catch(() => '');
      throw new Error(`Email relay HTTP ${res.status}: ${bodyText}`);
    }
    return res.json();
  });

  const tasks = [firestoreTask, emailTask];

  // Optional internal Google Workspace Apps Script webhook (if configured)
  if (GOOGLE_SCRIPT_WEBHOOK_URL) {
    tasks.push(
      fetch(GOOGLE_SCRIPT_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          ...formData,
          preferredDay,
          source,
          submittedAtPacific,
          notifyEmail: LEAD_NOTIFICATION_EMAIL
        })
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  const [firestoreResult, emailResult] = results;

  if (firestoreResult.status === 'rejected') {
    console.error('Firestore lead save failed:', firestoreResult.reason);
  }
  if (emailResult.status === 'rejected') {
    console.error('Email notification failed:', emailResult.reason);
  }

  // Only surface a form-level failure if every delivery channel failed
  const anySucceeded = results.some((r) => r.status === 'fulfilled');
  if (!anySucceeded) {
    throw firestoreResult.reason || emailResult.reason || new Error('Submission failed');
  }
}
