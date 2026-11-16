import { UnderwriteInputs, UnitInput } from '../../../lib/financial-engine';

export interface FeaturedAgent {
  name: string;
  brokerage?: string;
  phone: string;
  email: string;
}

export interface FeaturedDeal {
  id: string;
  buttonLabel: string;
  agent: FeaturedAgent;
  dealHighlight?: string;
  listingUrl?: string;
  inputs: Partial<UnderwriteInputs> & {
    propertyAddress: string;
    unitCount: 1 | 2 | 3 | 4;
    units: UnitInput[];
    purchasePrice: number;
  };
}

/**
 * Curated Investor Deals displayed in the top bar of /tools/rental-analyzer.
 *
 * To add a new partner-agent curated deal:
 * 1. Have the partner agent build the scenario in the analyzer and send you the
 *    Share Link (?s=...) plus their contact info, deal note, and optional MLS link.
 * 2. Add an entry below with `id`, `buttonLabel`, `agent` (name, brokerage, phone, email),
 *    optional `dealHighlight` and `listingUrl`, and `inputs`.
 */
export const FEATURED_DEALS: FeaturedDeal[] = [
  {
    id: 'crawford',
    buttonLabel: '6234 Crawford (1-Unit) · Rakesh Jain',
    agent: {
      name: 'Rakesh Jain',
      brokerage: 'Insider Mortgage · CA DRE #01336748 / NMLS #240594',
      phone: '(858) 848-5653',
      email: 'Rjain@insidermtg.com',
    },
    dealHighlight:
      'Strong San Diego single-family lot with detached ADU expansion upside (toggle the What-If ADU module to model cash-on-cash lift).',
    inputs: {
      propertyAddress: '6234 Crawford St, San Diego, CA 92120',
      unitCount: 1,
      units: [{ id: 'unit-1', label: 'Single Family Home', monthlyRent: 4600 }],
      purchasePrice: 989000,
      makeReadyCost: 10000,
      monthlyMaintenance: 150,
    },
  },
  {
    id: 'tam-o-shanter',
    buttonLabel: '535 Tam O Shanter (Duplex) · David Sider',
    agent: {
      name: 'David Sider',
      brokerage: 'Insider Mortgage · NMLS #254108',
      phone: '(858) 848-5653',
      email: 'DSider@InsiderMtg.com',
    },
    dealHighlight:
      'San Marcos duplex with dual income streams and multi-family CA ADU eligibility for up to 2 detached ADUs.',
    inputs: {
      propertyAddress: '535 Tam O Shanter Dr, San Marcos, CA 92069',
      unitCount: 2,
      units: [
        { id: 'unit-1', label: 'Unit 1 (Primary)', monthlyRent: 2600 },
        { id: 'unit-2', label: 'Unit 2 (Attached)', monthlyRent: 2200 },
      ],
      purchasePrice: 880000,
      makeReadyCost: 50000,
      monthlyMaintenance: 200,
    },
  },
  {
    id: 'fourplex',
    buttonLabel: 'Normal Heights 4-Plex · Insider Mortgage',
    agent: {
      name: 'David Sider & Rakesh Jain',
      brokerage: 'Insider Mortgage · NMLS #254108 / #240594',
      phone: '(858) 848-5653',
      email: 'Rjain@insidermtg.com',
    },
    dealHighlight:
      'Classic 4-unit residential income property eligible for conventional 1–4 unit financing or DSCR underwriting.',
    inputs: {
      propertyAddress: 'Normal Heights Fourplex, San Diego, CA 92116',
      unitCount: 4,
      units: [
        { id: 'unit-1', label: 'Unit 1 (2 Bed / 2 Bath)', monthlyRent: 2650 },
        { id: 'unit-2', label: 'Unit 2 (2 Bed / 1 Bath)', monthlyRent: 2400 },
        { id: 'unit-3', label: 'Unit 3 (2 Bed / 1 Bath)', monthlyRent: 2400 },
        { id: 'unit-4', label: 'Unit 4 (1 Bed / 1 Bath)', monthlyRent: 2050 },
      ],
      purchasePrice: 1450000,
      makeReadyCost: 25000,
      monthlyMaintenance: 400,
    },
  },
];
