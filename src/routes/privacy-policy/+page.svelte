<script>
	import { PHONE } from '$lib/content.js';
</script>

<svelte:head>
	<title>Privacy Policy — Nón Lá Express</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="section padding-md legal-page">
	<div class="container container--md prose">
		<h1 class="display display-lg">Privacy Policy</h1>
		<p><em>Effective date: August 6, 2026</em></p>

		<p>
			Nón Lá Express ("we," "us") operates nonlaexpress.com. This policy describes what
			information we collect through the site and how we use it.
		</p>

		<h2>Information we collect</h2>
		<ul>
			<li>
				<strong>Newsletter sign-ups.</strong> If you join our mailing list, we collect your email
				address and use it to send promotions, menu updates, and store news. You can unsubscribe at
				any time using the link in any email.
			</li>
			<li>
				<strong>Usage data.</strong> Like most websites, our hosting and analytics providers may
				collect standard technical information such as browser type, pages visited, and referring
				pages, used in aggregate to understand how the site is used.
			</li>
		</ul>

		<h2>Online ordering</h2>
		<p>
			Online orders are placed through third-party platforms (Snackpass, Grubhub, Seamless). Any
			information you provide there is governed by those platforms' own privacy policies — we
			encourage you to review them.
		</p>

		<h2>What we don't do</h2>
		<p>
			We do not sell your personal information, and we do not share it with third parties except as
			needed to operate the site and mailing list.
		</p>

		<h2>Contact</h2>
		<p>
			Questions about this policy? Call us at <a href={PHONE.tel}>{PHONE.display}</a> or visit us at
			Tangram Food Hall, 133-33 39th Ave, Flushing, NY 11354.
		</p>
	</div>
</main>

<style>
	.legal-page {
		padding-top: calc(var(--u) * 9);
	}
</style>
