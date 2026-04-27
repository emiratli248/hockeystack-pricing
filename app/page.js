"use client";

import React, { useState, useMemo, useEffect } from 'react';

const ACTIONS = [
  { name: 'Web Research', unit: 'per search', credits: 1 },
  { name: 'Find People', unit: 'per search', credits: 1 },
  { name: 'Get Person Details', unit: 'per person', credits: 0.2 },
  { name: 'Enrich & Verify Emails', unit: 'per search', credits: 1 },
  { name: 'Create Task', unit: 'per task', credits: 10 },
  { name: 'Draft Message from chat', unit: 'per message', credits: 5 },
  { name: 'Active Prospecting Agents', unit: 'per company per day', credits: 5 },
  { name: 'Active Deal Agents', unit: 'per deal per day', credits: 10 },
  { name: 'Deep Reasoning (meeting prep, deal health)', unit: 'per run', credits: 10 },
];

const fmtMoney = (n) => {
  if (Math.abs(n) >= 1000) return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Math.abs(n) >= 10) return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

const fmtNum = (n) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export default function Calculator() {
  useEffect(() => {
    const id = 'calc-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const [actions] = useState(ACTIONS);

  // Pricing inputs
  const [bundledCredits, setBundledCredits] = useState(25000);
  const customerCostPerCredit = 0.012;
  const [numReps, setNumReps] = useState(10);

  // Per-seat cost is derived
  const perSeatCost = bundledCredits * customerCostPerCredit;

  // Usage inputs
  const [dealsPerRep, setDealsPerRep] = useState(20);
  const [targetAccountsPerRep, setTargetAccountsPerRep] = useState(20);
  const [meetingsPerDay, setMeetingsPerDay] = useState(4);
  const [tasksPerDealPerDay, setTasksPerDealPerDay] = useState(2);
  const [tasksPerTaPerDay, setTasksPerTaPerDay] = useState(1);
  const [workingDays, setWorkingDays] = useState(22);

  const findAction = (startsWith) =>
    actions.find((a) => a.name.startsWith(startsWith)) || { credits: 0 };

  const calc = useMemo(() => {
    const prosp = findAction('Active Prospecting');
    const deal = findAction('Active Deal');
    const deep = findAction('Deep Reasoning');
    const task = findAction('Create Task');

    const dealTasksMo = dealsPerRep * tasksPerDealPerDay * workingDays;
    const taTasksMo = targetAccountsPerRep * tasksPerTaPerDay * workingDays;

    const rows = [
      {
        label: 'Active Prospecting Agents',
        usage: `${targetAccountsPerRep} accts × ${workingDays}d`,
        unitCredits: prosp.credits,
        qty: targetAccountsPerRep * workingDays,
      },
      {
        label: 'Active Deal Agents',
        usage: `${dealsPerRep} deals × ${workingDays}d`,
        unitCredits: deal.credits,
        qty: dealsPerRep * workingDays,
      },
      {
        label: 'Deep Reasoning (meeting prep)',
        usage: `${meetingsPerDay}/day × ${workingDays}d`,
        unitCredits: deep.credits,
        qty: meetingsPerDay * workingDays,
      },
      {
        label: 'Create Task — on deals',
        usage: `${fmtNum(dealTasksMo)} tasks/mo`,
        unitCredits: task.credits,
        qty: dealTasksMo,
      },
      {
        label: 'Create Task — on target accts',
        usage: `${fmtNum(taTasksMo)} tasks/mo`,
        unitCredits: task.credits,
        qty: taTasksMo,
      },
    ].map((r) => {
      const credits = r.unitCredits * r.qty;
      return { ...r, credits };
    });

    const creditsPerRep = rows.reduce((s, r) => s + r.credits, 0);
    const revenue = perSeatCost * numReps;
    const totalCredits = creditsPerRep * numReps;
    const creditUtil = bundledCredits > 0 ? (creditsPerRep / bundledCredits) * 100 : 0;

    return { rows, creditsPerRep, totalCredits, revenue, creditUtil };
  }, [actions, bundledCredits, customerCostPerCredit, numReps, dealsPerRep, targetAccountsPerRep, meetingsPerDay, tasksPerDealPerDay, tasksPerTaPerDay, workingDays]);

  const utilColor =
    calc.creditUtil <= 100 ? '#15603D' : calc.creditUtil <= 150 ? '#8A6B1C' : '#9A2A2A';

  const serif = "'Fraunces', Georgia, serif";
  const sans = "'IBM Plex Sans', -apple-system, sans-serif";
  const mono = "'IBM Plex Mono', ui-monospace, monospace";

  const cardStyle = {
    background: '#FFFFFF',
    border: '1px solid #E8E6E1',
    borderRadius: 10,
  };

  const inputStyle = {
    fontFamily: mono,
    fontSize: 14,
    padding: '6px 10px',
    border: '1px solid #E8E6E1',
    borderRadius: 6,
    background: '#FAFAF7',
    width: 120,
    textAlign: 'right',
    outline: 'none',
    color: '#141413',
  };

  const eyebrow = {
    fontSize: 10.5,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#8B8680',
    fontWeight: 500,
  };

  return (
    <div style={{ background: '#FAFAF7', fontFamily: sans, color: '#141413', minHeight: '100vh', padding: '40px 24px' }}>
      <style>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        input:focus { border-color: #141413 !important; background: #FFFFFF !important; }
        .num { font-family: ${mono}; font-variant-numeric: tabular-nums; }
      `}</style>

      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={eyebrow}>HockeyStack · Agents pricing</div>
          <h1 style={{ fontFamily: serif, fontWeight: 600, fontSize: 38, lineHeight: 1.05, margin: '8px 0 0' }}>
            Pricing calculator
          </h1>
        </div>

        {/* Hero output */}
        <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 28, overflow: 'hidden' }}>
          <HeroCell label="Customer pays / mo" value={fmtMoney(calc.revenue)} sub={`${fmtMoney(perSeatCost)} × ${numReps} reps`} />
          <HeroCell label="Credits used / rep / mo" value={fmtNum(calc.creditsPerRep)} sub={`${fmtNum(calc.totalCredits)} total credits`} divider />
          <HeroCell
            label="Credit utilization"
            value={`${calc.creditUtil.toFixed(0)}%`}
            sub={`${fmtNum(calc.creditsPerRep)} / ${fmtNum(bundledCredits)} bundled`}
            valueColor={utilColor}
            divider
          />
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <div style={{ ...cardStyle, padding: 22 }}>
            <div style={{ ...eyebrow, marginBottom: 14 }}>Pricing</div>
            <InputRow label="Bundled credits / seat / month" value={bundledCredits} onChange={setBundledCredits} style={inputStyle} />
            <DerivedRow label="$ per credit (to customer)" value={fmtMoney(customerCostPerCredit)} hint="static" />
            <DerivedRow label="Per-seat cost / month" value={fmtMoney(perSeatCost)} hint={`${fmtNum(bundledCredits)} × ${fmtMoney(customerCostPerCredit)}`} />
            <InputRow label="# of reps" value={numReps} onChange={setNumReps} style={inputStyle} last />
          </div>

          <div style={{ ...cardStyle, padding: 22 }}>
            <div style={{ ...eyebrow, marginBottom: 14 }}>Usage assumptions (per rep)</div>
            <InputRow label="Deals per rep" value={dealsPerRep} onChange={setDealsPerRep} style={inputStyle} />
            <InputRow label="Target accounts per rep" value={targetAccountsPerRep} onChange={setTargetAccountsPerRep} style={inputStyle} />
            <InputRow label="Meetings per rep per day" value={meetingsPerDay} onChange={setMeetingsPerDay} style={inputStyle} />
            <InputRow label="Tasks per deal per day" value={tasksPerDealPerDay} onChange={setTasksPerDealPerDay} step={0.1} style={inputStyle} />
            <InputRow label="Tasks per target acct per day" value={tasksPerTaPerDay} onChange={setTasksPerTaPerDay} step={0.1} style={inputStyle} />
            <InputRow label="Working days per month" value={workingDays} onChange={setWorkingDays} style={inputStyle} last />
          </div>
        </div>

        {/* Credit breakdown */}
        <div style={{ ...cardStyle, padding: 22, marginBottom: 28 }}>
          <div style={{ ...eyebrow, marginBottom: 14 }}>Credit breakdown per rep · per month</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E8E6E1' }}>
                <th style={thStyle}>Driver</th>
                <th style={thStyle}>Usage</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Credits</th>
              </tr>
            </thead>
            <tbody>
              {calc.rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F2F1ED' }}>
                  <td style={tdStyle}>{r.label}</td>
                  <td style={{ ...tdStyle, color: '#6F6B64' }} className="num">{r.usage}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }} className="num">{fmtNum(r.credits)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #141413' }}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>Total per rep</td>
                <td style={tdStyle}></td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }} className="num">{fmtNum(calc.creditsPerRep)}</td>
              </tr>
            </tbody>
          </table>

          {/* Credit utilization */}
          <div style={{ marginTop: 20, padding: '14px 16px', background: '#FAFAF7', borderRadius: 8, border: '1px solid #EFEDE8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: '#6F6B64' }}>
                Credit utilization vs bundle
                <span className="num" style={{ marginLeft: 8, color: '#141413' }}>
                  {fmtNum(calc.creditsPerRep)} / {fmtNum(bundledCredits)}
                </span>
              </div>
              <div className="num" style={{ fontSize: 15, fontWeight: 600, color: utilColor }}>
                {calc.creditUtil.toFixed(0)}%
              </div>
            </div>
            <div style={{ height: 6, background: '#EFEDE8', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  width: `${Math.min(calc.creditUtil, 100)}%`,
                  height: '100%',
                  background: utilColor,
                  transition: 'width 0.2s',
                }}
              />
              {calc.creditUtil > 100 && (
                <div style={{ position: 'absolute', right: 4, top: -1, fontSize: 10, color: '#9A2A2A' }}>▶ over</div>
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#8B8680', fontStyle: 'italic' }}>
              Remaining credits will be utilized for chat, artifact generation, etc.
            </div>
          </div>
        </div>

        {/* Actions reference table */}
        <div style={{ ...cardStyle, padding: 22, marginBottom: 40 }}>
          <div style={{ ...eyebrow, marginBottom: 14 }}>Agent actions · credits per unit</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E8E6E1' }}>
                <th style={thStyle}>Line item</th>
                <th style={thStyle}>Billable unit</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Credits</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F2F1ED' }}>
                  <td style={tdStyle}>{a.name}</td>
                  <td style={{ ...tdStyle, color: '#6F6B64' }}>{a.unit}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }} className="num">
                    {a.credits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 14, fontSize: 12, color: '#8B8680', lineHeight: 1.5 }}>
            Calculator uses Active Prospecting Agents (× target accts × days), Active Deal Agents (× deals × days),
            Deep Reasoning (× meetings/day × days), Create Task (× total tasks on deals + target accts).
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '10px 8px',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: '#8B8680',
  fontWeight: 500,
};

const tdStyle = {
  padding: '12px 8px',
  fontSize: 14,
  color: '#141413',
};

function HeroCell({ label, value, sub, divider, valueColor }) {
  return (
    <div style={{ padding: '22px 24px', borderLeft: divider ? '1px solid #E8E6E1' : 'none' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8B8680', fontWeight: 500, marginBottom: 10 }}>
        {label}
      </div>
      <div
        className="num"
        style={{
          fontSize: 34,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: valueColor || '#141413',
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#8B8680', marginTop: 8 }} className="num">
        {sub}
      </div>
    </div>
  );
}

function InputRow({ label, value, onChange, prefix, step = 1, last, style }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: last ? 'none' : '1px solid #F2F1ED',
      }}
    >
      <div style={{ fontSize: 13.5, color: '#3A3A37' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {prefix && <span style={{ color: '#6F6B64', fontFamily: "'IBM Plex Mono', monospace", fontSize: 14 }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(isNaN(v) ? 0 : v);
          }}
          style={style}
        />
      </div>
    </div>
  );
}

function DerivedRow({ label, value, hint, last }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: last ? 'none' : '1px solid #F2F1ED',
        background: 'transparent',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 13.5, color: '#3A3A37', display: 'flex', alignItems: 'center', gap: 6 }}>
          {label}
          <span style={{
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#8B8680',
            border: '1px solid #E8E6E1',
            borderRadius: 3,
            padding: '1px 5px',
            fontWeight: 500,
          }}>
            calc
          </span>
        </div>
        {hint && (
          <div className="num" style={{ fontSize: 11, color: '#8B8680' }}>= {hint}</div>
        )}
      </div>
      <div
        className="num"
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: '#141413',
          padding: '6px 10px',
          width: 120,
          textAlign: 'right',
        }}
      >
        {value}
      </div>
    </div>
  );
}
