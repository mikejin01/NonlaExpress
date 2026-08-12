<script>
	/**
	 * /press — retired 2026-08-12, replaced by /blog.
	 *
	 * Kept as a redirect rather than deleted, for two reasons: it was a real URL
	 * on the old Wix site (it is in the harvested sitemap), and it was live on
	 * our own GitHub Pages deploy for six phases. Either way there are links to
	 * it in the wild.
	 *
	 * WordPress 301s this server-side from scripts/redirects.js, which is the
	 * real redirect and the one search engines act on. This client-side hop is
	 * the GitHub Pages story, where no server-side redirect is possible at all —
	 * `replaceState` so it does not trap the Back button.
	 */
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	onMount(() => goto(`${base}/blog/`, { replaceState: true }));
</script>

<svelte:head>
	<title>Press — Nón Lá Express</title>
	<!-- Retired URL: keep it out of the index and point crawlers at the successor.
	     ⚠️ {base}, not a root-absolute "/blog/". The GitHub Pages build sets
	     paths.base to /NonlaExpress, and the prerenderer follows this href — a
	     bare "/blog/" made it crawl a path outside the base and FAILED the
	     deploy, while building clean locally where BASE_PATH is empty. Any
	     internal URL in this codebase needs {base}. -->
	<meta name="robots" content="noindex" />
	<link rel="canonical" href="{base}/blog/" />
</svelte:head>

<main id="main" tabindex="-1" class="section padding-md">
	<div class="container container--md text-center">
		<p>
			Our press page is now the <a href="{base}/blog/">blog</a>.
		</p>
	</div>
</main>
