import '../src/index.css';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';

export const metadata = {
  title: 'Insider Mortgage | Trusted Mortgage Experts',
  description: 'San Diego Mortgage Experts helping self-employed, first-time buyers, and real estate investors.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/insidermortgage/favicon.svg" />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
