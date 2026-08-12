/* =============================================================================
   Legacy Wix URL → new URL map, for 301s at DNS cutover.

   Consumed by scripts/build-wordpress-theme.mjs, which compiles it into
   functions.php. This file is the canonical record — edit it here, never in the
   generated PHP.

   WHY THIS EXISTS (plan §5 Q4, answered 2026-08-12: /blog is a real
   WordPress-backed route). The old site ran an active Wix blog — 12 posts, 11
   of them Chinese-language Flushing local-SEO articles, two still being updated
   as recently as 2026-07-29. On 2026-08-12 all 12 were MIGRATED into WordPress
   as real posts (original slugs, dates, featured images, and Yoast SEO
   title/description synced from the Wix head), so every legacy post URL now
   301s 1:1 to its own imported post rather than to a topical stand-in.

   SCOPE. Only three kinds of URL need mapping, because everything else already
   matches: `/menu`, `/company`, `/press`, `/privacy-policy`,
   `/terms-and-conditions` and `/` are the same paths on the new site — that is
   the "301 parity" the routes were deliberately built to preserve.

   TARGETS are written PERCENT-ENCODED, exactly as WordPress stored each
   post_name — not decoded Han characters — because wp_redirect() runs
   wp_sanitize_redirect(), which strips raw non-ASCII from the location. The
   encoded form is also the canonical WordPress permalink. Two slugs differ
   from their Wix originals, both by WordPress's own sanitize_title():
     • `法拉盛nón-lá-越南河粉` — the accented ó is folded to `non-la`.
     • `法拉盛好吃的越南粉推荐！品尝正宗河粉的美食餐馆` — percent-encoded it
       overflows post_name's 200 bytes, so WP truncated the final 馆 (the cut
       is on a character boundary; utf8_uri_encode does that deliberately).

   The URL list was read off the live sitemap on 2026-08-12 — and that stops
   being possible at cutover, which is the reason it is committed here rather
   than referenced. The imported posts' slugs were read back from the live DB
   the same day.
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

	// ---- the 12 posts, each 301ing to its imported WordPress copy ----------
	// The one English post, and the site's strongest single SEO asset.
	'post/best-pho-in-flushing-queens': '/blog/best-pho-in-flushing-queens/',

	'post/法拉盛nón-lá-越南河粉':
		'/blog/%e6%b3%95%e6%8b%89%e7%9b%9bnon-la-%e8%b6%8a%e5%8d%97%e6%b2%b3%e7%b2%89/',
	'post/法拉盛好吃的越南粉推荐-品尝正宗河粉的美食餐馆':
		'/blog/%e6%b3%95%e6%8b%89%e7%9b%9b%e5%a5%bd%e5%90%83%e7%9a%84%e8%b6%8a%e5%8d%97%e7%b2%89%e6%8e%a8%e8%8d%90-%e5%93%81%e5%b0%9d%e6%ad%a3%e5%ae%97%e6%b2%b3%e7%b2%89%e7%9a%84%e7%be%8e%e9%a3%9f%e9%a4%90%e9%a6%86/',
	// NB: target is the TRUNCATED slug (WP dropped the trailing 馆, see header).
	'post/法拉盛好吃的越南粉推荐！品尝正宗河粉的美食餐馆':
		'/blog/%e6%b3%95%e6%8b%89%e7%9b%9b%e5%a5%bd%e5%90%83%e7%9a%84%e8%b6%8a%e5%8d%97%e7%b2%89%e6%8e%a8%e8%8d%90%ef%bc%81%e5%93%81%e5%b0%9d%e6%ad%a3%e5%ae%97%e6%b2%b3%e7%b2%89%e7%9a%84%e7%be%8e%e9%a3%9f%e9%a4%90/',
	'post/法拉盛的美味越南河粉':
		'/blog/%e6%b3%95%e6%8b%89%e7%9b%9b%e7%9a%84%e7%be%8e%e5%91%b3%e8%b6%8a%e5%8d%97%e6%b2%b3%e7%b2%89/',
	'post/法拉盛好吃的粉与面-法拉盛河粉和中餐美食指南':
		'/blog/%e6%b3%95%e6%8b%89%e7%9b%9b%e5%a5%bd%e5%90%83%e7%9a%84%e7%b2%89%e4%b8%8e%e9%9d%a2-%e6%b3%95%e6%8b%89%e7%9b%9b%e6%b2%b3%e7%b2%89%e5%92%8c%e4%b8%ad%e9%a4%90%e7%be%8e%e9%a3%9f%e6%8c%87%e5%8d%97/',
	'post/附近美味的扁米粉':
		'/blog/%e9%99%84%e8%bf%91%e7%be%8e%e5%91%b3%e7%9a%84%e6%89%81%e7%b1%b3%e7%b2%89/',
	'post/法拉盛越南河粉推荐':
		'/blog/%e6%b3%95%e6%8b%89%e7%9b%9b%e8%b6%8a%e5%8d%97%e6%b2%b3%e7%b2%89%e6%8e%a8%e8%8d%90/',
	'post/法拉盛的美味面条-最佳用餐地点':
		'/blog/%e6%b3%95%e6%8b%89%e7%9b%9b%e7%9a%84%e7%be%8e%e5%91%b3%e9%9d%a2%e6%9d%a1-%e6%9c%80%e4%bd%b3%e7%94%a8%e9%a4%90%e5%9c%b0%e7%82%b9/',
	'post/法拉盛的美味米線':
		'/blog/%e6%b3%95%e6%8b%89%e7%9b%9b%e7%9a%84%e7%be%8e%e5%91%b3%e7%b1%b3%e7%b7%9a/',
	'post/法拉盛最佳美食地點：美食愛好者的簡單指南':
		'/blog/%e6%b3%95%e6%8b%89%e7%9b%9b%e6%9c%80%e4%bd%b3%e7%be%8e%e9%a3%9f%e5%9c%b0%e9%bb%9e%ef%bc%9a%e7%be%8e%e9%a3%9f%e6%84%9b%e5%a5%bd%e8%80%85%e7%9a%84%e7%b0%a1%e5%96%ae%e6%8c%87%e5%8d%97/',
	'post/正宗中國美食-你會愛上的美味中餐':
		'/blog/%e6%ad%a3%e5%ae%97%e4%b8%ad%e5%9c%8b%e7%be%8e%e9%a3%9f-%e4%bd%a0%e6%9c%83%e6%84%9b%e4%b8%8a%e7%9a%84%e7%be%8e%e5%91%b3%e4%b8%ad%e9%a4%90/'
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
 *
 * Target is /blog/ (not /menu/) since 2026-08-12: with the posts migrated, the
 * blog index — which lists every one of them — is the honest home for a post
 * URL we failed to match exactly.
 */
export const POST_PREFIX_FALLBACK = { prefix: 'post/', target: '/blog/' };
