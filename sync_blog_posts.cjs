/**
 * Syncs published blog articles from Firestore (imc-website-2026 / collection `blogPosts`)
 * into `src/data/blogPosts.json` prior to Next.js static export (`npm run build`).
 *
 * Security note:
 *   - Draft (`draft`), pending review (`pending`), and archived (`archived`) articles
 *     are blocked from unauthenticated reads by `firestore.rules`.
 *   - Only `status == "published"` articles are returned, and internal audit fields
 *     (`updatedBy`, `createdBy`, `approvedBy`, timestamps) are stripped before writing JSON.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'imc-website-2026';
const OUTPUT_FILE = path.join(__dirname, 'src', 'data', 'blogPosts.json');

const AUDIT_FIELDS_TO_STRIP = new Set([
  'createdBy',
  'createdAt',
  'updatedBy',
  'updatedAt',
  'approvedBy',
  'approvedAt',
  'importedFromSiteJson',
]);

function decodeFirestoreValue(valObj) {
  if (!valObj || typeof valObj !== 'object') return null;
  if ('stringValue' in valObj) return valObj.stringValue;
  if ('booleanValue' in valObj) return Boolean(valObj.booleanValue);
  if ('integerValue' in valObj) return Number(valObj.integerValue);
  if ('doubleValue' in valObj) return Number(valObj.doubleValue);
  if ('nullValue' in valObj) return null;
  if ('timestampValue' in valObj) return valObj.timestampValue;
  if ('arrayValue' in valObj) {
    return (valObj.arrayValue.values || []).map(decodeFirestoreValue);
  }
  if ('mapValue' in valObj) {
    return decodeFirestoreFields(valObj.mapValue.fields || {});
  }
  return null;
}

function decodeFirestoreFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) {
    out[k] = decodeFirestoreValue(v);
  }
  return out;
}

// Unwraps `{ cells: [...] }` wrappers used to store 2D table rows in Firestore
function unwrapNestedArrays(val) {
  if (Array.isArray(val)) {
    return val.map((item) => {
      if (
        item &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        Array.isArray(item.cells) &&
        Object.keys(item).length === 1
      ) {
        return unwrapNestedArrays(item.cells);
      }
      return unwrapNestedArrays(item);
    });
  }
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = unwrapNestedArrays(v);
    }
    return out;
  }
  return val;
}

async function syncPublishedBlogPosts() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: 'blogPosts' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: 'published' },
        },
      },
    },
  };

  console.log(`Querying published blogPosts from Firestore (${PROJECT_ID})...`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queryBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore query failed (${res.status}): ${errText}`);
  }

  const rows = await res.json();
  const docs = rows
    .filter((r) => r.document && r.document.fields)
    .map((r) => {
      const docId = r.document.name.split('/').pop();
      const decoded = unwrapNestedArrays(decodeFirestoreFields(r.document.fields));
      for (const auditKey of AUDIT_FIELDS_TO_STRIP) {
        delete decoded[auditKey];
      }
      return { id: decoded.id || docId, ...decoded };
    });

  if (docs.length === 0) {
    console.log(
      '0 published articles found in Firestore (collection may not be seeded yet). Keeping existing src/data/blogPosts.json untouched.'
    );
    return;
  }

  // Sort deterministically: live non-sample articles by date desc, then sample placeholders
  docs.sort((a, b) => {
    const aSample = a.isDraftSample ? 1 : 0;
    const bSample = b.isDraftSample ? 1 : 0;
    if (aSample !== bSample) return aSample - bSample;
    const dateCmp = (b.publishedAt || '').localeCompare(a.publishedAt || '');
    if (dateCmp !== 0) return dateCmp;
    return (a.id || '').localeCompare(b.id || '');
  });

  const formattedJson = JSON.stringify(docs, null, 2) + '\n';
  const existingJson = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, 'utf8') : '';

  if (existingJson === formattedJson) {
    console.log(`No changes in published blog posts (${docs.length} articles).`);
    return;
  }

  fs.writeFileSync(OUTPUT_FILE, formattedJson);
  console.log(`Synced ${docs.length} published article(s) to src/data/blogPosts.json!`);
}

syncPublishedBlogPosts().catch((err) => {
  console.error(err);
  process.exit(1);
});
