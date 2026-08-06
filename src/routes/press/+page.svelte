<script>
	import { IMG, PRESS, SOCIAL, PHONE } from '$lib/content.js';
</script>

<svelte:head>
	<title>Press — Nón Lá Express</title>
	<meta name="description" content="Press and features about Nón Lá Express, the Vietnamese kitchen inside Tangram Food Hall, Flushing, Queens." />
</svelte:head>

<main>
	<header class="section padding-md press-hero">
		<div class="container container--md text-center">
			<span class="eyebrow">In the News</span>
			<h1 class="display display-xl">Press</h1>
		</div>
	</header>

	<section class="section padding-md">
		<div class="container container--md">
			<div class="press-grid">
				{#each PRESS as p}
					<article class="press-card">
						<span class="press-date">{p.date}</span>
						<h2 class="press-title">{p.title}</h2>
						<p class="press-note">{p.note}</p>
					</article>
				{/each}
			</div>

			<div class="press-aside">
				<img class="press-img" src="{IMG}/merch-stickers.jpg" alt="Nón Lá Express stickers and coffee tin" loading="lazy" />
				<div class="press-contact">
					<h2 class="display display-md">Writing about us?</h2>
					<p>
						For press inquiries, reach out on Instagram
						<a href={SOCIAL.instagram.url} target="_blank" rel="noopener">{SOCIAL.instagram.label}</a>
						or call <a href={PHONE.tel}>{PHONE.display}</a>.
					</p>
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	.press-hero {
		padding-top: calc(var(--u) * 9);
	}
	.press-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.4rem;
	}
	@media (min-width: 768px) {
		.press-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.press-card {
		background: var(--cream-lift);
		border: 1px solid var(--rule);
		border-radius: 18px;
		padding: 1.8rem 1.6rem;
	}
	.press-date {
		font-family: var(--label);
		font-weight: 700;
		font-size: 11.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent-ink);
	}
	.press-title {
		font-family: var(--display);
		font-weight: 900;
		font-size: 1.5rem;
		line-height: 1.15;
		margin: 0.6rem 0 0.4rem;
	}
	.press-note {
		font-size: 1rem;
		font-style: italic;
		color: var(--fg-dim);
		margin: 0;
	}

	.press-aside {
		margin-top: 3rem;
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		align-items: center;
	}
	@media (min-width: 768px) {
		.press-aside {
			grid-template-columns: 1fr 1.4fr;
		}
	}
	.press-img {
		display: block;
		width: 100%;
		border-radius: 18px;
		max-height: 420px;
		object-fit: cover;
	}
	.press-contact p {
		color: var(--fg-muted);
	}
	.press-contact a {
		color: var(--accent-ink);
	}
</style>
