import BioDavid from '../../src/views/BioDavid';

export const metadata = {
  title: 'David Sider | Insider Mortgage',
  description: 'Managing Partner / Broker at Insider Mortgage',
};

// Conservative Person schema: no license numbers or credential claims.
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'David Sider',
  jobTitle: 'Mortgage Broker',
  url: 'https://insidermortgage.com/bio-david/',
  image: 'https://insidermortgage.com/david-sider.jpg',
  worksFor: {
    '@type': 'MortgageBroker',
    name: 'Insider Mortgage',
    url: 'https://insidermortgage.com/',
  },
};

export default function BioDavidPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <BioDavid />
    </>
  );
}
