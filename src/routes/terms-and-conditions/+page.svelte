<script>
	import { PHONE } from '$lib/content.js';
</script>

<svelte:head>
	<title>Terms & Conditions — Nón Lá Express</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main id="main" tabindex="-1" class="section padding-md legal-page">
	<div class="container container--md prose prose-panel on-cream">
		<h1 class="display display-lg">Terms & Conditions</h1>
		<p><em>Effective date: August 6, 2026</em></p>

		<p>
			By using nonlaexpress.com you agree to these terms. If you do not agree, please do not use
			the site.
		</p>

		<h2>Site content</h2>
		<p>
			Menu items, prices, hours, and availability shown on this site are provided for convenience
			and may change without notice. The menu at the stall is authoritative.
		</p>

		<h2>Online ordering</h2>
		<p>
			Ordering is fulfilled by third-party platforms (Snackpass, Grubhub, Seamless). Your purchase
			is subject to the terms of the platform you order through; we are not responsible for those
			platforms' availability or errors.
		</p>

		<h2>Intellectual property</h2>
		<p>
			All content on this site — text, photography, logos, and graphics — belongs to Nón Lá
			Express or its licensors and may not be reused without permission.
		</p>

		<h2>Limitation of liability</h2>
		<p>
			The site is provided "as is." To the fullest extent permitted by law, Nón Lá Express is not
			liable for damages arising from use of the site.
		</p>

		<h2>Contact</h2>
		<p>
			Questions? Call <a href={PHONE.tel}>{PHONE.display}</a> or visit us at Tangram Food Hall,
			133-33 39th Ave, Flushing, NY 11354.
		</p>
	</div>
</main>

<style>
	.legal-page {
		padding-top: calc(var(--u) * 9);
	}
</style>
