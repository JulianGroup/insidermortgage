const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const githubDispatchToken = defineSecret('GITHUB_DISPATCH_TOKEN');

const OWNER_EMAILS = new Set([
  'rakeshjain100@gmail.com',
  'rjain@insidermtg.com',
  'davidsider@gmail.com',
  'dsider@insidermtg.com',
]);

const GITHUB_REPO = 'JulianGroup/insidermortgage';
const WORKFLOW_FILE = 'publish-blog.yml';

exports.triggerBlogDeploy = onCall(
  {
    region: 'us-central1',
    cors: true,
    secrets: [githubDispatchToken],
  },
  async (request) => {
    if (!request.auth || !request.auth.token?.email_verified) {
      throw new HttpsError('unauthenticated', 'Verified sign-in is required.');
    }

    const email = (request.auth.token.email || '').toLowerCase();
    if (!OWNER_EMAILS.has(email)) {
      throw new HttpsError(
        'permission-denied',
        'Only owners (Rakesh or David) may publish to the live website.'
      );
    }

    const token = (githubDispatchToken.value() || '').trim();
    if (!token) {
      throw new HttpsError(
        'failed-precondition',
        'GITHUB_DISPATCH_TOKEN secret is not configured yet.'
      );
    }

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'imc-website-2026-cloud-function',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'master' }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      throw new HttpsError(
        'internal',
        `GitHub Actions dispatch failed (${res.status}): ${errBody}`
      );
    }

    return { ok: true, triggeredBy: email, timestamp: new Date().toISOString() };
  }
);
