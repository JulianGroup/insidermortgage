"use client";
import React, { useState, useEffect } from 'react';
import './TrustChips.css';

const GOOGLE_REVIEWS_URL =
  'https://search.google.com/local/reviews?placeid=ChIJveC1LxQH3IARnyqTS4mmz80';
const NMLS_CONSUMER_ACCESS_URL = 'https://www.nmlsconsumeraccess.org/';
const DIRECT_PHONE_HREF = 'tel:8588485653';

// Fires separate analytics events for each trust chip click
function trackChipClick(chipId, headline, placement) {
  if (typeof window === 'undefined') return;

  const payload = {
    event: 'trust_chip_click',
    chip_id: chipId,
    chip_headline: headline,
    chip_placement: placement,
    timestamp: new Date().toISOString()
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'trust_chip_click', {
      chip_id: chipId,
      chip_headline: headline,
      chip_placement: placement
    });
  }
  window.dispatchEvent(new CustomEvent('insider:trust_chip_click', { detail: payload }));
}

const TrustChips = ({
  placement = 'lead-capture',
  compact = false,
  layout = 'row' // 'row' (4 in a row on desktop, 2x2 on tablet/mobile) or 'grid-2x2'
}) => {
  const [reviewStats, setReviewStats] = useState({
    rating: '5.0',
    count: 61
  });

  useEffect(() => {
    let active = true;
    const urls = [
      '/google-reviews/data/reviews.json'
    ];
    (async () => {
      for (const url of urls) {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (!res.ok) continue;
          const data = await res.json();
          if (active && data) {
            const r = Number(data.averageRating || 5);
            const c = Number(data.totalReviewCount || (data.reviews && data.reviews.length) || 61);
            setReviewStats({
              rating: r.toFixed(1),
              count: c
            });
          }
          break;
        } catch {
          // Try next fallback URL
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSmoothScroll = (e, targetId, chipId, headline) => {
    e.preventDefault();
    trackChipClick(chipId, headline, placement);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = targetId;
    }
  };

  const handleDirectWorkClick = (e, chipId, headline) => {
    trackChipClick(chipId, headline, placement);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // On mobile: allow default tel: dialer navigation
      return;
    }
    // On desktop: smooth scroll to the schedule/consultation section
    e.preventDefault();
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const allChips = [
    {
      id: 'chip_1_google_rating',
      headline: `★ ${reviewStats.rating} on Google`,
      subline: `${reviewStats.count} client reviews`,
      href: GOOGLE_REVIEWS_URL,
      external: true,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l2.92 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77 5.82 21 7 14.14 2 9.27l7.08-1.01L12 2z" />
        </svg>
      )
    },
    {
      id: 'chip_2_referred_by_trust',
      headline: 'Referred by people you trust',
      subline: 'Clients, CPAs & financial planners',
      href: '#reviews',
      external: false,
      scrollTarget: 'reviews',
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'chip_3_nmls_verified',
      headline: 'Licensed in AZ, CA, FL, UT & WA',
      subline: 'C2 Financial NMLS #135622 • Look us up',
      title: 'NMLS IDs: 135622 (C2 Financial), 240594 (Rakesh Jain), 254108 (David Sider — CA)',
      href: NMLS_CONSUMER_ACCESS_URL,
      external: true,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      )
    },
    {
      id: 'chip_4_work_directly',
      headline: 'You work directly with us',
      subline: 'David and Rakesh handle your loan personally',
      href: DIRECT_PHONE_HREF,
      external: false,
      directAction: true,
      icon: (
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    }
  ];

  const visibleChips = compact
    ? allChips.filter(
        (c) => c.id === 'chip_1_google_rating' || c.id === 'chip_4_work_directly'
      )
    : allChips;

  return (
    <div
      className={`tc-chips-grid ${
        layout === 'grid-2x2' ? 'tc-layout-2x2' : 'tc-layout-row'
      } ${compact ? 'tc-layout-compact' : ''}`}
      role="region"
      aria-label="Verified Trust Credentials"
    >
      {visibleChips.map((chip) => {
        if (chip.external) {
          return (
            <a
              key={chip.id}
              href={chip.href}
              target="_blank"
              rel="noopener noreferrer"
              title={chip.title}
              className="tc-chip-card"
              data-analytics-event={chip.id}
              onClick={() => trackChipClick(chip.id, chip.headline, placement)}
            >
              <span className="tc-chip-icon" aria-hidden="true">
                {chip.icon}
              </span>
              <span className="tc-chip-text">
                <span className="tc-chip-headline">{chip.headline}</span>
                <span className="tc-chip-subline">{chip.subline}</span>
              </span>
            </a>
          );
        }

        if (chip.scrollTarget) {
          return (
            <a
              key={chip.id}
              href={chip.href}
              className="tc-chip-card"
              data-analytics-event={chip.id}
              onClick={(e) =>
                handleSmoothScroll(e, chip.scrollTarget, chip.id, chip.headline)
              }
            >
              <span className="tc-chip-icon" aria-hidden="true">
                {chip.icon}
              </span>
              <span className="tc-chip-text">
                <span className="tc-chip-headline">{chip.headline}</span>
                <span className="tc-chip-subline">{chip.subline}</span>
              </span>
            </a>
          );
        }

        return (
          <a
            key={chip.id}
            href={chip.href}
            className="tc-chip-card"
            data-analytics-event={chip.id}
            onClick={(e) => handleDirectWorkClick(e, chip.id, chip.headline)}
          >
            <span className="tc-chip-icon" aria-hidden="true">
              {chip.icon}
            </span>
            <span className="tc-chip-text">
              <span className="tc-chip-headline">{chip.headline}</span>
              <span className="tc-chip-subline">{chip.subline}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
};

export default TrustChips;
