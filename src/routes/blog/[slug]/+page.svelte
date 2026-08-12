<script>
	/**
	 * /blog/<slug> — a single post, fetched from WordPress by slug.
	 *
	 * WordPress owns this URL too: xo_configure_blog() sets the permalink base to
	 * /blog/, so a post published in the dashboard answers 200 here and index.php
	 * boots the SPA. Without that the URL would only work by accident, via
	 * 404.php also booting the SPA — and would serve a 404 status to crawlers.
	 *
	 * The prose panel is the same one the legal routes use: .prose.prose-panel
	 * .on-cream, which supplies --cream-lift and the --rule hairline a panel
	 * needs on the cream page.
	 */
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { page as pageStore } from '$app/state';
	import { fetchPost } from '$lib/wp/posts.js';

	let post = $state(/** @type {import('$lib/wp/posts.js').Post|null} */ (null));
	let loading = $state(true);

	onMount(async () => {
		post = await fetchPost(pageStore.params.slug);
		loading = false;
	});
</script>

<svelte:head>
	<title>{post ? `${post.title} — Nón Lá Express` : 'Blog — Nón Lá Express'}</title>
	{#if post?.excerpt}<meta name="description" content={post.excerpt} />{/if}
</svelte:head>

<main id="main" tabindex="-1" class="section padding-md">
	<div class="container container--md">
		{#if loading}
			<p class="post-state">Loading…</p>
		{:else if post}
			<article class="prose prose-panel on-cream">
				<span class="post-date"><time datetime={post.dateISO}>{post.date}</time></span>
				<h1 class="display display-lg post-title">{post.title}</h1>
				{#if post.image}
					<img class="post-img" src={post.image} alt={post.imageAlt} />
				{/if}
				<!-- Rendered by WordPress via the_content, so blocks and shortcodes
				     arrive as real markup. It is authored by logged-in editors — the
				     same trust boundary every WordPress theme runs on. -->
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html post.content ?? ''}
			</article>
			<p class="post-back">
				<a href="{base}/blog/">← All posts</a>
			</p>
		{:else}
			<div class="prose prose-panel on-cream">
				<h1 class="display display-lg">Post not found</h1>
				<p>That post may have been moved or unpublished.</p>
				<p><a href="{base}/blog/">← All posts</a></p>
			</div>
		{/if}
	</div>
</main>

<style>
	.post-date {
		font-family: var(--label);
		font-weight: 700;
		font-size: 11.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent-ink);
	}
	.post-title {
		/* See .blog-title — the same any-language reasoning applies. */
		font-family: var(--display-intl);
		margin: 0.5rem 0 1.2rem;
	}
	/* the_content() output: whatever the author wrote, in whatever language. */
	article.prose :global(p),
	article.prose :global(li),
	article.prose :global(blockquote) {
		font-family: var(--body-intl);
	}
	article.prose :global(h2),
	article.prose :global(h3),
	article.prose :global(h4) {
		font-family: var(--display-intl);
	}
	.post-img {
		display: block;
		width: 100%;
		border-radius: 18px;
		margin: 0 0 1.6rem;
	}
	.post-state {
		text-align: center;
		color: var(--fg-muted);
		font-size: var(--fs-lead);
	}
	.post-back {
		text-align: center;
		margin-top: 2rem;
	}
	.post-back a,
	.prose-panel a {
		color: var(--accent-ink);
	}
</style>
