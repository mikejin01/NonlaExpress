/* =============================================================================
   Legacy Wix URL → new URL map, for 301s at DNS cutover.

   Consumed by scripts/build-wordpress-theme.mjs, which compiles it into
   functions.php. This file is the canonical record — edit it here, never in the
   generated PHP.

   WHY THIS EXISTS (plan §5 Q4, answered 2026-08-12: keep PRESS, retire the
   blog). The old site ran an active Wix blog — 12 posts, 11 of them
   Chinese-language Flushing local-SEO articles, two still being updated as
   recently as 2026-07-29. Retiring it without redirects would 404 every one of
   them and throw away the local-search work they were doing.

   SCOPE. Only three kinds of URL need mapping, because everything else already
   matches: `/menu`, `/company`, `/press`, `/privacy-policy`,
   `/terms-and-conditions` and `/` are the same paths on the new site — that is
   the "301 parity" the routes were deliberately built to preserve.

   TARGETS. Not everything goes to `/`. Google treats a mass redirect to the
   homepage as a soft 404 and drops the ranking, so each post points at the page
   that actually covers its topic: the phở / noodle guides go to `/menu/`, which
   already carries the 法拉盛越南河粉菜单 copy and the bilingual dish names, and
   only the genuinely general "best food in Flushing" pieces go to `/`.

   The URL list was read off the live sitemap on 2026-08-12 — and that stops
   being possible at cutover, which is the reason it is committed here rather
   than referenced.
   ============================================================================= */

/** Wix slug (no leading slash, percent-DECODED) → path on the new site. */
export const LEGACY_REDIRECTS = {
	// ⚠️ `/blog` is deliberately NOT in this map. It was, while the blog was
	// being retired; the decision reversed on 2026-08-12 and /blog is now a real
	// route again, backed by WordPress posts. Re-adding it would 301 the live
	// blog index away. (The is_404() guard means it would in fact stand aside,
	// but do not rely on that — just don't list a live route here.)
	//
	// `/press` is the reverse: it WAS our route and is now retired in favour of
	// /blog/, so it redirects. It was also a real URL on the old Wix site, which
	// makes this a genuine legacy 301 rather than only an internal tidy-up.
	'press': '/blog/',

	// A Wix internal page that was in the sitemap. Nothing to preserve.
	'tracker-page': '/',

	// ---- the 12 posts ------------------------------------------------------
	// The one English post, and the site's strongest single SEO asset.
	'post/best-pho-in-flushing-queens': '/menu/',

	// Phở / noodle guides → the menu.
	'post/法拉盛好吃的越南粉推荐-品尝正宗河粉的美食餐馆': '/menu/',
	'post/法拉盛好吃的越南粉推荐！品尝正宗河粉的美食餐馆': '/menu/',
	'post/法拉盛的美味越南河粉': '/menu/',
	'post/法拉盛好吃的粉与面-法拉盛河粉和中餐美食指南': '/menu/',
	'post/附近美味的扁米粉': '/menu/',
	'post/法拉盛越南河粉推荐': '/menu/',
	'post/法拉盛的美味面条-最佳用餐地点': '/menu/',
	'post/法拉盛的美味米線': '/menu/',

	// Brand-named and general-interest pieces → the homepage.
	'post/法拉盛nón-lá-越南河粉': '/',
	'post/法拉盛最佳美食地點：美食愛好者的簡單指南': '/',
	'post/正宗中國美食-你會愛上的美味中餐': '/'
};

/**
 * Anything under /post/ that is not in the map above.
 *
 * This is not laziness, it is the encoding safety net. Those slugs carry Han
 * characters, a fullwidth colon, a fullwidth exclamation mark and an accented
 * `ó` — so a request can arrive percent-encoded, in NFC or in NFD, and an exact
 * string match is one normalisation away from silently missing. A prefix
 * fallback also covers any post that was published after this list was read, or
 * that never made it into the sitemap.
 */
export const POST_PREFIX_FALLBACK = { prefix: 'post/', target: '/menu/' };
