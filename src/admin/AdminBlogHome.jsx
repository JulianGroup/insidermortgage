"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import AdminGuard from './AdminGuard';
import { useAdminAuth } from './AuthContext';
import SectionEditor from './blog/SectionEditor';
import ShareKitPanel from './blog/ShareKitPanel';
import BlogPostView from '../views/BlogPostView';
import seedPosts from '../data/blogPosts.json';
import {
  AUTHORS,
  WHO_WE_SERVE_CATEGORIES,
  CALCULATOR_TAGS,
  BIO_TAGS,
  SPECIFIC_ROUTE_OPTIONS,
} from '../data/taxonomy';
import { extractYouTubeId, getYouTubeThumbnail, formatPostDate } from '../lib/blog';

const GITHUB_WORKFLOW_URL =
  'https://github.com/JulianGroup/insidermortgage/actions/workflows/publish-blog.yml';

// Firestore forbids directly nested arrays (e.g., table.rows = [["a","b"],["c","d"]]) and `undefined` values.
// Wrap table rows as `{ cells: [...] }` (and any generic nested array as `{ __items: [...] }`) on write,
// and unwrap seamlessly back to plain arrays on read.
function isPlainObject(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const proto = Object.getPrototypeOf(obj);
  return proto === Object.prototype || proto === null;
}

function toFirestoreValue(val) {
  if (val === undefined) return undefined;
  if (Array.isArray(val)) {
    return val
      .filter((item) => item !== undefined)
      .map((item) => (Array.isArray(item) ? { cells: toFirestoreValue(item) } : toFirestoreValue(item)));
  }
  if (isPlainObject(val)) {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      const converted = toFirestoreValue(v);
      if (converted !== undefined) out[k] = converted;
    }
    return out;
  }
  // Preserve Firestore FieldValue sentinels (e.g. serverTimestamp()), Timestamps, Dates, primitives
  return val;
}

function fromFirestoreValue(val) {
  if (Array.isArray(val)) {
    return val.map((item) => {
      if (
        isPlainObject(item) &&
        Array.isArray(item.cells) &&
        Object.keys(item).length === 1
      ) {
        return fromFirestoreValue(item.cells);
      }
      return fromFirestoreValue(item);
    });
  }
  if (isPlainObject(val)) {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = fromFirestoreValue(v);
    }
    return out;
  }
  return val;
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .replace(/^draft:\s*/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function todayIso() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function estimateReadMinutes(post) {
  const chunks = [post.title, post.excerpt, post.keyTakeaway];
  for (const sec of post.sections || []) {
    chunks.push(sec.heading, sec.formula, ...(sec.paragraphs || []), ...(sec.bullets || []));
    for (const ni of sec.numberedItems || []) chunks.push(ni.title, ni.text);
    for (const sub of sec.subsections || []) {
      chunks.push(sub.subheading, ...(sub.paragraphs || []), ...(sub.bullets || []));
    }
  }
  const words = chunks
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 190));
}

function makeBlankPost(defaultAuthorId = 'rakesh') {
  return {
    id: `post-${Date.now()}`,
    slug: '',
    title: '',
    topicBadge: '',
    excerpt: '',
    authorId: defaultAuthorId,
    publishedAt: todayIso(),
    readTimeMinutes: 4,
    status: 'draft',
    isDraftSample: false,
    youtubeUrl: '',
    videoPlaceholderNote: '',
    categories: [],
    specificRoutes: [],
    calculators: [],
    bioTags: [],
    sections: [
      {
        heading: '',
        dividerAbove: false,
        paragraphs: [''],
      },
    ],
    keyTakeawayTitle: 'Bottom-Line Takeaway',
    keyTakeaway: '',
  };
}

