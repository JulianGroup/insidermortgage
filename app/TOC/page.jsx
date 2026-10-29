import fs from 'fs';
import path from 'path';
import TableOfContents from '../../src/views/TableOfContents';
import { seoPages } from '../../src/data/seoPages';

export const metadata = {
  title: 'Table of Contents | Insider Mortgage',
  description: 'Auto-updating categorized directory of all published pages on Insider Mortgage.',
};

// Curated descriptions & titles for known routes; any new page automatically falls back to its page.jsx metadata or formatted slug
const KNOWN_PAGE_METADATA = {
  '/': {
    title: 'Primary Homepage (Current Root)',
    description: 'The main live root page of Insider Mortgage.',
    category: 'homepages'
  },
  '/home-v8': {
    title: 'Home V8 — Land-book Editorial Redesign',
    description: 'Editorial split-screen advisory hero, framed surfing dog showcase, Bento specialty grid, and full-page Land-book redesign.',
    highlight: 'NEW • V8',
    category: 'homepages'
  },
  '/home-v7': {
    title: 'Home V7 — Splash Page (Plain Text Specialties & Gold Bullets)',
    description: 'Aspect-ratio locked surfing dog splash page with plain text specialties and round gold bullet separators in the footer band.',
    highlight: 'V7',
    category: 'homepages'
  },
  '/home-v6': {
    title: 'Home V6 — Splash Page (5 Gold Specialty Pill Buttons)',
    description: 'Aspect-ratio locked surfing dog splash page with 5 gold pill buttons including Borrowers with Complicated Scenarios.',
    highlight: 'V6',
    category: 'homepages'
  },
  '/home-v5': {
    title: 'Home V5 — Splash Page (Tool & Strategy Cards + 5 Pills)',
    description: 'Surfing dog splash page featuring the TOOL / STRATEGY left cards, custom headline graphic, and Team Insider bio header.',
    highlight: 'V5',
    category: 'homepages'
  },
  '/home-v4': {
    title: 'Home V4 — Splash Page V4',
    description: 'Earlier splash page iteration using SplashPageV4 artwork.',
    category: 'homepages'
  },
  '/home-v2': {
    title: 'Home V2 — Surfing Dog V2',
    description: 'Earlier surfing dog hero with horizontal Purchase Pre-Approval, Refinance, and Request Consultation buttons.',
    category: 'homepages'
  },
  '/home-with-dog': {
    title: 'Home With Dog (Original Dog Hero)',
    description: 'Initial surfing dog hero layout.',
    category: 'homepages'
  },
  '/home-backup': {
    title: 'Home Backup (Original Non-Dog Hero)',
    description: 'Backup of the original homepage layout.',
    category: 'homepages'
  },
  '/self-employed-programs': {
    title: 'Self-Employed Mortgage Programs (Hub)',
    description: 'Overview of alternative documentation programs for entrepreneurs, freelancers, and business owners.',
    category: 'self-employed'
  },
  '/bank-statement-loans': {
    title: 'Bank Statement Loans',
    description: 'Qualify using 12–24 months of personal or business bank deposits instead of tax returns.',
    category: 'self-employed'
  },
  '/1099-loans': {
    title: '1099 Income Loans',
    description: 'Streamlined qualification using 1099 earning statements and expense-ratio analysis.',
    category: 'self-employed'
  },
  '/mortgage-for-contractors': {
    title: 'Mortgages for Independent Contractors',
    description: 'Tailored mortgage strategies for independent contractors and 1099 professionals.',
    category: 'self-employed'
  },
  '/mortgage-for-small-business': {
    title: 'Mortgages for Small Business Owners',
    description: 'Flexible financing using business cash flow and Profit & Loss statements.',
    category: 'self-employed'
  },
  '/mortgage-for-llc': {
    title: 'Mortgages for LLC Owners',
    description: 'Specialized K-1, Schedule C, and bank statement lending for LLC members and partners.',
    category: 'self-employed'
  },
  '/mortgage-for-scorp': {
    title: 'Mortgages for S-Corp Owners',
    description: 'Blending W-2 salaries, K-1 distributions, and corporate add-backs for S-Corporation owners.',
    category: 'self-employed'
  },
  '/mortgage-for-gig-workers': {
    title: 'Mortgages for Gig Workers & Freelancers',
    description: 'Combining multiple income streams and shorter self-employment histories.',
    category: 'self-employed'
  },
  '/pre-approval': {
    title: 'Purchase Pre-Approval',
    description: 'Get a rock-solid pre-approval and strategic home-buying roadmap.',
    category: 'borrower-programs'
  },
  '/refinance': {
    title: 'Mortgage Refinance',
    description: 'Rate-and-term, cash-out, and principal paydown refinance strategies.',
    category: 'borrower-programs'
  },
  '/first-time': {
    title: 'First-Time Home Buyers',
    description: 'Low down payment options, educational video breakdowns, and step-by-step guidance.',
    category: 'borrower-programs'
  },
  '/dscr-loans': {
    title: 'DSCR Investment Property Loans',
    description: 'Cash-flow based rental property financing with no personal income verification and LLC vesting.',
    category: 'borrower-programs'
  },
  '/retirees': {
    title: 'Mortgages for Retirees',
    description: 'Asset depletion and retirement account qualification without traditional W-2 employment.',
    category: 'borrower-programs'
  },
  '/mortgage-for-realtors': {
    title: 'Mortgages for Realtors & Real Estate Agents',
    description: 'Commission-smoothing, 1099, and investment property financing for real estate professionals.',
    category: 'borrower-programs'
  },
  '/geek-out': {
    title: 'Geek Out Hub (All Tools & Calculators)',
    description: 'Central directory of interactive calculators and financial modeling tools.',
    category: 'calculators'
  },
  '/geek-out/mbs-rate-watch': {
    title: 'MBS Rate Watch — Live Mortgage-Backed Securities Tracker',
    description: 'Live Mortgage-Backed Securities (UMBS 30YR 6.0, 6.5, 7.0) and US 10-Year Treasury Note tracker updating every minute.',
    highlight: 'NEW • LIVE',
    category: 'calculators'
  },
  '/big-picture': {
    title: 'The Big Picture (Economic & Rate Insights)',
    description: 'Macroeconomic perspective and interest rate cycle analysis.',
    category: 'calculators'
  },
  '/geek-out/interactive-active-calculator': {
    title: 'Interactive Mortgage Calculator',
    description: 'Interactive scenario modeling for monthly payments and loan structures.',
    category: 'calculators'
  },
  '/geek-out/loan-limits': {
    title: 'California County Loan Limits Lookup',
    description: 'Conforming and high-balance loan limits across California counties.',
    category: 'calculators'
  },
  '/geek-out/payoff-calculator': {
    title: 'Early Payoff & Principal Acceleration Calculator',
    description: 'Model the impact of extra principal payments and amortization savings.',
    category: 'calculators'
  },
  '/geek-out/weighted-average': {
    title: 'Weighted Average Interest Rate Calculator',
    description: 'Calculate blended rates across first and second mortgages or multiple properties.',
    category: 'calculators'
  },
  '/geek-out/yield-curve': {
    title: 'Treasury Yield Curve & Rate Tracker',
    description: 'Visualize yield curve movements and how they influence mortgage rates.',
    category: 'calculators'
  },
  '/bio-rakesh': {
    title: 'Rakesh Jain — Managing Partner / Broker Bio',
    description: 'Background, credentials, and lending philosophy of Managing Partner Rakesh Jain.',
    category: 'team-company'
  },
  '/bio-david': {
    title: 'David Sider — Managing Partner / Broker Bio',
    description: 'Background, credentials, and lending philosophy of Managing Partner David Sider.',
    category: 'team-company'
  },
  '/partners': {
    title: 'Trusted Referral Partners',
    description: 'Information and collaboration resources for Realtors, CPAs, financial advisors, and attorneys.',
    category: 'team-company'
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'Data protection, privacy practices, and compliance disclosures.',
    category: 'team-company'
  }
};

