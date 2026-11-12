"use client";
import React, { useState, useEffect } from 'react';
import { AUTHORS } from '../../data/taxonomy';
import {
  formatRawTextWithAI,
  getStoredApiKey,
  saveStoredApiKey,
} from './aiDraftFormatter';

export default function AiFormatterPanel({
  isNewPost,
  editingPost,
  isOwner = false,
  db = null,
  onChangeAuthor,
  onApplyFormattedDraft,
}) {
  const [expanded, setExpanded] = useState(Boolean(isNewPost));
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [saveToTeam, setSaveToTeam] = useState(true);
  const [keySavedBanner, setKeySavedBanner] = useState(false);

  const [rawText, setRawText] = useState('');
  const [extraInstructions, setExtraInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved key on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const stored = await getStoredApiKey(db);
      if (isMounted) {
        if (stored) {
          setApiKey(stored);
          setShowKeyInput(false);
        } else {
          setShowKeyInput(true);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [db]);

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

  const handleSaveKeyManually = async () => {
    if (!apiKey.trim()) return;
    await saveStoredApiKey(db, apiKey.trim(), isOwner && saveToTeam);
    setShowKeyInput(false);
    setKeySavedBanner(true);
    setTimeout(() => setKeySavedBanner(false), 3500);
  };

  const handleFormat = async () => {
    setError(null);

    const activeKey = apiKey.trim();
    if (!activeKey) {
      setError(
        'Please enter your Gemini API Key below. (Get your free key in 30 seconds at aistudio.google.com/app/apikey)'
      );
      setShowKeyInput(true);
      return;
    }

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
      // Save key so future runs don't need re-entering
      await saveStoredApiKey(db, activeKey, isOwner && saveToTeam);

      const formatted = await formatRawTextWithAI({
        apiKey: activeKey,
        rawText,
        extraInstructions,
        authorId: editingPost?.authorId || 'rakesh',
      });
      onApplyFormattedDraft(formatted);
      setExpanded(false);
    } catch (err) {
      setError(err?.message || 'AI formatting failed. Please verify your API key and try again.');
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
          {/* API Key Configuration Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '0.85rem 1.1rem',
              marginTop: '1rem',
              marginBottom: '0.9rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#EFB51E' }}>
                  🔑 Gemini API Key:
                </span>
                {apiKey ? (
                  <span
                    style={{
                      fontSize: '0.86rem',
                      fontFamily: 'monospace',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      color: '#A7F3D0',
                    }}
                  >
                    ••••••••••••{apiKey.slice(-4)}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#FCA5A5' }}>
                    Not entered yet
                  </span>
                )}
                {keySavedBanner && (
                  <span style={{ fontSize: '0.78rem', color: '#86EFAC', fontWeight: 700 }}>
                    ✓ Key Saved!
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.8rem',
                    color: '#93C5FD',
                    textDecoration: 'underline',
                  }}
                >
                  Get free key at Google AI Studio ↗
                </a>
                <button
                  type="button"
                  onClick={() => setShowKeyInput((prev) => !prev)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {showKeyInput ? 'Hide Key Field' : apiKey ? 'Change Key' : 'Enter Key'}
                </button>
              </div>
            </div>

            {showKeyInput && (
              <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste Gemini API Key (starts with AIzaSy...)"
                    style={{
                      flex: 1,
                      minWidth: '260px',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '7px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveKeyManually}
                    disabled={!apiKey.trim()}
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: '7px',
                      border: 'none',
                      backgroundColor: '#EFB51E',
                      color: '#060A2D',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Save Key
                  </button>
                </div>

                {isOwner && (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.8rem',
                      color: '#CBD5E1',
                      marginTop: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={saveToTeam}
                      onChange={(e) => setSaveToTeam(e.target.checked)}
                    />
                    Share key securely with team members in Firestore (so David and staff can use it without entering their own key)
                  </label>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.9rem',
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
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '0.95rem',
                fontSize: '0.9rem',
              }}
            >
              <span>{error}</span>
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
