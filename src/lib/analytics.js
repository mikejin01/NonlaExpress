/* =============================================================================
   GA4 events, sent through the gtag() that the Site Kit plugin prints in
   <head> (Google tag GT-KTRCDZ45 → G-YRYJR0DFFH). Site Kit leaves the tag out
   for logged-in WordPress users, and the GitHub Pages build has no tag at all,
   so every call here is a no-op there — test analytics logged out, on the
   WordPress site. Agency playbook: docs/GA4-EVENT-TRACKING-PLAYBOOK.md.

   Key events in GA4 — do not rename, GA4 matches them by name:

     order_online            a click to an ordering platform (Snackpass today)
     click_to_call           a tap on any tel: link
     get_directions          a click on a map link
     click_to_email          a click on any mailto: link
     newsletter_form_start   first typing in the footer newsletter form
     newsletter_form_submit  a signup the lead endpoint accepted

   Plain events (reporting only):

     social_click            Instagram / Yelp / Facebook / TikTok
     cta_click               any other .btn link — which buttons move people
     form_error              a newsletter submit blocked or refused

   link_location says where the click was: header, menu (mobile panel), hero,
   find_us, page or footer. A wrapper can name its own with
   data-link-location.

   newsletter_form_start replaces GA4's automatic form_start (enhanced
   measurement "Form interactions"), and click_to_call replaces Site Kit's
   contact_link_click (its "Plugin conversion tracking"). Both of those are
   meant to be switched off, so each action sends one event.
   ============================================================================= */

/** @param {string} name @param {Record<string, unknown>} [params] */
function track(name, params = {}) {
	if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

/** Visible text without decorative arrows, cut to GA4's 100-character limit. */
const clip = (/** @type {string} */ text) =>
	text.replace(/[↗→›»]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);

function linkLocation(/** @type {Element} */ el) {
	const tagged = el.closest('[data-link-location]')?.getAttribute('data-link-location');
	if (tagged) return tagged;
	if (el.closest('.mobile-panel')) return 'menu';
	if (el.closest('.navbar')) return 'header';
	if (el.closest('footer')) return 'footer';
	return 'page';
}

const MAP_LINK = /(^geo:)|google\.[^/]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.apple\.com|waze\.com/i;

// The order URL is editable in X.O. Admin, so match the platform, not today's
// link. A platform missing here falls through to cta_click.
const ORDER_PLATFORMS = /** @type {const} */ ([
	['snackpass', /(^|\.)snackpass\.co$/],
	['grubhub', /(^|\.)grubhub\.com$/],
	['seamless', /(^|\.)seamless\.com$/],
	['ubereats', /(^|\.)ubereats\.com$/],
	['doordash', /(^|\.)doordash\.com$/],
	['toast', /(^|\.)toasttab\.com$/],
	['chownow', /(^|\.)chownow\.com$/]
]);
const SOCIAL_PLATFORMS = /** @type {const} */ ([
	['instagram', /(^|\.)instagram\.com$/],
	['yelp', /(^|\.)yelp\.com$/],
	['facebook', /(^|\.)facebook\.com$/],
	['tiktok', /(^|\.)tiktok\.com$/]
]);

/** @param {string} host @param {ReadonlyArray<readonly [string, RegExp]>} list */
const platformOf = (host, list) => list.find(([, re]) => re.test(host))?.[0];

/**
 * Run once. One delegated listener covers every link, including ones editors
 * add or re-point later through inline editing and the blog's post bodies.
 */
export function trackClicks() {
	document.addEventListener(
		'click',
		(event) => {
			const a = event.target instanceof Element ? event.target.closest('a[href]') : null;
			if (!a) return;
			const href = a.getAttribute('href') ?? '';
			const link_location = linkLocation(a);
			/** @type {string | undefined} */
			let host;
			try {
				host = new URL(href, location.href).hostname;
			} catch {
				// not a URL — tel:, mailto: and map links are still handled below
			}

			if (href.startsWith('tel:')) track('click_to_call', { link_location });
			else if (href.startsWith('mailto:')) track('click_to_email', { link_location });
			else if (MAP_LINK.test(href)) track('get_directions', { link_location });
			else if (host && platformOf(host, ORDER_PLATFORMS)) {
				track('order_online', { platform: platformOf(host, ORDER_PLATFORMS), link_location });
			} else if (host && platformOf(host, SOCIAL_PLATFORMS)) {
				track('social_click', { platform: platformOf(host, SOCIAL_PLATFORMS), link_location });
			} else if (a.classList.contains('btn')) {
				track('cta_click', { link_location, cta_text: clip(a.textContent ?? ''), cta_destination: href });
			}
		},
		// Capture phase: runs before the SvelteKit router takes over the click.
		{ capture: true }
	);
}

/**
 * One form's start/submit pair. `start` fires once per form shown, on the
 * first real input — focus alone sends nothing.
 * @param {string} formName
 * @param {string} prefix event name prefix, e.g. 'newsletter_form'
 */
export function formTracker(formName, prefix) {
	let started = false;
	return {
		start() {
			if (started) return;
			started = true;
			track(`${prefix}_start`, { form_name: formName });
		},
		/** Call only after the server accepted the submission. */
		submitted() {
			track(`${prefix}_submit`, { form_name: formName });
		},
		/** @param {'validation' | 'server'} type @param {string} detail */
		failed(type, detail) {
			track('form_error', { form_name: formName, error_type: type, error_detail: clip(detail) });
		}
	};
}
