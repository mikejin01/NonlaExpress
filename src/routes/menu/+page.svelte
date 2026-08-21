<script>
	/**
	 * /menu — Phase D re-skin (plan §2.6).
	 *
	 * The original's menu page is the plainest thing on that site and that is the
	 * point: a cream page, a ruled heading per section, and cut-out dish photos
	 * sitting DIRECTLY on the ground with no card, no frame and no price. Phase A
	 * could not do that (our page was cream but the cards were carrying the
	 * contrast) and §1.2c's green ground could not either — a cut-out whose
	 * backdrop is #F1EAD7 shows a cream rectangle on anything that isn't cream.
	 * The §1.2d swap made the page cream again, so the card-less treatment is
	 * finally available and this phase takes it (plan §2.2, "two facts Phase C/D
	 * will want").
	 *
	 * SURFACES. Cream ground throughout — no .on-* class on the food sections,
	 * because :root already is cream. The one exception is the closing CTA, which
	 * is .on-charcoal so the page ends on a dark band and the footer arc rises out
	 * of it exactly as it does on the homepage (plan §2.3; this replaces the
	 * .on-green-deep strip that used to put green against the green dome).
	 *
	 * TYPE is the measured scale from §1.1 and nothing else — re-measured off
	 * screenshots/orig-menu-full.png at 1440 for this page specifically:
	 *   ăn nào! 105 (--fs-xl) · kicker + item names 24 (--fs-md) · section
	 *   headings 36 (--fs-lg) · intro 22.5 (--fs-lead) · descriptions 18
	 *   (--fs-nav) · notes/captions 14 (--fs-label).
	 *
	 * THIRD COLOUR (§1.2d, "terracotta draws"): the ăn nào! script, the numbered
	 * badges and the two folk-art ornaments. Prices and links stay --accent-ink
	 * (green) — terracotta cannot be small text on cream.
	 */
	import Art from '$lib/site/Art.svelte';
	import { wpEdit } from '$lib/wp/wpEdit.svelte.js';
	import { IMG, AN_NAO, BRAND, MENU, ORDER_URL, LUNCH_WINDOW } from '$lib/content.js';
	import LunchSpecial from '$lib/site/LunchSpecial.svelte';

	/* Dot colours for the burger sauce row (menu signature). FALLBACK ONLY since
	   2026-08-20 — all four sauces now carry a real photo and the row renders
	   circular crops of those instead. Kept because it is what a fifth sauce
	   added without a photo would land on, and because the order here is
	   positional: it matches content.js's `sauces` array index for index. */
	const SAUCE_COLORS = ['#c0392b', '#f4efe4', '#e8a444', '#7fae6a'];

	/* Two of the four harvested menu-page vectors land here (gap G4); the lime
	   and the noodle squiggle are in the header. Placed where the drawing means
	   something — the appetizers are the shrimp dishes, phở arrives under a pile
	   of herbs — rather than sprinkled section by section. */
	const ORNAMENT = { appetizers: 'shrimp', noodle: 'herb' };

	/* Photos first. A photo-less item that lands mid-row leaves a hole between
	   two photos that reads as a broken image rather than as a dish we have no
	   shot of; sorted to the tail it becomes a short text run after the photo
	   rows. As of 2026-08-21 **every menu item has a photo**, so this sort is
	   currently a no-op standing guard for the next photo-less item. The
	   numbered sections keep the kitchen's own order. */
	const ordered = (/** @type {any[]} */ items) => [
		...items.filter((i) => i.img),
		...items.filter((i) => !i.img)
	];

	/* Options render as ONE comma-separated line — "Spring Rolls, Pork, Chicken,
	   Ribeye" (client direction 2026-08-21). They were stacked one per line, as
	   the original site does it, which made a four-option dish four rows tall
	   and out-weighed its own description. content.js carries them as a single
	   "Choice: a / b / c" string; this only normalizes the separator, so the
	   data stays readable on its own. */
	const choicesOf = (/** @type {string} */ choice) =>
		choice
			.replace(/^\s*choice:\s*/i, '')
			.split('/')
			.map((c) => c.trim())
			.filter(Boolean)
			.join(', ');
