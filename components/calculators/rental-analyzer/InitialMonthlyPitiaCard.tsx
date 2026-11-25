'use client';

import React from 'react';
import { UnderwriteInputs, computeMortgagePmt } from '../../../lib/financial-engine';
import { MathMetricKey } from './MathReceiptModal';

interface InitialMonthlyPitiaCardProps {
  inputs: UnderwriteInputs;
  totalMonthlyRent?: number;
  onOpenMath?: (metric: MathMetricKey) => void;
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** Displays the initial monthly PITIA breakdown card with loan amount, interest rate, and DSCR ratio. */
export default function InitialMonthlyPitiaCard({
  inputs,
  totalMonthlyRent,
  onOpenMath,
}: InitialMonthlyPitiaCardProps) {
  const downPaymentDollar = Math.round(inputs.purchasePrice * inputs.downPaymentPct);
  const loanAmountDollar = Math.round(inputs.purchasePrice - downPaymentDollar);

  const monthlyPi = computeMortgagePmt(
    loanAmountDollar,
    inputs.interestRate,
    inputs.loanTermYears || 30
  );
  const monthlyPropertyTax = (inputs.purchasePrice * inputs.propertyTaxRate) / 12;
  const monthlyInsurance = (inputs.purchasePrice * inputs.insuranceRate) / 12;
  const monthlyHoaFee = inputs.monthlyHoa || 0;
  const totalMonthlyPitia =
    monthlyPi + monthlyPropertyTax + monthlyInsurance + monthlyHoaFee;

  const grossMonthlyRent =
    totalMonthlyRent ??
    inputs.units.reduce((sum, unit) => sum + (Number(unit.monthlyRent) || 0), 0);
  const dscr = totalMonthlyPitia > 0 ? grossMonthlyRent / totalMonthlyPitia : 0;
  const isDscrHealthy = dscr >= 1.0;

  const rateDisplay = Number((inputs.interestRate * 100).toFixed(3));

  return (
    <div
      className="ra-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
      style={{ borderTop: '4px solid #060A2D' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#0468E9',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Monthly Housing Payment Breakdown
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#060A2D', margin: 0 }}>
            Initial Monthly PITIA
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.6rem',
          }}
        >
          {totalMonthlyPitia > 0 && (
            <button
              type="button"
              onClick={() => onOpenMath?.('dscr')}
              title={`DSCR = ${currencyFmt.format(Math.round(grossMonthlyRent))}/mo Rent ÷ ${currencyFmt.format(Math.round(totalMonthlyPitia))}/mo PITIA. Tap to view math.`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                padding: '0.36rem 0.8rem',
                borderRadius: '999px',
                backgroundColor: isDscrHealthy ? '#DCFCE7' : '#FEF3C7',
                color: isDscrHealthy ? '#15803D' : '#B45309',
                border: isDscrHealthy ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                cursor: onOpenMath ? 'pointer' : 'default',
              }}
            >
              <span>✦</span>
              <span>DSCR {dscr.toFixed(3)}</span>
            </button>
          )}

          <div
            style={{
              backgroundColor: '#060A2D',
              color: '#EFB51E',
              padding: '0.4rem 0.9rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '1.15rem',
            }}
          >
            {currencyFmt.format(Math.round(totalMonthlyPitia))}
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#CBD5E1' }}>/mo</span>
          </div>
        </div>
      </div>

      {/* Stacked proportional bar */}
      {totalMonthlyPitia > 0 && (
        <div
          style={{
            display: 'flex',
            height: '10px',
            borderRadius: '999px',
            overflow: 'hidden',
            backgroundColor: '#E2E8F0',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: `${(monthlyPi / totalMonthlyPitia) * 100}%`,
              backgroundColor: '#060A2D',
            }}
            title="Principal & Interest"
          />
          <div
            style={{
              width: `${(monthlyPropertyTax / totalMonthlyPitia) * 100}%`,
              backgroundColor: '#0468E9',
            }}
            title="Property Taxes"
          />
          <div
            style={{
              width: `${(monthlyInsurance / totalMonthlyPitia) * 100}%`,
              backgroundColor: '#EFB51E',
            }}
            title="Home Insurance"
          />
          {monthlyHoaFee > 0 && (
            <div
              style={{
                width: `${(monthlyHoaFee / totalMonthlyPitia) * 100}%`,
                backgroundColor: '#10B981',
              }}
              title="HOA Fees"
            />
          )}
        </div>
      )}

      {/* 4 Breakdown Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px dashed #E2E8F0',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              color: '#334155',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#060A2D',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span>Principal &amp; Interest (P&amp;I)</span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#64748B',
                whiteSpace: 'nowrap',
              }}
            >
              ({currencyFmt.format(loanAmountDollar)} @ {rateDisplay}%)
            </span>
          </span>
          <span style={{ fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {currencyFmt.format(Math.round(monthlyPi))}/mo
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '0.5rem',
            borderBottom: '1px dashed #E2E8F0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 600 }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#0468E9',
                display: 'inline-block',
              }}
            />
            Property Taxes ({(inputs.propertyTaxRate * 100).toFixed(2)}%)
          </span>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>
            {currencyFmt.format(Math.round(monthlyPropertyTax))}/mo
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '0.5rem',
            borderBottom: '1px dashed #E2E8F0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 600 }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#EFB51E',
                display: 'inline-block',
              }}
            />
            Home Insurance ({(inputs.insuranceRate * 100).toFixed(2)}%)
          </span>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>
            {currencyFmt.format(Math.round(monthlyInsurance))}/mo
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontWeight: 600 }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                display: 'inline-block',
              }}
            />
            HOA / Association Fees
          </span>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>
            {currencyFmt.format(Math.round(monthlyHoaFee))}/mo
          </span>
        </div>
      </div>
    </div>
  );
}
