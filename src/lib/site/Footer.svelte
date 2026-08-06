<script>
	import { base } from '$app/paths';
	import Logo from './Logo.svelte';
	import { ADDRESS, PHONE, ORDER_URL, SOCIAL, SEO_BLURB } from '$lib/content.js';

	const year = new Date().getFullYear();
</script>

<footer class="site-footer">
	<div class="container container--lg">
		<div class="footer-row">
			<div class="f-col-logo">
				<a href="{base}/" rel="home" class="footer-logo"><Logo variant="v" /></a>
				<p class="footer-blurb">{SEO_BLURB}</p>
			</div>
			<div class="f-col-menu">
				<span class="footer-label">Visit</span>
				<ul>
					<li><a href="{base}/menu/">Menu</a></li>
					<li><a href={ORDER_URL} target="_blank" rel="noopener">Order Online</a></li>
					<li><a href="{base}/#find-us">Find Us</a></li>
					<li><a href="{base}/#newsletter">Newsletter</a></li>
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
	.site-footer {
		border-top: 1px solid var(--cream-25);
		padding: calc(var(--u) * 4) 0 calc(var(--u) * 3);
		background-color: var(--bg-deep);
	}
	.footer-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.25rem;
		text-align: center;
		justify-items: center;
	}
	@media (min-width: 768px) {
		.footer-row {
			grid-template-columns: 1.4fr 1fr 1fr 1.1fr;
			gap: 2rem;
			text-align: left;
			justify-items: start;
		}
	}
	.footer-logo {
		display: inline-block;
		color: var(--cream);
		text-decoration: none;
	}
	.footer-blurb {
		margin: 1.2rem 0 0;
		font-size: 13.5px;
		line-height: 1.8;
		color: var(--cream-55);
		max-width: 34ch;
	}
	.footer-label {
		display: block;
		font-family: var(--label);
		font-weight: 700;
		font-size: 11.5px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--accent-2);
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
		font-family: var(--label);
		font-weight: 500;
		font-size: 13.5px;
		color: var(--cream-70);
		text-decoration: none;
		transition: color 0.2s ease;
	}
	.f-col-menu a:hover {
		color: var(--cream);
	}
	.footer-address {
		margin-top: 1rem;
		font-style: normal;
		font-size: 13px;
		line-height: 1.9;
		color: var(--cream-55);
	}
	.footer-legal {
		margin-top: calc(var(--u) * 3);
		padding-top: 1.5rem;
		border-top: 1px solid var(--cream-25);
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
		font-size: 12px;
		color: var(--cream-55);
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
		color: var(--cream-55);
		font-size: 12px;
		text-decoration: none;
		transition: color 0.2s ease;
	}
	.footer-links a:hover {
		color: var(--cream);
	}
</style>