const CATEGORY_DEFINITIONS = [
  {
    id: 'homepages',
    title: 'Home & Splash Page Variations',
    subtitle: 'Active homepage and design iterations created for review and comparison.'
  },
  {
    id: 'self-employed',
    title: 'Self-Employed & Business Owner Loan Programs',
    subtitle: 'Alternative documentation, bank statement, 1099, and corporate entity mortgage pages.'
  },
  {
    id: 'borrower-programs',
    title: 'Buyer, Investor, Retiree & Refinance Solutions',
    subtitle: 'Dedicated landing pages for home buyers, real estate investors, retirees, and industry professionals.'
  },
  {
    id: 'calculators',
    title: 'Geek Out: Financial Calculators & Market Tools',
    subtitle: 'Interactive mortgage calculators, charts, and analytical tools.'
  },
  {
    id: 'team-company',
    title: 'Team Bios, Partners & Site Pages',
    subtitle: 'Advisor profiles, referral partner resources, and site policies.'
  }
];

function formatRouteTitle(routePath) {
  if (routePath === '/') return 'Primary Homepage';
  const lastSegment = routePath.split('/').filter(Boolean).pop() || '';
  return lastSegment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function inferCategory(routePath) {
  if (routePath === '/' || routePath.startsWith('/home')) return 'homepages';
  if (routePath.startsWith('/geek-out') || routePath === '/big-picture') return 'calculators';
  if (routePath.startsWith('/bio-') || routePath === '/partners' || routePath === '/privacy-policy') return 'team-company';
  if (
    routePath.includes('self-employed') ||
    routePath.includes('1099') ||
    routePath.includes('bank-statement') ||
    routePath.includes('contractor') ||
    routePath.includes('small-business') ||
    routePath.includes('llc') ||
    routePath.includes('scorp') ||
    routePath.includes('gig-worker')
  ) {
    return 'self-employed';
  }
  return 'borrower-programs';
}

function extractFileMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
    const descMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
    return {
      title: titleMatch ? titleMatch[1].replace(/\s*\|\s*Insider Mortgage$/i, '') : null,
      description: descMatch ? descMatch[1] : null
    };
  } catch {
    return { title: null, description: null };
  }
}

