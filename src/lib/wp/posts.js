/* =============================================================================
   Blog posts, read from WordPress at runtime.

   The posts live in the WordPress database and are written in the dashboard, so
   NOTHING here can be baked in at build time — that is the same rule the whole
   WP_BUILD shape runs on (see src/routes/+layout.js).

   ⚠️ OFF WORDPRESS THERE ARE NO POSTS, AND THAT IS NOT AN ERROR. `pnpm dev` and
   the GitHub Pages build have no WordPress behind them, so every call here
   resolves to an empty result and the routes render their empty state. Pages is
   a secondary target; WordPress is where the blog is published and read.
   ============================================================================= */

import { restRoot, underWordPress } from './client.js';

/** @typedef {{
 *   id: number, slug: string, title: string, date: string, dateISO: string,
 *   url: string, image: string, imageAlt: string, excerpt: string,
 *   content?: string
 * }} Post */

const NS = 'xo/v1';

/** Empty index result, so callers never branch on null. */
const EMPTY = { posts: /** @type {Post[]} */ ([]), total: 0, pages: 0, page: 1 };

/**
 * @param {string} query
 * @returns {Promise<any|null>} null when there is no WordPress, or it said no.
 */
async function get(query) {
	if (!underWordPress()) return null;
	try {
		const res = await fetch(`${restRoot()}${NS}/posts${query}`, {
			headers: { Accept: 'application/json' },
			credentials: 'same-origin'
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		// A blog that cannot reach the API renders its empty state. It must never
		// take the route down — this is one section of a restaurant site.
		return null;
	}
}

/**
 * One page of the index. Posts carry no `content`.
 * @param {{page?: number, perPage?: number}} [opts]
 */
export async function fetchPosts(opts = {}) {
	const page = opts.page ?? 1;
	const perPage = opts.perPage ?? 12;
	const data = await get(`?page=${page}&per_page=${perPage}`);
	if (!data || !Array.isArray(data.posts)) return { ...EMPTY, page };
	return {
		posts: /** @type {Post[]} */ (data.posts),
		total: Number(data.total) || 0,
		pages: Number(data.pages) || 0,
		page: Number(data.page) || page
	};
}

/**
 * A single post by slug, WITH rendered content.
 * @param {string} slug
 * @returns {Promise<Post|null>} null when missing — the route shows "not found".
 */
export async function fetchPost(slug) {
	if (!slug) return null;
	const data = await get(`?slug=${encodeURIComponent(slug)}`);
	return data && data.post ? /** @type {Post} */ (data.post) : null;
}
