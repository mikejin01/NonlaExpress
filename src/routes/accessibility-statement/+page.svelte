<script>
	import { PHONE } from '$lib/content.js';
</script>

<svelte:head>
	<title>Accessibility Statement — Nón Lá Express</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="section padding-md legal-page">
	<div class="container container--md prose">
		<h1 class="display display-lg">Accessibility Statement</h1>
		<p><em>Last updated: August 6, 2026</em></p>

		<p>
			Nón Lá Express is committed to making nonlaexpress.com usable by as many people as
			possible. We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level
			AA.
		</p>

		<h2>What we do</h2>
		<ul>
			<li>Semantic HTML with meaningful headings, landmarks, and link text</li>
			<li>Text alternatives for images and controls</li>
			<li>Color contrast checked against the brand palette</li>
			<li>Keyboard-operable navigation and forms</li>
			<li>Reduced-motion preferences respected for animations</li>
		</ul>

		<h2>Feedback</h2>
		<p>
			If you have difficulty using any part of this site, please tell us — call
			<a href={PHONE.tel}>{PHONE.display}</a> or speak with us at the stall (Tangram Food Hall,
			FH17). We will do our best to help and to fix the issue.
		</p>
	</div>
</main>

<style>
	.legal-page {
		padding-top: calc(var(--u) * 9);
	}
</style>
