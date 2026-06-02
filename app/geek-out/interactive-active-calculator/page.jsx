import Calculator from '../../../src/components/Calculator';

export const metadata = {
  title: 'Interactive Active Calculator | Insider Mortgage',
  description: 'Interactive mortgage tools to estimate monthly payments, analyze cash flow, and solve for missing variables.',
};

export default function InteractiveActiveCalculatorPage() {
  return (
    <main style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
      <Calculator />
    </main>
  );
}
