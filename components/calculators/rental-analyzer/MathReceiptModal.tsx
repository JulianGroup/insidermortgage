'use client';

import React, { useEffect } from 'react';
import { UnderwriteInputs, UnderwriteSummary } from '../../../lib/financial-engine';

export type MathMetricKey =
  | 'rent-factor'
  | 'cash-flow'
  | 'dscr'
  | 'noi'
  | 'cap-rate'
  | 'irr-5'
  | 'profit-5'
  | 'irr-10'
  | 'profit-10';

interface MathReceiptModalProps {
  activeMetric: MathMetricKey | null;
  onSelectMetric: (metric: MathMetricKey) => void;
  onClose: () => void;
  inputs: UnderwriteInputs;
  summary: UnderwriteSummary;
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const fmt = (n: number) => currencyFmt.format(Math.round(n));
const fmtSigned = (n: number) => {
  const r = Math.round(n);
  return r >= 0 ? `+${currencyFmt.format(r)}` : `−${currencyFmt.format(Math.abs(r))}`;
};

export const MATH_METRIC_TABS: { key: MathMetricKey; shortLabel: string; title: string }[] = [
  {
    key: 'rent-factor',
    shortLabel: 'Rent Factor',
    title: 'Rent Factor — A Quick Measure of Rental Income Potential',
  },
  { key: 'cap-rate', shortLabel: 'Cap Rate', title: 'Cap Rate (NOI ÷ Basis Value)' },
  { key: 'cash-flow', shortLabel: 'Cash on Cash', title: 'Cash-on-Cash Return (CoC) & Cash Flow' },
  { key: 'profit-10', shortLabel: '10-Yr Profit & ROI', title: 'Net 10-Year Lifetime Profit & ROI' },
  { key: 'irr-10', shortLabel: '10-Yr IRR', title: '10-Year Internal Rate of Return (IRR)' },
  { key: 'profit-5', shortLabel: '5-Yr Profit & ROI', title: 'Net 5-Year Lifetime Profit & ROI' },
  { key: 'irr-5', shortLabel: '5-Yr IRR', title: '5-Year Internal Rate of Return (IRR)' },
  { key: 'noi', shortLabel: 'Year 1 NOI', title: 'Year 1 Net Operating Income (NOI)' },
  { key: 'dscr', shortLabel: 'DSCR', title: 'DSCR (Debt Service Coverage Ratio)' },
];

interface ReceiptLine {
  label: string;
  sub?: string;
  amount: string;
  amountSub?: string;
  type?: 'normal' | 'subtract' | 'subtotal' | 'total';
  tone?: 'positive' | 'negative' | 'neutral';
}

export default function MathReceiptModal({
  activeMetric,
  onSelectMetric,
  onClose,
  inputs,
  summary,
}: MathReceiptModalProps) {
  useEffect(() => {
    if (!activeMetric) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMetric, onClose]);

  if (!activeMetric) return null;

  const price = inputs.purchasePrice || 0;
  const aduMultiplier = inputs.unitCount > 1 && inputs.aduCount === 2 ? 2 : 1;
  const effectiveAduCost = inputs.aduEnabled ? (inputs.aduCost || 0) * aduMultiplier : 0;
  const effectiveAduRent = inputs.aduEnabled ? (inputs.aduRentMonthly || 0) * aduMultiplier : 0;
  const aduInYear1 = inputs.aduEnabled && (inputs.aduStartMonth ?? 0) < 12;
  const taxInsBase = price + (aduInYear1 ? effectiveAduCost : 0);
  const basisValue = price + (inputs.makeReadyCost || 0) + (aduInYear1 ? effectiveAduCost : 0);
  const grossMonthlyRentForRentFactor =
    summary.totalMonthlyRent + (aduInYear1 ? effectiveAduRent : 0);
  const rentFactor =
    basisValue > 0 ? (grossMonthlyRentForRentFactor / basisValue) * 100 : 0;

  const yr1 = summary.schedule[0];
  const annualGrossRent = yr1 ? yr1.monthlyGrossRent * 12 : summary.totalMonthlyRent * 12;
  const vacancyLoss = annualGrossRent * inputs.vacancyRate;
  const egi = yr1 ? yr1.effectiveGrossIncome : annualGrossRent - vacancyLoss;

  const annualTaxes = taxInsBase * inputs.propertyTaxRate;
  const annualInsurance = taxInsBase * inputs.insuranceRate;
  const annualMgmt = egi * inputs.propMgmtRate;
  const annualHoa = (inputs.monthlyHoa || 0) * 12;
  const annualMaint = (inputs.monthlyMaintenance ?? 0) * 12;
  const totalOpEx = yr1
    ? yr1.operatingExpenses
    : annualTaxes + annualInsurance + annualMgmt + annualHoa + annualMaint;

  const year1Noi = summary.year1Noi;
  const monthlyNoi = year1Noi / 12;
  const capRate = basisValue > 0 ? (year1Noi / basisValue) * 100 : 0;

  const annualDebt = summary.monthlyPmt * 12;
  const year1Cf = summary.year1CashFlow;
  const monthlyCf = year1Cf / 12;
  const cocPct =
    summary.initialCashInvested > 0 ? (year1Cf / summary.initialCashInvested) * 100 : 0;

  const monthlyPropertyTax = (price * inputs.propertyTaxRate) / 12;
  const monthlyInsurance = (price * inputs.insuranceRate) / 12;
  const monthlyHoaFee = inputs.monthlyHoa || 0;
  const totalMonthlyPitia =
    summary.monthlyPmt + monthlyPropertyTax + monthlyInsurance + monthlyHoaFee;
  const dscr = totalMonthlyPitia > 0 ? summary.totalMonthlyRent / totalMonthlyPitia : 0;

  const downPayment = price * inputs.downPaymentPct;

  const buildHorizonProfitContent = (years: 5 | 10) => {
    const h = years === 5 ? summary.fiveYear : summary.tenYear;
    const isPositiveProfit = h.totalProfit >= 0;
    return {
      badgeValue: `${fmt(h.totalProfit)} (${h.totalRoiPct.toFixed(1)}% ROI)`,
      badgeTone: isPositiveProfit ? ('positive' as const) : ('negative' as const),
      plainEnglish: `If you sell the property at the end of Year ${years}, pay off the remaining mortgage, pay realtor/closing costs, and pay yourself back the ${fmt(
        summary.initialCashInvested
      )} you put in on Day 1, this is the net profit left in your pocket.`,
      formula: `Cash Check at Sale + ${years}-Yr Cash Flows − Initial Cash Put In = Net ${years}-Yr Profit`,
      lines: [
        {
          label: `Projected Property Value in Year ${years}`,
          sub: `Growing at ${(inputs.annualAppreciation * 100).toFixed(1)}%/yr appreciation`,
          amount: fmt(h.propertyValue),
          type: 'normal' as const,
        },
        {
          label: `Minus Selling & Closing Costs (${(inputs.sellingCostPct * 100).toFixed(1)}%)`,
          sub: 'Realtor commissions, title, escrow & transfer taxes',
          amount: `−${fmt(h.sellingCosts)}`,
          type: 'subtract' as const,
          tone: 'negative' as const,
        },
        {
          label: `Minus Remaining Mortgage Payoff`,
          sub: `Started at ${fmt(summary.loanAmount)} (${fmt(
            Math.max(0, summary.loanAmount - h.remainingBalance)
          )} paid down by tenants)`,
          amount: `−${fmt(h.remainingBalance)}`,
          type: 'subtract' as const,
          tone: 'negative' as const,
        },
        {
          label: 'Equals Cash Check at Closing (Net Sale Proceeds)',
          sub: 'Cash wired to you when the sale closes',
          amount: fmt(h.netSaleProceeds),
          type: 'subtotal' as const,
        },
        {
          label: `${years}-Year Cumulative Rent Cash Flow`,
          sub: `Sum of Years 1–${years} annual net cash flows`,
          amount: fmtSigned(h.cumulativeCashFlow),
          type: 'normal' as const,
          tone: h.cumulativeCashFlow >= 0 ? ('positive' as const) : ('negative' as const),
        },
        {
          label: 'Minus Your Original Day-1 Cash Invested',
          sub: `${fmt(downPayment)} down payment + ${fmt(inputs.makeReadyCost)} make-ready${
            effectiveAduCost > 0 ? ` + ${fmt(effectiveAduCost)} ADU` : ''
          }`,
          amount: `−${fmt(summary.initialCashInvested)}`,
          type: 'subtract' as const,
          tone: 'negative' as const,
        },
        {
          label: `Net ${years}-Year Lifetime Profit`,
          sub: `Total Return on Investment (ROI): ${fmt(h.totalProfit)} ÷ ${fmt(
            summary.initialCashInvested
          )} = ${h.totalRoiPct.toFixed(1)}%`,
          amount: fmt(h.totalProfit),
          amountSub: `${h.totalRoiPct.toFixed(1)}% Total ROI`,
          type: 'total' as const,
          tone: isPositiveProfit ? ('positive' as const) : ('negative' as const),
        },
      ],
      takeaway: `Total ROI (${h.totalRoiPct.toFixed(
        1
      )}%) measures your total cumulative gain over the whole ${years}-year hold. To compare this against an annual bank interest rate or stock market return, check the ${years}-Year IRR tab.`,
    };
  };

  const buildHorizonIrrContent = (years: 5 | 10) => {
    const h = years === 5 ? summary.fiveYear : summary.tenYear;
    const rows = summary.schedule.slice(0, years);
    const totalEndMoney = h.netSaleProceeds + h.cumulativeCashFlow;

    const lines: ReceiptLine[] = [
      {
        label: 'Day 1 (Money You Put In)',
        sub: `Down payment (${Math.round(inputs.downPaymentPct * 100)}%) + make-ready costs`,
        amount: `−${fmt(summary.initialCashInvested)}`,
        type: 'subtract',
        tone: 'negative',
      },
      ...rows.slice(0, years - 1).map((r) => ({
        label: `Year ${r.year} Operating Cash Flow`,
        sub: `${fmtSigned(r.netCashFlow / 12)}/mo after all bills & mortgage`,
        amount: fmtSigned(r.netCashFlow),
        type: 'normal' as const,
        tone: r.netCashFlow >= 0 ? ('positive' as const) : ('negative' as const),
      })),
      {
        label: `Year ${years} Cash Flow + Sale Payday`,
        sub: `${fmtSigned(rows[years - 1]?.netCashFlow ?? 0)} Year ${years} cash flow + ${fmt(
          h.netSaleProceeds
        )} net sale check`,
        amount: fmtSigned((rows[years - 1]?.netCashFlow ?? 0) + h.netSaleProceeds),
        type: 'subtotal',
        tone: 'positive',
      },
      {
        label: `Equivalent Yearly Compounding Rate (${years}-Yr IRR)`,
        sub: `Turns ${fmt(summary.initialCashInvested)} into ${fmt(
          totalEndMoney
        )} net over ${years} years`,
        amount: `${h.irrPct.toFixed(2)}% / yr`,
        type: 'total',
        tone: h.irrPct >= 0 ? 'positive' : 'negative',
      },
    ];

    return {
      badgeValue: `${h.irrPct.toFixed(2)}% / yr`,
      badgeTone: h.irrPct >= 0 ? ('positive' as const) : ('negative' as const),
      plainEnglish: `Think of IRR as your "Equivalent Savings Account Rate." Because real estate pays you mostly at the end when you sell (instead of evenly every month), IRR figures out what yearly compounding interest rate a bank account would have to pay to match your exact cash-in and cash-out timeline.`,
      formula: `Why isn't IRR just Total ROI (${h.totalRoiPct.toFixed(
        1
      )}%) ÷ ${years} years? Because interest compounds on itself each year, and money received earlier is worth more than money received later.`,
      lines,
      takeaway: `An IRR of ${h.irrPct.toFixed(
        2
      )}% means your invested dollars grew at the same pace as an account paying ${h.irrPct.toFixed(
        2
      )}% compounded annually for ${years} straight years.`,
    };
  };

  const getMetricContent = (): {
    badgeValue: string;
    badgeTone: 'positive' | 'negative' | 'neutral';
    plainEnglish: string | string[];
    formula: string;
    lines: ReceiptLine[];
    takeaway: string;
  } => {
    switch (activeMetric) {
      case 'rent-factor':
        return {
          badgeValue: `${rentFactor.toFixed(2)}%`,
          badgeTone: rentFactor >= 1.0 ? 'positive' : 'neutral',
          plainEnglish: [
            "The Rent Factor is an Insider Mortgage metric that compares a property's Monthly Gross Rental Income to its Total Acquisition Cost (purchase price plus initial improvements). A higher Rent Factor generally indicates more rental income relative to the property's cost, making it a useful tool for quickly comparing potential investments.",
            'Some call this a “Rent-to-Price Ratio.” Another common investor screening metric is called the “1% Rule,” which says a great investment is a Rent Factor of 1% or more.',
            'For example, a property with a purchase price of $900,000 and $100,000 of improvements that generates $7,500 in monthly rent has a Rent Factor of 0.75%.',
            'Unlike Cap Rate, Rent Factor does not deduct operating expenses. Unlike Cash-on-Cash Return and DSCR, it does not consider mortgage financing.',
          ],
          formula: 'Rent Factor = Gross Monthly Rent ÷ Total Acquisition Cost × 100',
          lines: [
            {
              label: 'Gross Monthly Rental Income',
              sub: `Across ${inputs.unitCount} ${inputs.unitCount === 1 ? 'unit' : 'units'}${
                aduInYear1 && effectiveAduRent > 0 ? ` + ${fmt(effectiveAduRent)}/mo ADU` : ''
              }`,
              amount: `${fmt(grossMonthlyRentForRentFactor)}/mo`,
              type: 'normal',
            },
            {
              label: 'Divided by Total Acquisition Cost',
              sub: `${fmt(price)} purchase price + ${fmt(
                inputs.makeReadyCost || 0
              )} initial improvements${
                aduInYear1 && effectiveAduCost > 0 ? ` + ${fmt(effectiveAduCost)} ADU cost` : ''
              }`,
              amount: `÷ ${fmt(basisValue)}`,
              type: 'normal',
            },
            {
              label: 'Rent Factor',
              sub: `(${fmt(grossMonthlyRentForRentFactor)} ÷ ${fmt(basisValue)}) × 100`,
              amount: `${rentFactor.toFixed(2)}%`,
              type: 'total',
              tone: rentFactor >= 1.0 ? 'positive' : 'neutral',
            },
          ],
          takeaway:
            'Think of Rent Factor as the first screening tool, Cap Rate as the measure of operating performance, Cash-on-Cash as the return on your invested cash, and DSCR as the measure of debt-payment coverage.',
        };

      case 'noi':
        return {
          badgeValue: `${fmt(year1Noi)}/yr (${fmt(monthlyNoi)}/mo)`,
          badgeTone: year1Noi >= 0 ? 'positive' : 'negative',
          plainEnglish:
            'How much money the property earns in Year 1 after paying everyday property upkeep bills—but BEFORE paying the mortgage.',
          formula: 'Actual Rent Collected − Everyday Property Bills = Net Operating Income (NOI)',
          lines: [
            {
              label: `Total Scheduled Gross Rent (${inputs.unitCount} ${
                inputs.unitCount === 1 ? 'unit' : 'units'
              })`,
              sub: `${fmt( yr1 ? yr1.monthlyGrossRent : summary.totalMonthlyRent )}/mo × 12 months`,
              amount: fmt(annualGrossRent),
              amountSub: `${fmt(annualGrossRent / 12)}/mo`,
              type: 'normal',
            },
            {
              label: `Minus Vacancy Allowance (${(inputs.vacancyRate * 100).toFixed(1)}%)`,
              sub: 'Money set aside for empty days between tenants',
              amount: `−${fmt(vacancyLoss)}`,
              amountSub: `−${fmt(vacancyLoss / 12)}/mo`,
              type: 'subtract',
              tone: 'negative',
            },
            {
              label: 'Equals Actual Rent Collected (EGI)',
              sub: 'Effective Gross Income',
              amount: fmt(egi),
              amountSub: `${fmt(egi / 12)}/mo`,
              type: 'subtotal',
            },
            {
              label: `Minus Property Taxes (${(inputs.propertyTaxRate * 100).toFixed(2)}%)`,
              sub: `${(inputs.propertyTaxRate * 100).toFixed(2)}% of ${fmt(taxInsBase)}`,
              amount: `−${fmt(annualTaxes)}`,
              amountSub: `−${fmt(annualTaxes / 12)}/mo`,
              type: 'subtract',
              tone: 'negative',
            },
            {
              label: `Minus Home Insurance (${(inputs.insuranceRate * 100).toFixed(2)}%)`,
              sub: `${(inputs.insuranceRate * 100).toFixed(2)}% of ${fmt(taxInsBase)}`,
              amount: `−${fmt(annualInsurance)}`,
              amountSub: `−${fmt(annualInsurance / 12)}/mo`,
              type: 'subtract',
              tone: 'negative',
            },
            {
              label: `Minus Property Management (${(inputs.propMgmtRate * 100).toFixed(0)}% of EGI)`,
              sub: 'Leasing & tenant management fee',
              amount: `−${fmt(annualMgmt)}`,
              amountSub: `−${fmt(annualMgmt / 12)}/mo`,
              type: 'subtract',
              tone: 'negative',
            },
            {
              label: 'Minus Repairs & Maintenance Budget',
              sub: `${fmt(inputs.monthlyMaintenance ?? 0)}/mo × 12 months`,
              amount: `−${fmt(annualMaint)}`,
              amountSub: `−${fmt(annualMaint / 12)}/mo`,
              type: 'subtract',
              tone: 'negative',
            },
            ...(annualHoa > 0
              ? [
                  {
                    label: 'Minus HOA / Association Dues',
                    sub: `${fmt(inputs.monthlyHoa)}/mo × 12 months`,
                    amount: `−${fmt(annualHoa)}`,
                    amountSub: `−${fmt(inputs.monthlyHoa)}/mo`,
                    type: 'subtract' as const,
                    tone: 'negative' as const,
                  },
                ]
              : []),
            {
              label: 'Year 1 Net Operating Income (NOI)',
              sub: `${fmt(egi)} collected rent − ${fmt(totalOpEx)} property bills`,
              amount: `${fmt(year1Noi)}/yr`,
              amountSub: `${fmt(monthlyNoi)}/mo`,
              type: 'total',
              tone: year1Noi >= 0 ? 'positive' : 'negative',
            },
          ],
          takeaway:
            'Why exclude the mortgage here? Because every buyer uses a different loan and down payment. NOI lets you judge the property itself on a level playing field.',
        };

      case 'cap-rate':
        return {
          badgeValue: `${capRate.toFixed(2)}%`,
          badgeTone: 'neutral',
          plainEnglish:
            'If you bought and stabilized this property with 100% cash (no mortgage at all), the Cap Rate is the yearly percentage return your money would earn in Year 1 relative to your total cost basis.',
          formula: 'Year 1 Net Operating Income (NOI) ÷ Value (Basis) = Cap Rate %',
          lines: [
            {
              label: 'Year 1 Net Operating Income (NOI)',
              sub: `${fmt(egi)} collected rent − ${fmt(totalOpEx)} operating bills`,
              amount: `${fmt(year1Noi)}/yr`,
              type: 'normal',
            },
            {
              label: 'Divided by Value (Basis = PP + Costs)',
              sub: `${fmt(price)} purchase price + ${fmt(inputs.makeReadyCost || 0)} make-ready${
                aduInYear1 && effectiveAduCost > 0 ? ` + ${fmt(effectiveAduCost)} ADU cost` : ''
              } (not appreciation)`,
              amount: `÷ ${fmt(basisValue)}`,
              type: 'normal',
            },
            {
              label: 'Year 1 Cap Rate',
              sub: `${fmt(year1Noi)} ÷ ${fmt(basisValue)} = ${(capRate / 100).toFixed(4)}`,
              amount: `${capRate.toFixed(2)}%`,
              type: 'total',
              tone: 'positive',
            },
          ],
          takeaway: `Think of Cap Rate like the interest rate on a CD. At ${capRate.toFixed(
            2
          )}%, the property's unlevered yield on basis is ${
            capRate < inputs.interestRate * 100
              ? `lower than your ${(inputs.interestRate * 100).toFixed(
                  2
                )}% mortgage rate—which explains why borrowing at ${(
                  inputs.interestRate * 100
                ).toFixed(2)}% creates negative cash flow in Year 1.`
              : `higher than your ${(inputs.interestRate * 100).toFixed(2)}% mortgage rate.`
          }`,
        };

      case 'dscr':
        return {
          badgeValue: `${dscr.toFixed(2)}%`,
          badgeTone: dscr >= 1.0 ? 'positive' : 'neutral',
          plainEnglish:
            'Debt Service Coverage Ratio (DSCR) is the lender metric comparing gross monthly schedule rent against total monthly housing payment (PITIA). A 1.00% DSCR means gross rent exactly equals the mortgage + tax + insurance + HOA payment.',
          formula: 'Gross Monthly Rent ÷ Total Monthly PITIA = DSCR',
          lines: [
            {
              label: 'Gross Monthly Rent Schedule',
              sub: `Across ${inputs.unitCount} ${inputs.unitCount === 1 ? 'unit' : 'units'}`,
              amount: `${fmt(summary.totalMonthlyRent)}/mo`,
              type: 'normal',
            },
            {
              label: 'Divided by Total Monthly PITIA',
              sub: `P&I ${fmt(summary.monthlyPmt)} + Tax ${fmt(monthlyPropertyTax)} + Ins ${fmt(
                monthlyInsurance
              )}${monthlyHoaFee > 0 ? ` + HOA ${fmt(monthlyHoaFee)}` : ''}`,
              amount: `÷ ${fmt(totalMonthlyPitia)}/mo`,
              type: 'normal',
            },
            {
              label: 'DSCR Ratio',
              sub: `${fmt(summary.totalMonthlyRent)}/mo ÷ ${fmt(totalMonthlyPitia)}/mo`,
              amount: `${dscr.toFixed(2)}%`,
              type: 'total',
              tone: dscr >= 1.0 ? 'positive' : 'negative',
            },
          ],
          takeaway:
            'DSCR lenders compare gross rent straight against PITIA (without subtracting vacancy, maintenance, or property management). That is why a property can be close to 1.00x DSCR while still having negative real-world cash flow.',
        };

      case 'cash-flow':
        return {
          badgeValue: `${cocPct.toFixed(2)}% (${fmtSigned(monthlyCf)}/mo)`,
          badgeTone: cocPct >= 0 ? 'positive' : 'negative',
          plainEnglish:
            'Cash-on-Cash Return (CoC) measures the annual pre-tax cash flow a rental property generates relative to the actual out-of-pocket cash you invested to acquire and stabilize it. Unlike metrics that evaluate the property’s total value (like Cap Rate), CoC isolates the performance of your specific cash equity, factoring in the impact of mortgage financing.',
          formula: 'Cash-on-Cash Return = (Annual Pre-Tax Cash Flow ÷ Total Cash Invested) × 100',
          lines: [
            {
              label: 'Monthly Rent Collected After Vacancy (EGI)',
              sub: `${fmt(annualGrossRent / 12)}/mo gross rent − ${fmt(
                vacancyLoss / 12
              )}/mo vacancy (${(inputs.vacancyRate * 100).toFixed(1)}%)`,
              amount: `+${fmt(egi / 12)}/mo`,
              amountSub: `${fmt(egi)}/yr`,
              type: 'normal',
            },
            {
              label: 'Minus Operating Expenses (Taxes, Ins, Mgmt, Maint, HOA)',
              sub: `Taxes ${fmt(annualTaxes / 12)} + Ins ${fmt(
                annualInsurance / 12
              )} + Mgmt ${fmt(annualMgmt / 12)} + Maint ${fmt(annualMaint / 12)}${
                annualHoa > 0 ? ` + HOA ${fmt(inputs.monthlyHoa)}` : ''
              }`,
              amount: `−${fmt(totalOpEx / 12)}/mo`,
              amountSub: `−${fmt(totalOpEx)}/yr`,
              type: 'subtract',
              tone: 'negative',
            },
            {
              label: 'Minus Annual Debt Service (Mortgage P&I)',
              sub: `${fmt(summary.loanAmount)} loan @ ${(inputs.interestRate * 100).toFixed(
                2
              )}% (${inputs.loanTermYears || 30}-yr fixed)`,
              amount: `−${fmt(summary.monthlyPmt)}/mo`,
              amountSub: `−${fmt(annualDebt)}/yr`,
              type: 'subtract',
              tone: 'negative',
            },
            {
              label: 'Equals Annual Pre-Tax Cash Flow',
              sub: `${fmt(monthlyNoi)}/mo NOI − ${fmt(summary.monthlyPmt)}/mo mortgage = ${fmtSigned(
                monthlyCf
              )}/mo`,
              amount: `${fmtSigned(year1Cf)}/yr`,
              amountSub: `${fmtSigned(monthlyCf)}/mo`,
              type: 'subtotal',
              tone: monthlyCf >= 0 ? 'positive' : 'negative',
            },
            {
              label: 'Divided by Total Cash Invested (Cash into Project)',
              sub: `${fmt(downPayment)} down payment (${Math.round(
                inputs.downPaymentPct * 100
              )}%) + ${fmt(inputs.makeReadyCost || 0)} make-ready${
                aduInYear1 && effectiveAduCost > 0 ? ` + ${fmt(effectiveAduCost)} ADU cost` : ''
              }`,
              amount: `÷ ${fmt(summary.initialCashInvested)}`,
              type: 'normal',
            },
            {
              label: 'Equals Cash-on-Cash Return (CoC)',
              sub: `(${fmtSigned(year1Cf)}/yr ÷ ${fmt(summary.initialCashInvested)}) × 100`,
              amount: `${cocPct.toFixed(2)}%`,
              type: 'total',
              tone: cocPct >= 0 ? 'positive' : 'negative',
            },
          ],
          takeaway:
            'Example: If you invest $200,000 total cash (down payment + improvements) and the property nets $2,000/mo ($24,000/yr) after all operating expenses and your mortgage, your Cash-on-Cash Return is $24,000 ÷ $200,000 = 12.00%.',
        };

      case 'profit-5':
        return buildHorizonProfitContent(5);

      case 'irr-5':
        return buildHorizonIrrContent(5);

      case 'profit-10':
        return buildHorizonProfitContent(10);

      case 'irr-10':
        return buildHorizonIrrContent(10);
    }
  };

  const content = getMetricContent();
  const activeTabInfo = MATH_METRIC_TABS.find((t) => t.key === activeMetric)!;

  return (
    <div
      className="no-print"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(6, 10, 45, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="math-modal-title"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(6, 10, 45, 0.45)',
          border: '2px solid #060A2D',
          overflow: 'hidden',
        }}
      >
        {/* Top Navy Header */}
        <div
          style={{
            backgroundColor: '#060A2D',
            color: '#FFFFFF',
            padding: '0.85rem 1.1rem 0.7rem',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: '#EFB51E',
                }}
              >
                ∑ Show Your Work · Step-by-Step Calculation
              </div>
              <h3
                id="math-modal-title"
                style={{
                  margin: '0.15rem 0 0',
                  fontSize: '1.12rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                {activeTabInfo.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close calculation"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '999px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Horizontal Scrollable Pill Tabs (Mobile & Desktop Friendly) */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              marginTop: '0.7rem',
              paddingBottom: '0.25rem',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {MATH_METRIC_TABS.map((tab) => {
              const isSelected = tab.key === activeMetric;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onSelectMetric(tab.key)}
                  style={{
                    padding: '0.38rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0,
                    border: isSelected
                      ? '1px solid #EFB51E'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: isSelected ? '#EFB51E' : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#060A2D' : '#E2E8F0',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Body (flexShrink: 0 on children prevents mobile flex clipping) */}
        <div
          style={{
            padding: '1rem 1.1rem 1.25rem',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* What It Means in Plain English */}
          <div
            style={{
              backgroundColor: '#EFF6FF',
              borderLeft: '4px solid #0468E9',
              borderRadius: '0 10px 10px 0',
              padding: '0.75rem 0.95rem',
              marginBottom: '0.85rem',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#0468E9',
                letterSpacing: '0.04em',
                marginBottom: '0.2rem',
              }}
            >
              What It Means in Plain English
            </div>
            {Array.isArray(content.plainEnglish) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {content.plainEnglish.map((paragraph, idx) => (
                  <p
                    key={idx}
                    style={{ margin: 0, fontSize: '0.86rem', color: '#1E293B', lineHeight: 1.5 }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#1E293B', lineHeight: 1.5 }}>
                {content.plainEnglish}
              </p>
            )}
          </div>

          {/* Simple Formula */}
          <div
            style={{
              backgroundColor: '#060A2D',
              color: '#FFFFFF',
              borderRadius: '10px',
              padding: '0.6rem 0.85rem',
              fontSize: '0.81rem',
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '0.01em',
              marginBottom: '0.85rem',
            }}
          >
            <span style={{ color: '#EFB51E', marginRight: '0.4rem' }}>Formula:</span>
            {content.formula}
          </div>

          {/* Step-by-Step Calculation */}
          <div
            style={{
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              marginBottom: '0.85rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#F1F5F9',
                padding: '0.55rem 0.9rem',
                borderBottom: '1px solid #CBD5E1',
                borderRadius: '11px 11px 0 0',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#060A2D',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Step-by-Step Calculation
            </div>

            <div>
              {content.lines.map((line, idx) => {
                const isTotal = line.type === 'total';
                const isSubtotal = line.type === 'subtotal';
                const isLast = idx === content.lines.length - 1;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: isTotal ? '0.75rem 0.9rem' : '0.55rem 0.9rem',
                      borderRadius: isLast ? '0 0 11px 11px' : undefined,
                      backgroundColor: isTotal
                        ? '#FEFCE8'
                        : isSubtotal
                        ? '#F8FAFC'
                        : '#FFFFFF',
                      borderTop:
                        idx === 0
                          ? 'none'
                          : isTotal
                          ? '2px solid #060A2D'
                          : isSubtotal
                          ? '1.5px solid #94A3B8'
                          : '1px dashed #E2E8F0',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: isTotal ? '0.9rem' : '0.84rem',
                          fontWeight: isTotal || isSubtotal ? 800 : 600,
                          color: '#0F172A',
                        }}
                      >
                        {line.label}
                      </div>
                      {line.sub && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          {line.sub}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: isTotal ? '1.02rem' : '0.88rem',
                          fontWeight: isTotal || isSubtotal ? 800 : 700,
                          color:
                            line.tone === 'positive'
                              ? '#15803D'
                              : line.tone === 'negative'
                              ? '#B91C1C'
                              : '#060A2D',
                        }}
                      >
                        {line.amount}
                      </div>
                      {line.amountSub && (
                        <div
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            color: '#64748B',
                          }}
                        >
                          {line.amountSub}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Takeaway */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0.7rem 0.9rem',
              fontSize: '0.82rem',
              color: '#334155',
              lineHeight: 1.45,
            }}
          >
            <strong style={{ color: '#060A2D' }}>💡 Quick Takeaway: </strong>
            {content.takeaway}
          </div>
        </div>
      </div>
    </div>
  );
}
