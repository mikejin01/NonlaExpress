<script>
	/**
	 * /company — Phase E re-skin (plan §2.7).
	 *
	 * The original's company page is a 50/50 split and almost nothing else: a
	 * cream story column on the left, a full-bleed kitchen video on the right,
	 * then three value blocks each carrying one illustrated dish. Everything
	 * below was re-derived from `original-company.html` in the source-html
	 * archive rather than from §1.3's paragraph — the same move Phase D made,
	 * and it paid off the same way: §1.3 guessed the three dish illustrations
	 * were "likely used" somewhere below the fold, and the token stream shows
	 * them sitting one per value block, between the heading and the body.
	 *
	 * SURFACES (plan §1.2d): cream ground, so only the mission band asks for a
	 * class. The values are card-less on cream deliberately, and the reason is
	 * the artwork: ⚠️ the three dish illustrations are the ONLY multi-colour
	 * pieces on the site — pale blue, yellow, mint and a near-white #FAFAFB,
	 * marked "no recolor" in svgclean.py's MANIFEST because the original ships
	 * them exactly this way and Wix applies no [data-color] override to them on
	 * this page (verified in original-company.html: zero scoped fill rules).
	 * They ignore --art-fill / --art-detail entirely, so unlike every other
	 * piece they do NOT adapt to their surface — those light pastels read as
	 * glowing blobs on a dark band. On `.on-green-deep`, which is where the
	 * Phase E task list put them, that is what would have happened. Green still
	 * gets its band on this route — the mission statement.
	 *
	 * TYPE measured off screenshots/orig-company-hero.png at 1440 (§2.7):
	 *   script heading ~44px (OFF-SCALE — see .company-title) · pull-quote 22.5
	 *   (--fs-lead) · story + value copy 18 (--fs-nav, the same running-copy step
	 *   Phase D measured on /menu) · value headings 36 (--fs-lg).
	 *
	 * THIRD COLOUR (§1.2d, "terracotta draws"): the script heading is --warm at
	 * display size; the pull-quote is --warm-ink because at 22.5px / weight 400
	 * it is NORMAL text by WCAG (large = ≥24px, or ≥18.66px at 700+), so
	 * terracotta's 3.88:1 would fail there and rust's 4.66:1 passes.
	 *
	 * MOTION: none of our own. The kitchen video autoplays muted and is paused
	 * under prefers-reduced-motion, exactly as the homepage hero does it.
	 */
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { IMG, VID, ART, BRAND, TAGLINE, MISSION, STORY, VALUES, ADDRESS, ORDER_URL } from '$lib/content.js';

	/* One illustrated dish per value, in the original's order (plan §1.4:
	   company-29/30/31 → dish-pho / dish-plate / dish-rolls). They are plain
	   <img> rather than <Art> because they need no theming — see Art.svelte.
	   ⚠️ Sized by HEIGHT below: pho is 1.11:1 but plate and rolls are ~1.6:1,
	   so a shared width would make the bowl tower over the other two (the trap
	   Phase D hit with the shrimp and the herb, plan §2.6). */
	const VALUE_ART = ['dish-pho', 'dish-plate', 'dish-rolls'];

	let kitchenVideo = $state(null);
	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) kitchenVideo?.pause();
	});
</script>

<svelte:head>
	<title>About — Nón Lá Express | Vietnamese Kitchen at Tangram, Flushing</title>
	<meta
		name="description"
		content="Born from a group of friends who love phở, Nón Lá Express brings healthy, fast Vietnamese food to Tangram Food Hall in Flushing, Queens."
	/>
</svelte:head>

