/* =============================================================================
   Form submission, with a working path on every host this site runs on.

     WordPress  → POST /wp-json/xo/v1/lead → saved under Leads and emailed to
                  the address set in X.O. Admin.
     Static     → no backend exists (GitHub Pages), so the caller is told so
                  rather than being handed a fake success it can't distinguish.

   The endpoint takes two shapes, tagged by `kind`. A newsletter signup carries
   an email and nothing else — see xo_rest_handle_lead() in the generated
   functions.php, which relaxes the name requirement for that kind and dedupes
   repeat signups instead of filing each one as a new lead.
   ============================================================================= */

import { restRoot, underWordPress } from './client.js';

/** True when the WordPress lead endpoint is the right destination. */
export const wordPressAvailable = () => underWordPress();

/**
 * POST one submission to WordPress.
 * @param {{ kind?: 'newsletter'|'contact', email: string, name?: string,
 *           phone?: string, message?: string, company?: string }} lead
 * @returns {Promise<{ ok: boolean, message?: string, duplicate?: boolean }>}
 */
export async function submitLead(lead) {
	try {
		const response = await fetch(`${restRoot()}xo/v1/lead`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				kind: lead.kind ?? 'contact',
				name: lead.name ?? '',
				email: lead.email,
				phone: lead.phone ?? '',
				message: lead.message ?? '',
				page: location.pathname,
				// Honeypot — only bots fill this in. The server returns success
				// either way so they get no signal from the difference.
				company: lead.company ?? ''
			})
		});
		const result = await response.json().catch(() => ({}));
		if (!response.ok || result?.success === false) {
			return { ok: false, message: result?.message || `Request failed (${response.status})` };
		}
		return { ok: true, duplicate: Boolean(result?.duplicate) };
	} catch {
		// Offline, DNS failure, a blocked request — anything that never reached
		// WordPress. Worth distinguishing from a 400: the address was probably fine.
		return { ok: false, message: 'Could not reach the server. Please try again.' };
	}
}

/**
 * Subscribe an address to the newsletter.
 * @param {string} email
 * @param {string} [company] honeypot value
 */
export function submitNewsletter(email, company = '') {
	return submitLead({ kind: 'newsletter', email: String(email ?? '').trim(), company });
}
