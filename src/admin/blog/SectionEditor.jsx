"use client";
import React from 'react';

const labelStyle = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '0.35rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.8rem',
  border: '1px solid #CBD5E1',
  borderRadius: '8px',
  fontSize: '0.96rem',
  fontFamily: 'inherit',
  backgroundColor: '#FFFFFF',
};

const smallBtn = {
  padding: '0.35rem 0.65rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  borderRadius: '6px',
  border: '1px solid #CBD5E1',
  backgroundColor: '#FFFFFF',
  color: '#1E293B',
  cursor: 'pointer',
};

const pillAddBtn = {
  padding: '0.38rem 0.75rem',
  fontSize: '0.8rem',
  fontWeight: 700,
  borderRadius: '999px',
  border: '1px dashed #94A3B8',
  backgroundColor: '#F8FAFC',
  color: '#0F172A',
  cursor: 'pointer',
};

export default function SectionEditor({
  section,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
}) {
  const update = (patch) => onChange({ ...section, ...patch });

  // Paragraphs helpers
  const paragraphs = section.paragraphs || [];
  const setParagraph = (pIdx, val) => {
    const next = [...paragraphs];
    next[pIdx] = val;
    update({ paragraphs: next });
  };
  const addParagraph = () => update({ paragraphs: [...paragraphs, ''] });
  const removeParagraph = (pIdx) =>
    update({ paragraphs: paragraphs.filter((_, i) => i !== pIdx) });

  // Bullets helpers
  const bullets = section.bullets || [];
  const setBullet = (bIdx, val) => {
    const next = [...bullets];
    next[bIdx] = val;
    update({ bullets: next });
  };
  const addBullet = () => update({ bullets: [...bullets, ''] });
  const removeBullet = (bIdx) =>
    update({ bullets: bullets.filter((_, i) => i !== bIdx) });

  // Numbered items helpers
  const numberedItems = section.numberedItems || [];
  const setNumberedItem = (nIdx, field, val) => {
    const next = numberedItems.map((it, i) => (i === nIdx ? { ...it, [field]: val } : it));
    update({ numberedItems: next });
  };
  const addNumberedItem = () =>
    update({ numberedItems: [...numberedItems, { title: '', text: '' }] });
  const removeNumberedItem = (nIdx) =>
    update({ numberedItems: numberedItems.filter((_, i) => i !== nIdx) });

  // Table helpers
  const table = section.table || null;
  const initTable = () =>
    update({
      table: {
        headers: ['Column 1', 'Column 2'],
        rows: [['', '']],
      },
    });
  const setTableHeader = (hIdx, val) => {
    const headers = [...table.headers];
    headers[hIdx] = val;
    update({ table: { ...table, headers } });
  };
  const setTableCell = (rIdx, cIdx, val) => {
    const rows = table.rows.map((r, ri) =>
      ri === rIdx ? r.map((c, ci) => (ci === cIdx ? val : c)) : r
    );
    update({ table: { ...table, rows } });
  };
  const addTableRow = () => {
    const emptyRow = table.headers.map(() => '');
    update({ table: { ...table, rows: [...(table.rows || []), emptyRow] } });
  };
  const removeTableRow = (rIdx) =>
    update({ table: { ...table, rows: table.rows.filter((_, i) => i !== rIdx) } });
  const addTableColumn = () => {
    const headers = [...table.headers, `Column ${table.headers.length + 1}`];
    const rows = (table.rows || []).map((r) => [...r, '']);
    update({ table: { headers, rows } });
  };
  const removeTableColumn = (cIdx) => {
    if (table.headers.length <= 1) return;
    const headers = table.headers.filter((_, i) => i !== cIdx);
    const rows = (table.rows || []).map((r) => r.filter((_, i) => i !== cIdx));
    update({ table: { headers, rows } });
  };

  // Comparison columns helpers
  const comparisonColumns = section.comparisonColumns || [];
  const addComparisonColumns = () =>
    update({
      comparisonColumns: [
        { title: 'Option A', subtitle: '', bullets: [''] },
        { title: 'Option B', subtitle: '', bullets: [''] },
      ],
    });
  const updateCompCol = (cIdx, patch) => {
    const next = comparisonColumns.map((c, i) => (i === cIdx ? { ...c, ...patch } : c));
    update({ comparisonColumns: next });
  };

  // Subsections helpers
  const subsections = section.subsections || [];
  const addSubsection = () =>
    update({
      subsections: [...subsections, { subheading: '', paragraphs: [''], bullets: [] }],
    });
  const updateSub = (sIdx, patch) => {
    const next = subsections.map((s, i) => (i === sIdx ? { ...s, ...patch } : s));
    update({ subsections: next });
  };
  const removeSub = (sIdx) =>
    update({ subsections: subsections.filter((_, i) => i !== sIdx) });

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: '12px',
        padding: '1.35rem',
        marginBottom: '1.15rem',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Section Header Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: '#060A2D',
              color: '#EFB51E',
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '0.22rem 0.65rem',
              borderRadius: '999px',
            }}
          >
            Section {index + 1}
          </span>
          {index > 0 && (
            <label style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <input
                type="checkbox"
                checked={Boolean(section.dividerAbove)}
                onChange={(e) => update({ dividerAbove: e.target.checked })}
              />
              Divider line above
            </label>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button type="button" style={smallBtn} disabled={index === 0} onClick={onMoveUp} title="Move section up">
            ↑
          </button>
          <button
            type="button"
            style={smallBtn}
            disabled={index === total - 1}
            onClick={onMoveDown}
            title="Move section down"
          >
            ↓
          </button>
          <button type="button" style={smallBtn} onClick={onDuplicate} title="Duplicate section">
            Duplicate
          </button>
          {total > 1 && (
            <button
              type="button"
              style={{ ...smallBtn, color: '#B91C1C', borderColor: '#FECACA' }}
              onClick={onRemove}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Section Heading */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Section Heading (optional for intro)</label>
        <input
          style={inputStyle}
          placeholder="e.g., 1. Interest Rate: Index + Margin"
          value={section.heading || ''}
          onChange={(e) => update({ heading: e.target.value })}
        />
      </div>

      {/* Paragraphs */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Paragraphs</label>
          <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
            Supports <code>**bold**</code>, <code>*italic*</code>, <code>`formula`</code>, and{' '}
            <code>[Link Text](https://...)</code>
          </span>
        </div>

        {paragraphs.map((p, pIdx) => (
          <div key={pIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
              placeholder="Write paragraph text..."
              value={p}
              onChange={(e) => setParagraph(pIdx, e.target.value)}
            />
            <button
              type="button"
              style={{ ...smallBtn, alignSelf: 'flex-start', color: '#64748B' }}
              onClick={() => removeParagraph(pIdx)}
              title="Remove paragraph"
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" style={smallBtn} onClick={addParagraph}>
          + Add Paragraph
        </button>
      </div>

      {/* Optional Formula Box */}
      {section.formula !== undefined && section.formula !== null && section.formula !== '' ? (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.9rem',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Formula / Highlight Callout</label>
            <button
              type="button"
              style={{ ...smallBtn, padding: '0.15rem 0.5rem', color: '#B91C1C' }}
              onClick={() => update({ formula: '' })}
            >
              Remove Formula
            </button>
          </div>
          <input
            style={inputStyle}
            placeholder="e.g., Interest Rate = Index (Prime Rate) + Margin"
            value={section.formula}
            onChange={(e) => update({ formula: e.target.value })}
          />
        </div>
      ) : null}

      {/* Optional Bullet Points */}
      {bullets.length > 0 && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.9rem',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
        >
          <label style={labelStyle}>Bullet Points</label>
          {bullets.map((b, bIdx) => (
            <div key={bIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <span style={{ paddingTop: '0.55rem', color: '#060A2D', fontWeight: 700 }}>•</span>
              <input
                style={inputStyle}
                placeholder="**Key Point:** Explanation..."
                value={b}
                onChange={(e) => setBullet(bIdx, e.target.value)}
              />
              <button type="button" style={smallBtn} onClick={() => removeBullet(bIdx)}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" style={smallBtn} onClick={addBullet}>
            + Add Bullet
          </button>
        </div>
      )}

      {/* Optional Numbered Steps */}
      {numberedItems.length > 0 && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.9rem',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
        >
          <label style={labelStyle}>Numbered Steps</label>
          {numberedItems.map((item, nIdx) => (
            <div
              key={nIdx}
              style={{
                display: 'flex',
                gap: '0.6rem',
                marginBottom: '0.65rem',
                padding: '0.65rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
              }}
            >
              <span style={{ fontWeight: 800, color: '#060A2D', paddingTop: '0.4rem' }}>
                {nIdx + 1}.
              </span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <input
                  style={inputStyle}
                  placeholder="Step title (bold)"
                  value={item.title || ''}
                  onChange={(e) => setNumberedItem(nIdx, 'title', e.target.value)}
                />
                <textarea
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Step description..."
                  value={item.text || ''}
                  onChange={(e) => setNumberedItem(nIdx, 'text', e.target.value)}
                />
              </div>
              <button
                type="button"
                style={{ ...smallBtn, alignSelf: 'flex-start' }}
                onClick={() => removeNumberedItem(nIdx)}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" style={smallBtn} onClick={addNumberedItem}>
            + Add Numbered Step
          </button>
        </div>
      )}

      {/* Optional Table */}
      {table && table.headers && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.9rem',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            overflowX: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Comparison Table</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="button" style={smallBtn} onClick={addTableColumn}>
                + Column
              </button>
              <button type="button" style={smallBtn} onClick={addTableRow}>
                + Row
              </button>
              <button
                type="button"
                style={{ ...smallBtn, color: '#B91C1C' }}
                onClick={() => update({ table: undefined })}
              >
                Remove Table
              </button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {table.headers.map((h, hIdx) => (
                  <th key={hIdx} style={{ padding: '0.3rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <input
                        style={{ ...inputStyle, fontWeight: 700, backgroundColor: '#EFF6FF' }}
                        value={h}
                        onChange={(e) => setTableHeader(hIdx, e.target.value)}
                        placeholder={`Header ${hIdx + 1}`}
                      />
                      {table.headers.length > 1 && (
                        <button
                          type="button"
                          style={{ ...smallBtn, padding: '0.2rem 0.45rem' }}
                          onClick={() => removeTableColumn(hIdx)}
                          title="Delete column"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th style={{ width: '36px' }} />
              </tr>
            </thead>
            <tbody>
              {(table.rows || []).map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '0.3rem' }}>
                      <input
                        style={inputStyle}
                        value={cell}
                        onChange={(e) => setTableCell(rIdx, cIdx, e.target.value)}
                        placeholder="Cell value..."
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      style={{ ...smallBtn, padding: '0.3rem 0.5rem' }}
                      onClick={() => removeTableRow(rIdx)}
                      title="Delete row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Optional Side-by-Side Comparison Columns */}
      {comparisonColumns.length > 0 && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.9rem',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Side-by-Side Comparison Cards</label>
            <button
              type="button"
              style={{ ...smallBtn, color: '#B91C1C' }}
              onClick={() => update({ comparisonColumns: [] })}
            >
              Remove Cards
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {comparisonColumns.map((col, cIdx) => (
              <div
                key={cIdx}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                }}
              >
                <input
                  style={{ ...inputStyle, fontWeight: 700, marginBottom: '0.4rem' }}
                  placeholder="Card Title (e.g., Draw Period)"
                  value={col.title || ''}
                  onChange={(e) => updateCompCol(cIdx, { title: e.target.value })}
                />
                <input
                  style={{ ...inputStyle, marginBottom: '0.4rem', fontSize: '0.86rem' }}
                  placeholder="Subtitle (e.g., 3 to 10 Years)"
                  value={col.subtitle || ''}
                  onChange={(e) => updateCompCol(cIdx, { subtitle: e.target.value })}
                />
                <textarea
                  rows={3}
                  style={{ ...inputStyle, fontSize: '0.88rem' }}
                  placeholder="One bullet per line..."
                  value={(col.bullets || []).join('\n')}
                  onChange={(e) =>
                    updateCompCol(cIdx, { bullets: e.target.value.split('\n') })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Subsections */}
      {subsections.length > 0 && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.9rem',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
        >
          <label style={labelStyle}>Subsections</label>
          {subsections.map((sub, sIdx) => (
            <div
              key={sIdx}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                marginBottom: '0.6rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.45rem' }}>
                <input
                  style={{ ...inputStyle, fontWeight: 700 }}
                  placeholder="Subheading (optional)"
                  value={sub.subheading || ''}
                  onChange={(e) => updateSub(sIdx, { subheading: e.target.value })}
                />
                <button type="button" style={smallBtn} onClick={() => removeSub(sIdx)}>
                  ✕
                </button>
              </div>
              <textarea
                rows={2}
                style={{ ...inputStyle, marginBottom: '0.45rem', fontSize: '0.9rem' }}
                placeholder="Subsection paragraphs (separate paragraphs with blank line)..."
                value={(sub.paragraphs || []).join('\n\n')}
                onChange={(e) =>
                  updateSub(sIdx, {
                    paragraphs: e.target.value ? e.target.value.split(/\n\n+/) : [],
                  })
                }
              />
              <textarea
                rows={2}
                style={{ ...inputStyle, fontSize: '0.9rem' }}
                placeholder="Subsection bullets (one per line)..."
                value={(sub.bullets || []).join('\n')}
                onChange={(e) =>
                  updateSub(sIdx, {
                    bullets: e.target.value
                      ? e.target.value.split('\n').filter((line) => line.trim() !== '')
                      : [],
                  })
                }
              />
            </div>
          ))}
          <button type="button" style={smallBtn} onClick={addSubsection}>
            + Add Subsection
          </button>
        </div>
      )}

      {/* Quick Add Rich Blocks Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', paddingTop: '0.35rem' }}>
        {!bullets.length && (
          <button type="button" style={pillAddBtn} onClick={addBullet}>
            + Bullet List
          </button>
        )}
        {!numberedItems.length && (
          <button type="button" style={pillAddBtn} onClick={addNumberedItem}>
            + Numbered Steps
          </button>
        )}
        {!table && (
          <button type="button" style={pillAddBtn} onClick={initTable}>
            + Comparison Table
          </button>
        )}
        {!section.formula && (
          <button
            type="button"
            style={pillAddBtn}
            onClick={() => update({ formula: 'Rate = Index + Margin' })}
          >
            + Formula Callout
          </button>
        )}
        {!comparisonColumns.length && (
          <button type="button" style={pillAddBtn} onClick={addComparisonColumns}>
            + 2-Column Comparison
          </button>
        )}
        {!subsections.length && (
          <button type="button" style={pillAddBtn} onClick={addSubsection}>
            + Subsection
          </button>
        )}
      </div>
    </div>
  );
}
