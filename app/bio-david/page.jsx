import BioDavid from '../../src/views/BioDavid';

export const metadata = {
  title: 'David Sider | Insider Mortgage',
  description: 'Managing Partner / Broker at Insider Mortgage',
};

// Person schema linked to central organization entity graph
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://insidermortgage.com/bio-david/#person',
  name: 'David Sider',
  jobTitle: 'Managing Partner / Broker',
  url: 'https://insidermortgage.com/bio-david/',
  sameAs: [
    'https://www.linkedin.com/in/david-sider-010701b/'
  ],
  image: 'https://insidermortgage.com/david-sider.jpg',
  worksFor: {
    '@type': 'MortgageBroker',
    '@id': 'https://insidermortgage.com/#organization',
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
