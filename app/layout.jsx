import '../src/index.css';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';

export const metadata = {
  metadataBase: new URL('https://insidermortgage.com'),
  alternates: { canonical: './' },
  verification: { google: 'RY_4PE2t2wnYtX13dCYwn16HIayjmpHfs9jL2d_4wYA' },
  title: 'Insider Mortgage | Trusted Mortgage Experts',
  description: 'San Diego Mortgage Experts helping self-employed, first-time buyers, and real estate investors.',
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
