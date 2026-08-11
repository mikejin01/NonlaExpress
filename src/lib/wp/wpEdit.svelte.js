/* =============================================================================
   Live-edit state — the Svelte 5 runes mirror of the React `WPEditProvider`.

   One shared instance drives every editable primitive on the page. Import it
   anywhere; there is no context to thread through.

     import { wpEdit } from '$lib/wp/wpEdit.svelte.js';
     wpEdit.text('hero_lead', HERO.lead)

   CONTENT RESOLUTION ORDER (highest wins):

     1. draft[key]              unsaved edits in this browser session
     2. routeOverrides[route]   per-route edits saved on the live site
     3. pageData[key]           post meta + xo_global_* options from the WP DB
     4. localOverrides[key]     src/lib/content-overrides.json (make pull-content)
     5. the default passed in   src/lib/content.js

   Layers 2–3 exist only inside WordPress. Layer 4 is how live edits reach the
   local codebase and the GitHub Pages build — see `make pull-content`.
   ============================================================================= */

import localOverrides from '$lib/content-overrides.json';
import { detectLoggedIn, restRoot, routeKey, wpRest } from './client.js';
import { normalizeUploadUrl } from './assets.js';

/** Content keys ending in these suffixes hold image URLs, not prose. */
const IMAGE_KEY = /(_img|_photo|_image|_logo|_mark)$/;

class WPEdit {
	/** Any WordPress user who can edit posts — controls whether the toolbar shows. */
	isLoggedIn = $state(false);
	/** Edit mode on/off. */
	isEditing = $state(false);
	/** Unsaved edits, keyed by content key. */
	draft = $state(/** @type {Record<string, string>} */ ({}));
	/** Placeholder-resolved content from the WP database. */
	pageData = $state(/** @type {Record<string, string>} */ ({}));
	/** The same content with `{{TOKENS}}` intact, for editing. */
	rawPageData = $state(/** @type {Record<string, string>} */ ({}));
	/** Per-route saved edits, `{ '/': { key: value } }`. */
	routeOverrides = $state(/** @type {Record<string, Record<string, string>>} */ ({}));
	/** 'idle' | 'saving' | 'saved' | 'error' */
	status = $state('idle');
	/** Human-readable result of the last save. */
	message = $state('');

	/** Code defaults for the global_* keys, supplied by init(). */
	#globalDefaults = /** @type {Record<string, string>} */ ({});
	#started = false;

	get dirtyCount() {
		return Object.keys(this.draft).length;
	}

	/**
	 * Code defaults for the `global_*` keys, backing the {{TOKEN}} resolver.
	 * Call this from the root layout's script body, NOT from onMount: it has to
	 * run during prerendering too, or the static build ships a page with every
	 * token resolved to an empty string.
	 * @param {Record<string, string>} globals
	 */
	setGlobals(globals) {
		this.#globalDefaults = globals;
	}

	/** Call once, from onMount in the root layout. Browser-only work. */
	async init() {
		if (this.#started) return;
		this.#started = true;

		this.#absorb(wpRest());
		this.isLoggedIn = detectLoggedIn();

		// Speed plugins sometimes strip or defer inline <script> output, which
		// takes window.wpRest with it and silently kills edit mode. If the
		// payload is missing on a page WordPress clearly served, go fetch it.
		if (!wpRest().root && this.#looksLikeWordPress()) {
			await this.#fetchBootstrap();
		}

		// The bootstrap endpoint is public, so it cannot mint a nonce: a REST
		// request without one is unauthenticated by design. admin-ajax.php does
		// authenticate from the cookie, so that is where a stripped-payload
		// editor gets a working nonce back.
		if (this.isLoggedIn && !wpRest().nonce) {
			await this.#fetchEditContext();
		}
	}

	/** Resolved text for a content key. This is what the site renders. */
	text(/** @type {string} */ key, /** @type {string} */ fallback = '') {
		return this.resolve(this.#lookup(key, fallback, this.pageData));
	}

	/** Unresolved text — `{{TOKENS}}` intact — for editing UI. */
	raw(/** @type {string} */ key, /** @type {string} */ fallback = '') {
		return this.#lookup(key, fallback, this.rawPageData);
	}

	/**
	 * Substitute `{{TOKENS}}` from the global business details.
	 * Idempotent: resolved text contains no tokens, so re-running is a no-op.
	 * @param {string} value
	 */
	resolve(value) {
		const str = String(value ?? '');
		if (!str.includes('{{')) return str;
		const map = this.#tokens();
		return str.replace(/\{\{([A-Z_]+)\}\}/g, (whole, token) => map[token] ?? whole);
	}

	/** Stage an edit. Nothing is persisted until save(). */
	updateDraft(/** @type {string} */ key, /** @type {string} */ value) {
		const next = IMAGE_KEY.test(key) ? normalizeUploadUrl(value) : value;
		if (this.raw(key, '') === next) return;
		this.draft = { ...this.draft, [key]: next };
	}

	toggle() {
		if (this.isEditing) this.cancel();
		else {
			this.isEditing = true;
			this.status = 'idle';
			this.message = '';
		}
	}

	cancel() {
		this.draft = {};
		this.isEditing = false;
		this.status = 'idle';
		this.message = '';
	}

	/** POST the whole draft to the theme's save endpoint. */
	async save() {
		if (!this.dirtyCount) {
			this.isEditing = false;
			return;
		}
		const rest = wpRest();
		this.status = 'saving';
		this.message = '';

		try {
			const response = await fetch(`${restRoot()}wp-theme/v1/save-page-data`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
					...(rest.nonce ? { 'X-WP-Nonce': rest.nonce } : {})
				},
				body: JSON.stringify({
					postId: rest.postId ?? 0,
					url: location.href,
					route: routeKey(),
					pageData: this.draft
				})
			});
			const result = await response.json().catch(() => ({}));
			if (!response.ok || result?.success === false) {
				throw new Error(result?.message || `Save failed (${response.status})`);
			}

			// Fold the saved draft into the live layers so the page keeps showing
			// the new values without a reload.
			const route = routeKey();
			const saved = this.draft;
			this.routeOverrides = {
				...this.routeOverrides,
				[route]: { ...(this.routeOverrides[route] ?? {}), ...saved }
			};
			this.pageData = { ...this.pageData, ...saved };
			this.rawPageData = { ...this.rawPageData, ...saved };

			this.draft = {};
			this.isEditing = false;
			this.status = 'saved';
			this.message = result?.message || 'Changes saved.';
		} catch (error) {
			this.status = 'error';
			this.message = error instanceof Error ? error.message : 'Save failed.';
		}
	}

