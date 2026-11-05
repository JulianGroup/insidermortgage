"use client";
import React, { useState } from 'react';
import { AUTHORS } from '../../data/taxonomy';
import { formatRawTextWithAI } from './aiDraftFormatter';

export default function AiFormatterPanel({
  isNewPost,
  editingPost,
  onChangeAuthor,
  onApplyFormattedDraft,
}) {
  const [expanded, setExpanded] = useState(Boolean(isNewPost));
  const [rawText, setRawText] = useState('');
  const [extraInstructions, setExtraInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [setupUrl, setSetupUrl] = useState(null);

  const hasExistingContent = Boolean(
    (editingPost?.title && editingPost.title.trim()) ||
      (editingPost?.sections || []).some(
        (s) =>
          (s.heading && s.heading.trim()) ||
          (s.paragraphs || []).some((p) => p && p.trim()) ||
          (s.bullets || []).length > 0 ||
          Boolean(s.table)
      )
  );

  const handleFormat = async () => {
    setError(null);
    setSetupUrl(null);

    if (!rawText.trim()) {
      setError('Paste your rough text, notes, email draft, or transcript above first.');
      return;
    }

    if (
      hasExistingContent &&
      !window.confirm(
        'Replace the current form fields with the newly AI-formatted draft? (Nothing is saved to Firestore until you click Save Draft or Publish.)'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const formatted = await formatRawTextWithAI({
        rawText,
        extraInstructions,
        authorId: editingPost?.authorId || 'rakesh',
      });
      onApplyFormattedDraft(formatted);
      setExpanded(false);
    } catch (err) {
      setError(err?.message || 'AI formatting failed. Please try again.');
      if (err?.setupUrl) {
        setSetupUrl(err.setupUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #060A2D 0%, #0F1C4D 100%)',
        borderRadius: '14px',
        border: '1px solid #1E3A8A',
        color: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(6, 10, 45, 0.12)',
      }}
    >
      {/* Header / Collapse Toggle */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: '#FFFFFF',
          padding: '1.05rem 1.35rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              fontWeight: 800,
              fontSize: '1.02rem',
            }}
          >
            <span
              style={{
                backgroundColor: '#EFB51E',
                color: '#060A2D',
                padding: '0.18rem 0.55rem',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              AI Assistant
            </span>
            <span>✨ Paste Rough Text → Auto-Fill Form &amp; Formatting</span>
          </div>
          <div style={{ fontSize: '0.86rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
            Drop in plain text, bullet notes, an email to a client, or a video transcript — AI builds
            headings, comparison tables, checklists, tags, and summary so you &amp; David just review
            and edit.
          </div>
        </div>
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#EFB51E',
            whiteSpace: 'nowrap',
          }}
        >
          {expanded ? 'Hide ▲' : 'Open AI Formatter ▼'}
        </span>
      </button>

      {expanded && (
        <div
          style={{
            padding: '0 1.35rem 1.35rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.9rem',
              marginTop: '1rem',
              marginBottom: '0.9rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#CBD5E1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '0.35rem',
                }}
              >
                Author Voice &amp; Bio Tag
              </label>
              <select
                value={editingPost?.authorId || 'rakesh'}
                onChange={(e) => onChangeAuthor(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.22)',
                  backgroundColor: 'rgba(255,255,255,0.96)',
                  color: '#0F172A',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                }}
              >
                {Object.values(AUTHORS).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#CBD5E1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '0.35rem',
                }}
              >
                Optional Formatting Requests
              </label>
              <input
                type="text"
                disabled={loading}
                value={extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                placeholder="e.g., Add a comparison table and 5 questions borrowers should ask..."
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.22)',
                  backgroundColor: 'rgba(255,255,255,0.96)',
                  color: '#0F172A',
                  fontSize: '0.92rem',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.95rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#CBD5E1',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.35rem',
              }}
            >
              Paste Rough Text, Notes, Email, or Video Transcript *
            </label>
            <textarea
              rows={8}
              disabled={loading}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your unformatted article text, rough bullet points, or client email explanation here..."
              style={{
                width: '100%',
                padding: '0.8rem 0.9rem',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.25)',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: '0.95rem',
                lineHeight: 1.55,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                backgroundColor: setupUrl ? '#FEF3C7' : '#FEE2E2',
                color: setupUrl ? '#92400E' : '#991B1B',
                border: setupUrl ? '1px solid #FCD34D' : '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '0.95rem',
                fontSize: '0.9rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <span>{error}</span>
              {setupUrl && (
                <a
                  href={setupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    backgroundColor: '#060A2D',
                    color: '#EFB51E',
                    fontWeight: 800,
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  Enable Firebase AI Logic ↗
                </a>
              )}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
              Populates all form fields below without publishing — you &amp; David stay in 100%
              editorial control.
            </span>

            <button
              type="button"
              disabled={loading || !rawText.trim()}
              onClick={handleFormat}
              style={{
                padding: '0.68rem 1.35rem',
                borderRadius: '9px',
                border: 'none',
                backgroundColor: loading || !rawText.trim() ? '#94A3B8' : '#EFB51E',
                color: '#060A2D',
                fontWeight: 800,
                fontSize: '0.94rem',
                cursor: loading || !rawText.trim() ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(239, 181, 30, 0.25)',
              }}
            >
              {loading
                ? '✨ Formatting headings, tables & tags (5–10s)…'
                : '✨ Format & Fill Form with AI'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
