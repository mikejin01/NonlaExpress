<script>
	import { base } from '$app/paths';
	import { IMG, BRAND, MISSION, STORY, VALUES, ADDRESS, ORDER_URL } from '$lib/content.js';
</script>

<svelte:head>
	<title>About — Nón Lá Express | Vietnamese Kitchen at Tangram, Flushing</title>
	<meta
		name="description"
		content="Born from a group of friends who love phở, Nón Lá Express brings healthy, fast Vietnamese food to Tangram Food Hall in Flushing, Queens."
	/>
</svelte:head>

<main>
	<!-- ============================== HEADER ============================== -->
	<header class="section story-hero">
		<div class="story-hero-bg">
			<img src="{IMG}/lifestyle-bw.jpg" alt="" />
			<div class="story-hero-overlay"></div>
		</div>
		<div class="container container--md text-center story-hero-content on-media">
			<span class="eyebrow">Our Story</span>
			<h1 class="display display-xl">Phở, the new era</h1>
		</div>
	</header>

	<!-- ============================== STORY ============================== -->
	<section class="section padding-md">
		<div class="container container--md">
			<div class="story-grid">
				<div class="story-copy">
					{#each STORY as para}
						<p>{para}</p>
					{/each}
					<a class="btn btn-outline" href="{base}/menu/">See the Menu</a>
				</div>
				<figure class="story-media">
					<img src="{IMG}/interior-tables-tall.jpg" alt="Inside Tangram — wood tables, red banquettes, and nón lá lanterns" loading="lazy" />
				</figure>
			</div>
		</div>
	</section>

	<!-- ============================== MISSION ============================== -->
	<section class="section padding-md mission-band on-green">
		<div class="container container--md text-center">
			<span class="eyebrow">Our Mission</span>
			<h2 class="display display-md mission-line">“{MISSION}”</h2>
		</div>
	</section>

	<!-- ============================== VALUES ============================== -->
	<section class="section padding-md">
		<div class="container container--lg">
			<h2 class="display display-lg text-center values-title">What we stand by</h2>
			<div class="values">
				{#each VALUES as v}
					<div class="value-card">
						<h3 class="value-title">{v.title}</h3>
						<p class="value-body">{v.body}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ============================== GALLERY ============================== -->
	<section class="section padding-sm">
		<div class="container container--lg">
			<div class="gallery">
				<img class="g-wide" src="{IMG}/interior-murals-wide.jpg" alt="Dining room with hand-drawn animal murals — lợn, gà, bò" loading="lazy" />
				<img src="{IMG}/interior-drink-station.jpg" alt="The drink station — iced coffee, sugarcane juice, salted limeade" loading="lazy" />
				<img src="{IMG}/interior-kiosk-tall.jpg" alt="Tap-to-order kiosk at the stall" loading="lazy" />
				<img src="{IMG}/merch-stickers.jpg" alt="Nón Lá Express stickers and coffee tin" loading="lazy" />
				<img src="{IMG}/interior-dining-tall.jpg" alt="Nón lá lanterns over the dining room" loading="lazy" />
			</div>
		</div>
	</section>

	<!-- ============================== VISIT ============================== -->
	<section class="section padding-md text-center">
		<div class="container container--md">
			<span class="eyebrow">Come say hi</span>
			<h2 class="display display-md">Find us inside Tangram</h2>
			<p class="visit-body">
				{ADDRESS.lines.join(' · ')}. {ADDRESS.transit}
			</p>
			<div class="visit-links">
				<a class="btn btn-primary" href={ORDER_URL} target="_blank" rel="noopener">Order Online</a>
				<a class="btn btn-outline" href={ADDRESS.mapsUrl} target="_blank" rel="noopener">Get Directions</a>
			</div>
		</div>
	</section>
</main>

<style>
	.story-hero {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 62vh;
	}
	.story-hero-bg {
		position: absolute;
		inset: 0;
	}
	.story-hero-bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1);
	}
	/* Flat charcoal scrim. The old rule faded to the page background, which
	   was a dark-site trick — on cream it would have washed out the type. */
	.story-hero-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(26, 22, 19, 0.62), rgba(26, 22, 19, 0.34));
	}
	.story-hero-content {
		padding: 7rem 1.25rem 3rem;
	}

	.story-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
		align-items: center;
	}
	@media (min-width: 900px) {
		.story-grid {
			grid-template-columns: 1.2fr 1fr;
		}
	}
	.story-copy p {
		color: var(--fg-muted);
		font-size: var(--fs-lead);
		line-height: 1.7;
	}
	.story-copy .btn {
		margin-top: 0.8rem;
	}
	.story-media {
		margin: 0;
		border-radius: 24px;
		overflow: hidden;
	}
	.story-media img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.mission-line {
		line-height: 1.3;
		max-width: 32ch;
		margin: 0 auto;
	}

	.values-title {
		margin-bottom: 2.2rem;
	}
	.values {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.4rem;
	}
	@media (min-width: 768px) {
		.values {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.value-card {
		background: var(--cream-lift);
		border: 1px solid var(--rule);
		border-radius: 18px;
		padding: 1.8rem 1.6rem;
	}
	.value-title {
		font-family: var(--label);
		font-weight: 700;
		font-size: 14px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent-ink);
		margin: 0 0 0.6rem;
	}
	.value-body {
		font-size: 1.0625rem;
		line-height: 1.65;
		color: var(--fg-muted);
		margin: 0;
	}

	.gallery {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}
	@media (min-width: 768px) {
		.gallery {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	.gallery img {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 220px;
		object-fit: cover;
		border-radius: 18px;
	}
	.g-wide {
		grid-column: 1 / -1;
		max-height: 460px;
	}

	.visit-body {
		color: var(--fg-muted);
		max-width: 56ch;
		margin: 0 auto 1.8rem;
	}
	.visit-links {
		display: flex;
		gap: 14px;
		justify-content: center;
		flex-wrap: wrap;
	}
</style>
