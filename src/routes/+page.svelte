<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import LunchSpecial from '$lib/site/LunchSpecial.svelte';
	import {
		IMG,
		VID,
		BRAND,
		KITCHEN,
		TAGLINE,
		AN_NAO,
		MISSION,
		ADDRESS,
		PHONE,
		HOURS,
		LUNCH_WINDOW,
		ORDER_URL,
		DELIVERY_NOTE,
		SOCIAL,
		SEO_BLURB,
		NEWSLETTER_PITCH
	} from '$lib/content.js';

	/* ---------- auto media marquee (from the Editorial template) ---------- */
	const mediaCards = [
		{ src: `${IMG}/pho-special.jpg`, alt: 'Phở Special — rare beef, brisket, tendon, and tripe' },
		{ src: `${IMG}/spring-roll.jpg`, alt: 'Crispy spring rolls with nuoc cham' },
		{ src: `${IMG}/drinks-trio.jpg`, alt: 'Signature drinks — iced coffee, limeade, sugarcane juice' },
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

	/* ---------- newsletter ---------- */
	let email = $state('');
	let subscribed = $state(false);
	function subscribe(e) {
		e.preventDefault();
		// TODO: wire to the chosen newsletter provider before launch (brief §5).
		if (email.trim()) subscribed = true;
	}

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
	<!-- ============================== HERO ============================== -->
	<section class="section hero">
		<div class="hero-bg">
			<!-- HEVC .mov first for Safari; H.264 .mp4 for browsers without HEVC decode -->
			<video bind:this={heroVideo} autoplay muted loop playsinline aria-hidden="true">
				<source src="{VID}/Nonla-Express-Hero.mov" type="video/quicktime" />
				<source src="{VID}/Nonla-Express-Hero.mp4" type="video/mp4" />
			</video>
			<div class="hero-overlay"></div>
		</div>
		<!-- crisp arc divider into the page bg — a shallow nón-lá curve instead of a gradient fade -->
		<div class="hero-curve" aria-hidden="true">
			<svg viewBox="0 0 1440 88" preserveAspectRatio="none">
				<path d="M0,88 L0,60 Q720,-24 1440,60 L1440,88 Z" fill="var(--bg)" />
				<path d="M0,60 Q720,-24 1440,60" fill="none" stroke="var(--accent-2)" stroke-width="2.5" opacity="0.85" />
			</svg>
		</div>
		<div class="container container--md text-center hero-content">
			<h1 class="sr-only">{BRAND} — {KITCHEN}, Tangram Food Hall, Flushing, Queens</h1>
			<span class="eyebrow">Tangram Food Hall · Flushing, Queens</span>
			<p class="display display-xl hero-title">{TAGLINE}</p>
			<p class="hero-sub">
				{BRAND} — fast-casual {KITCHEN}. Fresh phở, rice plates & signature drinks, made quick
				without cutting corners. <em>{AN_NAO}</em>
			</p>
			<div class="hero-links">
				<a class="btn btn-cream" href={ORDER_URL} target="_blank" rel="noopener">Order Online</a>
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
		<!-- ============================== MEDIA MARQUEE ============================== -->
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

		<!-- ============================== LUNCH SPECIAL ============================== -->
		<section class="section padding-sm">
			<div class="container container--lg">
				<LunchSpecial />
			</div>
		</section>

		<!-- ============================== MISSION ============================== -->
		<section class="section padding-md">
			<div class="container container--md text-center">
				<span class="eyebrow">Our Mission</span>
				<h2 class="display display-md mission-line">“{MISSION}”</h2>
				<p class="mission-body">
					Born from a group of friends who love phở — and set out to make enjoying it on the go
					possible without sacrificing quality or flavor.
				</p>
				<a class="btn btn-outline" href="{base}/company/">Our Story</a>
			</div>
		</section>

		<!-- ============================== FEATURE: PHỞ ============================== -->
		<section class="section padding-sm">
			<div class="container container--lg">
				<div class="feature">
					<div class="feature-panel">
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

		<!-- ============================== FEATURE: DRINKS ============================== -->
		<section class="section padding-sm">
			<div class="container container--lg">
				<div class="feature feature--reverse">
					<div class="feature-panel feature-panel--soft">
						<span class="feature-eyebrow">Signature Drinks · 招牌饮品</span>
						<h2 class="display display-lg">Cà phê, limeade & more</h2>
						<p class="feature-body">
							Phin-brewed Vietnamese iced coffee, Thai green milk tea, salted limeade, and fresh
							sugarcane juice — poured at the drink station, $6 each.
						</p>
						<a class="btn btn-outline feature-btn" href={ORDER_URL} target="_blank" rel="noopener">Order Online</a>
					</div>
					<div class="feature-media">
						<img src="{IMG}/drinks-trio.jpg" alt="Sugarcane juice, Vietnamese iced coffee, and salted limeade" loading="lazy" />
					</div>
				</div>
			</div>
		</section>

		<!-- ============================== FIND US ============================== -->
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
							<a class="btn btn-cream" href={ORDER_URL} target="_blank" rel="noopener">Order on Snackpass</a>
							<a class="btn btn-outline btn-sm" href={SOCIAL.instagram.url} target="_blank" rel="noopener">
								Instagram {SOCIAL.instagram.label}
							</a>
						</p>
						<p class="info-dim">{DELIVERY_NOTE}</p>
					</div>
				</div>
			</div>
		</section>

		<!-- ============================== NEWSLETTER ============================== -->
		<section class="section section--alt padding-md" id="newsletter">
			<div class="container container--md text-center">
				<span class="eyebrow">Stay in Touch</span>
				<h2 class="display display-md">Join our mailing list</h2>
				<p class="newsletter-pitch">{NEWSLETTER_PITCH}</p>
				<div class="mail-form">
					{#if subscribed}
						<p class="subscribed-msg">Thank you — you're on the list.</p>
					{:else}
						<form onsubmit={subscribe}>
							<input
								type="email"
								bind:value={email}
								placeholder="Email address"
								required
								aria-label="Email address"
							/>
							<button class="btn btn-outline subscribe-btn">Subscribe</button>
						</form>
					{/if}
				</div>
				<p class="consent">
					By signing up, I agree to Nón Lá Express's
					<a href="{base}/terms-and-conditions/">Terms</a> and
					<a href="{base}/privacy-policy/">Privacy Policy</a>.
				</p>
			</div>
		</section>
	</div>
</main>

<style>
	/* ---------- hero ---------- */
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
		/* neutral scrim only — no green fade; the arc divider owns the bottom edge.
		   Slight dark vignette at the base grounds the video behind the curve. */
		background:
			linear-gradient(to top, rgba(15, 30, 25, 0.35), rgba(15, 30, 25, 0) 20%),
			linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25));
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
		color: var(--cream);
		background: rgba(26, 50, 43, 0.55);
		border-radius: 980px;
		padding: 7px 16px;
	}
	@media (max-width: 480px) {
		.hero .eyebrow {
			font-size: 10.5px;
			letter-spacing: 0.16em;
		}
	}
	.hero-title {
		color: var(--cream);
		margin: 0 0 0.8rem;
		text-transform: none; /* the tagline is lowercase by design: "phở, the new era" */
		text-shadow: 0 2px 22px rgba(15, 30, 25, 0.6);
	}
	.hero-sub {
		font-size: clamp(16px, 2vw, 19px);
		color: var(--cream);
		opacity: 0.94;
		max-width: 52ch;
		margin: 0 auto 0.5rem;
		text-shadow: 0 1px 14px rgba(15, 30, 25, 0.65);
	}
	.hero-sub em {
		font-style: italic;
		color: var(--accent-2);
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

	/* ---------- media marquee ---------- */
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
		background: var(--green-soft);
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
		opacity: 0.6;
		transition: opacity 0.35s ease-in-out;
		color: var(--cream);
		padding: 6px;
	}
	.carousel-btn svg {
		fill: var(--cream);
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
		border: 2px solid var(--cream);
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
		background: var(--cream);
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
		border-left: 9px solid var(--cream);
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		width: 0;
		height: 0;
		background: none;
	}

	/* ---------- mission ---------- */
	.mission-line {
		text-transform: none;
		font-weight: 600;
		font-variation-settings: 'opsz' 60;
		line-height: 1.3;
		max-width: 30ch;
		margin: 0 auto 1rem;
	}
	.mission-body {
		color: var(--cream-70);
		max-width: 52ch;
		margin: 0 auto 1.8rem;
	}

	/* ---------- feature rows (green panel + photo) ---------- */
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
		.feature--reverse .feature-panel {
			order: 2;
		}
		.feature--reverse .feature-media {
			order: 1;
		}
	}
	.feature-panel {
		background: var(--green);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		padding: clamp(2.5rem, 5vw, 4.5rem);
	}
	.feature-panel--soft {
		background: var(--green-soft);
	}
	.feature-eyebrow {
		font-family: var(--label);
		font-weight: 700;
		font-size: 12px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--cream-70);
		margin-bottom: 0.9rem;
	}
	.feature-body {
		font-size: 16px;
		line-height: 1.75;
		max-width: 46ch;
		color: var(--cream);
		opacity: 0.94;
		margin: 0 0 1.8rem;
	}
	.feature-btn {
		align-self: flex-start;
	}
	.feature-media {
		overflow: hidden;
		min-height: 320px;
		background: #efe6d2; /* the food photography's cream backdrop */
	}
	.feature-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 1.2s ease;
	}
	.feature:hover .feature-media img {
		transform: scale(1.04);
	}

	/* ---------- find us ---------- */
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
		font-size: 16.5px;
		line-height: 1.8;
	}
	.info-dim {
		color: var(--cream-55);
		font-size: 14px;
	}
	.info-link {
		color: var(--cream);
		opacity: 0.8;
		text-decoration: none;
	}
	.info-link:hover {
		text-decoration: underline;
		opacity: 1;
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

	/* ---------- newsletter ---------- */
	.section--alt {
		background: var(--bg-deep);
	}
	.newsletter-pitch {
		color: var(--cream-70);
		margin-bottom: 1.6rem;
	}
	.mail-form {
		max-width: 34rem;
		margin: 0 auto;
	}
	.mail-form form {
		display: flex;
		align-items: stretch;
		gap: 12px;
	}
	.mail-form input {
		flex: 1;
		width: 100%;
		outline: none;
		background: rgba(242, 235, 217, 0.07);
		border: 1px solid var(--cream-25);
		border-radius: 980px;
		font-size: 15px;
		color: var(--cream);
		font-family: var(--body-font);
		padding: 10px 20px;
		transition:
			border-color 0.2s ease,
			background 0.2s ease;
	}
	.mail-form input:focus {
		border-color: var(--accent-2);
		background: rgba(242, 235, 217, 0.1);
	}
	.mail-form input::placeholder {
		color: var(--cream-55);
	}
	.subscribe-btn {
		flex: none;
	}
	.subscribed-msg {
		font-size: 19px;
		padding: 0.75rem;
		margin: 0;
	}
	.consent {
		margin-top: 1.4rem;
		font-size: 12.5px;
		color: var(--cream-55);
	}
	.consent a {
		color: var(--cream-70);
	}
	@media (max-width: 575.98px) {
		.mail-form form {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
