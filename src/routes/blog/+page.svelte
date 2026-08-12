<script>
	/**
	 * /blog — the post index, read live from WordPress.
	 *
	 * Replaced /press on 2026-08-12 (plan §5 Q4, reversed): the client wanted a
	 * blog they can actually write from the WordPress dashboard, which /press
	 * could never be — it rendered a hard-coded three-item array.
	 *
	 * SURFACE: cream ground, no .on-* class, because :root is already cream
	 * (design system — green is the one you ask for). Cards need --cream-lift
	 * plus a --rule hairline, since a .on-cream panel on a cream page is not a
	 * panel. Same treatment the /press cards used, kept deliberately.
	 *
	 * ⚠️ Posts come from the WP database at RUNTIME, so this list is empty on
	 * `pnpm dev` and on the GitHub Pages build. That is the designed behaviour,
	 * not a bug — see src/lib/wp/posts.js.
	 */
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { fetchPosts } from '$lib/wp/posts.js';
	import { underWordPress } from '$lib/wp/client.js';

	let posts = $state(/** @type {import('$lib/wp/posts.js').Post[]} */ ([]));
	let pages = $state(0);
	let page = $state(1);
	let loading = $state(true);
	let offWordPress = $state(false);

	async function load(/** @type {number} */ next) {
		loading = true;
		const r = await fetchPosts({ page: next });
		posts = r.posts;
		pages = r.pages;
		page = r.page;
		loading = false;
	}

	onMount(() => {
		offWordPress = !underWordPress();
		load(1);
	});
</script>

<svelte:head>
	<title>Blog — Nón Lá Express</title>
	<meta
		name="description"
		content="News, guides and stories from Nón Lá Express — the Vietnamese kitchen inside Tangram Food Hall, Flushing, Queens."
	/>
</svelte:head>

<main id="main" tabindex="-1">
	<header class="section padding-md blog-hero">
		<div class="container container--md text-center">
			<span class="eyebrow">From the kitchen</span>
			<h1 class="display display-xl">Blog</h1>
		</div>
	</header>

	<section class="section padding-md">
		<div class="container container--md">
			{#if loading}
				<p class="blog-state">Loading posts…</p>
			{:else if posts.length}
				<div class="blog-grid">
					{#each posts as p (p.id)}
						<article class="blog-card">
							<a class="blog-link" href="{base}/blog/{p.slug}/">
								{#if p.image}
									<img class="blog-img" src={p.image} alt={p.imageAlt} loading="lazy" />
								{/if}
								<span class="blog-date"><time datetime={p.dateISO}>{p.date}</time></span>
								<h2 class="blog-title">{p.title}</h2>
								{#if p.excerpt}<p class="blog-excerpt">{p.excerpt}</p>{/if}
								<span class="blog-more">Read more</span>
							</a>
						</article>
					{/each}
				</div>

				{#if pages > 1}
					<nav class="blog-pager" aria-label="Blog pages">
						<button class="btn btn-outline btn-sm" disabled={page <= 1} onclick={() => load(page - 1)}>
							Newer
						</button>
						<span class="blog-pageno">Page {page} of {pages}</span>
						<button
							class="btn btn-outline btn-sm"
							disabled={page >= pages}
							onclick={() => load(page + 1)}
						>
							Older
						</button>
					</nav>
				{/if}
			{:else if offWordPress}
				<!-- Honest rather than pretending the blog is empty: this build has no
				     WordPress behind it, so there is nothing to fetch. -->
				<p class="blog-state">
					Posts are published from the WordPress dashboard and appear on the live site.
				</p>
			{:else}
				<p class="blog-state">No posts yet — check back soon.</p>
			{/if}
		</div>
	</section>
</main>

<style>
	.blog-hero {
		padding-top: calc(var(--u) * 9);
	}
	.blog-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.4rem;
	}
	@media (min-width: 768px) {
		.blog-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	/* --cream-lift + a --rule hairline: on the cream page a plain .on-cream
	   panel would be invisible against its own ground. */
	.blog-card {
		background: var(--cream-lift);
		border: 1px solid var(--rule);
		border-radius: 18px;
		overflow: hidden;
	}
	.blog-link {
		display: block;
		padding: 1.8rem 1.6rem;
		text-decoration: none;
		color: inherit;
		height: 100%;
	}
	.blog-img {
		display: block;
		width: calc(100% + 3.2rem);
		margin: -1.8rem -1.6rem 1.2rem;
		height: 180px;
		object-fit: cover;
	}
	.blog-date {
		font-family: var(--label);
		font-weight: 700;
		font-size: 11.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent-ink);
	}
	.blog-title {
		/* --display-intl, not --display: post titles are user-authored and may be
		   Chinese, and --display's generic `serif` tail would swallow them. */
		font-family: var(--display-intl);
		font-weight: 900;
		font-size: 1.5rem;
		line-height: 1.15;
		margin: 0.6rem 0 0.4rem;
	}
	.blog-excerpt {
		font-family: var(--body-intl);
		font-size: 1rem;
		color: var(--fg-muted);
		margin: 0 0 0.9rem;
	}
	.blog-more {
		font-family: var(--label);
		font-weight: 700;
		font-size: 12px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent-ink);
	}
	.blog-state {
		text-align: center;
		color: var(--fg-muted);
		font-size: var(--fs-lead);
		margin: 0;
	}
	.blog-pager {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.2rem;
		margin-top: 2.6rem;
	}
	.blog-pageno {
		font-family: var(--label);
		font-size: 12px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-muted);
	}
	.blog-pager button[disabled] {
		opacity: 0.45;
		pointer-events: none;
	}
</style>
