<script>
	/**
	 * Homepage — the original nonlaexpress.com's spine (plan §1.3 / Phase C) with
	 * THREE of our own sections kept deliberately. Phase C first shipped as a
	 * near-faithful copy and the client asked for five of our sections back; on
	 * 2026-08-07 they then removed two of those five (the Lunch Special section
	 * and the Signature Drinks feature row). Plan §2.4 tracks the current list —
	 * the point of it is that our sections are not deleted to "match the
	 * original", NOT that any particular section is permanent.
	 *
	 * SURFACES are as of plan §1.2d (the colour swap): the page ground is CREAM,
	 * so a section with no .on-* class is cream and green is what you ask for.
	 *
	 *   1  video hero              OURS   ·  .on-media + curve w/ terracotta ring
	 *   2  sliding dish cards      OURS   ·  rAF marquee w/ prev / next / pause
	 *   3  intro: rooster · slideshow · h1 + buffalo, pig lower-left  (cream)
	 *   4  statement hero + 3 phở cards   .on-green-deep + .on-cream cards
	 *   5  feature: phở            OURS   ·  .on-green panel + sand media half
	 *   6  type marquee, two rows          (cream — black type, red animals)
	 *   7  interior grid, 3×2
	 *   8  find us                 OURS
	 *   9  drinks collage                 .on-charcoal
	 *   →  footer carries the newsletter + the arc (Footer.svelte)
	 *
	 * MOTION. The rAF card marquee and the scroll-arrow bob are the only moving
	 * parts, and both already bail out under prefers-reduced-motion. Everything
	 * Phase C2 adds (§1.5 M1–M6) must likewise leave the page correct with all
	 * animation removed.
	 */
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import Art from '$lib/site/Art.svelte';
	import {
		IMG,
		VID,
		BRAND,
		KITCHEN,
		TAGLINE,
		AN_NAO,
		INTRO_SEO,
		STATEMENT,
		PHO_FAVORITES,
		DRINKS_BLURB,
		ADDRESS,
		PHONE,
		HOURS,
		LUNCH_WINDOW,
		ORDER_URL,
		DELIVERY_NOTE,
		SOCIAL,
		SEO_BLURB
	} from '$lib/content.js';

	/* ---------- auto media marquee (kept from the Editorial template) ----------
	   Not the same thing as the type marquee in section 6: that one is the
	   original's giant "nón lá / express" band and gets pure-CSS tracks in C2.
	   This is ours, it is a photo carousel with real controls, and it stays.
	   FIVE dish cards since 2026-08-07 — the drinks-trio photo was removed on
	   client direction. The track renders the set twice and wraps at
	   scrollWidth/2, so one copy must stay wider than the viewport or the wrap
	   shows a gap: at 25vw + 20px per card that holds down to 4 cards. Don't
	   drop below that without re-checking. */
	const mediaCards = [
		{ src: `${IMG}/pho-special.jpg`, alt: 'Phở Special — rare beef, brisket, tendon, and tripe' },
		{ src: `${IMG}/spring-roll.jpg`, alt: 'Crispy spring rolls with nuoc cham' },
		{ src: `${IMG}/vermicelli.jpg`, alt: 'Rice vermicelli bowl with fresh herbs' },
		{ src: `${IMG}/wings.jpg`, alt: 'Lemongrass chicken wings' },
		{ src: `${IMG}/shaking-beef.jpg`, alt: 'Shaking beef rice' }
	];
	let trackEl = $state(null);
	let heroVideo = $state(null);
	let marqueeX = 0;
	let marqueePlaying = $state(true);
	let raf;
	function marqueeLoop() {
		if (trackEl && marqueePlaying) {
			marqueeX -= 0.6;
			const half = trackEl.scrollWidth / 2;
			if (-marqueeX >= half) marqueeX += half;
			trackEl.style.transform = `translate3d(${marqueeX}px,0,0)`;
		}
		raf = requestAnimationFrame(marqueeLoop);
	}
	function marqueeStep(dir) {
		if (!trackEl) return;
		const card = trackEl.querySelector('.card');
		const step = (card ? card.offsetWidth : 400) + 20;
		marqueeX += dir * step;
		const half = trackEl.scrollWidth / 2;
		if (-marqueeX >= half) marqueeX += half;
		if (marqueeX > 0) marqueeX -= half;
		trackEl.style.transition = 'transform .45s ease-in-out';
		trackEl.style.transform = `translate3d(${marqueeX}px,0,0)`;
		setTimeout(() => trackEl && (trackEl.style.transition = 'none'), 460);
	}

	/* ---------- M6 intro slideshow ---------- */
	const slides = [
		{ src: `${IMG}/interior-dining-tall.jpg`, alt: 'The dining room at Nón Lá Express, Tangram Food Hall' },
		{ src: `${IMG}/merch-stickers.jpg`, alt: 'Nón Lá Express zodiac-animal brand stickers' },
		{ src: `${IMG}/pho-bowl-tall.jpg`, alt: 'A bowl of phở with Thai basil and bean sprouts' }
	];
	let slide = $state(0);
	const move = (d) => (slide = (slide + d + slides.length) % slides.length);

	/* Four repeats is enough to overflow the widest viewport; C2's duplicated
	   track doubles it again. */
	const MQ = [0, 1, 2, 3];

	/* Six interiors, tight 3×2 masonry — the original's section 6. */
	const interiors = [
		{ src: `${IMG}/interior-entrance.jpg`, alt: 'The entrance to the Nón Lá Express stall' },
		{ src: `${IMG}/interior-tables-tall.jpg`, alt: 'Tables and red banquette seating' },
		{ src: `${IMG}/interior-murals-wide.jpg`, alt: 'Zodiac-animal murals along the dining wall' },
		{ src: `${IMG}/interior-kiosk-tall.jpg`, alt: 'The ordering kiosk' },
		{ src: `${IMG}/interior-hat-wide.jpg`, alt: 'Nón lá pendant lamps over the counter' },
		{ src: `${IMG}/interior-drink-station.jpg`, alt: 'The drink station' }
	];

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!reduced) raf = requestAnimationFrame(marqueeLoop);
		else {
			marqueePlaying = false;
			heroVideo?.pause();
		}
		return () => cancelAnimationFrame(raf);
	});
