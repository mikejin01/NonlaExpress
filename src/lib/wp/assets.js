/* =============================================================================
   Image URL resolution across three hosts.

   The same content value has to resolve correctly in three places:

     pnpm dev / GitHub Pages   /assets/images/x.jpg  → <base>/assets/images/x.jpg
     WordPress theme           /assets/images/x.jpg  → /wp-content/themes/<slug>/assets/images/x.jpg
     WordPress Media Library   /wp-content/uploads/…  → left alone

   So content.js stores theme-relative paths beginning `/assets/`, and anything
   a client picks in the Media Library (already root-absolute, or a full URL)
   passes straight through untouched.
   ============================================================================= */

import { base } from '$app/paths';
import { wpRest } from './client.js';

/**
 * Prefix a theme-shipped asset path with whichever base applies here.
 * @param {string | undefined | null} path
 * @returns {string}
 */
export function assetUrl(path) {
	const p = String(path ?? '').trim();
	if (!p) return '';

	// Absolute URLs, protocol-relative URLs and data URIs are already final.
	if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(p)) return p;

	// Only assets that ship inside the theme need rebasing. Uploads
	// (/wp-content/uploads/...) are already correct relative to the site root.
	if (!p.startsWith('/assets/')) return p;

	return `${themeUri() || base}${p}`;
}

/**
 * Where the theme's own files live, or '' off WordPress.
 *
 * Read from the inline wpRest payload first, then from a `data-xo-theme`
 * attribute on <body>. The attribute exists because of a failure mode the
 * bootstrap endpoint cannot cover: speed plugins strip or defer inline
 * <script> tags, and unlike edit mode — which can wait for an async fetch —
 * an <img src> is resolved the moment it renders. A plain HTML attribute is
 * not something a script optimiser touches, so it survives.
 * @returns {string}
 */
function themeUri() {
	const fromPayload = wpRest().themeUri;
	if (fromPayload) return fromPayload;
	if (typeof document === 'undefined') return '';
	return document.body?.dataset?.xoTheme ?? '';
}

/**
 * Media Library URLs are stored root-relative so they survive a domain or
 * protocol change (staging → live, http → https). Mirrors the same
 * normalisation in the theme's save-page-data handler.
 * @param {string} url
 */
export function normalizeUploadUrl(url) {
	const u = String(url ?? '').trim();
	const match = u.match(/^https?:\/\/[^/]+(\/wp-content\/uploads\/.*)$/i);
	return match ? match[1] : u;
}
