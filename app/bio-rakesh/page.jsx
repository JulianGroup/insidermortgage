import BioRakesh from '../../src/views/BioRakesh';

export const metadata = {
  title: 'Rakesh Jain | Insider Mortgage',
  description: 'Mortgage Loan Officer at Insider Mortgage',
};

// Person schema linked to central organization entity graph
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://insidermortgage.com/bio-rakesh/#person',
  name: 'Rakesh Jain',
  jobTitle: 'Senior Loan Officer & Partner',
  url: 'https://insidermortgage.com/bio-rakesh/',
  sameAs: [
    'https://www.linkedin.com/in/rakeshjainprofile/'
  ],
  image: 'https://insidermortgage.com/rakesh-jain.jpg',
  worksFor: {
    '@type': 'MortgageBroker',
    '@id': 'https://insidermortgage.com/#organization',
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