	/* ------------------------------------------------------------- internals */

	/**
	 * Walk the layers, highest first.
	 *
	 * An empty stored value falls through to the next layer rather than
	 * rendering as nothing. That makes blanking a field impossible from the
	 * editor — deliberate, because the far more common case is a value that got
	 * cleared by accident, and a silently empty headline is worse than a stale
	 * one. To really remove a string, delete its key (X.O. Admin → Reset page
	 * content, or `wp option delete xo_route_overrides`).
	 *
	 * @param {string} key
	 * @param {string} fallback
	 * @param {Record<string, string>} dbLayer
	 */
	#lookup(key, fallback, dbLayer) {
		if (key in this.draft) return this.draft[key];

		const override = this.routeOverrides[routeKey()]?.[key];
		if (override !== undefined && override !== '') return override;

		const fromDb = dbLayer[key];
		if (fromDb !== undefined && fromDb !== '') return fromDb;

		const local = /** @type {Record<string, string>} */ (localOverrides)[key];
		if (local !== undefined && local !== '') return local;

		return fallback;
	}

	/** Token → value map, read from the raw layers so resolve() can't recurse. */
	#tokens() {
		const g = (/** @type {string} */ name) =>
			this.#lookup(`global_${name}`, this.#globalDefaults[`global_${name}`] ?? '', this.rawPageData);

		const phone = g('contact_phone');
		const email = g('contact_email');
		const digits = phone.replace(/[^\d+]/g, '');

		return /** @type {Record<string, string>} */ ({
			BUSINESS_NAME: g('business_name'),
			PHONE: phone,
			PHONE_HREF: digits ? `tel:${digits.length === 10 ? `+1${digits}` : digits}` : 'tel:',
			EMAIL: email,
			EMAIL_HREF: `mailto:${email}`,
			ADDRESS: g('contact_address'),
			LOCATION: g('contact_address'),
			CITY_STATE: g('city_state'),
			HOURS: g('contact_hours'),
			SERVICE_AREA: g('service_area')
		});
	}

	/** @param {import('./client.js').WpRest} rest */
	#absorb(rest) {
		if (rest.pageData) this.pageData = rest.pageData;
		if (rest.rawPageData) this.rawPageData = rest.rawPageData;
		else if (rest.pageData) this.rawPageData = rest.pageData;
		if (rest.routeOverrides) this.routeOverrides = rest.routeOverrides;
	}

	/** WordPress served this page even though the inline payload went missing. */
	#looksLikeWordPress() {
		if (typeof document === 'undefined') return false;
		return Boolean(
			document.querySelector('link[rel="https://api.w.org/"]') ||
				document.getElementById('wpadminbar') ||
				document.querySelector('script[src*="/wp-content/themes/"], link[href*="/wp-content/themes/"]')
		);
	}

	async #fetchBootstrap() {
		try {
			const url = `${restRoot()}wp-theme/v1/bootstrap?route=${encodeURIComponent(routeKey())}&url=${encodeURIComponent(location.href)}`;
			const response = await fetch(url, { credentials: 'same-origin' });
			if (!response.ok) return;
			const payload = await response.json();
			if (!payload || typeof payload !== 'object') return;

			/** @type {any} */ (window).wpRest = { ...payload, ...(wpRest() ?? {}) };
			this.#absorb(payload);
			this.isLoggedIn = detectLoggedIn();
		} catch {
			// Offline or endpoint missing: the code defaults are still rendering.
		}
	}

	/** Cookie-authenticated fallback for the nonce + editor-only raw content. */
	async #fetchEditContext() {
		try {
			const response = await fetch('/wp-admin/admin-ajax.php?action=xo_edit_context', {
				credentials: 'same-origin'
			});
			if (!response.ok) return;
			const payload = await response.json();
			if (!payload?.nonce) return;

			/** @type {any} */ (window).wpRest = { ...wpRest(), ...payload };
			this.#absorb(payload);
		} catch {
			// Still editable in the UI, but saving will report the failure.
		}
	}
}

export const wpEdit = new WPEdit();
