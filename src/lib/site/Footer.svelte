<script>
	/**
	 * Footer — the original's closing slab (plan §1.3 item 8), rebuilt in Phase C:
	 * the ARC rising out of the page, then a centred stacked logo + SEO
	 * paragraph, the cream NEWSLETTER panel (moved here from the homepage, where
	 * the original has never had it), link columns, address and the © line.
	 *
	 * Shared by every route, so the arc has to work on any surface above it.
	 */
	import { base } from '$app/paths';
	import Logo from './Logo.svelte';
	import { ADDRESS, PHONE, ORDER_URL, SOCIAL, SEO_BLURB, NEWSLETTER_PITCH } from '$lib/content.js';

	const year = new Date().getFullYear();

	let email = $state('');
	let subscribed = $state(false);
	function subscribe(e) {
		e.preventDefault();
		// TODO: wire to the chosen newsletter provider before launch (brief §5).
		if (email.trim()) subscribed = true;
	}
</script>

<footer class="site-footer on-green-deep">
	<!-- §1.5 M2. A plain circle, horizontally centred, ~2.5 viewport widths
	     across, whose top cap becomes the footer's curved edge — the footer
	     paints no background of its own, the arc IS the footer's surface. Phase
	     C2 scrubs `width` from 120vw to 255vw on the footer's view progress; at
	     rest it sits at full size, which is what an unsupporting browser gets
	     and still looks right. The hairline is what keeps a --green-deep dome
	     legible against the --green-surface ground (they are one ladder step
	     apart) — the same trick the old hero curve used. -->
	<div class="arc" aria-hidden="true"></div>

	<div class="container container--lg footer-body">
		<div class="footer-head">
			<a href="{base}/" rel="home" class="footer-logo"><Logo variant="v" width="clamp(150px, 16vw, 210px)" /></a>
			<p class="footer-blurb">{SEO_BLURB}</p>
		</div>

		<section class="newsletter on-cream" id="newsletter" aria-labelledby="newsletter-title">
			<h2 class="newsletter-title" id="newsletter-title">Subscribe to our newsletter</h2>
			<p class="newsletter-pitch">{NEWSLETTER_PITCH}</p>
			{#if subscribed}
				<p class="subscribed-msg">Thank you — you're on the list.</p>
			{:else}
				<form class="mail-form" onsubmit={subscribe}>
					<input
						type="email"
						bind:value={email}
						placeholder="Email address"
						required
						aria-label="Email address"
					/>
					<button class="btn btn-primary">Submit</button>
				</form>
			{/if}
			<p class="consent">
				By signing up, I agree to Nón Lá Express's
				<a href="{base}/terms-and-conditions/">Terms</a> and
				<a href="{base}/privacy-policy/">Privacy Policy</a>.
			</p>
		</section>

		<div class="footer-row">
			<div class="f-col-menu">
				<span class="footer-label">Visit</span>
				<ul>
					<li><a href="{base}/menu/">Menu</a></li>
					<li><a href={ORDER_URL} target="_blank" rel="noopener">Order Online</a></li>
					<li><a href="{base}/#find-us">Find Us</a></li>
				</ul>
			</div>
			<div class="f-col-menu">
				<span class="footer-label">Company</span>
				<ul>
					<li><a href="{base}/company/">About</a></li>
					<li><a href="{base}/press/">Press</a></li>
					<li><a href={PHONE.tel}>{PHONE.display}</a></li>
				</ul>
			</div>
			<div class="f-col-menu">
				<span class="footer-label">Follow</span>
				<ul>
					<li><a href={SOCIAL.instagram.url} target="_blank" rel="noopener">Instagram {SOCIAL.instagram.label}</a></li>
					<li><a href={SOCIAL.yelp.url} target="_blank" rel="noopener">Yelp</a></li>
				</ul>
			</div>
			<div class="f-col-menu">
				<span class="footer-label">Find Us</span>
				<address class="footer-address">
					{#each ADDRESS.lines as line}{line}<br />{/each}
				</address>
			</div>
		</div>

		<div class="footer-legal">
			<p class="copyright">© {year} Nón Lá Express. All rights reserved.</p>
			<ul class="footer-links">
				<li><a href="{base}/privacy-policy/">Privacy</a></li>
				<li><a href="{base}/terms-and-conditions/">Terms</a></li>
				<li><a href="{base}/accessibility-statement/">Accessibility</a></li>
			</ul>
		</div>
	</div>
</footer>

<style>
	/* --arc-rise is the dome's depth: for a circle 2.55 viewports wide the top
	   cap drops ≈10.2vw from centre to edge, so that is how much clear space the
	   content needs above it. Both the padding and the arc read the one value. */
	.site-footer {
		--arc-rise: 10.2vw;
		position: relative;
		overflow: hidden; /* clips a 255vw circle — without this it is horizontal scroll */
		background: transparent; /* .on-green-deep would paint a square slab; the arc paints instead */
		padding: calc(var(--arc-rise) + var(--u) * 2.5) 0 calc(var(--u) * 3);
	}
	.arc {
		position: absolute;
		top: 0;
		left: 50%;
		width: 255vw;
		aspect-ratio: 1;
		transform: translateX(-50%);
		border-radius: 50%;
		background: var(--green-deep);
		/* The ring is the THIRD COLOUR's biggest moment (plan §1.2d). It began
		   as a --sand-3 hairline, which existed only because a --green-deep
		   dome on a green ground was one ladder step and read as nothing. On
		   the cream page the dome separates on its own, so the ring is now
		   purely a brand line — terracotta, echoing the original site's red
		   arc, and rhyming with the hero curve's hairline at the top of the
		   page. Decorative, so terracotta's 3.88:1 does not apply. */
		border: 2px solid var(--terracotta);
		z-index: 0;
	}
	.footer-body {
		position: relative;
		z-index: 1;
	}

	.footer-head {
		text-align: center;
	}
	.footer-logo {
		display: inline-block;
		color: var(--fg);
		text-decoration: none;
	}
	.footer-blurb {
		margin: 1.4rem auto 0;
		font-size: var(--fs-fine);
		line-height: 1.8;
		color: var(--fg-dim);
		max-width: 62ch;
	}

	/* The original's cream panel on the statement colour, radius 16px, with the
	   heading in the WORKHORSE serif at 105px — not the display face (§1.1). */
	.newsletter {
		margin: clamp(2.5rem, 6vw, 5rem) auto 0;
		max-width: 62rem;
		border-radius: 16px;
		padding: clamp(1.8rem, 5vw, 3.5rem);
	}
	.newsletter-title {
		font-size: var(--fs-xl);
		line-height: 1.05;
		margin: 0 0 1.6rem;
		color: var(--fg);
	}
	.newsletter-pitch {
		font-size: var(--fs-lead);
		color: var(--fg-muted);
		margin: 0 0 1.6rem;
		max-width: 46ch;
	}
	.mail-form {
		display: flex;
		align-items: stretch;
		gap: 12px;
		max-width: 34rem;
	}
	.mail-form input {
		flex: 1;
		width: 100%;
		outline: none;
		background: var(--cream-lift);
		border: 1.5px solid rgba(26, 22, 19, 0.28);
		border-radius: 50px;
		font-size: 1.0625rem;
		color: var(--ink);
		font-family: var(--body-font);
		padding: 12px 22px;
		transition:
			border-color 0.4s ease,
			box-shadow 0.2s ease;
	}
	.mail-form input:focus {
		border-color: var(--green);
		box-shadow: 0 0 0 3px rgba(27, 110, 82, 0.28);
	}
	.mail-form input::placeholder {
		color: rgba(26, 22, 19, 0.55);
	}
	.mail-form .btn {
		flex: none;
	}
	.subscribed-msg {
		font-size: var(--fs-lead);
		margin: 0;
	}
	.consent {
		margin: 1.4rem 0 0;
		font-size: var(--fs-fine);
		color: var(--fg-dim);
	}
	.consent a {
		color: var(--accent-ink);
	}
	@media (max-width: 575.98px) {
		.mail-form {
			flex-direction: column;
			align-items: stretch;
		}
	}

	.footer-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.25rem;
		margin-top: clamp(2.5rem, 6vw, 4.5rem);
		text-align: center;
		justify-items: center;
	}
	@media (min-width: 768px) {
		.footer-row {
			grid-template-columns: repeat(4, 1fr);
			gap: 2rem;
			text-align: left;
			justify-items: start;
		}
	}
	.footer-label {
		display: block;
		font-family: var(--label);
		font-weight: 700;
		font-size: 11.5px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--accent-ink);
		margin-bottom: 1rem;
	}
	.f-col-menu ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.f-col-menu li {
		line-height: 2.3;
	}
	.f-col-menu a {
		font-family: var(--body-font);
		font-size: 1rem;
		color: var(--fg-muted);
		text-decoration: none;
		transition: color 0.2s ease;
	}
	.f-col-menu a:hover {
		color: var(--fg);
	}
	.footer-address {
		font-style: normal;
		font-size: 0.9375rem;
		line-height: 1.9;
		color: var(--fg-dim);
	}
	.footer-legal {
		margin-top: calc(var(--u) * 3);
		padding-top: 1.5rem;
		border-top: 1px solid var(--rule);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-items: center;
		text-align: center;
	}
	@media (min-width: 992px) {
		.footer-legal {
			flex-direction: row;
			justify-content: space-between;
			text-align: left;
		}
	}
	.copyright {
		font-size: var(--fs-fine);
		color: var(--fg-dim);
		margin: 0;
	}
	.footer-links {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin: 0;
		padding: 0;
		gap: 0.35rem 1.25rem;
	}
	.footer-links a {
		color: var(--fg-dim);
		font-size: var(--fs-fine);
		text-decoration: none;
		transition: color 0.2s ease;
	}
	.footer-links a:hover {
		color: var(--fg);
	}
</style>