</script>

<svelte:head>
	<title>Menu — Nón Lá Express | Pho, Rice Plates & Signature Drinks, Flushing NY</title>
	<!-- Kept under the ~160 that Google truncates at. Two things came out on
	     purpose in Phase F, and both are about not committing to an answer we
	     don't have yet: the "$17"/"$6" prices are §5 Q5 (show prices at all?)
	     and "burgers" is §5 Q6 (is that section still on the menu?). This
	     wording is correct whichever way the client answers either one.
	     Measured 142 chars / 151 effective width — Google truncates on PIXELS
	     and the CJK run is double-width, so the raw count understates it. -->
	<meta
		name="description"
		content="Full menu at Nón Lá Express, Tangram Food Hall, Flushing: phở, rice plates and signature drinks. 法拉盛越南河粉菜单 — lunch special {LUNCH_WINDOW}."
	/>
</svelte:head>

<main id="main" tabindex="-1" class="menu-page">
	<!-- ============================== HEADER ==============================
	     The original's three-part header: green lime bleeding off the LEFT edge,
	     the red "ăn nào!" script centred over its kicker and intro, and the white
	     noodle squiggle off the RIGHT. Both pieces are absolute and clip against
	     the section's own overflow:hidden — that bleed is the effect. -->
	<header class="section menu-hero">
		<!-- The one placement that overrides the art tokens, deliberately: every
		     other piece takes whatever the surface hands it, but the lime has a
		     colour of its own on the original (#53B28F) and reads as a lime
		     because of it. --green-bright is the client's vivid green, which is
		     decorative-fill-only at 3.08:1 — a big graphic with no text on it is
		     precisely the job it exists for. -->
		<div class="menu-art menu-art--lime" aria-hidden="true">
			<Art name="lime" style="--art-fill: var(--green-bright); --art-detail: var(--cream)" />
		</div>
		<!-- Monochrome piece, so it takes `color`. The original draws it pure
		     white on cream — a texture you notice second, not first — and
		     --cream-bright is the token nearest that white. -->
		<div class="menu-art menu-art--noodles" aria-hidden="true">
			<Art name="noodles" />
		</div>

		<div class="container container--md text-center menu-hero-copy">
			<h1 class="menu-h1">
				<span class="script anao">{AN_NAO}</span>
				<span class="menu-kicker">{BRAND} Menu</span>
			</h1>
			<p class="menu-hero-sub">
				Our team ensures every dish in our menu is prepared quickly without cutting corners,
				capturing the rich and aromatic essence of Vietnamese cuisine.
			</p>
		</div>
	</header>

	<!-- ============================== SECTIONS ============================== -->
	{#each MENU as section}
		{@const hasPhotos = section.items.some((i) => i.img)}
		<section class="section padding-md menu-section" id={section.id}>
			<div class="container container--lg">
				<!-- Hairline above, hairline below: the original brackets each
				     section's heading and its serving note between two rules and
				     lets whitespace do the rest. -->
				<header class="section-head">
					<div class="section-head-row">
						<h2 class="display display-lg section-title">{section.title}</h2>
						{#if section.zh}
							<span class="section-caption">
								<span class="zh">{section.zh}</span> <span class="vi">({section.vi})</span>
							</span>
						{/if}
						{#if ORNAMENT[section.id]}
							<span class="section-art">
								<Art name={ORNAMENT[section.id]} />
							</span>
						{/if}
					</div>
					{#if section.blurb}<p class="section-blurb">{section.blurb}</p>{/if}
					{#if section.note}<p class="section-note">{section.note}</p>{/if}
				</header>

				<!-- No cards. Cut-outs straight on the page, name under the photo,
				     description under the name (plan §2.6). A section whose items
				     carry no photo at all drops the media box entirely and runs a
				     text grid instead of leaving holes (no section does today);
				     photo-less items inside a photo section sort to the tail
				     (see `ordered`). -->
				<div class="items" class:items--text={!hasPhotos}>
					{#each ordered(section.items) as item}
						<article class="item">
							{#if item.img}
								<div class="item-media">
									<img src="{IMG}/{item.img}" alt={item.en} loading="lazy" />
								</div>
							{/if}
							<h3 class="item-name">
								{#if item.num}<span class="num-badge">{item.num}</span>{/if}
								<span class="item-en"
									>{item.en}{#if item.spicy}<span class="spicy" title="Spicy">🌶</span>{/if}</span
								>
							</h3>
							{#if item.zh || item.vi}
								<p class="item-caption">
									{#if item.zh}<span class="zh">{item.zh}</span>{/if}
									{#if item.vi}<span class="vi">({item.vi})</span>{/if}
								</p>
							{/if}
							{#if item.desc}<p class="item-desc">{item.desc}</p>{/if}
							{#if item.choice}
								<p class="item-choice">{choicesOf(item.choice)}</p>
							{/if}
						</article>
					{/each}
				</div>

				{#if section.sauces}
					<div class="sauces">
						<span class="sauces-label">Sauces</span>
						{#each section.sauces as s, i}
							<span class="sauce">
								{#if s.img}
									<!-- alt="" on purpose: the sauce's name is the very next
									     thing in the same line, so a filled alt would make a
									     screen reader say it twice. -->
									<img class="sauce-photo" src="{IMG}/{s.img}" alt="" loading="lazy" />
								{:else}
									<span class="sauce-dot" style="background:{SAUCE_COLORS[i]}"></span>
								{/if}
								{s.en} <span class="zh sauce-zh">{s.zh}</span> <span class="vi">({s.vi})</span>
							</span>
						{/each}
					</div>
				{/if}

			</div>
		</section>
	{/each}

	<!-- ============================== LUNCH SPECIAL ==============================
	     Removed from the homepage 2026-08-07 (plan §2.4) and kept here, which is
	     arguably where a menu offer belongs. It is the one panel on the page: the
	     densest small text on the site, so it keeps its --cream-lift + --rule
	     lift rather than joining the card-less treatment above.

	     MOVED to the foot of the menu 2026-08-21 (client) — it used to sit
	     between the header and Appetizer. ⚠️ "Bottom of the page" stops HERE,
	     above the order CTA: the CTA is charcoal so the footer arc can rise out
	     of it (see below / plan §2.3), and a cream panel between the two would
	     break that seam. It also reads better — you see the menu, then the deal,
	     then the button. -->
	<section class="section padding-md">
		<div class="container container--lg">
			<LunchSpecial />
		</div>
	</section>

	<!-- ============================== ORDER CTA ==============================
	     CHARCOAL, not --green-deep. The footer arc's wedges show the page ground
	     (cream), so a green band here put the same green either side of a cream
	     seam; charcoal gives /menu the homepage's three-value close — charcoal →
	     cream wedges → green dome + terracotta ring (plan §2.3). -->
	<section class="section padding-md order-cta on-charcoal">
		<div class="container container--md text-center">
			<h2 class="display display-md">Hungry now?</h2>
			<p class="order-note">Order ahead for pickup at Tangram, or find us on Grubhub and Seamless.</p>
			<a
				class="btn btn-primary"
				href={wpEdit.text('global_order_url', ORDER_URL)}
				target="_blank"
				rel="noopener">Order on Snackpass</a
			>
			<!-- "prices" dropped 2026-08-21: the page no longer shows any, so
			     disclaiming them read as a leftover. -->
			<p class="menu-disclaimer">Menu items and availability are subject to change.</p>
		</div>
	</section>
</main>

<style>
	/* ---------- header ---------- */
	.menu-hero {
		/* clears the fixed navbar */
		padding: calc(var(--u) * 9) 0 calc(var(--u) * 5);
	}
	.menu-hero-copy {
		/* above the two bleeding art pieces */
		z-index: 2;
	}
	.menu-h1 {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15em;
		margin: 0 0 1.4rem;
	}
	/* The page's biggest terracotta moment, and the reason the third colour
	   needs no explanation here: at --fs-xl it is 105px, miles past the
	   18.66px/700 floor that 3.88:1 imposes on warm type (plan §1.2d). */
	.anao {
		font-size: var(--fs-xl);
		color: var(--warm);
	}
	.menu-kicker {
		font-size: var(--fs-md);
		line-height: 1.2;
	}
	.menu-hero-sub {
		font-size: var(--fs-lead);
		color: var(--fg-muted);
		max-width: 34ch;
		margin: 0 auto;
	}

	.menu-art {
		position: absolute;
		z-index: 1;
		pointer-events: none;
	}
	.menu-art--lime {
		left: -3vw;
		top: calc(var(--u) * 8);
		width: 38vw;
		max-width: 560px;
	}
	.menu-art--noodles {
		right: 0.5vw;
		top: calc(var(--u) * 10);
		width: 27vw;
		max-width: 400px;
		color: var(--cream-bright);
	}

	/* ---------- section heads ---------- */
	.section-head {
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
		padding: 1rem 0 0.85rem;
		margin-bottom: 2.8rem;
	}
	.section-head-row {
		display: flex;
		align-items: baseline;
		gap: 0.9rem;
		flex-wrap: wrap;
	}
	.section-title {
		margin: 0;
	}
	/* ⚠️ §5 Q5 is ANSWERED (2026-08-21, client): this page shows NO PRICES at
	   all — which is what the original site did, so Phase D's "keep ours as a
	   small green label" default is retired along with `.section-price`,
	   `.item-price` and `.extras-price`. The price DATA still lives in
	   content.js and is deliberately unrendered; don't reintroduce a price here
	   because you found a `price:` field. */
	.section-caption {
		font-size: var(--fs-label);
		color: var(--fg-muted);
	}
	/* Sized by HEIGHT, not width: the shrimp is 1.51:1 and the herb 0.84:1, so
	   one shared width made the herb half again as tall as the heading row and
	   opened a gap under "Noodle" that looked like a layout bug. Equal optical
	   height is what makes the two read as one set. */
	.section-art {
		display: flex;
		align-items: center;
		height: clamp(52px, 5.2vw, 74px);
		margin-left: auto;
		color: var(--warm); /* a graphic, so terracotta draws it */
	}
	.section-art :global(.art) {
		width: auto;
		height: 100%;
	}
	.section-art :global(svg) {
		width: auto;
		height: 100%;
	}
	.section-blurb {
		color: var(--fg-muted);
		font-size: var(--fs-lead);
		max-width: 62ch;
		margin: 0.9rem 0 0;
	}
	.section-note {
		font-size: var(--fs-label);
		color: var(--fg-dim);
		/* wide enough for the longest serving note to hold one line, as it does
		   on the original — 62ch at 14px broke "Served with white rice…" in two */
		max-width: 90ch;
		margin: 0.55rem 0 0;
	}

	/* ---------- items: no cards ----------
	   THREE columns, fixed, not auto-fill. The original's grid is 3-up at 1440
	   and the photo is the section's whole presence; an auto-fill track that
	   happened to fit four or five shrank every dish to a thumbnail. */
	.items {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 3.4rem 2.6rem;
	}
	.items--text {
		gap: 2rem 2.6rem;
	}
	@media (max-width: 1000px) {
		.items {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 620px) {
		.items {
			grid-template-columns: 1fr;
			gap: 2.6rem;
		}
	}
	.item {
		display: flex;
		flex-direction: column;
	}
	/* Every photo renders at the same 4:3 height, rounded 18px like the
	   homepage's photo cards (.card 18 / .fav-card 20). The ratio sits on the
	   IMG, not the wrapper: a wrapper's `aspect-ratio` is only a preferred
	   height, so a portrait source (the 570×610 Fries crop) grew the box and
	   broke its row — an img with its own aspect-ratio + object-fit cannot. */
	.item-media {
		margin-bottom: 1rem;
	}
	.item-media img {
		width: 100%;
		aspect-ratio: 4 / 3;
		height: auto;
		object-fit: cover;
		border-radius: 18px;
		display: block;
	}
	/* Drinks is the one remaining CUT-OUT section (studio backdrop ≈ cream,
	   plan §2.2) and its cups are portrait — a 4:3 cover crop would behead
	   them. `contain` keeps each cup whole inside the same-height box; the
	   near-cream backdrop makes the letterboxing invisible. */
	#drinks .item-media img {
		object-fit: contain;
	}
	.item-name {
		display: flex;
		align-items: baseline;
		gap: 0.5em;
		font-family: var(--body-font);
		font-size: var(--fs-md);
		line-height: 1.25;
		margin: 0 0 0.3rem;
	}
	/* The original writes the number into the name ("1. Ribeye Phở"); ours keeps
	   the printed menu's terracotta badge and puts it in the same place, which is
	   also the only place it can go now that there is no card to pin it to. */
	.item-name .num-badge {
		flex: none;
		align-self: flex-start;
		transform: translateY(0.1em);
	}
	.item-en {
		flex: 1 1 auto;
	}
	.spicy {
		margin-left: 0.4em;
	}
	.item-caption {
		font-size: var(--fs-label);
		color: var(--fg-muted);
		margin: 0 0 0.5rem;
	}
	.item-caption .zh {
		margin-right: 0.35em;
	}
	.item-desc {
		font-size: var(--fs-nav);
		line-height: 1.5;
		color: var(--fg-muted);
		margin: 0;
	}
	/* `capitalize` is load-bearing: content.js writes the options lowercase
	   ("spring rolls / pork / chicken / ribeye"), so this is what makes the line
	   read "Spring Rolls, Pork, Chicken, Ribeye". Soda's are already cased and
	   are unaffected. */
	.item-choice {
		margin: 0.5rem 0 0;
		font-size: var(--fs-label);
		line-height: 1.5;
		color: var(--fg-dim);
		text-transform: capitalize;
	}

	/* ---------- sauces (burger section) ---------- */
	.sauces {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.6rem;
		margin-top: 2.2rem;
		font-size: var(--fs-nav);
		color: var(--fg-muted);
	}
	.sauces-label {
		font-family: var(--label);
		font-weight: 700;
		font-size: 11.5px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--accent-ink);
	}
	.sauce {
		display: inline-flex;
		align-items: center;
		gap: 0.45em;
	}
	.sauce-dot {
		width: 13px;
		height: 13px;
		border-radius: 50%;
		display: inline-block;
		border: 1px solid var(--rule);
	}
	/* The real thing, in the dot's place. The four sauce photos are square and
	   shot straight down with the bowl centred (content.js), so a 50% radius
	   lands on the rim and crops nothing — but that ALSO means these are the one
	   set of dish photos on the page with a wood-table background rather than the
	   #F1EAD7 studio backdrop, so unlike the cut-outs they need the --rule
	   hairline to sit on cream without looking like a floating swatch. */
	.sauce-photo {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		object-fit: cover;
		display: inline-block;
		flex: none;
		border: 1px solid var(--rule);
	}
	.sauce-zh {
		font-size: 12.5px;
	}

	/* ---------- order CTA ---------- */
	.order-note {
		color: var(--fg-muted);
		margin-bottom: 1.6rem;
	}
	.menu-disclaimer {
		margin-top: 2rem;
		font-size: var(--fs-fine);
		color: var(--fg-dim);
	}

	/* ---------- narrow ----------
	   The lime cannot stay behind the copy on a phone: --green-bright is a
	   decorative fill at 3.08:1 and text over it would be unreadable. So it
	   leaves the absolute layer and flows above the heading, still bleeding off
	   the left edge. The noodles are white-on-cream and harmless behind text,
	   but there is no width left for them — they go. */
	@media (max-width: 900px) {
		.menu-art--noodles {
			display: none;
		}
		.menu-art--lime {
			position: static;
			width: 62vw;
			margin: 0 auto 1.6rem -12vw;
		}
		.menu-hero {
			padding-top: calc(var(--u) * 7);
		}
	}
</style>
