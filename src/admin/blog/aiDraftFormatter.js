import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  AUTHORS,
  WHO_WE_SERVE_CATEGORIES,
  CALCULATOR_TAGS,
  BIO_TAGS,
  SPECIFIC_ROUTE_OPTIONS,
} from '../../data/taxonomy';

const VALID_CATEGORY_IDS = new Set(WHO_WE_SERVE_CATEGORIES.map((c) => c.id));
const VALID_CALC_IDS = new Set(CALCULATOR_TAGS.map((c) => c.id));
const VALID_BIO_IDS = new Set(BIO_TAGS.map((b) => b.id));
const VALID_ROUTE_SLUGS = new Set(SPECIFIC_ROUTE_OPTIONS.map((r) => r.slug));

// Preferred Gemini models on Google AI Studio
const MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

export const formattedArticleJsonSchema = {
  type: 'OBJECT',
  properties: {
    title: {
      type: 'STRING',
      description: 'Clear, compelling article headline (no clickbait, 5 to 12 words).',
    },
    topicBadge: {
      type: 'STRING',
      description:
        'Short 2-3 word badge above the title (e.g., "First-Time Buyers", "HELOC Strategy", "Self-Employed", "Investor DSCR", "55+ & Prop 19").',
    },
    excerpt: {
      type: 'STRING',
      description:
        '1 to 2 crisp sentences (140-210 characters) summarizing the article value for blog cards and Google SEO meta description.',
    },
    categories: {
      type: 'ARRAY',
      description: 'Matching Who-We-Serve category IDs (0 to 2 most relevant).',
      items: { type: 'STRING' },
    },
    specificRoutes: {
      type: 'ARRAY',
      description:
        'Matching website loan-program page slugs where this article should appear in Related Insights (1 to 4 most relevant).',
      items: { type: 'STRING' },
    },
    calculators: {
      type: 'ARRAY',
      description: 'Matching Geeky Calculator IDs if relevant to the article topic (0 to 2).',
      items: { type: 'STRING' },
    },
    sections: {
      type: 'ARRAY',
      description: 'Structured body sections (typically 3 to 6 rich sections).',
      items: {
        type: 'OBJECT',
        properties: {
          heading: {
            type: 'STRING',
            description: 'Clear section heading.',
          },
          paragraphs: {
            type: 'ARRAY',
            description:
              'Introductory or explanatory paragraphs for this section. Use **bold** for key phrases and [anchor](https://insidermortgage.com/...) for internal links when appropriate.',
            items: { type: 'STRING' },
          },
          bullets: {
            type: 'ARRAY',
            description:
              'Optional bullet points. Format each bullet with a bold lead-in phrase like "**Lead-in concept:** Clear explanation..."',
            items: { type: 'STRING' },
          },
          numberedItems: {
            type: 'ARRAY',
            description:
              'Optional numbered checklist items, questions to ask, or sequential action steps.',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING', description: 'Short bold step or question title.' },
                text: { type: 'STRING', description: '1-3 sentence actionable explanation.' },
              },
              required: ['title', 'text'],
            },
          },
          table: {
            type: 'OBJECT',
            description:
              'Optional structured comparison table when comparing options, features, fees, or roles (e.g. Inspection vs Appraisal, Loan A vs Loan B).',
            properties: {
              headers: {
                type: 'ARRAY',
                description:
                  'Column headers (2 to 4 columns, e.g., ["Feature", "Home Inspection", "Lender Appraisal"]).',
                items: { type: 'STRING' },
              },
              rows: {
                type: 'ARRAY',
                description: 'Table rows, each containing cells matching headers length.',
                items: {
                  type: 'OBJECT',
                  properties: {
                    cells: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                    },
                  },
                  required: ['cells'],
                },
              },
            },
            required: ['headers', 'rows'],
          },
          formula: {
            type: 'STRING',
            description:
              'Optional short formula callout box if a calculation applies (e.g. "Your Rate = U.S. Prime Rate + Lender Margin"). Leave empty if none.',
          },
          comparisonColumns: {
            type: 'ARRAY',
            description:
              'Optional 2 side-by-side comparison cards (e.g. Draw Period vs Repayment Period, Option A vs Option B).',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                subtitle: { type: 'STRING' },
                bullets: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                },
              },
              required: ['title', 'bullets'],
            },
          },
        },
        required: ['heading', 'paragraphs'],
      },
    },
    keyTakeawayTitle: {
      type: 'STRING',
      description: 'Short title for the closing summary callout box (e.g., "Bottom-Line Takeaway").',
    },
    keyTakeaway: {
      type: 'STRING',
      description: '2 to 3 sentence bottom-line summary wrapping up the practical advice.',
    },
  },
  required: ['title', 'excerpt', 'sections', 'keyTakeaway'],
};

