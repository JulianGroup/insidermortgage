// Single source of truth for Insider Mortgage blog categories, calculators,
// personal bio tags, author licensing disclosures, and Phase 3 admin whitelist.
//
// Future-proofing note:
// - Keep `id` values permanent.
// - You can freely rename `label` / `title` / `description` at any time and every
//   page, filter pill, and blog badge updates automatically.
// - To retire a "Who We Serve" category without breaking existing blog URLs,
//   change `status` from 'active' to 'archived'.

export const ADMIN_EMAIL_WHITELIST = [
  'rakeshjain100@gmail.com',
  'rjain@insidermtg.com',
  'davidsider@gmail.com',
  'dsider@insidermtg.com',
];

export const C2_CORPORATE = {
  name: 'C2 Financial Corporation',
  dba: 'Insider Mortgage',
  nmls: '135622',
  cfll: '603L442',
  address: '12230 El Camino Real #100, San Diego, CA 92130',
};

export const AUTHORS = {
  rakesh: {
    id: 'rakesh',
    name: 'Rakesh Jain',
    role: 'Senior Loan Officer & Partner',
    email: 'Rjain@insidermtg.com',
    phone: '858-848-5653',
    photo: '/rakesh-jain.jpg',
    bioRoute: '/bio-rakesh',
    nmls: '240594',
    c2Nmls: '135622',
    shortBio:
      'Over two decades structuring residential mortgages, non-QM self-employed solutions, and strategic equity/HELOC plans across AZ, CA, FL, UT, and WA.',
    licenses: [
      { state: 'Arizona', stateCode: 'AZ', bloggerLicense: '1050797', c2License: 'BK-2009362' },
      { state: 'California (DRE)', stateCode: 'CA', bloggerLicense: '01336748', c2License: '01821025' },
      { state: 'Florida', stateCode: 'FL', bloggerLicense: 'LO121680', c2License: 'MLD2635' },
      { state: 'Utah (UDRE)', stateCode: 'UT', bloggerLicense: '13917645', c2License: '13748829' },
      { state: 'Washington', stateCode: 'WA', bloggerLicense: 'MLO-240594', c2License: 'MB135622' },
    ],
  },
  david: {
    id: 'david',
    name: 'David Sider',
    role: 'Managing Partner / Broker',
    email: 'DSider@InsiderMtg.com',
    phone: '858-848-5653',
    photo: '/david-sider.jpg',
    bioRoute: '/bio-david',
    nmls: '254108',
    c2Nmls: '135622',
    shortBio:
      'Known for custom video scenario breakdowns, transparent numbers-first guidance, and creative mortgage structuring for California homebuyers and homeowners.',
    licenses: [
      { state: 'California (DRE)', stateCode: 'CA', bloggerLicense: '01193796', c2License: '01821025' },
    ],
  },
};

export const WHO_WE_SERVE_CATEGORIES = [
  {
    id: 'cat-self-employed',
    label: 'Self-Employed Borrowers',
    shortLabel: 'Self-Employed',
    icon: '💼',
    description:
      "We understand that your tax returns don't always tell the whole story. Leverage our alternative documentation programs designed for entrepreneurs.",
    highlights: ['Bank Statement Loans', 'P&L Only Programs', '1099 Expense Ratio Loans'],
    route: '/self-employed-programs',
    matchingSlugs: [
      'self-employed-programs',
      'bank-statement-loans',
      '1099-loans',
      'mortgage-for-contractors',
      'mortgage-for-realtors',
      'mortgage-for-gig-workers',
      'mortgage-for-small-business',
      'mortgage-for-llc',
      'mortgage-for-scorp',
    ],
    showOnHomepageWhoWeServe: true,
    status: 'active',
  },
  {
    id: 'cat-investors',
    label: 'Investors',
    shortLabel: 'Investors & DSCR',
    icon: '🏢',
    description:
      'Expand your real estate portfolio without the red tape. Qualify strictly based on the cash flow of the property, not your personal income.',
    highlights: ['DSCR Loans', 'No Personal Income Limits', '2nd mortgages'],
    route: '/dscr-loans',
    matchingSlugs: ['dscr-loans'],
    showOnHomepageWhoWeServe: true,
    status: 'active',
  },
  {
    id: 'cat-first-time',
    label: 'First-Time Home Buyers',
    shortLabel: 'First-Time Buyers',
    icon: '🔑',
    description:
      'Navigate the home buying process with confidence. We provide a step-by-step roadmap and low-down-payment options to get you into your first home.',
    highlights: ['Low Down Payment', 'Down Payment Assistance', 'Educational Roadmap'],
    route: '/first-time',
    matchingSlugs: ['first-time'],
    showOnHomepageWhoWeServe: true,
    status: 'active',
  },
  {
    id: 'cat-retirees',
    label: 'Retirees',
    shortLabel: 'Retirees & 55+',
    icon: '🌅',
    description:
      'Unlock the equity in your home or qualify for a new purchase using your hard-earned retirement assets, even without traditional employment income.',
    highlights: ['Asset Depletion Programs', 'Reverse Mortgages', 'Retirement Account Qualifying'],
    route: '/retirees',
    matchingSlugs: ['retirees'],
    showOnHomepageWhoWeServe: true,
    status: 'active',
  },
];

