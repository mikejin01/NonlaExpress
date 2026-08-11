/* =============================================================================
   The WordPress side of the bridge — everything that touches `window.wpRest`.

   `wpRest` is the payload functions.php prints into <head> (and also serves
   from GET /wp-json/wp-theme/v1/bootstrap, for the day a speed plugin decides
   to strip inline scripts). Outside WordPress — `pnpm dev`, the GitHub Pages
   build — none of this exists and every helper degrades to a sane default, so
   the same components run in both places.
   ============================================================================= */

/** @typedef {{
 *   root?: string, nonce?: string, postId?: number, isLoggedIn?: boolean,
 *   themeUri?: string, pageData?: Record<string, string>,
 *   rawPageData?: Record<string, string> | null,
 *   routeOverrides?: Record<string, Record<string, string>>
 * }} WpRest */

/** The payload WordPress handed us, or an empty object off-WordPress. */
export function wpRest() {
	if (typeof window === 'undefined') return /** @type {WpRest} */ ({});
	return /** @type {WpRest} */ (/** @type {any} */ (window).wpRest ?? {});
}

/** True when the app is running inside the WordPress theme. */
export function underWordPress() {
	if (typeof window === 'undefined') return false;
	return Boolean(/** @type {any} */ (window).wpRest) || Boolean(document.getElementById('wpadminbar'));
}

/** Base for REST calls. Falls back to a same-origin /wp-json/ guess. */
export function restRoot() {
	const root = wpRest().root;
	return root && root.endsWith('/') ? root : root ? `${root}/` : '/wp-json/';
}

/**
 * Route key for per-route content overrides. Must match
 * `xo_normalize_route_key()` in the generated functions.php: leading slash,
 * no trailing slash except for the root.
 * @param {string} [path]
 */
export function routeKey(path) {
	let p = (path ?? (typeof location !== 'undefined' ? location.pathname : '/')).split('?')[0];
	if (!p) return '/';
	if (p[0] !== '/') p = `/${p}`;
	if (p.length > 1) p = p.replace(/\/+$/, '') || '/';
	return p;
}

/**
 * A logged-in WordPress user is anyone who can edit posts. Read it four ways:
 * a cached page can lose the inline payload while the admin bar survives, and
 * vice versa.
 */
export function detectLoggedIn() {
	if (typeof document === 'undefined') return false;
	return Boolean(
		wpRest().isLoggedIn ||
			document.body.classList.contains('logged-in') ||
			document.body.classList.contains('admin-bar') ||
			document.getElementById('wpadminbar')
	);
}

/** `tel:` href built from whatever the live phone number happens to be. */
export function telHref(phone) {
	const digits = String(phone ?? '').replace(/[^\d+]/g, '');
	if (!digits) return 'tel:';
	if (digits.startsWith('+')) return `tel:${digits}`;
	return `tel:${digits.length === 10 ? `+1${digits}` : digits}`;
}

/** `mailto:` href for the live email address. */
export function mailHref(email) {
	return `mailto:${String(email ?? '').trim()}`;
}