function buildSystemInstruction(authorId) {
  const author = AUTHORS[authorId] || AUTHORS.rakesh;
  const categoriesList = WHO_WE_SERVE_CATEGORIES.map((c) => `- "${c.id}": ${c.label}`).join('\n');
  const routesList = SPECIFIC_ROUTE_OPTIONS.map((r) => `- "${r.slug}": ${r.label}`).join('\n');
  const calcsList = CALCULATOR_TAGS.map(
    (c) => `- "${c.id}": ${c.label} (https://insidermortgage.com${c.route}/)`
  ).join('\n');

  return `You are an expert mortgage editorial assistant formatting articles for ${author.name} (${author.role}) at Insider Mortgage (C2 Financial Corporation).

YOUR GOAL:
Take the author's rough text, notes, email draft, or transcript and transform it into a polished, scannable, visually structured Blog Studio article — preserving the author's core facts, transparent numbers-first voice, and practical guidance without inventing fake rate quotes or compliance-violating promises.

FORMATTING PLAYBOOK (Make the article easy and engaging to scan, NOT a wall of paragraphs):
1. Break the content into 3 to 6 logical sections with clear, reader-friendly headings.
2. Whenever the text contrasts two or more concepts, loan types, roles, pros/cons, or fee structures, build a structured Comparison Table (\`table\`) OR Side-by-Side Comparison Cards (\`comparisonColumns\`).
3. Turn lists of factors, tips, red flags, or criteria into crisp \`bullets\` starting with \`**Bold Lead-In:** Explanation...\`.
4. Turn step-by-step roadmaps, borrower checklists, or "questions to ask" into \`numberedItems\` (\`{ title, text }\`).
5. Include a \`formula\` callout ONLY when a clear mathematical relationship helps the reader (otherwise omit \`formula\`).
6. Keep paragraphs concise (2-4 sentences each) and use \`**bold**\` sparingly to highlight key mortgage terms.
7. Never invent specific interest rate quotes unless explicitly stated as an educational example in the author's notes.

AVAILABLE TAXONOMY IDS (Choose ONLY from these exact IDs):
Who We Serve Categories (\`categories\`):
${categoriesList}

Target Website Pages (\`specificRoutes\`):
${routesList}

Geeky Calculators (\`calculators\`):
${calcsList}`;
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .replace(/^draft:\s*/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function estimateReadMinutesFromDraft(draft) {
  const chunks = [draft.title, draft.excerpt, draft.keyTakeaway];
  for (const sec of draft.sections || []) {
    chunks.push(sec.heading, sec.formula, ...(sec.paragraphs || []), ...(sec.bullets || []));
    for (const ni of sec.numberedItems || []) chunks.push(ni.title, ni.text);
    if (sec.table) {
      chunks.push(...(sec.table.headers || []));
      for (const row of sec.table.rows || []) chunks.push(...row);
    }
  }
  const words = chunks
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 190));
}

function normalizeFormattedDraft(raw, authorId) {
  const cleanSections = (Array.isArray(raw.sections) ? raw.sections : []).map((sec, idx) => {
    const out = {
      heading: (sec.heading || '').trim(),
      dividerAbove: idx > 0,
      paragraphs: Array.isArray(sec.paragraphs)
        ? sec.paragraphs.map((p) => String(p || '').trim()).filter(Boolean)
        : [],
    };

    if (Array.isArray(sec.bullets) && sec.bullets.length > 0) {
      const b = sec.bullets.map((x) => String(x || '').trim()).filter(Boolean);
      if (b.length > 0) out.bullets = b;
    }

    if (Array.isArray(sec.numberedItems) && sec.numberedItems.length > 0) {
      const ni = sec.numberedItems
        .map((item) => ({
          title: String(item?.title || '').trim(),
          text: String(item?.text || '').trim(),
        }))
        .filter((item) => item.title || item.text);
      if (ni.length > 0) out.numberedItems = ni;
    }

    if (sec.table && Array.isArray(sec.table.headers) && sec.table.headers.length >= 2) {
      const headers = sec.table.headers.map((h) => String(h || '').trim());
      const colCount = headers.length;
      const rows = (Array.isArray(sec.table.rows) ? sec.table.rows : [])
        .map((r) => {
          const cells = Array.isArray(r) ? r : Array.isArray(r?.cells) ? r.cells : [];
          const normalized = Array.from({ length: colCount }, (_, ci) =>
            String(cells[ci] ?? '').trim()
          );
          return normalized;
        })
        .filter((r) => r.some((cell) => cell !== ''));
      if (rows.length > 0) {
        out.table = { headers, rows };
      }
    }

    if (typeof sec.formula === 'string' && sec.formula.trim()) {
      out.formula = sec.formula.trim();
    }

    if (Array.isArray(sec.comparisonColumns) && sec.comparisonColumns.length >= 2) {
      const cols = sec.comparisonColumns
        .map((col) => ({
          title: String(col?.title || '').trim(),
          subtitle: String(col?.subtitle || '').trim(),
          bullets: Array.isArray(col?.bullets)
            ? col.bullets.map((b) => String(b || '').trim()).filter(Boolean)
            : [],
        }))
        .filter((col) => col.title);
      if (cols.length >= 2) out.comparisonColumns = cols;
    }

    if (
      out.paragraphs.length === 0 &&
      !out.bullets &&
      !out.numberedItems &&
      !out.table &&
      !out.comparisonColumns
    ) {
      out.paragraphs = [''];
    }

    return out;
  });

  const defaultBio = authorId === 'david' ? 'bio-david' : 'bio-rakesh';

  const result = {
    title: String(raw.title || '').trim(),
    slug: slugify(raw.title || ''),
    topicBadge: String(raw.topicBadge || '').trim(),
    excerpt: String(raw.excerpt || '').trim(),
    categories: (raw.categories || []).filter((id) => VALID_CATEGORY_IDS.has(id)),
    specificRoutes: (raw.specificRoutes || []).filter((slug) => VALID_ROUTE_SLUGS.has(slug)),
    calculators: (raw.calculators || []).filter((id) => VALID_CALC_IDS.has(id)),
    bioTags: VALID_BIO_IDS.has(defaultBio) ? [defaultBio] : [],
    sections:
      cleanSections.length > 0
        ? cleanSections
        : [{ heading: '', dividerAbove: false, paragraphs: [''] }],
    keyTakeawayTitle: String(raw.keyTakeawayTitle || 'Bottom-Line Takeaway').trim(),
    keyTakeaway: String(raw.keyTakeaway || '').trim(),
  };

  result.readTimeMinutes = estimateReadMinutesFromDraft(result);
  return result;
}

