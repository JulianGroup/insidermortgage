import Calculator from '../../../src/components/Calculator';
import RelatedInsights from '../../../src/components/blog/RelatedInsights';

export const metadata = {
  title: 'Interactive Active Calculator | Insider Mortgage',
  description: 'Interactive mortgage tools to estimate monthly payments, analyze cash flow, and solve for missing variables.',
};

export default function InteractiveActiveCalculatorPage() {
  return (
    <main style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
      <Calculator />
      <RelatedInsights
        calculatorId="calc-interactive"
        title="Payment & Cash-Flow Strategy Breakdowns"
        subtitle="Real borrower and investor scenarios analyzed by David and Rakesh."
        background="#FFFFFF"
      />
    </main>
  );
}
