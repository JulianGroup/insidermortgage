import '../src/index.css';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';

export const metadata = {
  metadataBase: new URL('https://insidermortgage.com'),
  alternates: { canonical: './' },
  verification: { google: 'HFFShjVLJzamyLU8m8MXP--GugsvWFt-WH545nQ3Um8' },
  title: 'Insider Mortgage | San Diego Self-Employed & Investor Loans',
  description:
    'San Diego mortgage experts helping self-employed borrowers, first-time buyers, retirees, and real estate investors. Schedule a consultation.',
  openGraph: {
    title: 'Insider Mortgage | San Diego Mortgage Broker',
    description:
      'San Diego mortgage specialists helping self-employed borrowers, 1099 contractors, first-time home buyers, retirees, and real estate investors.',
    url: 'https://insidermortgage.com/',
    siteName: 'Insider Mortgage',
    images: [
      {
        url: '/og-preview.jpg',
        width: 1200,
        height: 630,
        alt: 'Insider Mortgage - Trusted Mortgage Experts',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Insider Mortgage | San Diego Mortgage Broker',
    description:
      'San Diego mortgage specialists helping self-employed borrowers, 1099 contractors, first-time home buyers, retirees, and real estate investors.',
    images: ['/og-preview.jpg'],
  },
};

// Conservative organization schema: no license numbers, ratings or rate claims.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'MortgageBroker',
  name: 'Insider Mortgage',
  legalName: 'C2 Financial Corporation',
  url: 'https://insidermortgage.com/',
  logo: 'https://insidermortgage.com/C2-IMCv2.jpg',
  image: 'https://insidermortgage.com/C2-IMCv2.jpg',
  telephone: '+1-858-848-5653',
  email: 'Rjain@insidermtg.com',
  hasMap: 'https://maps.app.goo.gl/YNzoKE4J1ywzhySE8',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '12230 El Camino Real #100',
    addressLocality: 'San Diego',
    addressRegion: 'CA',
    postalCode: '92130',
    addressCountry: 'US',
  },
  areaServed: {
    '@type': 'State',
    name: 'California',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