/**
 * Retrieves the stored Gemini API key from Firestore (shared team setting)
 * or local device storage.
 */
export async function getStoredApiKey(db) {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('imc_gemini_api_key');
    if (local && local.trim()) return local.trim();
  }
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'ai'));
      if (snap.exists() && snap.data()?.geminiApiKey) {
        const key = snap.data().geminiApiKey.trim();
        if (typeof window !== 'undefined') {
          localStorage.setItem('imc_gemini_api_key', key);
        }
        return key;
      }
    } catch {
      // Gracefully fall through on unauthenticated / permission checks
    }
  }
  return '';
}

/**
 * Saves the Gemini API key locally and optionally into Firestore so all staff share it.
 */
export async function saveStoredApiKey(db, apiKey, saveToTeam = true) {
  const cleanKey = (apiKey || '').trim();
  if (typeof window !== 'undefined') {
    if (cleanKey) {
      localStorage.setItem('imc_gemini_api_key', cleanKey);
    } else {
      localStorage.removeItem('imc_gemini_api_key');
    }
  }
  if (saveToTeam && db && cleanKey) {
    try {
      await setDoc(
        doc(db, 'settings', 'ai'),
        { geminiApiKey: cleanKey, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.warn('Could not save API key to team settings (saved locally):', err.message);
    }
  }
}

/**
 * Direct Gemini API call using user-provided API key from Google AI Studio.
 * Bypasses Firebase App Check and reCAPTCHA completely.
 */
export async function formatRawTextWithAI({
  apiKey,
  rawText,
  extraInstructions = '',
  authorId = 'rakesh',
}) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'Please enter your Gemini API Key first. Get a free key at aistudio.google.com/app/apikey'
    );
  }
  if (!rawText || !rawText.trim()) {
    throw new Error('Please paste your rough text, bullet points, or draft notes first.');
  }

  const systemInstruction = buildSystemInstruction(authorId);

  const userPrompt = [
    extraInstructions.trim()
      ? `ADDITIONAL FORMATTING INSTRUCTIONS FROM AUTHOR:\n${extraInstructions.trim()}\n\n---`
      : null,
    `RAW TEXT / NOTES TO FORMAT INTO ARTICLE:\n${rawText.trim()}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;
    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        response_schema: formattedArticleJsonSchema,
        temperature: 0.35,
      },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error?.message || `HTTP ${res.status}`;
        // If 404 on model name, try next candidate
        if (res.status === 404 || errorMsg.toLowerCase().includes('not found')) {
          lastError = new Error(`Model ${modelName} not available: ${errorMsg}`);
          continue;
        }
        throw new Error(errorMsg);
      }

      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No content returned from Gemini. Please try again.');
      }
      text = text.trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
      }

      const parsed = JSON.parse(text);
      return normalizeFormattedDraft(parsed, authorId);
    } catch (err) {
      lastError = err;
      const msg = String(err?.message || '');
      // If error is not a 404 model issue, rethrow immediately (e.g. invalid key or quota)
      if (!msg.toLowerCase().includes('not found') && !msg.includes('404')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('AI formatting failed. Please check your API key.');
}
