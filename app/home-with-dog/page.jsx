import HomeWithDog from '../../src/views/HomeWithDog';

export const metadata = {
  robots: { index: false, follow: false },
  title: 'Home (Experimental) | Insider Mortgage',
  description: 'Experimental homepage design featuring a surfing dog.',
};

export default function HomeWithDogPage() {
  return <HomeWithDog />;
}
