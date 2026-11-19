import HomePreview from '../../src/views/HomePreview';

export const metadata = {
  title: 'Homepage Polish Preview | Insider Mortgage',
  description: 'Internal design preview for partner review.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <HomePreview />;
}
