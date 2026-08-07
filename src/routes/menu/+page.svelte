<script>
	import { IMG, AN_NAO, MENU, ORDER_URL, LUNCH_WINDOW } from '$lib/content.js';
	import LunchSpecial from '$lib/site/LunchSpecial.svelte';

	// dot colors for the burger sauce row (menu signature)
	const SAUCE_COLORS = ['#c0392b', '#f4efe4', '#e8a444', '#7fae6a'];
</script>

<svelte:head>
	<title>Menu — Nón Lá Express | Pho, Rice Plates & Signature Drinks, Flushing NY</title>
	<meta
		name="description"
		content="Full menu at Nón Lá Express, Tangram Food Hall, Flushing: pho ($17), rice plates, appetizers, burgers, and $6 signature drinks. 法拉盛越南河粉菜单 — lunch special {LUNCH_WINDOW}."
	/>
</svelte:head>

<main class="menu-page">
	<!-- ============================== HEADER ============================== -->
	<header class="section menu-hero padding-md">
		<div class="container container--md text-center">
			<span class="eyebrow">{AN_NAO} — let's eat</span>
			<h1 class="display display-xl">The Menu</h1>
			<p class="menu-hero-sub">
				Every dish is prepared quickly without cutting corners, capturing the rich and aromatic
				essence of Vietnamese cuisine.
			</p>
		</div>
	</header>

	<!-- ============================== LUNCH SPECIAL ============================== -->
	<section class="section padding-sm">
		<div class="container container--lg">
			<LunchSpecial />
		</div>
	</section>

	<!-- ============================== SECTIONS ============================== -->
	{#each MENU as section}
		<section class="section padding-md menu-section" id={section.id}>
			<div class="container container--lg">
				<header class="section-head">
					<h2 class="display display-lg section-title">
						{section.title} <span class="price-oval">{section.price}</span>
					</h2>
					{#if section.zh}
						<p class="section-caption"><span class="zh">{section.zh}</span> <span class="vi">({section.vi})</span></p>
					{/if}
					{#if section.blurb}<p class="section-blurb">{section.blurb}</p>{/if}
					{#if section.note}<p class="section-note">{section.note}</p>{/if}
				</header>

				<div class="items" class:items--text={section.id === 'burgers'}>
					{#each section.items as item}
						<article class="item on-cream" class:item--text={!item.img}>
							{#if item.img}
								<div class="item-media">
									<img src="{IMG}/{item.img}" alt={item.en} loading="lazy" />
									{#if item.num}<span class="num-badge">#{item.num}</span>{/if}
								</div>
							{:else if item.num}
								<span class="num-badge">#{item.num}</span>
							{/if}
							<div class="item-body">
								<h3 class="item-name">
									{item.en}{#if item.spicy}<span class="spicy" title="Spicy">🌶</span>{/if}
								</h3>
								<p class="item-caption">
									{#if item.zh}<span class="zh">{item.zh}</span>{/if}
									{#if item.vi}<span class="vi">({item.vi})</span>{/if}
								</p>
								{#if item.desc}<p class="item-desc">{item.desc}</p>{/if}
								{#if item.choice}<p class="item-choice">{item.choice}</p>{/if}
							</div>
						</article>
					{/each}
				</div>

				{#if section.sauces}
					<div class="sauces">
						<span class="sauces-label">Sauces</span>
						{#each section.sauces as s, i}
							<span class="sauce">
								<span class="sauce-dot" style="background:{SAUCE_COLORS[i]}"></span>
								{s.en} <span class="zh sauce-zh">{s.zh}</span> <span class="vi">({s.vi})</span>
							</span>
						{/each}
					</div>
				{/if}

				{#if section.extras}
					<ul class="extras">
						{#each section.extras as x}
							<li>
								<span class="extras-name">{x.en} <span class="zh extras-zh">{x.zh}</span> <span class="vi">({x.vi})</span></span>
								<span class="extras-dots"></span>
								<span class="extras-price">{x.price}</span>
								{#if x.detail}<span class="extras-detail">{x.detail}</span>{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>
	{/each}

	<!-- ============================== ORDER CTA ============================== -->
	<section class="section padding-md order-cta on-green-deep">
		<div class="container container--md text-center">
			<h2 class="display display-md">Hungry now?</h2>
			<p class="order-note">Order ahead for pickup at Tangram, or find us on Grubhub and Seamless.</p>
			<a class="btn btn-primary" href={ORDER_URL} target="_blank" rel="noopener">Order on Snackpass</a>
			<p class="menu-disclaimer">Menu items, prices, and availability are subject to change.</p>
		</div>
	</section>
</main>

<style>
	.menu-hero {
		padding-top: calc(var(--u) * 9);
	}
	.menu-hero-sub {
		color: var(--fg-muted);
		max-width: 52ch;
		margin: 0.5rem auto 0;
	}

	.menu-section + .menu-section {
		border-top: 1px solid var(--rule);
	}
	.section-head {
		margin-bottom: 2.2rem;
		max-width: 62ch;
	}
	.section-title {
		display: flex;
		align-items: center;
		gap: 0.55em;
		flex-wrap: wrap;
	}
	.section-title .price-oval {
		font-size: 0.62em;
	}
	.section-caption {
		font-size: 1.0625rem;
		color: var(--fg-muted);
		margin: 0.2rem 0 0;
	}
	.section-blurb {
		color: var(--fg-muted);
		margin: 0.9rem 0 0;
	}
	.section-note {
		font-size: 0.9375rem;
		font-style: italic;
		color: var(--fg-dim);
		margin: 0.6rem 0 0;
	}

	/* ---------- item grid ---------- */
	.items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1.6rem;
	}
	.items--text {
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	}
	/* Cream card on the green page — carries .on-cream so its whole ramp flips
	   to ink. The dish names, 中文 captions and descriptions are the smallest
	   sustained text on the site; they belong on cream, not on the ground. */
	.item {
		background: var(--cream-lift);
		border: 1px solid var(--rule);
		border-radius: 18px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.item--text {
		padding-top: 1.3rem;
	}
	.item--text > .num-badge {
		align-self: flex-start;
		margin-left: 1.3rem;
	}
	.item-media {
		position: relative;
		aspect-ratio: 4 / 3;
		background: var(--cream-lift);
	}
	.item-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.item-media .num-badge {
		position: absolute;
		top: 12px;
		left: 12px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
	}
	.item-body {
		padding: 1.1rem 1.3rem 1.3rem;
	}
	/* Maname, not the button grotesque — the original sets its card titles in
	   the workhorse serif (plan §1.1). Phase D takes them to 36px. */
	.item-name {
		font-family: var(--body-font);
		font-size: 1.25rem;
		margin: 0 0 0.25rem;
		line-height: 1.3;
	}
	.spicy {
		margin-left: 0.4em;
	}
	.item-caption {
		font-size: 0.875rem;
		color: var(--fg-muted);
		margin: 0 0 0.5rem;
	}
	.item-caption .zh {
		margin-right: 0.35em;
	}
	.item-desc {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--fg-muted);
		margin: 0;
	}
	.item-choice {
		font-size: 0.875rem;
		font-style: italic;
		color: var(--fg-dim);
		margin: 0.5rem 0 0;
	}

	/* ---------- sauces (burger section) ---------- */
	.sauces {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.6rem;
		margin-top: 1.6rem;
		font-size: 0.9375rem;
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
	.sauce-zh {
		font-size: 12.5px;
	}

	/* ---------- extras (sodas & water) ---------- */
	.extras {
		list-style: none;
		margin: 2rem 0 0;
		padding: 0;
		max-width: 40rem;
	}
	.extras li {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0 0.7rem;
		padding: 0.55rem 0;
		border-bottom: 1px dashed var(--rule);
	}
	.extras-name {
		font-family: var(--label);
		font-weight: 600;
		font-size: 13.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.extras-zh {
		text-transform: none;
		letter-spacing: 0;
	}
	.extras-dots {
		flex: 1;
	}
	.extras-price {
		font-family: var(--display);
		font-weight: 900;
		font-size: 15px;
	}
	.extras-detail {
		flex-basis: 100%;
		font-size: 0.875rem;
		color: var(--fg-dim);
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
</style>