</script>

<svelte:head>
	<title>Nón Lá Express — Pho & Vietnamese Kitchen in Flushing, NY</title>
	<meta name="description" content={SEO_BLURB + ' 法拉盛越南河粉 · Tangram Food Hall.'} />
</svelte:head>

<main>
	<!-- ============================== 1 · VIDEO HERO ==============================
	     OURS, kept on client direction (plan §2.4). The page's real h1 is the SEO
	     line in the intro below — same as the original, where the statement type
	     is not the heading. So this headline is a <p>, not a second h1. -->
	<section class="section hero">
		<div class="hero-bg">
			<!-- HEVC .mov first for Safari; H.264 .mp4 for browsers without HEVC decode -->
			<video bind:this={heroVideo} autoplay muted loop playsinline aria-hidden="true">
				<source src="{VID}/Nonla-Express-Hero.mov" type="video/quicktime" />
				<source src="{VID}/Nonla-Express-Hero.mp4" type="video/mp4" />
			</video>
			<div class="hero-overlay"></div>
		</div>
		<!-- crisp arc divider into the page bg — a shallow nón-lá curve instead of a
		     gradient fade. The fill reads --surface so it always matches whatever
		     the page ground is (cream since plan §1.2d); the hairline is the same
		     terracotta ring the footer arc carries, deliberately, so the page
		     opens and closes on the same shape in the same brand red. -->
		<div class="hero-curve" aria-hidden="true">
			<svg viewBox="0 0 1440 88" preserveAspectRatio="none">
				<path d="M0,88 L0,60 Q720,-24 1440,60 L1440,88 Z" fill="var(--surface)" />
				<path d="M0,60 Q720,-24 1440,60" fill="none" stroke="var(--terracotta)" stroke-width="2.5" />
			</svg>
		</div>
		<div class="container container--md text-center hero-content on-media">
			<span class="eyebrow">Tangram Food Hall · Flushing, Queens</span>
			<p class="display display-xl hero-title">{TAGLINE}</p>
			<p class="hero-sub">
				{BRAND} — fast-casual {KITCHEN}. Fresh phở, rice plates & signature drinks, made quick
				without cutting corners. <em>{AN_NAO}</em>
			</p>
			<div class="hero-links">
				<a class="btn btn-primary" href={ORDER_URL} target="_blank" rel="noopener">Order Online</a>
				<a class="btn btn-outline" href="{base}/menu/">View Menu</a>
			</div>
		</div>
		<div class="scroll-arrow-container">
			<a href="#page-body" class="scroll-arrow" aria-label="Scroll to content">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 9l8 7 8-7" /></svg>
			</a>
		</div>
	</section>

	<div id="page-body">
		<!-- ============================== 2 · SLIDING DISH CARDS ==============================
		     OURS, kept on client direction (plan §2.4). -->
		<section class="section padding-sm">
			<div class="container container--fluid">
				<div class="marquee" role="region" aria-label="Dishes from the menu">
					<button class="carousel-btn prev" aria-label="Previous" onclick={() => marqueeStep(1)}>
						<svg viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 70,90 L 30,50 L 70,10 L 60,0 Z" /></svg>
					</button>
					<button class="carousel-btn next" aria-label="Next" onclick={() => marqueeStep(-1)}>
						<svg viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 70,90 L 30,50 L 70,10 L 60,0 Z" transform="translate(100, 100) rotate(180)" /></svg>
					</button>
					<button
						class="carousel-btn play-pause"
						class:playing={marqueePlaying}
						class:paused={!marqueePlaying}
						aria-label={marqueePlaying ? 'Pause carousel' : 'Play carousel'}
						onclick={() => (marqueePlaying = !marqueePlaying)}><span></span></button>
					<div class="carousel-track" bind:this={trackEl}>
						{#each [...mediaCards, ...mediaCards] as card}
							<div class="card"><img src={card.src} alt={card.alt} loading="lazy" /></div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- ============================== 3 · INTRO ==============================
		     Three columns, not two (plan §1.3 item 2 — the tall-capture reading was
		     wrong). The animals overflow their columns and clip at the viewport;
		     that bleed is the effect. They need no recolor, and on the cream page
		     they get better for free: each is drawn as a cream body carrying its own
		     terracotta line-work (plan §2.2), so the body vanishes into the ground
		     and they read as the original's pure red line-art. -->
		<section class="section intro">
			<div class="container container--lg intro-grid">
				<div class="intro-art intro-art--left">
					<img class="animal animal--rooster" src="{base}/assets/art/rooster.svg" alt="" />
					<img class="animal animal--pig" src="{base}/assets/art/pig.svg" alt="" />
				</div>

				<div class="intro-stage">
					<div class="slideshow" role="group" aria-roledescription="carousel" aria-label="Inside Nón Lá Express">
						<div class="slide-frame">
							{#each slides as s, i}
								<img
									class="slide"
									class:active={i === slide}
									src={s.src}
									alt={s.alt}
									aria-hidden={i === slide ? undefined : 'true'}
									loading="lazy"
								/>
							{/each}
						</div>
						<button class="slide-arrow prev" aria-label="Previous slide" onclick={() => move(-1)}>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4 L7 12 L15 20" /></svg>
						</button>
						<button class="slide-arrow next" aria-label="Next slide" onclick={() => move(1)}>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 L17 12 L9 20" /></svg>
						</button>
					</div>
				</div>

				<div class="intro-art intro-art--right">
					<div class="intro-copy">
						<h1 class="display intro-h1">{INTRO_SEO.h1}</h1>
						<p class="intro-blurb">{INTRO_SEO.blurb}</p>
					</div>
					<img class="animal animal--buffalo" src="{base}/assets/art/buffalo.svg" alt="" />
				</div>
			</div>
		</section>

		<!-- ============================== 4 · STATEMENT + PHO CARDS ==============================
		     The original's terracotta block, in --green-deep. The cards are cream
		     panels sitting ON the band exactly as the originals sit on terracotta —
		     and the dish cut-outs' own backdrop is #F1EAD7, one step off our cream,
		     so they drop in with no visible seam (plan §2.2). -->
		<section class="section statement on-green-deep">
			<div class="container container--md text-center">
				<h2 class="display display-hero statement-title">{STATEMENT.headline}</h2>
				<p class="statement-body">{STATEMENT.body}</p>
				<a class="tag-link" href={SOCIAL.instagram.url} target="_blank" rel="noopener">{STATEMENT.tag}</a>
				<p class="favorites-caption">{PHO_FAVORITES.caption}</p>
			</div>
			<div class="container container--lg">
				<div class="fav-row">
					{#each PHO_FAVORITES.cards as card}
						<figure class="fav">
							<div class="fav-card on-cream">
								<img src="{IMG}/{card.item.img}" alt={card.item.en} loading="lazy" />
							</div>
							<figcaption>
								<h3 class="fav-name">{card.label}</h3>
								<p class="fav-desc">{card.item.desc}</p>
							</figcaption>
						</figure>
					{/each}
				</div>
			</div>
		</section>

		<!-- ============================== 5 · FEATURE: PHỞ ==============================
		     OURS. The single feature row: client direction 2026-08-07 removed the
		     Lunch Special section and the Signature Drinks row that used to sit
		     either side of it, leaving this one (plan §2.4).
		     The panel is GREEN since plan §1.2d — a cream panel on a cream page is
		     not a panel — and the media half is SAND for the same reason: the dish
		     photo carries its own cream backdrop, so on a cream page the right half
		     read as bare page. See .feature-media for how the backdrop is removed. -->
		<section class="section padding-sm">
			<div class="container container--lg">
				<div class="feature">
					<div class="feature-panel on-green">
						<span class="feature-eyebrow">On the Menu · 河粉</span>
						<h2 class="display display-lg">Phở, made for right now</h2>
						<p class="feature-body">
							Fresh ingredients, tender meats, and aromatic herbs in every bowl — silky rice
							noodles in a rich, comforting broth, served with bean sprouts, Thai basil, lime, and
							jalapeños on the side.
						</p>
						<a class="btn btn-outline feature-btn" href="{base}/menu/">View Full Menu</a>
					</div>
					<div class="feature-media">
						<img src="{IMG}/pho-bowl-tall.jpg" alt="Rare eye round beef phở with Thai basil" loading="lazy" />
					</div>
				</div>
			</div>
		</section>

		<!-- ============================== 6 · TYPE MARQUEE ==============================
		     Two duplicated tracks; C2 animates them in opposite directions at 30.9s
		     and 36.5s (§1.5 M1). Static they still read as the original's band. -->
		<section class="section marquee-band" aria-hidden="true">
			<div class="mq-row">
				<div class="mq-track">
					{#each MQ as n (n)}
						<span class="script mq-word">nón lá</span>
						<img class="mq-animal" src="{base}/assets/art/buffalo.svg" alt="" />
					{/each}
				</div>
			</div>
			<div class="mq-row">
				<div class="mq-track mq-track--right">
					{#each MQ as n (n)}
						<span class="script mq-word">express</span>
						<img class="mq-animal" src="{base}/assets/art/rooster.svg" alt="" />
					{/each}
				</div>
			</div>
		</section>
		<h2 class="sr-only">Inside {BRAND}</h2>

		<!-- ============================== 7 · INTERIOR GRID ============================== -->
		<section class="section interiors">
			<div class="interior-grid">
				{#each interiors as p}
					<img src={p.src} alt={p.alt} loading="lazy" />
				{/each}
			</div>
		</section>

		<!-- ============================== 8 · FIND US ============================== -->
		<section class="section padding-md" id="find-us">
			<div class="container container--lg">
				<div class="info-row">
					<div class="info-col">
						<span class="eyebrow">Hours</span>
						{#each HOURS as h}
							<p class="info-strong">{h.days}<br />{h.time}</p>
						{/each}
						<p class="info-dim">Lunch special · {LUNCH_WINDOW}</p>
					</div>
					<div class="info-col">
						<span class="eyebrow">Find Us</span>
						<p class="info-strong">
							{#each ADDRESS.lines as line}{line}<br />{/each}
						</p>
						<p class="info-dim">{ADDRESS.transit}</p>
						<p>
							<a class="info-link" href={ADDRESS.mapsUrl} target="_blank" rel="noopener">Get Directions</a><br />
							<a class="info-link" href={PHONE.tel}>Tel: {PHONE.display}</a>
						</p>
					</div>
					<div class="info-col">
						<span class="eyebrow">Order</span>
						<p class="info-links-stack">
							<a class="btn btn-primary" href={ORDER_URL} target="_blank" rel="noopener">Order on Snackpass</a>
							<a class="btn btn-outline btn-sm" href={SOCIAL.instagram.url} target="_blank" rel="noopener">
								Instagram {SOCIAL.instagram.label}
							</a>
						</p>
						<p class="info-dim">{DELIVERY_NOTE}</p>
					</div>
				</div>
			</div>
		</section>

		<!-- ============================== 9 · DRINKS COLLAGE ==============================
		     Charcoal against the green ground is a subtle step, so this one runs
		     full-bleed with no rounding — the change of surface has to read on its
		     own. Polaroids keep their static −8° / +9° even with motion off (§1.5 M3).
		     It also has to stay LAST: the footer arc rises out of it. -->
		<section class="section drinks on-charcoal">
			<div class="container container--lg">
				<h2 class="display display-hero drinks-title">{DRINKS_BLURB.headline}</h2>

				<div class="drinks-collage">
					<Art class="d-art d-phin" name="phin" width="clamp(90px, 11vw, 168px)" />
					<Art class="d-art d-cup" name="cup" width="clamp(96px, 12vw, 180px)" />
					<Art class="d-art d-beans" name="beans" width="clamp(52px, 6vw, 92px)" />
					<Art class="d-art d-bean" name="bean" width="clamp(20px, 2.4vw, 36px)" />

					<figure class="polaroid polaroid--a">
						<img src="{IMG}/drinks-trio.jpg" alt="Sugarcane juice, Vietnamese iced coffee and salted limeade" loading="lazy" />
					</figure>
					<figure class="polaroid polaroid--b">
						<img src="{IMG}/lifestyle-bw.jpg" alt="Friends sharing bowls of phở" loading="lazy" />
					</figure>
				</div>

				<div class="drinks-copy text-center">
					<p>{DRINKS_BLURB.en}</p>
					<p class="zh">{DRINKS_BLURB.zh}</p>
				</div>
			</div>
		</section>
	</div>
</main>

<style>
	/* ================= 1 · video hero ================= */
	.hero {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 92vh;
	}
	.hero-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
	}
	.hero-bg video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.hero-overlay {
		position: absolute;
		inset: 0;
		/* Neutral scrim only — the arc divider owns the bottom edge. 0.55 is
		   measured, not guessed: sampling the actual video across 7 timestamps,
		   it leaves 0.17% of the pixels behind the hero text below 4.5:1
		   (0.46 left 2.7%, 0.30 left 8.0%). The video is dark to begin with, so
		   this costs little. */
		background:
			linear-gradient(to top, rgba(45, 41, 38, 0.5), rgba(45, 41, 38, 0) 22%),
			linear-gradient(rgba(26, 22, 19, 0.55), rgba(26, 22, 19, 0.55));
	}
	.hero-curve {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		height: clamp(44px, 7vw, 96px);
		pointer-events: none;
	}
	.hero-curve svg {
		display: block;
		width: 100%;
		height: 100%;
	}
	.hero-content {
		position: relative;
		z-index: 2;
		padding: 6rem 1.25rem 3rem;
	}
	.hero .eyebrow {
		color: var(--fg);
		background: rgba(45, 41, 38, 0.55);
		border-radius: 980px;
		padding: 7px 16px;
	}
	@media (max-width: 480px) {
		.hero .eyebrow {
			font-size: 10.5px;
			letter-spacing: 0.16em;
		}
	}
	/* The tagline is lowercase by design ("phở, the new era") — and .display no
	   longer uppercases anything, so no override is needed here any more. */
	.hero-title {
		color: var(--fg);
		margin: 0 0 0.8rem;
		text-shadow: 0 2px 22px rgba(26, 22, 19, 0.55);
	}
	.hero-sub {
		font-size: var(--fs-lead);
		color: var(--fg-muted);
		max-width: 52ch;
		margin: 0 auto 0.5rem;
		text-shadow: 0 1px 14px rgba(26, 22, 19, 0.6);
	}
	.hero-sub em {
		font-style: italic;
		color: var(--accent-ink);
	}
	.hero-links {
		display: flex;
		gap: 16px;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 1.5rem;
	}
	.scroll-arrow-container {
		position: absolute;
		bottom: 22px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 3;
	}
	.scroll-arrow {
		color: var(--cream);
		display: block;
		filter: drop-shadow(0 1px 8px rgba(26, 22, 19, 0.6));
		animation: bob 2.4s ease-in-out infinite;
	}
	.scroll-arrow svg {
		width: 34px;
		height: 20px;
	}
	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(8px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.scroll-arrow {
			animation: none;
		}
	}

	/* ================= 2 · sliding dish cards ================= */
	.marquee {
		margin: 0 auto;
		padding: 50px 0;
		max-width: 100%;
		overflow: hidden;
		position: relative;
	}
	.carousel-track {
		display: flex;
		gap: 20px;
		padding: 0 20px 0 0;
		will-change: transform;
		transition: none;
	}
	.card {
		position: relative;
		flex: 0 0 auto;
		width: 25vw;
		height: 520px;
		border-radius: 18px;
		overflow: hidden;
		background: var(--cream-lift);
		transition: transform 0.35s ease-in-out;
	}
	@media (max-width: 1199.98px) {
		.card {
			width: 35vw;
		}
	}
	@media (max-width: 991.98px) {
		.card {
			width: 40vw;
			height: 440px;
		}
	}
	@media (max-width: 767.98px) {
		.card {
			width: 55vw;
			height: 380px;
		}
	}
	.card:hover {
		transform: translateY(-10px);
	}
	.card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.carousel-btn {
		position: absolute;
		top: 8px;
		border: none;
		cursor: pointer;
		z-index: 100;
		width: 32px;
		height: 32px;
		background: transparent;
		opacity: 0.55;
		transition: opacity 0.35s ease-in-out;
		color: var(--fg);
		padding: 6px;
	}
	.carousel-btn svg {
		fill: currentColor;
		width: 100%;
		height: 100%;
		display: block;
	}
	.carousel-btn:hover {
		opacity: 1;
	}
	.carousel-btn.prev {
		right: 9rem;
		left: auto;
	}
	.carousel-btn.next {
		right: 6rem;
		left: auto;
	}
	.play-pause {
		background: transparent;
		border: 2px solid currentColor;
		border-radius: 30px;
		padding: 5px;
		position: absolute;
		top: 8px;
		right: 2rem;
		width: 30px;
		height: 30px;
		opacity: 0.8;
	}
	.play-pause.playing::before,
	.play-pause.playing::after {
		content: '';
		position: absolute;
		background: currentColor;
		top: 0;
		bottom: 0;
		margin: auto;
		width: 2px;
		height: 12px;
	}
	.play-pause.playing::before {
		left: 9px;
	}
	.play-pause.playing::after {
		right: 9px;
	}
	.play-pause.paused::before {
		content: '';
		position: absolute;
		left: 10px;
		top: 6px;
		border-left: 9px solid currentColor;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		width: 0;
		height: 0;
		background: none;
	}

	/* ================= 3 · intro ================= */
	.intro {
		padding: calc(var(--u) * 3) 0 calc(var(--u) * 4);
	}
	.intro-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(280px, 30rem) minmax(0, 1fr);
		align-items: start;
		gap: clamp(1rem, 3vw, 3rem);
	}
	.intro-art {
		position: relative;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	/* The bleed: the art is wider than its column and is allowed to run off the
	   page edge, which .section's overflow:hidden clips. */
	.animal {
		display: block;
		width: clamp(190px, 26vw, 360px);
		height: auto;
	}
	.animal--rooster {
		margin-left: -8%;
	}
	.animal--pig {
		width: clamp(160px, 22vw, 310px);
		margin: clamp(1rem, 3vw, 3rem) 0 0 -14%;
	}
	.animal--buffalo {
		width: clamp(200px, 28vw, 390px);
		margin: clamp(1.5rem, 4vw, 4rem) -10% 0 auto;
	}
	.intro-copy {
		max-width: 34ch;
		margin-left: auto;
	}
	/* The original sets this h1 small and coloured — it is the SEO line, not a
	   statement headline. Red there; --accent-ink (= --sand, 7.2:1) here, since
	   terracotta is 1.89:1 on the ground. */
	/* The original sets this line in RED display type (plan §1.3 item 2), which
	   is exactly the "terracotta draws" role — so it takes --warm rather than
	   --accent-ink. The clamp FLOOR is 20px on purpose, not taste: terracotta
	   is 3.88:1 on cream, which clears WCAG large text (3:1) but not normal
	   text (4.5:1), and "large" needs >=18.66px at weight 700+. --fs-lead alone
	   resolves to 18.4px at 540px and would drop this below the line. */
	.intro-h1 {
		font-size: clamp(1.25rem, 1rem + 0.45vw, 1.406rem);
		line-height: 1.15;
		color: var(--warm);
		margin-bottom: 0.75rem;
	}
	.intro-blurb {
		font-size: 1.0625rem;
		line-height: 1.6;
		color: var(--fg-muted);
		margin: 0;
	}

	.intro-stage {
		display: flex;
		justify-content: center;
	}
	/* White frame, arrows on the long edges — the original's M6 carousel. */
	.slideshow {
		position: relative;
		width: 100%;
		max-width: 30rem;
		background: #fff;
		padding: 12px;
		box-shadow: 0 18px 50px rgba(9, 26, 21, 0.35);
	}
	.slide-frame {
		position: relative;
		aspect-ratio: 467 / 584;
		overflow: hidden;
		background: var(--cream);
	}
	.slide {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		visibility: hidden;
	}
	.slide.active {
		opacity: 1;
		visibility: visible;
	}
	.slide-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		border: none;
		border-radius: 50%;
		background: #fff;
		color: var(--ink);
		cursor: pointer;
		box-shadow: 0 4px 16px rgba(9, 26, 21, 0.28);
		transition: background-color 0.4s ease;
	}
	.slide-arrow:hover {
		background: var(--cream);
	}
	.slide-arrow svg {
		width: 20px;
		height: 20px;
	}
	.slide-arrow.prev {
		left: -22px;
	}
	.slide-arrow.next {
		right: -22px;
	}
	/* The frame reaches the container gutter below ~620px, so arrows that
	   straddle its edge fall off the viewport. Move them inside the photo. */
	@media (max-width: 620px) {
		.slide-arrow.prev {
			left: 18px;
		}
		.slide-arrow.next {
			right: 18px;
		}
	}

	@media (max-width: 991.98px) {
		.intro-grid {
			grid-template-columns: 1fr 1fr;
		}
		.intro-stage {
			grid-column: 1 / -1;
			order: 2;
		}
		.intro-art--right {
			grid-column: 1 / -1;
			order: 1;
		}
		.intro-art--left {
			grid-column: 1 / -1;
			order: 3;
			flex-direction: row;
			align-items: flex-end;
			justify-content: space-between;
		}
		.intro-copy {
			max-width: none;
			margin: 0;
			text-align: center;
		}
		.animal--buffalo {
			margin: 1.2rem auto 0;
		}
		.animal--rooster,
		.animal--pig {
			margin: 1.4rem 0 0;
		}
	}

	/* ================= 4 · statement + pho cards ================= */
	.statement {
		padding: calc(var(--u) * 6) 0 calc(var(--u) * 5);
	}
	.statement-title {
		margin: 0 auto 1.6rem;
		max-width: 14ch;
	}
	.statement-body {
		font-size: var(--fs-body);
		line-height: 1.5;
		max-width: 46ch;
		margin: 0 auto 1.4rem;
		color: var(--fg-muted);
	}
	/* the original's #nonlaexpress line under the statement paragraph */
	.tag-link {
		display: inline-block;
		font-family: var(--label);
		font-weight: 700;
		font-size: var(--fs-label);
		letter-spacing: 0.14em;
		color: var(--accent-ink);
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.favorites-caption {
		margin: clamp(2.5rem, 5vw, 4.5rem) auto 0;
		max-width: 46ch;
		font-size: var(--fs-lead);
		line-height: 1.5;
		color: var(--fg-muted);
	}
	.fav-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: clamp(1.5rem, 3vw, 2.5rem);
		margin-top: clamp(1.8rem, 4vw, 3rem);
	}
	@media (min-width: 768px) {
		.fav-row {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.fav {
		margin: 0;
	}
	.fav-card {
		border-radius: 20px;
		overflow: hidden;
	}
	.fav-card img {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}
	.fav-name {
		font-family: var(--display);
		font-weight: 900;
		font-size: var(--fs-lg);
		line-height: 1.1;
		margin: 1.2rem 0 0.5rem;
		color: var(--fg);
	}
	.fav-desc {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--fg-muted);
		margin: 0;
	}

	/* ================= 5 · feature row (panel + photo) ================= */
	.feature {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0;
		border-radius: 24px;
		overflow: hidden;
	}
	@media (min-width: 992px) {
		.feature {
			grid-template-columns: 1fr 1fr;
			min-height: 520px;
		}
	}
	/* `.feature--reverse` (panel right, media left) went with the Signature
	   Drinks row on 2026-08-07. Re-add the two `order` rules if a second
	   feature row ever comes back — one row alone should not alternate. */
	.feature-panel {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		padding: clamp(2.5rem, 5vw, 4.5rem);
	}
	.feature-eyebrow {
		font-family: var(--label);
		font-weight: 700;
		font-size: var(--fs-fine);
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--accent-ink);
		margin-bottom: 0.9rem;
	}
	.feature-body {
		font-size: var(--fs-lead);
		line-height: 1.65;
		max-width: 46ch;
		color: var(--fg-muted);
		margin: 0 0 1.8rem;
	}
	.feature-btn {
		align-self: flex-start;
	}
	/* The media half needs a real surface of its own: the dish photo is a JPG
	   with the studio's cream backdrop BAKED IN (~#F1EAD7, a hair off --cream),
	   so on the cream page this half read as bare page and the row looked like
	   one green panel floating next to nothing.
	   Setting a background alone does nothing — the img is object-fit:cover and
	   covers it. `mix-blend-mode: multiply` is what actually removes the
	   backdrop: multiplying a near-white field over --sand leaves the sand, and
	   the bowl, being much darker, survives with only a mild warm tint. Same
	   trick the whole harvested dish set would take, since they all ship on that
	   one flat backdrop (plan §2.2).
	   Where multiply is unsupported the img simply paints over the sand and the
	   half falls back to exactly its previous appearance — no broken state. */
	.feature-media {
		overflow: hidden;
		min-height: 320px;
		background: var(--sand); /* decorative fill only — sand is unreadable as
		   text on cream (~1.1:1) but is exactly right behind a photo */
	}
	.feature-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		mix-blend-mode: multiply;
		transition: transform 1.2s ease;
	}
	.feature:hover .feature-media img {
		transform: scale(1.04);
	}

	/* ================= 6 · type marquee ================= */
	.marquee-band {
		padding: clamp(1.5rem, 4vw, 3.5rem) 0;
		overflow: hidden;
	}
	.mq-row {
		display: flex;
		width: max-content;
	}
	.mq-track {
		display: flex;
		align-items: center;
		gap: 20px;
		padding-right: 20px;
	}
	/* Row 2 starts shifted so the two rows never line up vertically — the
	   original's rows also run at different phases (and, in C2, different
	   directions and durations). */
	.mq-track--right {
		margin-left: -14vw;
	}
	.mq-word {
		font-size: clamp(3.25rem, 16.4vw, 14.75rem); /* 236px @1440 (§1.5 M1) */
		line-height: 1;
		color: var(--fg);
		white-space: nowrap;
	}
	.mq-animal {
		display: block;
		height: clamp(2.4rem, 8vw, 7rem);
		width: auto;
		flex: none;
	}

	/* ================= 7 · interiors ================= */
	.interiors {
		padding: 0;
	}
	.interior-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
	}
	@media (max-width: 767.98px) {
		.interior-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	.interior-grid img {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 2;
		object-fit: cover;
	}

	/* ================= 8 · find us ================= */
	.info-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}
	@media (min-width: 992px) {
		.info-row {
			grid-template-columns: 1fr 1.2fr 1fr;
		}
	}
	.info-strong {
		font-size: var(--fs-lead);
		line-height: 1.7;
	}
	.info-dim {
		color: var(--fg-dim);
		font-size: 0.9375rem;
	}
	.info-link {
		color: var(--accent-ink);
		text-decoration: none;
	}
	.info-link:hover {
		text-decoration: underline;
	}
	.info-links-stack {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.8rem;
	}
	@media (max-width: 991.98px) {
		.info-links-stack {
			align-items: stretch;
		}
	}

	/* ================= 9 · drinks collage ================= */
	.drinks {
		padding: calc(var(--u) * 5) 0 calc(var(--u) * 6);
	}
	/* 90% of the hero size, and this is the one place the measured scale bends.
	   The original sets this at 157.5px and breaks it COOL DRINKS / WARM
	   MEMORIES / IN EVERY SIP. — but that is TT Nooks, which is condensed.
	   Playfair 900 needs 1432px for "WARM MEMORIES" at 157.5px against a
	   1368px container, so it spills to four lines. Shaving 10% restores the
	   original's three-line rhythm, which reads as the more faithful choice.
	   Revisit if the TT Nooks license lands (plan §5 Q2). */
	.drinks-title {
		text-align: center;
		font-size: calc(var(--fs-hero) * 0.9);
		margin: 0 auto clamp(1rem, 3vw, 2.5rem);
	}
	.drinks-collage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(0.5rem, 2vw, 2rem);
		padding: clamp(1.5rem, 5vw, 4rem) 0;
		min-height: clamp(240px, 34vw, 460px);
	}
	.drinks-collage :global(.d-art) {
		position: absolute;
		pointer-events: none;
	}
	.drinks-collage :global(.d-phin) {
		left: 2%;
		top: 8%;
	}
	.drinks-collage :global(.d-cup) {
		right: 2%;
		top: 4%;
	}
	.drinks-collage :global(.d-beans) {
		left: 16%;
		bottom: 6%;
	}
	.drinks-collage :global(.d-bean) {
		right: 17%;
		bottom: 12%;
	}
	@media (max-width: 767.98px) {
		.drinks-collage :global(.d-beans),
		.drinks-collage :global(.d-bean) {
			display: none;
		}
		.drinks-collage :global(.d-phin) {
			top: auto;
			bottom: 0;
			left: 0;
		}
		.drinks-collage :global(.d-cup) {
			top: auto;
			bottom: 0;
			right: 0;
		}
	}
	/* Taped-polaroid tilt. These rotations are part of the look with motion off;
	   C2 only adds the opposite-direction drift (§1.5 M3). */
	.polaroid {
		position: relative;
		z-index: 1;
		margin: 0;
		flex: 0 1 clamp(150px, 21vw, 300px);
		background: #fff;
		padding: 10px 10px 34px;
		box-shadow: 0 16px 42px rgba(0, 0, 0, 0.42);
	}
	.polaroid img {
		display: block;
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
	}
	.polaroid--a {
		transform: rotate(-8deg);
	}
	.polaroid--b {
		transform: rotate(9deg);
	}
	.drinks-copy {
		max-width: 52ch;
		margin: clamp(1.5rem, 4vw, 3rem) auto 0;
	}
	.drinks-copy p {
		font-size: 1.0625rem;
		line-height: 1.75;
		color: var(--fg-muted);
	}
	.drinks-copy p:last-child {
		margin-bottom: 0;
	}
</style>