function scanAppDirectory(dirPath, baseRoute = '') {
  let discovered = [];
  if (!fs.existsSync(dirPath)) return discovered;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Skip dynamic route folders like [slug] (handled via seoPages) and TOC itself
      if (entry.name.startsWith('[') || entry.name.startsWith('_') || entry.name.toLowerCase() === 'toc') {
        continue;
      }
      const childRoute = `${baseRoute}/${entry.name}`;
      discovered = discovered.concat(scanAppDirectory(path.join(dirPath, entry.name), childRoute));
    } else if (entry.isFile() && /^page\.(jsx|js|tsx|ts)$/.test(entry.name)) {
      const routePath = baseRoute === '' ? '/' : baseRoute;
      const fileMeta = extractFileMetadata(path.join(dirPath, entry.name));
      discovered.push({
        path: routePath,
        fileTitle: fileMeta.title,
        fileDescription: fileMeta.description
      });
    }
  }
  return discovered;
}

function buildAutoCategories() {
  const appDir = path.join(process.cwd(), 'app');
  const staticRoutes = scanAppDirectory(appDir);

  // Merge static routes from app/ and dynamic routes from seoPages.js
  const allRoutesMap = new Map();

  for (const r of staticRoutes) {
    const known = KNOWN_PAGE_METADATA[r.path];
    const versionMatch = r.path.match(/^\/home-v(\d+)$/i);
    allRoutesMap.set(r.path, {
      path: r.path,
      title: known?.title || r.fileTitle || formatRouteTitle(r.path),
      description:
        known?.description ||
        r.fileDescription ||
        `Published page at ${r.path}.`,
      highlight:
        known?.highlight ||
        (versionMatch ? `V${versionMatch[1]}` : undefined),
      category: known?.category || inferCategory(r.path)
    });
  }

  for (const seoPage of seoPages) {
    const routePath = `/${seoPage.slug}`;
    if (!allRoutesMap.has(routePath)) {
      const known = KNOWN_PAGE_METADATA[routePath];
      allRoutesMap.set(routePath, {
        path: routePath,
        title: known?.title || seoPage.title || formatRouteTitle(routePath),
        description:
          known?.description ||
          seoPage.seoDescription ||
          seoPage.heroSubtitle ||
          `Published specialty page at ${routePath}.`,
        highlight: known?.highlight,
        category: known?.category || inferCategory(routePath)
      });
    }
  }

  // Group into categories and sort naturally
  return CATEGORY_DEFINITIONS.map((catDef) => {
    const pages = Array.from(allRoutesMap.values()).filter(
      (p) => p.category === catDef.id
    );

    // Sort homepages so Root '/' is first, followed by highest version numbers (v8, v7, v6...)
    if (catDef.id === 'homepages') {
      pages.sort((a, b) => {
        if (a.path === '/') return -1;
        if (b.path === '/') return 1;
        const vA = a.path.match(/\/home-v(\d+)/i);
        const vB = b.path.match(/\/home-v(\d+)/i);
        if (vA && vB) return Number(vB[1]) - Number(vA[1]);
        if (vA) return -1;
        if (vB) return 1;
        return a.path.localeCompare(b.path);
      });
    }

    return {
      ...catDef,
      badge: `${pages.length} ${pages.length === 1 ? 'PAGE' : 'PAGES'}`,
      pages
    };
  }).filter((cat) => cat.pages.length > 0);
}

export default function TOCPage() {
  const categories = buildAutoCategories();
  return <TableOfContents categories={categories} />;
}
