/**
 * Insider Mortgage — Embeddable Google Reviews Carousel Widget
 *
 * Zero-dependency drop-in widget that renders the "Our Happy Clients!" summary bar
 * and responsive 3-card review carousel with pinned-first + newest-first ordering.
 *
 * Embed usage on any website:
 *   <div id="insider-google-reviews"
 *        data-reviews-url="https://your-domain.com/data/reviews.json"
 *        data-heading="Our Happy Clients!"
 *        data-expand-mode="inline"></div>
 *   <script src="https://your-domain.com/widget/google-reviews-widget.js" defer></script>
 */

(function () {
  const DEFAULT_CHAR_LIMIT = 195;

  const STYLES = `
    :host, .igr-root {
      display: block;
      width: 100%;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .igr-wrapper {
      background-color: var(--igr-bg, #0a102a);
      padding: var(--igr-padding, 48px 24px 56px);
      border-radius: var(--igr-wrapper-radius, 0px);
      box-sizing: border-box;
    }

    .igr-container {
      max-width: 1060px;
      margin: 0 auto;
      position: relative;
    }

    .igr-heading {
      text-align: center;
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 28px 0;
      letter-spacing: -0.01em;
    }

    /* Summary Header Card */
    .igr-summary-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 20px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
      flex-wrap: wrap;
    }

    .igr-summary-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .igr-brand-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .igr-google-g {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .igr-brand-title {
      font-size: 21px;
      font-weight: 700;
      color: #111827;
      line-height: 1.2;
    }

    .igr-rating-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .igr-rating-number {
      font-size: 19px;
      font-weight: 700;
      color: #111827;
    }

    .igr-stars {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .igr-star {
      width: 18px;
      height: 18px;
      fill: #fbbc04;
      flex-shrink: 0;
    }

    .igr-star-empty {
      fill: #e2e8f0;
    }

    .igr-total-count {
      font-size: 15.5px;
      color: #64748b;
      font-weight: 500;
    }

    .igr-feedback-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #0b76f6;
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 600;
      text-decoration: none;
      padding: 11px 20px;
      border-radius: 7px;
      transition: background-color 0.18s ease, transform 0.15s ease;
      white-space: nowrap;
      border: none;
      cursor: pointer;
    }

    .igr-feedback-btn:hover {
      background-color: #0061d5;
      transform: translateY(-1px);
    }

    /* Carousel Viewport */
    .igr-carousel-outer {
      position: relative;
      display: flex;
      align-items: center;
    }

    .igr-viewport {
      overflow: hidden;
      width: 100%;
    }

    .igr-track {
      display: flex;
      gap: 20px;
      transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform;
    }

    .igr-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 26px 24px 24px;
      box-sizing: border-box;
      flex: 0 0 calc((100% - 40px) / 3);
      min-width: calc((100% - 40px) / 3);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 255px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      position: relative;
    }

    .igr-card-top {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .igr-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .igr-pinned-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #0b76f6;
      background: #eff6ff;
      padding: 3px 8px;
      border-radius: 999px;
    }

    .igr-comment {
      color: #5b667d;
      font-size: 14.5px;
      line-height: 1.56;
      margin: 0;
      word-break: break-word;
    }

    .igr-read-more {
      color: #0b76f6;
      font-size: 14px;
      font-weight: 500;
      text-decoration: underline;
      background: none;
      border: none;
      padding: 0;
      margin-top: 4px;
      cursor: pointer;
      display: inline-block;
      align-self: flex-start;
    }

    .igr-read-more:hover {
      color: #0056b3;
    }

    .igr-reviewer {
      margin-top: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .igr-reviewer-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .igr-reviewer-name {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
    }

    .igr-review-time {
      font-size: 12.5px;
      color: #6b7280;
    }

    /* Navigation Arrows */
    .igr-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid rgba(226, 232, 240, 0.9);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 5;
      color: #475569;
      transition: background 0.15s ease, transform 0.15s ease, opacity 0.2s ease;
    }

    .igr-nav-btn:hover:not(:disabled) {
      background: #ffffff;
      color: #0f172a;
      transform: translateY(-50%) scale(1.06);
    }

    .igr-nav-btn:disabled {
      opacity: 0.35;
      cursor: default;
    }

    .igr-nav-prev {
      left: -18px;
    }

    .igr-nav-next {
      right: -18px;
    }

    /* Modal for full review (when expand-mode="modal") */
    .igr-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(10, 16, 42, 0.72);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 20px;
      backdrop-filter: blur(3px);
    }

    .igr-modal {
      background: #ffffff;
      border-radius: 16px;
      max-width: 540px;
      width: 100%;
      padding: 28px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
      position: relative;
    }

    .igr-modal-close {
      position: absolute;
      top: 18px;
      right: 18px;
      background: #f1f5f9;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      color: #475569;
    }

    /* Responsive Breakpoints */
    @media (max-width: 960px) {
      .igr-card {
        flex: 0 0 calc((100% - 20px) / 2);
        min-width: calc((100% - 20px) / 2);
      }
    }

    @media (max-width: 640px) {
      .igr-wrapper {
        padding: 36px 16px 44px;
      }
      .igr-heading {
        font-size: 26px;
      }
      .igr-summary-card {
        padding: 18px 20px;
      }
      .igr-card {
        flex: 0 0 100%;
        min-width: 100%;
      }
      .igr-nav-prev {
        left: -10px;
      }
      .igr-nav-next {
        right: -10px;
      }
    }
  `;

  function formatRelativeTime(isoDateStr) {
    if (!isoDateStr) return '';
    const date = new Date(isoDateStr);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const diffSeconds = Math.max(1, Math.floor((now - date) / 1000));
    const diffDays = Math.floor(diffSeconds / 86400);

    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    if (diffDays < 365) {
      const months = Math.max(1, Math.floor(diffDays / 30));
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }

  function renderStarsSvg(rating = 5) {
    const fullStars = Math.round(rating);
    let html = '<span class="igr-stars" aria-label="' + rating + ' out of 5 stars">';
    for (let i = 1; i <= 5; i++) {
      const cls = i <= fullStars ? 'igr-star' : 'igr-star igr-star-empty';
      html += `<svg class="${cls}" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.447a1 1 0 00-1.175 0l-3.368 2.447c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.049 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.3-3.957z"/></svg>`;
    }
    html += '</span>';
    return html;
  }

  function renderGoogleIcon() {
    return `
      <svg class="igr-google-g" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/>
        <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
      </svg>
    `;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getVisibleCount(width) {
    if (width <= 640) return 1;
    if (width <= 960) return 2;
    return 3;
  }

  function renderWidgetIntoContainer(hostEl, data, options = {}) {
    const attrHeading = hostEl.getAttribute('data-heading');
    const attrShowHeading = hostEl.getAttribute('data-show-heading');

    const heading =
      options.heading !== undefined
        ? options.heading
        : attrHeading !== null
          ? attrHeading
          : data.heading !== undefined
            ? data.heading
            : 'The Word on the Street';

    const showHeading =
      options.showHeading !== undefined
        ? Boolean(options.showHeading)
        : attrShowHeading !== null
          ? attrShowHeading !== 'false'
          : data.showHeading !== undefined
            ? Boolean(data.showHeading)
            : true;

    const expandMode = options.expandMode || hostEl.getAttribute('data-expand-mode') || 'inline';
    const showPinnedBadge = options.showPinnedBadge !== undefined
      ? options.showPinnedBadge
      : (hostEl.getAttribute('data-show-pinned-badge') === 'true');
    const charLimit = Number(options.charLimit || hostEl.getAttribute('data-char-limit') || DEFAULT_CHAR_LIMIT);

    const reviews = Array.isArray(data.reviews) ? data.reviews : [];
    const avgRating = Number(data.averageRating || 5);
    const formattedAvg = Number.isInteger(avgRating) ? String(avgRating) : avgRating.toFixed(1);
    const totalCount = data.totalReviewCount ?? reviews.length;
    const writeReviewUrl = data.writeReviewUrl || '#';

    const shadowRoot = hostEl.shadowRoot || hostEl.attachShadow({ mode: 'open' });

    let currentIndex = 0;
    const expandedIds = new Set();

    function buildCardsHtml() {
      return reviews
        .map((r) => {
          const isExpanded = expandedIds.has(r.id);
          const fullText = r.comment || '';
          const needsTruncation = fullText.length > charLimit;
          const displayedText = !needsTruncation || isExpanded
            ? fullText
            : fullText.slice(0, charLimit).replace(/\s+\S*$/, '') + '...';

          return `
            <article class="igr-card" data-review-id="${escapeHtml(r.id)}">
              <div class="igr-card-top">
                <div class="igr-card-header">
                  ${renderStarsSvg(r.rating || 5)}
                  ${showPinnedBadge && r.pinned ? '<span class="igr-pinned-badge">📌 Featured</span>' : ''}
                </div>
                <div>
                  <p class="igr-comment">${escapeHtml(displayedText)}</p>
                  ${
                    needsTruncation
                      ? `<button type="button" class="igr-read-more" data-action="toggle-read" data-id="${escapeHtml(r.id)}">${
                          isExpanded ? 'Show less' : 'Read more'
                        }</button>`
                      : ''
                  }
                </div>
              </div>
              <div class="igr-reviewer">
                <div class="igr-reviewer-info">
                  <span class="igr-reviewer-name">${escapeHtml(r.reviewerName)}</span>
                  <span class="igr-review-time">${escapeHtml(formatRelativeTime(r.createTime))}</span>
                </div>
              </div>
            </article>
          `;
        })
        .join('');
    }

    shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <div class="igr-root">
        <section class="igr-wrapper" aria-label="Google Customer Reviews">
          <div class="igr-container">
            ${showHeading && String(heading).trim() ? `<h2 class="igr-heading">${escapeHtml(String(heading).trim())}</h2>` : ''}

            <div class="igr-summary-card">
              <div class="igr-summary-left">
                <div class="igr-brand-row">
                  ${renderGoogleIcon()}
                  <span class="igr-brand-title">Google Reviews</span>
                </div>
                <div class="igr-rating-row">
                  <span class="igr-rating-number">${escapeHtml(formattedAvg)}</span>
                  ${renderStarsSvg(avgRating)}
                  <span class="igr-total-count">(${escapeHtml(totalCount)})</span>
                </div>
              </div>
              <a class="igr-feedback-btn" href="${escapeHtml(writeReviewUrl)}" target="_blank" rel="noopener noreferrer">
                Share your feedback
              </a>
            </div>

            <div class="igr-carousel-outer">
              <button type="button" class="igr-nav-btn igr-nav-prev" aria-label="Previous reviews">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div class="igr-viewport">
                <div class="igr-track">
                  ${buildCardsHtml()}
                </div>
              </div>
              <button type="button" class="igr-nav-btn igr-nav-next" aria-label="Next reviews">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </section>
        <div class="igr-modal-slot"></div>
      </div>
    `;

    const track = shadowRoot.querySelector('.igr-track');
    const viewport = shadowRoot.querySelector('.igr-viewport');
    const prevBtn = shadowRoot.querySelector('.igr-nav-prev');
    const nextBtn = shadowRoot.querySelector('.igr-nav-next');
    const modalSlot = shadowRoot.querySelector('.igr-modal-slot');

    function updateCarouselPosition() {
      const width = viewport.clientWidth || 960;
      const visibleCount = getVisibleCount(width);
      const maxIndex = Math.max(0, reviews.length - visibleCount);
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      const firstCard = track.querySelector('.igr-card');
      if (firstCard) {
        const cardWidth = firstCard.getBoundingClientRect().width;
        const gap = 20;
        const offset = currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;
      }

      prevBtn.disabled = currentIndex <= 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    }

    function openModal(review) {
      modalSlot.innerHTML = `
        <div class="igr-modal-backdrop" data-close-modal="true">
          <div class="igr-modal" role="dialog" aria-modal="true">
            <button type="button" class="igr-modal-close" data-close-modal="true" aria-label="Close">&times;</button>
            <div style="margin-bottom: 14px;">${renderStarsSvg(review.rating || 5)}</div>
            <p class="igr-comment" style="font-size: 15.5px; color: #334155;">${escapeHtml(review.comment)}</p>
            <div class="igr-reviewer" style="margin-top: 22px;">
              <div class="igr-reviewer-info">
                <span class="igr-reviewer-name">${escapeHtml(review.reviewerName)}</span>
                <span class="igr-review-time">${escapeHtml(formatRelativeTime(review.createTime))}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      modalSlot.querySelectorAll('[data-close-modal="true"]').forEach((el) => {
        el.addEventListener('click', (e) => {
          if (e.target === el) {
            modalSlot.innerHTML = '';
          }
        });
      });
    }

    prevBtn.addEventListener('click', () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateCarouselPosition();
    });

    nextBtn.addEventListener('click', () => {
      const visibleCount = getVisibleCount(viewport.clientWidth || 960);
      const maxIndex = Math.max(0, reviews.length - visibleCount);
      currentIndex = Math.min(maxIndex, currentIndex + 1);
      updateCarouselPosition();
    });

    track.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="toggle-read"]');
      if (!btn) return;
      const reviewId = btn.getAttribute('data-id');
      const review = reviews.find((item) => item.id === reviewId);
      if (!review) return;

      if (expandMode === 'modal') {
        openModal(review);
      } else {
        if (expandedIds.has(reviewId)) {
          expandedIds.delete(reviewId);
        } else {
          expandedIds.add(reviewId);
        }
        track.innerHTML = buildCardsHtml();
        updateCarouselPosition();
      }
    });

    window.addEventListener('resize', updateCarouselPosition);
    requestAnimationFrame(updateCarouselPosition);
  }

  async function initElement(el) {
    const primaryUrl = el.getAttribute('data-reviews-url') || './data/reviews.json';
    const candidateUrls = Array.from(
      new Set([
        primaryUrl,
        '/insidermortgage/google-reviews/data/reviews.json',
        '/google-reviews/data/reviews.json',
        './data/reviews.json'
      ])
    );

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) continue;
        const data = await res.json();
        renderWidgetIntoContainer(el, data);
        return;
      } catch {
        // Try next candidate URL
      }
    }
    console.error('[InsiderGoogleReviews] Failed to load reviews from candidate URLs:', candidateUrls);
  }

  function autoInit() {
    const targets = document.querySelectorAll('#insider-google-reviews, [data-insider-google-reviews]');
    targets.forEach((el) => initElement(el));
  }

  window.InsiderGoogleReviews = {
    render: renderWidgetIntoContainer,
    init: autoInit
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
