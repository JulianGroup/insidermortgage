import BigPicture from '../../src/views/BigPicture';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: "IMC's Big Picture | Insider Mortgage",
  description: "Learn about Insider Mortgage's holistic approach to Financial Whealth.",
});

export default function BigPicturePage() {
  return <BigPicture />;
}
