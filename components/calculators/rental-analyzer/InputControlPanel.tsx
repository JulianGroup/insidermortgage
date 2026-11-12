'use client';

import React from 'react';
import { NumericFormat } from 'react-number-format';
import { UnderwriteInputs, computeMortgagePmt } from '../../../lib/financial-engine';

interface InputControlPanelProps {
  inputs: UnderwriteInputs;
  onChange: (patch: Partial<UnderwriteInputs>) => void;
  isLockedPublic?: boolean;
  onRequestUnlock?: () => void;
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function InputControlPanel({
  inputs,
  onChange,
  isLockedPublic = false,
  onRequestUnlock,
}: InputControlPanelProps) {
  const downPaymentDollar = Math.round(inputs.purchasePrice * inputs.downPaymentPct);
  const loanAmountDollar = Math.round(inputs.purchasePrice - downPaymentDollar);

  // Initial Monthly PITIA Breakdown
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Acquisition & Financing Inputs */}
      <div className="ra-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#060A2D',
              color: '#EFB51E',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            2
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#060A2D', margin: 0 }}>
            Acquisition &amp; Financing
          </h2>
        </div>

        <div className="ra-two-col" style={{ marginBottom: '1.1rem' }}>
          {/* Purchase Price */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.35rem',
              }}
            >
              Purchase Price ($)
            </label>
            <NumericFormat
              thousandSeparator=","
              decimalScale={0}
              allowNegative={false}
              prefix="$"
              className="ra-input"
              style={{ fontWeight: 700 }}
              value={inputs.purchasePrice === 0 ? '' : inputs.purchasePrice}
              onValueChange={(values) =>
                onChange({ purchasePrice: Math.max(0, Number(values.floatValue) || 0) })
              }
              placeholder="$0"
            />
            <span style={{ fontSize: '0.73rem', color: '#64748B' }}>
              Loan Amount: {currencyFmt.format(loanAmountDollar)}
            </span>
          </div>

          {/* Make-Ready / Initial CapEx */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.35rem',
              }}
            >
              Make-Ready / Rehab Cost ($)
            </label>
            <NumericFormat
              thousandSeparator=","
              decimalScale={0}
              allowNegative={false}
              prefix="$"
              className="ra-input"
              style={{ fontWeight: 700 }}
              value={inputs.makeReadyCost === 0 ? '' : inputs.makeReadyCost}
              onValueChange={(values) =>
                onChange({ makeReadyCost: Math.max(0, Number(values.floatValue) || 0) })
              }
              placeholder="$0"
            />
            <span style={{ fontSize: '0.73rem', color: '#64748B' }}>
              Closing + initial turn-key reserves
            </span>
          </div>
        </div>

        {/* Down Payment % Slider */}
        <div style={{ marginBottom: '1.1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.35rem',
            }}
          >
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
              Down Payment (%)
            </label>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#060A2D' }}>
              {Math.round(inputs.downPaymentPct * 100)}% ({currencyFmt.format(downPaymentDollar)})
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={50}
            step={1}
            value={Math.round(inputs.downPaymentPct * 100)}
            onChange={(e) => onChange({ downPaymentPct: Number(e.target.value) / 100 })}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: '#94A3B8',
              marginTop: '0.2rem',
            }}
          >
            <span>15%</span>
            <span>25% Standard Investor</span>
            <span>50%</span>
          </div>
        </div>

        {/* Interest Rate Slider + Input */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.35rem',
            }}
          >
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
              Interest Rate (30-Yr Fixed %)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <input
                type="number"
                min={4.0}
                max={10.0}
                step={0.125}
                className="ra-input"
                style={{ width: '92px', padding: '0.3rem 0.5rem', textAlign: 'right', fontWeight: 700 }}
                value={Number((inputs.interestRate * 100).toFixed(3))}
                onChange={(e) =>
                  onChange({
                    interestRate: Math.min(0.15, Math.max(0, (Number(e.target.value) || 0) / 100)),
                  })
                }
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#060A2D' }}>%</span>
            </div>
          </div>
          <input
            type="range"
            min={4.0}
            max={10.0}
            step={0.125}
            value={Number((inputs.interestRate * 100).toFixed(3))}
            onChange={(e) => onChange({ interestRate: Number(e.target.value) / 100 })}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: '#94A3B8',
              marginTop: '0.2rem',
            }}
          >
            <span>4.000%</span>
            <span>7.500% Default</span>
            <span>10.000%</span>
          </div>
        </div>
      </div>

      {/* Operating Expense Assumptions */}
      <div className="ra-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#060A2D',
              color: '#EFB51E',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            3
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#060A2D', margin: 0 }}>
            Operating Expense Ratios
          </h2>
        </div>

        {/* Vacancy Rate */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.3rem',
            }}
          >
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
              Vacancy Rate (%)
            </label>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#060A2D' }}>
              {(inputs.vacancyRate * 100).toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={Number((inputs.vacancyRate * 100).toFixed(1))}
            onChange={(e) => onChange({ vacancyRate: Number(e.target.value) / 100 })}
          />
        </div>

        {/* Property Management Fee */}
        <div style={{ marginBottom: '1.1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.3rem',
            }}
          >
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
              Property Management Fee (% of EGI)
            </label>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#060A2D' }}>
              {(inputs.propMgmtRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={Math.round(inputs.propMgmtRate * 100)}
            onChange={(e) => onChange({ propMgmtRate: Number(e.target.value) / 100 })}
          />
        </div>

        {/* Tax Rate, Insurance Rate, HOA, Maintenance */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.25rem',
              }}
            >
              Property Tax Rate (%)
            </label>
            <input
              type="number"
              min={0.5}
              max={3.0}
              step={0.05}
              className="ra-input"
              value={Number((inputs.propertyTaxRate * 100).toFixed(2))}
              onChange={(e) =>
                onChange({ propertyTaxRate: Math.max(0, (Number(e.target.value) || 0) / 100) })
              }
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.25rem',
              }}
            >
              Insurance Rate (%)
            </label>
            <input
              type="number"
              min={0.1}
              max={1.5}
              step={0.05}
              className="ra-input"
              value={Number((inputs.insuranceRate * 100).toFixed(2))}
              onChange={(e) =>
                onChange({ insuranceRate: Math.max(0, (Number(e.target.value) || 0) / 100) })
              }
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.25rem',
              }}
            >
              Monthly HOA ($/mo)
            </label>
            <NumericFormat
              thousandSeparator=","
              decimalScale={0}
              allowNegative={false}
              prefix="$"
              className="ra-input"
              value={inputs.monthlyHoa === 0 ? '' : inputs.monthlyHoa}
              onValueChange={(values) =>
                onChange({ monthlyHoa: Math.max(0, Number(values.floatValue) || 0) })
              }
              placeholder="$0"
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.25rem',
              }}
            >
              Maintenance ($/mo)
            </label>
            <NumericFormat
              thousandSeparator=","
              decimalScale={0}
              allowNegative={false}
              prefix="$"
              className="ra-input"
              value={inputs.monthlyMaintenance ?? 200}
              onValueChange={(values) =>
                onChange({ monthlyMaintenance: Math.max(0, Number(values.floatValue) || 0) })
              }
              placeholder="$200"
            />
          </div>
        </div>
      </div>

      {/* Exit Engine & Growth Assumptions */}
      <div
        className="ra-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        style={{ position: 'relative' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#060A2D',
                color: '#EFB51E',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              4
            </span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#060A2D', margin: 0 }}>
              10-Year Growth &amp; Exit Engine
            </h2>
          </div>
          {isLockedPublic && (
            <button
              type="button"
              onClick={onRequestUnlock}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.3rem 0.7rem',
                borderRadius: '999px',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A',
                cursor: 'pointer',
              }}
            >
              🔒 Unlock 10-Yr Model
            </button>
          )}
        </div>

        {/* Annual Rent Growth */}
        <div style={{ marginBottom: '0.95rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.3rem',
            }}
          >
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
              Annual Rent Growth (%)
            </label>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#060A2D' }}>
              {(inputs.annualRentGrowth * 100).toFixed(1)}%/yr
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={8}
            step={0.5}
            value={Number((inputs.annualRentGrowth * 100).toFixed(1))}
            onChange={(e) => onChange({ annualRentGrowth: Number(e.target.value) / 100 })}
          />
        </div>

        {/* Annual Appreciation */}
        <div style={{ marginBottom: '0.95rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.3rem',
            }}
          >
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
              Annual Property Appreciation (%)
            </label>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#060A2D' }}>
              {(inputs.annualAppreciation * 100).toFixed(1)}%/yr
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={Number((inputs.annualAppreciation * 100).toFixed(1))}
            onChange={(e) => onChange({ annualAppreciation: Number(e.target.value) / 100 })}
          />
        </div>

        {/* Selling Cost % */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.3rem',
            }}
          >
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
              Exit Selling Cost / Friction (%)
            </label>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#060A2D' }}>
              {(inputs.sellingCostPct * 100).toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={8}
            step={0.5}
            value={Number((inputs.sellingCostPct * 100).toFixed(1))}
            onChange={(e) => onChange({ sellingCostPct: Number(e.target.value) / 100 })}
          />
        </div>

        {/* Annual Tax & Insurance Escalations */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.95rem',
            paddingTop: '0.75rem',
            borderTop: '1px dashed #E2E8F0',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                Tax Escalation (%/yr)
              </label>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#060A2D' }}>
                {((inputs.propertyTaxGrowthRate ?? 0.02) * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={Number(((inputs.propertyTaxGrowthRate ?? 0.02) * 100).toFixed(1))}
              onChange={(e) => onChange({ propertyTaxGrowthRate: Number(e.target.value) / 100 })}
            />
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Default 2.0% (CA Prop 13)</span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                Insurance Escalation (%/yr)
              </label>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#060A2D' }}>
                {((inputs.insuranceGrowthRate ?? 0.05) * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={Number(((inputs.insuranceGrowthRate ?? 0.05) * 100).toFixed(1))}
              onChange={(e) => onChange({ insuranceGrowthRate: Number(e.target.value) / 100 })}
            />
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Default 5.0% inflation</span>
          </div>
        </div>
      </div>

      {/* Initial Monthly PITIA Breakdown Box (Below Box 4) */}
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
            gap: '0.5rem',
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
                  backgroundColor: '#060A2D',
                  display: 'inline-block',
                }}
              />
              Principal &amp; Interest (P&amp;I)
            </span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>
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

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.25rem',
              fontSize: '0.8rem',
              color: '#64748B',
            }}
          >
            <span>Annualized Total PITIA:</span>
            <strong style={{ color: '#060A2D' }}>
              {currencyFmt.format(Math.round(totalMonthlyPitia * 12))}/yr
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
