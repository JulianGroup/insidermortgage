"use client";
import React, { useState, useEffect } from 'react';

export default function ArticleShareBar({ post, theme = 'dark' }) {
  const [pageUrl, setPageUrl] = useState(
    `https://www.insidermtg.com/resource-library/${post?.slug || ''}/`
  );
  const [isIOS, setIsIOS] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
      const ua = window.navigator.userAgent || '';
      const iOSDevice =
        /iPad|iPhone|iPod/.test(ua) ||
        (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
      setIsIOS(iOSDevice);
    }
  }, [post?.slug]);

  if (!post) return null;

  const cleanTitle = post.title.replace(/^Draft:\s*/i, '');

  // Neutral message so you, David, Realtors, or borrowers can all share naturally
  const smsBody = `Thought you might find this mortgage breakdown from Insider Mortgage helpful: "${cleanTitle}" — ${pageUrl}`;
  const smsHref = isIOS
    ? `sms:&body=${encodeURIComponent(smsBody)}`
    : `sms:?body=${encodeURIComponent(smsBody)}`;

  const emailSubject = `Helpful mortgage breakdown: ${cleanTitle}`;
  const emailBody = `Hi,\n\nThought you might find this article from Insider Mortgage helpful:\n\n${cleanTitle}\n${post.excerpt ? `${post.excerpt}\n\n` : '\n'}Read it here:\n${pageUrl}\n`;
  const mailtoHref = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
    emailBody
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const isDark = theme === 'dark';

  const baseBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.42rem',
    padding: '0.45rem 0.9rem',
    borderRadius: '999px',
    fontSize: '0.84rem',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.18s ease',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid #CBD5E1',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F8FAFC',
    color: isDark ? '#FFFFFF' : '#0F172A',
  };

  return (
    <div
      className="imc-article-share-bar"
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: isDark ? 'rgba(255,255,255,0.72)' : '#64748B',
          marginRight: '0.15rem',
        }}
      >
        Share:
      </span>

      {/* Mobile-Only Text (SMS / iMessage) Button */}
      <a
        href={smsHref}
        className="imc-share-sms-btn"
        style={baseBtnStyle}
        aria-label="Share article via text message"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Text
      </a>

      {/* Mobile + Desktop Email Button */}
      <a
        href={mailtoHref}
        style={baseBtnStyle}
        aria-label="Share article via email"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
        Email
      </a>

      {/* Copy Link Button (Helpful for Gmail-in-browser & quick pasting) */}
      <button
        type="button"
        onClick={handleCopyLink}
        style={{
          ...baseBtnStyle,
          backgroundColor: copied
            ? '#059669'
            : baseBtnStyle.backgroundColor,
          borderColor: copied ? '#059669' : baseBtnStyle.border,
          color: copied ? '#FFFFFF' : baseBtnStyle.color,
        }}
        aria-label="Copy article link"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied ? 'Copied!' : 'Copy Link'}
      </button>

      {/* Show Text (SMS) button only on phones/tablets / touch screens */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .imc-share-sms-btn {
              display: none !important;
            }
            @media (max-width: 900px), (hover: none) and (pointer: coarse) {
              .imc-share-sms-btn {
                display: inline-flex !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}