const STATUS_BADGE = {
  published: { label: 'Published', bg: '#DCFCE7', color: '#166534', border: '#86EFAC' },
  pending: { label: 'Needs Approval', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  draft: { label: 'Draft', bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' },
  archived: { label: 'Archived', bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '0.35rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const inputStyle = {
  width: '100%',
  padding: '0.68rem 0.85rem',
  border: '1px solid #CBD5E1',
  borderRadius: '8px',
  fontSize: '0.96rem',
  fontFamily: 'inherit',
  backgroundColor: '#FFFFFF',
};

function BlogStudioInner() {
  const { profile, isOwner } = useAdminAuth();
  const defaultAuthor =
    profile?.email?.includes('david') || profile?.email?.includes('dsider') ? 'david' : 'rakesh';

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Editor state: null = list view, object = editing article
  const [editingPost, setEditingPost] = useState(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview' | 'share'
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success'|'warn'|'error', text, actionUrl?, actionLabel? }

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const snap = await getDocs(collection(db, 'blogPosts'));
      const list = snap.docs.map((d) => fromFirestoreValue({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        // Pending review items surface to top for owners
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        return (b.publishedAt || '').localeCompare(a.publishedAt || '');
      });
      setPosts(list);
    } catch (err) {
      setBanner({
        type: 'error',
        text: `Could not load blog posts from Firestore: ${err.message}`,
      });
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Count how many static seed posts aren't in Firestore yet
  const missingSeedPosts = useMemo(() => {
    const existingIds = new Set(posts.map((p) => p.id));
    return seedPosts.filter((sp) => !existingIds.has(sp.id));
  }, [posts]);

  const handleImportSeedPosts = async () => {
    if (!isOwner || missingSeedPosts.length === 0) return;
    setSaving(true);
    setBanner(null);
    try {
      const batch = writeBatch(db);
      for (const sp of missingSeedPosts) {
        batch.set(
          doc(db, 'blogPosts', sp.id),
          toFirestoreValue({
            ...sp,
            importedFromSiteJson: true,
            updatedBy: profile.email,
            updatedAt: serverTimestamp(),
          }),
          { merge: true }
        );
      }
      await batch.commit();
      setBanner({
        type: 'success',
        text: `Imported ${missingSeedPosts.length} existing site article(s) into Blog Studio.`,
      });
      await loadPosts();
    } catch (err) {
      setBanner({ type: 'error', text: `Import failed: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const triggerWebsiteRebuild = async (reason = 'Manual publish') => {
    if (!isOwner) return;
    setDeploying(true);
    try {
      const fn = httpsCallable(functions, 'triggerBlogDeploy');
      await fn({ reason });
      setBanner({
        type: 'success',
        text: 'Live website rebuild started! Your published changes will be live on insidermortgage.com in ~60–90 seconds.',
      });
    } catch (err) {
      setBanner({
        type: 'warn',
        text: 'Saved to Firestore as Published! Automatic rebuild trigger is awaiting one-time Cloud Function token setup — click below to run the 1-click GitHub rebuild now:',
        actionUrl: GITHUB_WORKFLOW_URL,
        actionLabel: 'Run Publish Workflow on GitHub ↗',
      });
    } finally {
      setDeploying(false);
    }
  };

  const openNewPost = () => {
    setEditingPost(makeBlankPost(defaultAuthor));
    setIsNewPost(true);
    setSlugTouched(false);
    setActiveTab('edit');
    setDirty(false);
    setBanner(null);
  };

  const openExistingPost = (post, initialTab = 'edit') => {
    setEditingPost(JSON.parse(JSON.stringify(post)));
    setIsNewPost(false);
    setSlugTouched(true);
    setActiveTab(initialTab);
    setDirty(false);
    setBanner(null);
  };

  const closeEditor = () => {
    if (dirty && !window.confirm('Discard unsaved edits?')) return;
    setEditingPost(null);
    setDirty(false);
  };

  const updateDraft = (patch) => {
    setEditingPost((prev) => {
      const next = { ...prev, ...patch };
      if ('title' in patch && !slugTouched) {
        next.slug = slugify(patch.title);
      }
      return next;
    });
    setDirty(true);
  };

  const toggleArrayItem = (field, itemValue) => {
    const arr = Array.isArray(editingPost[field]) ? editingPost[field] : [];
    const next = arr.includes(itemValue)
      ? arr.filter((v) => v !== itemValue)
      : [...arr, itemValue];
    updateDraft({ [field]: next });
  };

  const saveWithStatus = async (targetStatus, autoRebuild = false) => {
    if (!editingPost) return;
    const cleanTitle = (editingPost.title || '').trim();
    const cleanSlug = slugify(editingPost.slug || cleanTitle);

    if (!cleanTitle) {
      setBanner({ type: 'error', text: 'Please enter an article title before saving.' });
      return;
    }
    if (!cleanSlug) {
      setBanner({ type: 'error', text: 'Please enter a valid URL slug.' });
      return;
    }

    const duplicate = posts.find((p) => p.slug === cleanSlug && p.id !== editingPost.id);
    if (duplicate) {
      setBanner({
        type: 'error',
        text: `Another article already uses the URL slug "${cleanSlug}". Please choose a unique slug.`,
      });
      return;
    }

    setSaving(true);
    setBanner(null);

    try {
      const cleanedSections = (editingPost.sections || []).map((sec) => {
        const copy = { ...sec };
        if (copy.table === undefined) delete copy.table;
        if (!copy.formula) delete copy.formula;
        if (Array.isArray(copy.bullets) && copy.bullets.length === 0) delete copy.bullets;
        if (Array.isArray(copy.numberedItems) && copy.numberedItems.length === 0)
          delete copy.numberedItems;
        if (Array.isArray(copy.comparisonColumns) && copy.comparisonColumns.length === 0)
          delete copy.comparisonColumns;
        if (Array.isArray(copy.subsections) && copy.subsections.length === 0)
          delete copy.subsections;
        return copy;
      });

      const payload = {
        ...editingPost,
        title: cleanTitle,
        slug: cleanSlug,
        status: targetStatus,
        readTimeMinutes:
          Number(editingPost.readTimeMinutes) || estimateReadMinutes(editingPost),
        sections: cleanedSections,
        updatedBy: profile.email,
        updatedAt: serverTimestamp(),
      };

      if (isNewPost) {
        payload.createdBy = profile.email;
        payload.createdAt = serverTimestamp();
      }
      if (targetStatus === 'published') {
        payload.approvedBy = profile.email;
        payload.approvedAt = serverTimestamp();
      }

      await setDoc(doc(db, 'blogPosts', payload.id), toFirestoreValue(payload), { merge: true });
      setEditingPost({ ...payload });
      setIsNewPost(false);
      setSlugTouched(true);
      setDirty(false);
      await loadPosts();

      if (targetStatus === 'published' && autoRebuild && isOwner) {
        await triggerWebsiteRebuild(`Publish: ${cleanTitle}`);
      } else {
        const msgMap = {
          draft: 'Draft saved privately to Firestore.',
          pending: 'Submitted for owner review! Rakesh and David will see this under "Needs Approval".',
          published: 'Article marked as Published.',
          archived: 'Article archived — it will be removed from the live site on the next rebuild.',
        };
        setBanner({ type: 'success', text: msgMap[targetStatus] || 'Saved.' });
      }
    } catch (err) {
      setBanner({ type: 'error', text: `Save failed: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || !editingPost) return;
    if (
      !window.confirm(
        `Permanently delete "${editingPost.title || editingPost.id}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'blogPosts', editingPost.id));
      setEditingPost(null);
      setDirty(false);
      await loadPosts();
      setBanner({
        type: 'success',
        text: 'Article deleted from Firestore. Click "Rebuild Live Website" if it was previously published.',
      });
    } catch (err) {
      setBanner({ type: 'error', text: `Delete failed: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  // Filtered list counts & items
  const counts = useMemo(() => {
    const c = { all: posts.length, pending: 0, published: 0, draft: 0, archived: 0 };
    for (const p of posts) {
      if (c[p.status] !== undefined) c[p.status]++;
    }
    return c;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (authorFilter !== 'all' && p.authorId !== authorFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${p.title || ''} ${p.slug || ''} ${p.excerpt || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, statusFilter, authorFilter, search]);

  const BannerAlert = () => {
    if (!banner) return null;
    const palette =
      banner.type === 'error'
        ? { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B' }
        : banner.type === 'warn'
        ? { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' }
        : { bg: '#F0FDF4', border: '#BBF7D0', color: '#166534' };
    return (
      <div
        style={{
          padding: '0.9rem 1.15rem',
          borderRadius: '10px',
          backgroundColor: palette.bg,
          border: `1px solid ${palette.border}`,
          color: palette.color,
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontWeight: 500,
        }}
      >
        <span>{banner.text}</span>
        {banner.actionUrl && (
          <a
            href={banner.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: '#060A2D',
              color: '#EFB51E',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.88rem',
            }}
          >
            {banner.actionLabel || 'Open ↗'}
          </a>
        )}
      </div>
    );
  };

  // =========================================================================
  // EDITOR VIEW
  // =========================================================================
  if (editingPost) {
    const ytId = extractYouTubeId(editingPost.youtubeUrl);
    const ytThumb = getYouTubeThumbnail(editingPost.youtubeUrl);
    const badge = STATUS_BADGE[editingPost.status] || STATUS_BADGE.draft;

    const sections = editingPost.sections || [];
    const setSection = (idx, updatedSec) => {
      const next = sections.map((s, i) => (i === idx ? updatedSec : s));
      updateDraft({ sections: next });
    };
    const moveSection = (idx, dir) => {
      const target = idx + dir;
      if (target < 0 || target >= sections.length) return;
      const next = [...sections];
      [next[idx], next[target]] = [next[target], next[idx]];
      updateDraft({ sections: next });
    };
    const duplicateSection = (idx) => {
      const clone = JSON.parse(JSON.stringify(sections[idx]));
      const next = [...sections.slice(0, idx + 1), clone, ...sections.slice(idx + 1)];
      updateDraft({ sections: next });
    };
    const removeSection = (idx) => {
      updateDraft({ sections: sections.filter((_, i) => i !== idx) });
    };
    const addSection = () => {
      updateDraft({
        sections: [
          ...sections,
          { heading: '', dividerAbove: true, paragraphs: [''] },
        ],
      });
    };

    return (
      <div className="container" style={{ maxWidth: '1080px', padding: '1.5rem 0 4rem' }}>
        {/* Sticky Top Action Bar */}
        <div
          style={{
            position: 'sticky',
            top: '72px',
            zIndex: 30,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            padding: '0.85rem 1.15rem',
            marginBottom: '1.25rem',
            boxShadow: '0 6px 20px rgba(6, 10, 45, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={closeEditor}
              style={{
                background: 'none',
                border: 'none',
                color: '#060A2D',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              ← Articles
            </button>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                padding: '0.22rem 0.65rem',
                borderRadius: '999px',
                backgroundColor: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
              }}
            >
              {badge.label}
            </span>
            {dirty && (
              <span style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 600 }}>
                • Unsaved changes
              </span>
            )}
          </div>

          {/* Mode Tabs */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#F1F5F9',
              padding: '0.22rem',
              borderRadius: '8px',
              gap: '0.2rem',
            }}
          >
            {[
              { id: 'edit', label: '✍️ Write & Tag' },
              { id: 'preview', label: '👁️ Live Preview' },
              { id: 'share', label: '📣 Share Kit' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '0.42rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  backgroundColor: activeTab === t.id ? '#060A2D' : 'transparent',
                  color: activeTab === t.id ? '#FFFFFF' : '#475569',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Role-Based Save / Approve Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn"
              disabled={saving || deploying}
              onClick={() => saveWithStatus('draft', false)}
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.86rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
              }}
            >
              Save Draft
            </button>

            {!isOwner ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving || deploying}
                onClick={() => saveWithStatus('pending', false)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                }}
              >
                Submit for Owner Approval
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn"
                  disabled={saving || deploying}
                  onClick={() => saveWithStatus('published', true)}
                  style={{
                    padding: '0.5rem 1.05rem',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#EFB51E',
                    color: '#060A2D',
                    cursor: 'pointer',
                  }}
                >
                  {saving || deploying ? 'Publishing…' : '✓ Approve & Publish Live'}
                </button>
                {!isNewPost && editingPost.status === 'published' && (
                  <button
                    type="button"
                    className="btn"
                    disabled={saving || deploying}
                    onClick={() => saveWithStatus('archived', true)}
                    style={{
                      padding: '0.5rem 0.85rem',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                    }}
                  >
                    Archive
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <BannerAlert />

        {activeTab === 'preview' && (
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2px solid #CBD5E1',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <BlogPostView post={editingPost} />
          </div>
        )}

        {activeTab === 'share' && <ShareKitPanel post={editingPost} />}

        {activeTab === 'edit' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.35rem' }}>
            {/* Core Metadata Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                padding: '1.5rem',
              }}
            >
              <h2 style={{ margin: '0 0 1.15rem', fontSize: '1.2rem', color: '#060A2D' }}>
                1. Article Headline &amp; Author
              </h2>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Article Title *</label>
                <input
                  style={{ ...inputStyle, fontSize: '1.15rem', fontWeight: 700 }}
                  placeholder="e.g., How to Shop for a HELOC"
                  value={editingPost.title || ''}
                  onChange={(e) => updateDraft({ title: e.target.value })}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label style={labelStyle}>URL Slug *</label>
                  <input
                    style={inputStyle}
                    placeholder="how-to-shop-for-a-heloc"
                    value={editingPost.slug || ''}
                    onChange={(e) => {
                      setSlugTouched(true);
                      updateDraft({ slug: slugify(e.target.value) });
                    }}
                  />
                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.25rem' }}>
                    /resource-library/{editingPost.slug || 'your-slug'}/
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Author &amp; Licensing Footer</label>
                  <select
                    style={inputStyle}
                    value={editingPost.authorId || 'rakesh'}
                    onChange={(e) => updateDraft({ authorId: e.target.value })}
                  >
                    {Object.values(AUTHORS).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (NMLS #{a.nmls})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Publish Date</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={editingPost.publishedAt || todayIso()}
                    onChange={(e) => updateDraft({ publishedAt: e.target.value })}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Read Time (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    style={inputStyle}
                    value={editingPost.readTimeMinutes || 4}
                    onChange={(e) =>
                      updateDraft({ readTimeMinutes: parseInt(e.target.value, 10) || 4 })
                    }
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Short Excerpt / SEO Summary *</label>
                <textarea
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="1–2 sentence summary shown on Resource Library cards, Google search snippets, and Share Kit emails..."
                  value={editingPost.excerpt || ''}
                  onChange={(e) => updateDraft({ excerpt: e.target.value })}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <label style={labelStyle}>Custom Topic Badge (optional)</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g., 🏡 Home Equity & HELOCs"
                    value={editingPost.topicBadge || ''}
                    onChange={(e) => updateDraft({ topicBadge: e.target.value })}
                  />
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#334155',
                    paddingTop: '1.2rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(editingPost.isDraftSample)}
                    onChange={(e) => updateDraft({ isDraftSample: e.target.checked })}
                  />
                  Show &ldquo;Draft Entry&rdquo; sample badge on public card
                </label>
              </div>
            </div>

            {/* YouTube Video Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                padding: '1.5rem',
              }}
            >
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#060A2D' }}>
                2. YouTube Video Embed (Optional)
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: ytThumb ? '1fr 220px' : '1fr',
                  gap: '1.25rem',
                  alignItems: 'start',
                }}
              >
                <div>
                  <div style={{ marginBottom: '0.85rem' }}>
                    <label style={labelStyle}>YouTube URL (watch, youtu.be, or Shorts)</label>
                    <input
                      style={inputStyle}
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={editingPost.youtubeUrl || ''}
                      onChange={(e) => updateDraft({ youtubeUrl: e.target.value })}
                    />
                    {editingPost.youtubeUrl && !ytId && (
                      <div style={{ fontSize: '0.8rem', color: '#B91C1C', marginTop: '0.25rem' }}>
                        Could not detect an 11-character YouTube video ID from this URL.
                      </div>
                    )}
                  </div>

                  {!ytId && (
                    <div>
                      <label style={labelStyle}>
                        Placeholder Note When Video Isn&apos;t Recorded Yet (optional)
                      </label>
                      <input
                        style={inputStyle}
                        placeholder="Leave blank to hide video box completely"
                        value={editingPost.videoPlaceholderNote || ''}
                        onChange={(e) =>
                          updateDraft({ videoPlaceholderNote: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>

                {ytThumb && (
                  <div>
                    <img
                      src={ytThumb}
                      alt="YouTube thumbnail preview"
                      style={{
                        width: '100%',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                      }}
                    />
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: '#15803D',
                        fontWeight: 700,
                        marginTop: '0.3rem',
                        textAlign: 'center',
                      }}
                    >
                      ✓ Video ID: {ytId}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Placement Checkboxes Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                padding: '1.5rem',
              }}
            >
              <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.2rem', color: '#060A2D' }}>
                3. Where Should This Article Appear?
              </h2>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', color: '#64748B' }}>
                Every published article automatically appears in the central{' '}
                <strong>/resource-library</strong> hub. Tick any categories, specialty pages,
                calculators, or bio pages where it should also appear.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {/* Who We Serve Categories */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={labelStyle}>Who We Serve Categories</div>
                  {WHO_WE_SERVE_CATEGORIES.filter((c) => c.status === 'active').map((cat) => (
                    <label
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.45rem',
                        fontSize: '0.92rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(editingPost.categories || []).includes(cat.id)}
                        onChange={() => toggleArrayItem('categories', cat.id)}
                      />
                      <span>
                        {cat.icon} {cat.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Geek Out Calculators */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={labelStyle}>Geek Out Calculators &amp; Tools</div>
                  {CALCULATOR_TAGS.map((calc) => (
                    <label
                      key={calc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.45rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(editingPost.calculators || []).includes(calc.id)}
                        onChange={() => toggleArrayItem('calculators', calc.id)}
                      />
                      <span>{calc.shortLabel}</span>
                    </label>
                  ))}
                </div>

                {/* Specific Specialty Pages + Bio Pages */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={labelStyle}>Personal Bio Pages (Strict Opt-In)</div>
                  {BIO_TAGS.map((bio) => (
                    <label
                      key={bio.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.45rem',
                        fontSize: '0.92rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(editingPost.bioTags || []).includes(bio.id)}
                        onChange={() => toggleArrayItem('bioTags', bio.id)}
                      />
                      <span>{bio.label}</span>
                    </label>
                  ))}

                  <div style={{ ...labelStyle, marginTop: '1rem' }}>
                    Specific Loan / Program Pages
                  </div>
                  <div style={{ maxHeight: '190px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {SPECIFIC_ROUTE_OPTIONS.map((rt) => (
                      <label
                        key={rt.slug}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.4rem',
                          fontSize: '0.86rem',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={(editingPost.specificRoutes || []).includes(rt.slug)}
                          onChange={() => toggleArrayItem('specificRoutes', rt.slug)}
                        />
                        <span>{rt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Article Sections Builder */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.85rem',
                }}
              >
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#060A2D' }}>
                  4. Article Body Sections ({sections.length})
                </h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addSection}
                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.86rem' }}
                >
                  + Add Section
                </button>
              </div>

              {sections.map((sec, idx) => (
                <SectionEditor
                  key={idx}
                  section={sec}
                  index={idx}
                  total={sections.length}
                  onChange={(updated) => setSection(idx, updated)}
                  onMoveUp={() => moveSection(idx, -1)}
                  onMoveDown={() => moveSection(idx, 1)}
                  onDuplicate={() => duplicateSection(idx)}
                  onRemove={() => removeSection(idx)}
                />
              ))}

              <button
                type="button"
                onClick={addSection}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: '2px dashed #94A3B8',
                  backgroundColor: '#F8FAFC',
                  color: '#060A2D',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Add Another Section
              </button>
            </div>

            {/* Bottom Key Takeaway Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                padding: '1.5rem',
              }}
            >
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#060A2D' }}>
                5. Bottom-Line Takeaway Box (Optional)
              </h2>

              <div style={{ marginBottom: '0.85rem', maxWidth: '360px' }}>
                <label style={labelStyle}>Callout Label</label>
                <input
                  style={inputStyle}
                  placeholder="Bottom-Line Takeaway"
                  value={editingPost.keyTakeawayTitle || ''}
                  onChange={(e) => updateDraft({ keyTakeawayTitle: e.target.value })}
                />
              </div>

              <div>
                <label style={labelStyle}>Key Takeaway Text</label>
                <textarea
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="1–2 sentence closing takeaway highlighted in gold at the bottom of the article..."
                  value={editingPost.keyTakeaway || ''}
                  onChange={(e) => updateDraft({ keyTakeaway: e.target.value })}
                />
              </div>

              {isOwner && !isNewPost && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      border: '1px solid #FECACA',
                      backgroundColor: '#FEF2F2',
                      color: '#B91C1C',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    Delete Article Permanently
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // DIRECTORY / LIST VIEW
  // =========================================================================
  return (
    <div className="container" style={{ maxWidth: '1040px', padding: '2.25rem 0 4rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <Link href="/admin/" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0468E9' }}>
            ← Admin Portal
          </Link>
          <h1 style={{ margin: '0.35rem 0 0.25rem', color: 'var(--primary)' }}>Blog Studio</h1>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem' }}>
            {isOwner
              ? 'Create, edit, approve staff drafts, and publish articles to Insider Mortgage.'
              : 'Write and edit articles, then submit drafts for Rakesh or David to approve and publish.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {isOwner && (
            <button
              type="button"
              className="btn"
              disabled={deploying || posts.length === 0}
              onClick={() => triggerWebsiteRebuild('Manual rebuild from Blog Studio')}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#060A2D',
                fontWeight: 700,
              }}
            >
              {deploying ? 'Starting Rebuild…' : '🚀 Rebuild Live Website'}
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={openNewPost}>
            + New Article
          </button>
        </div>
      </div>

      <BannerAlert />

      {/* Seed Import Banner for Owners when site JSON has articles not yet in Firestore */}
      {isOwner && !loadingPosts && missingSeedPosts.length > 0 && (
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '1.1rem 1.35rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <strong style={{ color: '#1E3A8A' }}>
              {missingSeedPosts.length} existing website article
              {missingSeedPosts.length === 1 ? '' : 's'} ready to import
            </strong>
            <div style={{ fontSize: '0.88rem', color: '#1E40AF', marginTop: '0.2rem' }}>
              Import your current published articles and sample drafts into Firestore so you can
              edit, unpublish, or replace them here.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={handleImportSeedPosts}
          >
            {saving ? 'Importing…' : `Import ${missingSeedPosts.length} Site Articles`}
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${counts.all})` },
            {
              id: 'pending',
              label: `Needs Approval (${counts.pending})`,
              highlight: counts.pending > 0,
            },
            { id: 'published', label: `Published (${counts.published})` },
            { id: 'draft', label: `Drafts (${counts.draft})` },
            { id: 'archived', label: `Archived (${counts.archived})` },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: active
                    ? '1px solid #060A2D'
                    : tab.highlight
                    ? '1px solid #F59E0B'
                    : '1px solid #CBD5E1',
                  backgroundColor: active
                    ? '#060A2D'
                    : tab.highlight
                    ? '#FEF3C7'
                    : '#FFFFFF',
                  color: active ? '#FFFFFF' : tab.highlight ? '#92400E' : '#334155',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            style={{ ...inputStyle, width: 'auto', padding: '0.48rem 0.75rem', fontSize: '0.88rem' }}
          >
            <option value="all">All Authors</option>
            {Object.values(AUTHORS).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, width: '210px', padding: '0.48rem 0.8rem', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* Articles List */}
      {loadingPosts ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '2.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#64748B',
          }}
        >
          Loading articles…
        </div>
      ) : filteredPosts.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '3rem 2rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
            color: '#64748B',
          }}
        >
          <p style={{ margin: '0 0 1rem', fontSize: '1.05rem' }}>
            {posts.length === 0
              ? 'No articles in Firestore yet. Import your existing site articles above or start a new article.'
              : 'No articles match the current filter.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={openNewPost}>
            + Write First Article
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredPosts.map((post) => {
            const author = AUTHORS[post.authorId] || AUTHORS.rakesh;
            const badge = STATUS_BADGE[post.status] || STATUS_BADGE.draft;
            const hasVideo = Boolean(extractYouTubeId(post.youtubeUrl));

            return (
              <div
                key={post.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border:
                    post.status === 'pending'
                      ? '2px solid #F59E0B'
                      : '1px solid #E2E8F0',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ flex: '1 1 420px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '0.18rem 0.6rem',
                        borderRadius: '999px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.label}
                    </span>
                    {post.isDraftSample && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.16rem 0.55rem',
                          borderRadius: '999px',
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                        }}
                      >
                        Sample Placeholder
                      </span>
                    )}
                    {hasVideo && (
                      <span style={{ fontSize: '0.76rem', color: '#0468E9', fontWeight: 700 }}>
                        🎥 Video
                      </span>
                    )}
                    <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      {author.name} • {formatPostDate(post.publishedAt)}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '1.08rem',
                      fontWeight: 700,
                      color: '#060A2D',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {post.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    /resource-library/{post.slug}/
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => openExistingPost(post, 'edit')}
                    style={{
                      padding: '0.42rem 0.85rem',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      backgroundColor: '#060A2D',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => openExistingPost(post, 'preview')}
                    style={{
                      padding: '0.42rem 0.8rem',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      color: '#1E293B',
                      borderRadius: '8px',
                    }}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => openExistingPost(post, 'share')}
                    style={{
                      padding: '0.42rem 0.8rem',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      color: '#1E293B',
                      borderRadius: '8px',
                    }}
                  >
                    Share Kit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminBlogHome() {
  return (
    <AdminGuard moduleId="blog">
      <BlogStudioInner />
    </AdminGuard>
  );
}
