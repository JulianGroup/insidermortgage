import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'firebase/ai';
import { app } from '../../lib/firebase';
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

// Candidate Gemini models via Firebase AI Logic (GoogleAIBackend)
const MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.0-flash'];

const formattedArticleSchema = Schema.object({
  properties: {
    title: Schema.string({
      description: 'Clear, compelling article headline (no clickbait, 5 to 12 words).',
    }),
    topicBadge: Schema.string({
      description:
        'Short 2-3 word badge above the title (e.g., "First-Time Buyers", "HELOC Strategy", "Self-Employed", "Investor DSCR", "55+ & Prop 19").',
    }),
    excerpt: Schema.string({
      description:
        '1 to 2 crisp sentences (140-210 characters) summarizing the article value for blog cards and Google SEO meta description.',
    }),
    categories: Schema.array({
      description: 'Matching Who-We-Serve category IDs (0 to 2 most relevant).',
      items: Schema.string(),
    }),
    specificRoutes: Schema.array({
      description: 'Matching website loan-program page slugs where this article should appear in Related Insights (1 to 4 most relevant).',
      items: Schema.string(),
    }),
    calculators: Schema.array({
      description: 'Matching Geeky Calculator IDs if relevant to the article topic (0 to 2).',
      items: Schema.string(),
    }),
    sections: Schema.array({
      description: 'Structured body sections (typically 3 to 6 rich sections).',
      items: Schema.object({
        properties: {
          heading: Schema.string({
            description: 'Clear section heading.',
          }),
          paragraphs: Schema.array({
            description:
              'Introductory or explanatory paragraphs for this section. Use **bold** for key phrases and [anchor](https://insidermortgage.com/...) for internal links when appropriate.',
            items: Schema.string(),
          }),
          bullets: Schema.array({
            description:
              'Optional bullet points. Format each bullet with a bold lead-in phrase like "**Lead-in concept:** Clear explanation..."',
            items: Schema.string(),
          }),
          numberedItems: Schema.array({
            description:
              'Optional numbered checklist items, questions to ask, or sequential action steps.',
            items: Schema.object({
              properties: {
                title: Schema.string({ description: 'Short bold step or question title.' }),
                text: Schema.string({ description: '1-3 sentence actionable explanation.' }),
              },
            }),
          }),
          table: Schema.object({
            description:
              'Optional structured comparison table when comparing options, features, fees, or roles (e.g. Inspection vs Appraisal, Loan A vs Loan B).',
            properties: {
              headers: Schema.array({
                description: 'Column headers (2 to 4 columns, e.g., ["Feature", "Home Inspection", "Lender Appraisal"]).',
                items: Schema.string(),
              }),
              rows: Schema.array({
                description: 'Table rows, each containing cells matching headers length.',
                items: Schema.object({
                  properties: {
                    cells: Schema.array({
                      items: Schema.string(),
                    }),
                  },
                }),
              }),
            },
          }),
          formula: Schema.string({
            description:
              'Optional short formula callout box if a calculation applies (e.g. "Your Rate = U.S. Prime Rate + Lender Margin"). Leave empty if none.',
          }),
          comparisonColumns: Schema.array({
            description:
              'Optional 2 side-by-side comparison cards (e.g. Draw Period vs Repayment Period, Option A vs Option B).',
            items: Schema.object({
              properties: {
                title: Schema.string(),
                subtitle: Schema.string(),
                bullets: Schema.array({ items: Schema.string() }),
              },
              optionalProperties: ['subtitle'],
            }),
          }),
        },
        optionalProperties: [
          'bullets',
          'numberedItems',
          'table',
          'formula',
          'comparisonColumns',
        ],
      }),
    }),
    keyTakeawayTitle: Schema.string({
      description: 'Short title for the closing summary callout box (e.g., "Bottom-Line Takeaway").',
    }),
    keyTakeaway: Schema.string({
      description: '2 to 3 sentence bottom-line summary wrapping up the practical advice.',
    }),
  },
});

function buildSystemInstruction(authorId) {
  const author = AUTHORS[authorId] || AUTHORS.rakesh;
  const categoriesList = WHO_WE_SERVE_CATEGORIES.map((c) => `- "${c.id}": ${c.label}`).join('\n');
  const routesList = SPECIFIC_ROUTE_OPTIONS.map((r) => `- "${r.slug}": ${r.label}`).join('\n');
  const calcsList = CALCULATOR_TAGS.map((c) => `- "${c.id}": ${c.label} (https://insidermortgage.com${c.route}/)`).join('\n');

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
 * Uses Firebase AI Logic (Gemini Developer API backend) to convert raw notes/text
 * into a structured Blog Studio article object ready for Rakesh/David to review & edit.
 */
export async function formatRawTextWithAI({
  rawText,
  extraInstructions = '',
  authorId = 'rakesh',
}) {
  if (!rawText || !rawText.trim()) {
    throw new Error('Please paste your rough text, bullet points, or draft notes first.');
  }

  const ai = getAI(app, { backend: new GoogleAIBackend() });
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
    try {
      const model = getGenerativeModel(ai, {
        model: modelName,
        systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: formattedArticleSchema,
          temperature: 0.35,
        },
      });

      const response = await model.generateContent(userPrompt);
      const jsonText = response.response.text();
      const parsed = JSON.parse(jsonText);
      return normalizeFormattedDraft(parsed, authorId);
    } catch (err) {
      lastError = err;
      const msg = String(err?.message || err || '');
      // If Firebase AI Logic API itself is not yet enabled in Firebase Console, surface immediately
      if (
        err?.code === 'api-not-enabled' ||
        msg.includes('api-not-enabled') ||
        msg.includes('firebasevertexai.googleapis.com') ||
        msg.includes('SERVICE_DISABLED')
      ) {
        const setupError = new Error(
          'One-time Firebase AI setup needed: click "Get started" on Firebase AI Logic (Gemini Developer API) in your Firebase Console, then click Format again.'
        );
        setupError.setupUrl =
          'https://console.firebase.google.com/project/imc-website-2026/ailogic';
        throw setupError;
      }
      // If model name not found (404), try next candidate; otherwise rethrow
      if (!msg.includes('404') && !msg.toLowerCase().includes('not found')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('AI formatting failed. Please try again.');
}