<main>
	<!-- ============================== 1 · THE SPLIT ==============================
	     The original's whole hero: story left on cream, kitchen video right,
	     full-bleed and edge to edge, the two halves the same height. The video
	     is decoration (aria-hidden) — every word of the page is in the left
	     column — so on a phone it may lead visually without confusing reading
	     order. -->
	<section class="section company-split">
		<div class="split-story">
			<div class="story-inner">
				<span class="eyebrow">About {BRAND}</span>
				<h1 class="script company-title">Serving Fresh Healthy Pho, with Modern Convenience</h1>
				<p class="pull-quote">“{TAGLINE}”</p>
				{#each STORY as para}
					<p class="story-para">{para}</p>
				{/each}
				<figure class="story-mural">
					<img
						src="{IMG}/interior-murals-wide.jpg"
						alt="Hand-drawn zodiac-animal murals along the dining wall at Tangram"
						loading="lazy"
					/>
				</figure>
				<a class="btn btn-outline" href="{base}/menu/">See the Menu</a>
			</div>
		</div>
		<div class="split-media" aria-hidden="true">
			<!-- 1.12MB / 1280×720 web rendition of the harvested 7.9MB 1080p original
			     (docs/assets/original-site/video/company-kitchen-1080p.mp4). No .mov
			     twin: unlike the hero pair this one is H.264 only, which every target
			     decodes. -->
			<video
				bind:this={kitchenVideo}
				autoplay
				muted
				loop
				playsinline
				poster="{IMG}/company-kitchen-poster.jpg"
			>
				<source src="{VID}/company-kitchen.mp4" type="video/mp4" />
			</video>
		</div>
	</section>

	<!-- ============================== 2 · MISSION ==============================
	     OURS — the original folds this text into its first value block. Kept as
	     its own band because it is the page's one green moment: the values below
	     have to stay on cream for the dish line-art to read (see the header
	     comment), so without this the route would carry no brand band at all. -->
	<section class="section padding-md mission-band on-green-deep">
		<div class="container container--md text-center">
			<span class="eyebrow">Our Mission</span>
			<h2 class="display display-md mission-line">“{MISSION}”</h2>
		</div>
	</section>

	<!-- ============================== 3 · VALUES ==============================
	     The original's three blocks, card-less on cream, each led by its dish
	     illustration. No --cream-lift panel: with the ground cream and the art
	     drawn on cream, a card would be a box around nothing — the same reasoning
	     that took the cards off /menu (plan §2.6). -->
	<section class="section padding-md">
		<div class="container container--lg">
			<div class="values">
				{#each VALUES as v, i}
					<article class="value">
						<img class="value-art" src="{ART}/{VALUE_ART[i]}.svg" alt="" loading="lazy" />
						<h2 class="display value-title">{v.title}</h2>
						<p class="value-body">{v.body}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- ============================== 4 · GALLERY ============================== -->
	<section class="section padding-sm">
		<div class="container container--lg">
			<div class="gallery">
				<!-- the murals shot leads the story column above, so the wide slot here
				     takes the lamps instead rather than running the same photo twice -->
				<img class="g-wide" src="{IMG}/interior-hat-wide.jpg" alt="Nón lá pendant lamps over the counter" loading="lazy" />
				<img src="{IMG}/interior-drink-station.jpg" alt="The drink station — iced coffee, sugarcane juice, salted limeade" loading="lazy" />
				<img src="{IMG}/interior-kiosk-tall.jpg" alt="Tap-to-order kiosk at the stall" loading="lazy" />
				<img src="{IMG}/merch-stickers.jpg" alt="Nón Lá Express stickers and coffee tin" loading="lazy" />
				<img src="{IMG}/interior-dining-tall.jpg" alt="Nón lá lanterns over the dining room" loading="lazy" />
			</div>
		</div>
	</section>

	<!-- ============================== 5 · VISIT ============================== -->
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
	/* ---------------------------- 1 · the split ---------------------------- */
	.company-split {
		display: grid;
		grid-template-columns: 1fr;
	}
	@media (min-width: 900px) {
		.company-split {
			grid-template-columns: 1fr 1fr; /* measured 719/1440 on the original */
			align-items: stretch;
		}
	}
	.split-story {
		display: flex;
		align-items: center;
		/* measured: content inset 76px either side of a 719px pane at 1440 */
		padding: clamp(2.5rem, 5.3vw, 4.75rem) clamp(1.25rem, 5.3vw, 4.75rem);
	}
	.story-inner {
		width: 100%;
		max-width: 36rem;
		margin: 0 auto;
	}
	.split-media {
		min-height: 56vh;
		overflow: hidden;
	}
	@media (min-width: 900px) {
		.split-media {
			min-height: 0; /* the story column sets the row height past this point */
		}
	}
	.split-media video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	/* Decorative, so leading with it on a phone costs nothing in reading order */
	@media (max-width: 899px) {
		.split-media {
			order: -1;
		}
	}

	/* OFF-SCALE, and fitted the way .hero-title was (plan §2.3): the measured
	   heading is ~44px and the scale steps 36 → 105 with nothing between. The
	   value below holds the original's two-line break in a 36rem column with
	   Playfair 900 italic, which sets ~9% wider than TT Nooks (§1.1) — so
	   re-measure if the copy or the column width changes. */
	.company-title {
		font-size: clamp(1.9rem, 3.06vw, 2.75rem);
		color: var(--warm); /* display size, so terracotta draws it */
		margin: 0.15em 0 0.5em;
		text-wrap: balance;
	}
	/* NOT --warm: 22.5px at weight 400 is normal text by WCAG, where terracotta
	   measures 3.88:1. Rust is 4.66:1 and passes (plan §2.1). */
	.pull-quote {
		font-size: var(--fs-lead);
		color: var(--warm-ink);
		margin: 0 0 1.6rem;
	}
	.story-para {
		color: var(--fg-muted);
		font-size: var(--fs-nav);
		line-height: 1.7;
		margin: 0 0 1.1rem;
	}
	.story-mural {
		margin: 1.8rem 0 1.6rem;
		border-radius: 18px;
		overflow: hidden;
	}
	.story-mural img {
		display: block;
		width: 100%;
		height: auto;
	}

	/* ---------------------------- 2 · mission ---------------------------- */
	.mission-line {
		line-height: 1.3;
		max-width: 32ch;
		margin: 0 auto;
	}

	/* ---------------------------- 3 · values ---------------------------- */
	.values {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.6rem;
	}
	@media (min-width: 768px) {
		.values {
			grid-template-columns: repeat(3, 1fr);
			gap: 2rem;
		}
		/* Two of the three titles set on one line and one on two, which left the
		   bodies on different baselines across the row. Reserving two lines is
		   enough — measured, the longest title is exactly two at 14ch — and it
		   costs nothing in the single-column layout below this breakpoint. */
		.value-title {
			min-height: 2.1em;
		}
	}
	.value {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	/* HEIGHT, not width — the three dishes run 1.11:1 to 1.60:1 and only a
	   shared height makes them read as one set (plan §2.6). */
	.value-art {
		display: block;
		width: auto;
		height: clamp(96px, 9vw, 128px);
		margin-bottom: 1.1rem;
	}
	.value-title {
		font-size: var(--fs-lg);
		line-height: 1.05;
		margin: 0 0 0.7rem;
		max-width: 14ch;
	}
	.value-body {
		font-size: var(--fs-nav);
		line-height: 1.7;
		color: var(--fg-muted);
		margin: 0;
	}

	/* ---------------------------- 4 · gallery ---------------------------- */
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

	/* ---------------------------- 5 · visit ---------------------------- */
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
