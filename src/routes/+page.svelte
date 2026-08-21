<script>
	/**
	 * Homepage — the original nonlaexpress.com's spine (plan §1.3 / Phase C) with
	 * THREE of our own sections kept deliberately. Phase C first shipped as a
	 * near-faithful copy and the client asked for five of our sections back; over
	 * 2026-08-07 they then trimmed the page three times — out went the Lunch
	 * Special section, the Signature Drinks feature row, and the three-column
	 * intro. Plan §2.4 tracks what is in and what was removed; the point of it is
	 * that our sections are not deleted to "match the original", NOT that any
	 * particular section is permanent.
	 *
	 * SURFACES are as of plan §1.2d (the colour swap): the page ground is CREAM,
	 * so a section with no .on-* class is cream and green is what you ask for.
	 *
	 *   1  video hero              OURS   ·  .on-media + curve w/ terracotta ring
	 *                                     ·  carries the page's ONLY h1
	 *   2  sliding dish cards      OURS   ·  rAF marquee w/ prev / next / pause
	 *   3  statement hero + 3 phở cards   .on-green-deep + .on-cream cards
	 *   4  feature: phở            OURS   ·  .on-green panel + sand media half
	 *   5  type marquee, two rows          (cream — black type, red animals)
	 *   6  interior grid, 3×2
	 *   7  find us                 OURS
	 *   8  drinks collage                 .on-charcoal
	 *   →  footer carries the newsletter + the arc (Footer.svelte)
	 *
	 * ⚠️ §1.5 M4 (intro animal parallax) and M6 (intro slideshow) went with the
	 * intro section and are NOT buildable here any more. C2 is M1/M2/M3/M5.
	 *
	 * MOTION. The rAF card marquee and the scroll-arrow bob are the only moving
	 * parts, and both already bail out under prefers-reduced-motion. Everything
	 * Phase C2 adds (§1.5 M1–M6) must likewise leave the page correct with all
	 * animation removed.
	 */
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import Art from '$lib/site/Art.svelte';
	import InlineEdit from '$lib/inline-edit/InlineEdit.svelte';
	import ImageEdit from '$lib/inline-edit/ImageEdit.svelte';
	import { wpEdit } from '$lib/wp/wpEdit.svelte.js';
	import { telHref } from '$lib/wp/client.js';
	import {
		IMG,
		VID,
		ART,
		BRAND,
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
		META_DESCRIPTION
	} from '$lib/content.js';

	/* ---------- values that live in X.O. Admin rather than in a content key ----
	   These are the same options the schema.org listing and the lead emails read,
	   so the page can't be allowed to disagree with them. The admin fields for
	   hours and address are textareas: one line each, blank lines dropped. */
	const lines = (/** @type {string} */ value) =>
		String(value ?? '')
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean);

	const liveHours = $derived(
		lines(wpEdit.text('global_contact_hours', HOURS.map((h) => `${h.days}\n${h.time}`).join('\n')))
	);
	const liveAddress = $derived(
		lines(wpEdit.text('global_contact_address', ADDRESS.lines.join('\n')))
	);
	const livePhone = $derived(wpEdit.text('global_contact_phone', PHONE.display));
	const liveOrderUrl = $derived(wpEdit.text('global_order_url', ORDER_URL));

	/* ---------- auto media marquee (kept from the Editorial template) ----------
	   Not the same thing as the type marquee in section 5: that one is the
	   original's giant "nón lá / express" band and gets pure-CSS tracks in C2.
	   This is ours, it is a photo carousel with real controls, and it stays.
	   FIVE dish cards since 2026-08-07 — the drinks-trio photo was removed on
	   client direction. The track renders the set twice and wraps at
	   scrollWidth/2, so one copy must stay wider than the viewport or the wrap
	   shows a gap: at 25vw + 20px per card that holds down to 4 cards. Don't
	   drop below that without re-checking.

	   ⚠️ ALL FIVE cards are homepage-only harvested cut-outs with un-prefixed
	   names: /menu moved every dish here to the owner's in-situ photos
	   (spring roll + wings on 2026-08-20, the other three on 2026-08-21) and
	   this carousel deliberately did NOT follow, because all five cards sit on
	   cream with no frame and only a cut-out reads right there. These files are
	   not menu item images any more, which is why the `menu-` convention does
	   not apply to them. */
	const mediaCards = [
		{ src: `${IMG}/pho-special.jpg`, alt: 'Phở Special — rare beef, brisket, tendon, and tripe' },
		{ src: `${IMG}/spring-roll.jpg`, alt: 'Crispy spring rolls with nuoc cham' },
		{ src: `${IMG}/rice-vermicelli-bowl.jpg`, alt: 'Rice vermicelli bowl with fresh herbs' },
		{ src: `${IMG}/wings.jpg`, alt: 'Lemongrass chicken wings' },
		{ src: `${IMG}/shaking-beef-rice.jpg`, alt: 'Shaking beef rice' }
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

	/* Four repeats is enough to overflow the widest viewport; the duplicated
	   track below doubles it again. */
	const MQ = [0, 1, 2, 3];
	/* §1.5 M1's mechanism: each row renders its track TWICE and animates both
	   between translateX(0) and translateX(-100%), so the second copy is
	   standing exactly where the first one started at the moment it wraps. The
	   loop is only seamless while ONE track is wider than the viewport —
	   4 repeats holds that down to 540px (measured: ~1520px of track against a
	   540px viewport). Drop the repeat count and the wrap shows a gap. */
	const MQ_COPIES = [0, 1];

	/* Six interiors, tight 3×2 masonry — the original's section 6 (ours is 6 too). */
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
	<meta name="description" content={META_DESCRIPTION} />
</svelte:head>

<main id="main" tabindex="-1">
	<!-- ============================== 1 · VIDEO HERO ==============================
	     OURS, kept on client direction (plan §2.4). Carries the page's ONLY h1
	     since 2026-08-07: the intro section that used to hold the SEO line was
	     removed and its copy moved up here, so the hero headline became a real
	     <h1> instead of the <p> it was while the intro existed. -->
	<section class="section hero">
		<div class="hero-bg">
			<!-- HEVC .mov first for Safari; H.264 .mp4 for browsers without HEVC decode.
			     v2 (2026-08-14): new footage, 1080p from the client's 4K master
			     (docs/assets/video-source/), ~2.3MB/4.2MB vs the 15/17MB originals. -->
			<video bind:this={heroVideo} autoplay muted loop playsinline aria-hidden="true">
				<source src="{VID}/Nonla-Express-Hero-v2.mov" type="video/quicktime" />
				<source src="{VID}/Nonla-Express-Hero-v2.mp4" type="video/mp4" />
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
			<!-- Eyebrow says the STALL, not the borough: the h1 and the blurb below it
			     both end "in Flushing, Queens", and the old "Tangram Food Hall ·
			     Flushing, Queens" made that three times in three lines. -->
			<span class="eyebrow"><InlineEdit k="hero_eyebrow" value="Tangram Food Hall · Stall FH17" /></span>
			<!-- ⚠️ .hero-title carries a MEASURED clamp fitted to break this exact
			     50-character string at two lines (plan §2.3). Editing this copy live
			     can therefore change the hero's line count — re-measure if it does. -->
			<h1 class="display hero-title"><InlineEdit k="hero_h1" value={INTRO_SEO.h1} /></h1>
			<p class="hero-sub"><InlineEdit k="hero_blurb" value={INTRO_SEO.blurb} multiline /></p>
			<div class="hero-links">
				<a class="btn btn-primary" href={wpEdit.text('global_order_url', ORDER_URL)} target="_blank" rel="noopener">
					<InlineEdit k="hero_cta_order" value="Order Online" />
				</a>
				<a class="btn btn-outline" href="{base}/menu/"><InlineEdit k="hero_cta_menu" value="View Menu" /></a>
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

		<!-- The three-column INTRO (rooster · slideshow · h1 + buffalo, pig
		     lower-left) was removed 2026-08-07 on client direction, and its copy
		     moved into the hero above — which is why the hero headline is now the
		     real <h1>. See plan §2.4; the folk animals still appear in the type
		     marquee, and §1.5 M4/M6 are no longer buildable on this page. -->

		<!-- ============================== 3 · STATEMENT + PHO CARDS ==============================
		     The original's terracotta block, in --green-deep. The cards are cream
		     panels sitting ON the band exactly as the originals sit on terracotta —
		     and the dish cut-outs' own backdrop is #F1EAD7, one step off our cream,
		     so they drop in with no visible seam (plan §2.2). -->
		<section class="section statement on-green-deep">
			<div class="container container--md text-center">
				<h2 class="display display-hero statement-title">
					<InlineEdit k="statement_headline" value={STATEMENT.headline} />
				</h2>
				<p class="statement-body"><InlineEdit k="statement_body" value={STATEMENT.body} multiline /></p>
				<a
					class="tag-link"
					href={wpEdit.text('global_instagram_url', SOCIAL.instagram.url)}
					target="_blank"
					rel="noopener"><InlineEdit k="statement_tag" value={STATEMENT.tag} /></a>
				<p class="favorites-caption">
					<InlineEdit k="favorites_caption" value={PHO_FAVORITES.caption} multiline />
				</p>
			</div>
			<div class="container container--lg">
				<div class="fav-row">
					{#each PHO_FAVORITES.cards as card, i}
						<figure class="fav">
							<div class="fav-card on-cream">
								<ImageEdit
									k="fav_{i}_img"
									src="{IMG}/{card.item.img}"
									altKey="fav_{i}_alt"
									alt={card.item.en}
									loading="lazy"
								/>
							</div>
							<figcaption>
								<h3 class="fav-name"><InlineEdit k="fav_{i}_name" value={card.label} /></h3>
								<p class="fav-desc"><InlineEdit k="fav_{i}_desc" value={card.item.desc} multiline /></p>
							</figcaption>
						</figure>
					{/each}
				</div>
			</div>
		</section>

		<!-- ============================== 4 · FEATURE: PHỞ ==============================
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
						<span class="feature-eyebrow"><InlineEdit k="feature_eyebrow" value="On the Menu · 河粉" /></span>
						<h2 class="display display-lg">
							<InlineEdit k="feature_headline" value="Phở, made for right now" />
						</h2>
						<p class="feature-body">
							<InlineEdit
								k="feature_body"
								value="Fresh ingredients, tender meats, and aromatic herbs in every bowl — silky rice noodles in a rich, comforting broth, served with bean sprouts, Thai basil, lime, and jalapeños on the side."
								multiline
							/>
						</p>
						<a class="btn btn-outline feature-btn" href="{base}/menu/">
							<InlineEdit k="feature_cta" value="View Full Menu" />
						</a>
					</div>
					<div class="feature-media">
						<ImageEdit
							k="feature_img"
							src="{IMG}/pho-bowl-tall.jpg"
							altKey="feature_img_alt"
							alt="Rare eye round beef phở with Thai basil"
							loading="lazy"
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- ============================== 5 · TYPE MARQUEE ==============================
		     Two duplicated tracks running in OPPOSITE directions at 30.9s and
		     36.5s — deliberately co-prime-ish so the rows never re-sync (§1.5 M1).
		     Static (reduced motion, or no CSS animation at all) they still read as
		     the original's band, which is the requirement on everything C2 adds. -->
		<section class="section marquee-band" aria-hidden="true">
			<div class="mq-row">
				{#each MQ_COPIES as copy (copy)}
					<div class="mq-track">
						{#each MQ as n (n)}
							<span class="script mq-word">nón lá</span>
							<img class="mq-animal" src="{ART}/buffalo.svg" alt="" />
						{/each}
					</div>
				{/each}
			</div>
			<div class="mq-row mq-row--right">
				{#each MQ_COPIES as copy (copy)}
					<div class="mq-track">
						{#each MQ as n (n)}
							<span class="script mq-word">express</span>
							<img class="mq-animal" src="{ART}/rooster.svg" alt="" />
						{/each}
					</div>
				{/each}
			</div>
		</section>
		<h2 class="sr-only">Inside {BRAND}</h2>

		<!-- ============================== 6 · INTERIOR GRID ============================== -->
		<section class="section interiors">
			<div class="interior-grid">
				{#each interiors as p, i}
					<ImageEdit k="interior_{i}_img" src={p.src} altKey="interior_{i}_alt" alt={p.alt} loading="lazy" />
				{/each}
			</div>
		</section>

		<!-- ============================== 7 · FIND US ============================== -->
		<section class="section padding-md" id="find-us">
			<div class="container container--lg">
				<div class="info-row">
					<div class="info-col">
						<span class="eyebrow"><InlineEdit k="findus_hours_label" value="Hours" /></span>
						<!-- Hours and the address come from X.O. Admin, not from a content
						     key: they are the same values the schema.org listing and the
						     lead emails use, and a restaurant whose hours disagree between
						     the page and Google is worse than one that can't edit them
						     inline. Both admin fields are textareas — one line each. -->
						<p class="info-strong">
							{#each liveHours as line}{line}<br />{/each}
						</p>
						<p class="info-dim">
							<InlineEdit k="findus_lunch_note" value="Lunch special · {LUNCH_WINDOW}" />
						</p>
					</div>
					<div class="info-col">
						<span class="eyebrow"><InlineEdit k="findus_label" value="Find Us" /></span>
						<p class="info-strong">
							{#each liveAddress as line}{line}<br />{/each}
						</p>
						<p class="info-dim"><InlineEdit k="findus_transit" value={ADDRESS.transit} multiline /></p>
						<p>
							<a class="info-link" href={ADDRESS.mapsUrl} target="_blank" rel="noopener">
								<InlineEdit k="findus_directions" value="Get Directions" /></a><br />
							<a class="info-link" href={telHref(livePhone)}>Tel: {livePhone}</a>
						</p>
					</div>
					<div class="info-col">
						<span class="eyebrow"><InlineEdit k="findus_order_label" value="Order" /></span>
						<p class="info-links-stack">
							<a class="btn btn-primary" href={liveOrderUrl} target="_blank" rel="noopener">
								<InlineEdit k="findus_order_cta" value="Order on Snackpass" />
							</a>
							<a
								class="btn btn-outline btn-sm"
								href={wpEdit.text('global_instagram_url', SOCIAL.instagram.url)}
								target="_blank"
								rel="noopener"
							>
								<InlineEdit k="findus_instagram_cta" value="Instagram {SOCIAL.instagram.label}" />
							</a>
						</p>
						<p class="info-dim"><InlineEdit k="findus_delivery_note" value={DELIVERY_NOTE} /></p>
					</div>
				</div>
			</div>
		</section>

		<!-- ============================== 8 · DRINKS COLLAGE ==============================
		     Charcoal against the green ground is a subtle step, so this one runs
		     full-bleed with no rounding — the change of surface has to read on its
		     own. Polaroids keep their static −8° / +9° even with motion off (§1.5 M3).
		     It also has to stay LAST: the footer arc rises out of it. -->
		<section class="section drinks on-charcoal">
			<div class="container container--lg">
				<!-- ⚠️ This headline already sits off the measured type scale because
				     Playfair 900 is ~9% wider than the real face (plan §2.3, Q2).
				     Lengthening it live will push it further. -->
				<h2 class="display display-hero drinks-title">
					<InlineEdit k="drinks_headline" value={DRINKS_BLURB.headline} />
				</h2>

				<div class="drinks-collage">
					<Art class="d-art d-phin" name="phin" width="clamp(90px, 11vw, 168px)" />
					<Art class="d-art d-cup" name="cup" width="clamp(96px, 12vw, 180px)" />
					<Art class="d-art d-beans" name="beans" width="clamp(52px, 6vw, 92px)" />
					<Art class="d-art d-bean" name="bean" width="clamp(20px, 2.4vw, 36px)" />

					<figure class="polaroid polaroid--a">
						<ImageEdit
							k="drinks_photo_a"
							src="{IMG}/drinks-trio.jpg"
							altKey="drinks_photo_a_alt"
							alt="Sugarcane juice, Vietnamese iced coffee and salted limeade"
							loading="lazy"
						/>
					</figure>
					<figure class="polaroid polaroid--b">
						<ImageEdit
							k="drinks_photo_b"
							src="{IMG}/lifestyle-bw.jpg"
							altKey="drinks_photo_b_alt"
							alt="Friends sharing bowls of phở"
							loading="lazy"
						/>
					</figure>
				</div>

				<div class="drinks-copy text-center">
					<p><InlineEdit k="drinks_body_en" value={DRINKS_BLURB.en} multiline /></p>
					<p class="zh"><InlineEdit k="drinks_body_zh" value={DRINKS_BLURB.zh} multiline /></p>
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
		/* Neutral scrim only — the arc divider owns the bottom edge. 0.65 is
		   measured, not guessed, and is RE-measured per video: the v2 footage
		   (2026-08-14) is far brighter than the old clip (white bowl, pale
		   noodles), and the 0.55 tuned on that dark footage left .hero-sub at
		   3.35:1 worst with 6.6% of its pixels under 4.5:1. Sampling v2 across
		   16 timestamps at both widths, 0.65 is the least scrim that leaves
		   every hero element at 0.00% under threshold (worst 4.63:1, before
		   text-shadow). Re-run the sample if the video changes again. */
		background:
			linear-gradient(to top, rgba(45, 41, 38, 0.5), rgba(45, 41, 38, 0) 22%),
			linear-gradient(rgba(26, 22, 19, 0.65), rgba(26, 22, 19, 0.65));
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
	/* Off the measured type scale on purpose, and for a different reason than the
	   drinks headline's 0.9 shave (plan §2.3). This headline changed JOB on
	   2026-08-07: it used to be the four-word brand line "phở, the new era" at
	   --fs-xl/105px, and is now the 50-character SEO h1 moved up from the deleted
	   intro. At 105px that sets three lines and swallows the hero; the scale has
	   no step between 36px and 105px, so this role gets its own clamp, sized to
	   break to TWO lines at 1440 inside the 68rem container. Re-measure if the
	   copy changes — it is fitted to this exact string. */
	.hero-title {
		font-size: clamp(1.75rem, 4.4vw, 3.95rem);
		color: var(--fg);
		margin: 0 0 0.8rem;
		text-shadow: 0 2px 22px rgba(26, 22, 19, 0.55);
	}
	.hero-sub {
		font-size: var(--fs-lead);
		/* --fg, not --fg-muted, and this is a contrast fix rather than a style
		   preference. On .on-media --fg-muted is cream at 0.9 ALPHA, so over the
		   video it composites toward whatever frame is behind it. Re-sampling the
		   real video across 8 timestamps (Phase F) put 0.29% of the pixels behind
		   this line under 4.5:1 at 1440 and 0.37% at 540, worst 3.94:1. Opaque
		   cream takes that to 0.01% / 0.00%, worst 4.44:1 / 4.54:1 — and that
		   measurement ignores the text-shadow below, so the real margin is wider.
		   The 0.9 muting was invisible against a dark video anyway. */
		color: var(--fg);
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

	/* ================= 3 · statement + pho cards ================= */
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
	.fav-card :global(img) {
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

	/* ================= 4 · feature row (panel + photo) ================= */
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
	.feature-media :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		mix-blend-mode: multiply;
		transition: transform 1.2s ease;
	}
	.feature:hover .feature-media :global(img) {
		transform: scale(1.04);
	}

	/* ================= 5 · type marquee ================= */
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
		flex: none; /* two tracks share the row — neither may shrink, or the
		               wrap point stops matching translateX(-100%) */
	}
	/* Row 2 starts shifted so the two rows never line up vertically — the
	   original's rows also run at different phases as well as different
	   directions and durations. The offset lives on the ROW, not on a track:
	   a margin on the animated element would move with it. */
	.mq-row--right {
		margin-left: -14vw;
	}
	/* §1.5 M1. Each track slides exactly its own width, so the duplicate lands
	   where the original started — the seam never shows. Row 1 runs left, row 2
	   runs right (its keyframe is the same journey read backwards), and the two
	   durations are the measured ones; being unequal is the point.
	   The row-2 direction needs one track's width of content sitting off-screen
	   LEFT at rest, which is exactly what the duplicate provides. */
	@media (prefers-reduced-motion: no-preference) {
		.mq-track {
			animation: mq-left 30.9s linear infinite;
		}
		.mq-row--right .mq-track {
			animation: mq-right 36.5s linear infinite;
		}
	}
	@keyframes mq-left {
		to {
			transform: translateX(-100%);
		}
	}
	@keyframes mq-right {
		from {
			transform: translateX(-100%);
		}
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

	/* ================= 6 · interiors ================= */
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
	.interior-grid :global(img) {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 2;
		object-fit: cover;
	}

	/* ================= 7 · find us ================= */
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

	/* ================= 8 · drinks collage ================= */
	.drinks {
		padding: calc(var(--u) * 5) 0 calc(var(--u) * 6);
		/* §1.5 M3 drift amplitudes. Measured on the original at 1440 (cup ±102px,
		   phin ±107px, polaroids ±60px) and expressed in vw so a phone doesn't
		   get a desktop-sized shove — the clamps hold the measured value at 1440
		   and stop a 2560px monitor from doubling it.
		   Read by the keyframes below via --drift; custom properties inherit, so
		   each element only has to point --drift at the right one. */
		--drift-phin: clamp(38px, 7.4vw, 110px);
		--drift-cup: clamp(36px, 7.1vw, 105px);
		--drift-polaroid: clamp(22px, 4.2vw, 62px);
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
	.polaroid :global(img) {
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

	/* ---------- §1.5 M3 · drinks parallax ----------
	   Scroll-linked drift over the section's own pass through the viewport
	   (`cover` = first pixel in to last pixel out ≈ 1800px of scroll here,
	   against the ~1600px the original was measured over, so the measured
	   amplitudes transfer directly).
	   THE POINT OF THE EFFECT IS THE DISAGREEMENT: the art drifts DOWN the page
	   as you scroll (it lags) while polaroid A drifts UP (it leads) and
	   polaroid B drifts down against it. The two polaroids moving apart from
	   each other is what sells the collage as a pile of loose objects.
	   The bean cluster and the single bean stay STATIC — measured as static on
	   the original, and they are the fixed point the rest moves against.
	   Rotation is baked into the polaroids' keyframes because they carry a
	   static tilt that has to survive; translateY is written FIRST so the drift
	   runs down the page rather than along the tilted axis. */
	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: view()) {
			.drinks {
				view-timeline-name: --drinks-view;
				view-timeline-axis: block;
			}
			/* Longhands on purpose: the `animation` shorthand RESETS
			   animation-timeline and animation-range to their initial values,
			   so a shorthand written after these two would silently put every
			   drift back on the document timeline and run it once on load. */
			.drinks-collage :global(.d-phin),
			.drinks-collage :global(.d-cup),
			.polaroid--a,
			.polaroid--b {
				animation-timing-function: linear;
				animation-fill-mode: both;
				animation-timeline: --drinks-view;
				animation-range: cover 0% cover 100%;
			}
			.drinks-collage :global(.d-phin) {
				--drift: var(--drift-phin);
				animation-name: d-lag;
			}
			.drinks-collage :global(.d-cup) {
				--drift: var(--drift-cup);
				animation-name: d-lag;
			}
			.polaroid--a {
				animation-name: d-lead-a;
			}
			.polaroid--b {
				animation-name: d-lag-b;
			}
		}
	}
	@keyframes d-lag {
		from {
			transform: translateY(calc(var(--drift) * -1));
		}
		to {
			transform: translateY(var(--drift));
		}
	}
	@keyframes d-lead-a {
		from {
			transform: translateY(var(--drift-polaroid)) rotate(-8deg);
		}
		to {
			transform: translateY(calc(var(--drift-polaroid) * -1)) rotate(-8deg);
		}
	}
	@keyframes d-lag-b {
		from {
			transform: translateY(calc(var(--drift-polaroid) * -1)) rotate(9deg);
		}
		to {
			transform: translateY(var(--drift-polaroid)) rotate(9deg);
		}
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
