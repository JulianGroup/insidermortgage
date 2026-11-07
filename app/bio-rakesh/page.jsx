import BioRakesh from '../../src/views/BioRakesh';

export const metadata = {
  title: 'Rakesh Jain | Insider Mortgage',
  description: 'Mortgage Loan Officer at Insider Mortgage',
};

// Conservative Person schema: no license numbers or credential claims.
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Rakesh Jain',
  jobTitle: 'Mortgage Loan Officer',
  url: 'https://insidermortgage.com/bio-rakesh/',
  sameAs: [
    'https://www.linkedin.com/in/rakeshjainprofile/'
  ],
  image: 'https://insidermortgage.com/rakesh-jain.jpg',
  worksFor: {
    '@type': 'MortgageBroker',
    name: 'Insider Mortgage',
    url: 'https://insidermortgage.com/',
  },
};

export default function BioRakeshPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <BioRakesh />
    </>
  );
}