export const CALCULATOR_TAGS = [
  {
    id: 'calc-weighted-avg',
    label: 'Weighted Average & HELOC Calculator',
    shortLabel: 'Weighted Avg Calculator',
    route: '/geek-out/weighted-average',
    description:
      'Calculate your blended interest rate across all debts and test whether consolidating high-interest balances into a HELOC lowers your monthly outflow.',
    ctaLabel: 'Open Weighted Average Calculator',
  },
  {
    id: 'calc-prop19',
    label: 'California Prop 19 Tax Transfer Calculator',
    shortLabel: 'CA Prop 19 Calculator',
    route: '/CAprop-19-calculator',
    description:
      'Estimate first-year and 10-year property tax savings when transferring your protected Prop 13 base as a homeowner age 55+.',
    ctaLabel: 'Run Prop 19 Tax Savings Numbers',
  },
  {
    id: 'calc-payoff',
    label: 'Mortgage Payoff Time Calculator',
    shortLabel: 'Payoff Calculator',
    route: '/geek-out/payoff-calculator',
    description:
      'Model how extra principal payments or strategic refinancing shaves months and years off your mortgage timeline.',
    ctaLabel: 'Launch Payoff Time Calculator',
  },
  {
    id: 'calc-interactive',
    label: 'Interactive Active Mortgage Calculator',
    shortLabel: 'Interactive Calculator',
    route: '/geek-out/interactive-active-calculator',
    description:
      'Solve for monthly payments, loan amounts, interest rates, or investment property cash-flow scenarios.',
    ctaLabel: 'Try Interactive Calculator',
  },
  {
    id: 'calc-loan-limits',
    label: '2026 County Loan Limits Lookup',
    shortLabel: '2026 Loan Limits',
    route: '/geek-out/loan-limits',
    description:
      'Check 2026 conforming and high-balance loan limits for 1-to-4 unit properties in your county.',
    ctaLabel: 'Check County Loan Limits',
  },
  {
    id: 'calc-yield-curve',
    label: 'Treasury Yield Curve Tracker',
    shortLabel: 'Yield Curve Tracker',
    route: '/geek-out/yield-curve',
    description:
      'Track the 10-Year vs. 3-Month Treasury spread and see what bond market inversions signal for mortgage rates.',
    ctaLabel: 'Explore Yield Curve Chart',
  },
  {
    id: 'calc-mbs',
    label: 'MBS & 10-Year Treasury Rate Watch',
    shortLabel: 'MBS Rate Watch',
    route: '/geek-out/mbs-rate-watch',
    description:
      'Watch live UMBS 30-Year coupon pricing and 10-Year Treasury basis-point movements.',
    ctaLabel: 'View Live MBS Rate Watch',
  },
  {
    id: 'calc-prime-rate',
    label: 'U.S. Prime Rate & 10-Year History',
    shortLabel: 'Prime Rate History',
    route: '/geek-out/prime-rate-history',
    description:
      'Track the current U.S. Prime Rate, FOMC rate vote summaries, and every Prime Rate change over the last 10 years.',
    ctaLabel: 'View 10-Year Prime Rate History',
  },
];

export const BIO_TAGS = [
  {
    id: 'bio-rakesh',
    label: "Rakesh's Personal Bio Page",
    authorId: 'rakesh',
    route: '/bio-rakesh',
  },
  {
    id: 'bio-david',
    label: "David's Personal Bio Page",
    authorId: 'david',
    route: '/bio-david',
  },
];

export const SPECIFIC_ROUTE_OPTIONS = [
  { slug: 'self-employed-programs', label: 'Self-Employed Hub (/self-employed-programs)' },
  { slug: 'bank-statement-loans', label: 'Bank Statement Loans (/bank-statement-loans)' },
  { slug: '1099-loans', label: '1099 Income Loans (/1099-loans)' },
  { slug: 'mortgage-for-contractors', label: 'Independent Contractors (/mortgage-for-contractors)' },
  { slug: 'mortgage-for-small-business', label: 'Small Business Owners (/mortgage-for-small-business)' },
  { slug: 'mortgage-for-llc', label: 'LLC Owners (/mortgage-for-llc)' },
  { slug: 'mortgage-for-scorp', label: 'S-Corp Owners (/mortgage-for-scorp)' },
  { slug: 'mortgage-for-gig-workers', label: 'Gig Workers & Freelancers (/mortgage-for-gig-workers)' },
  { slug: 'mortgage-for-realtors', label: 'Realtors & Agents (/mortgage-for-realtors)' },
  { slug: 'first-time', label: 'First-Time Home Buyers (/first-time)' },
  { slug: 'pre-approval', label: 'Purchase Pre-Approval (/pre-approval)' },
  { slug: 'refinance', label: 'Refinance & Home Equity (/refinance)' },
  { slug: 'dscr-loans', label: 'DSCR Investor Loans (/dscr-loans)' },
  { slug: 'retirees', label: 'Retirees & 55+ (/retirees)' },
];
