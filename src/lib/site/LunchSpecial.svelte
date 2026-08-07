<script>
	// The printed menu's hot-orange promo panel (brief §4 layout signatures):
	// window badge, bilingual set steps, big $25 price oval.
	import { LUNCH_SPECIAL as LS } from '$lib/content.js';
</script>

<div class="promo on-cream">
	<div class="promo-copy">
		<span class="window-badge">{LS.window}</span>
		<h2 class="display display-lg promo-title">{LS.title}</h2>
		<p class="promo-caption"><span class="zh">{LS.zh}</span> <span class="vi">({LS.vi})</span></p>
		<ul class="steps">
			{#each LS.steps as s}
				<li>
					<span class="step-n">{s.n}</span>
					<span class="step-body">
						<span class="step-en">{s.en}</span>
						<span class="step-zh zh">{s.zh}</span>
						{#if s.note}<span class="step-note">{s.note}</span>{/if}
					</span>
				</li>
			{/each}
		</ul>
	</div>
	<div class="promo-price">
		<span class="price-oval big">$25</span>
	</div>
</div>

<style>
	/* The promo is the densest small text on the site (11.5px badge, bilingual
	   step list, italic notes), so it keeps the ink-on-cream ramp at 14.9:1.
	   Now that cream is also the PAGE (plan §1.2d) the panel has to lift off it
	   rather than contrast with it: --cream-lift plus a --rule hairline, the
	   same treatment the press/company/menu cards already use. Flat, never a
	   gradient: the original uses flat color everywhere, and the old gradient's
	   #E57923 end measured 2.9:1 against any white. */
	.promo {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
		background: var(--cream-lift);
		border: 1px solid var(--rule);
		border-radius: 24px;
		padding: clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 5vw, 4rem);
	}
	.window-badge {
		display: inline-block;
		font-family: var(--label);
		font-weight: 700;
		font-size: 11.5px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		/* inverted now that the panel itself is cream: green fill, cream label */
		color: var(--cream);
		background: var(--green); /* 5.13:1 — passes at this size */
		border-radius: 980px;
		padding: 5px 14px;
		margin-bottom: 0.9rem;
	}
	.promo-title {
		margin-bottom: 0.2rem;
	}
	.promo-caption {
		margin: 0 0 1.3rem;
		font-size: 1.0625rem;
		color: var(--fg-muted);
	}
	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.steps li {
		display: flex;
		gap: 0.7rem;
		align-items: baseline;
	}
	.step-n {
		font-size: 19px;
		line-height: 1;
	}
	.step-body {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		column-gap: 0.6rem;
	}
	.step-en {
		font-family: var(--label);
		font-weight: 700;
		font-size: 13.5px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.step-zh {
		font-size: 0.9375rem;
		color: var(--fg-muted);
	}
	.step-note {
		flex-basis: 100%;
		font-size: var(--fs-fine);
		font-style: italic;
		color: var(--fg-dim);
	}
	.promo-price {
		flex: 0 0 auto;
		margin: 0 auto;
	}
	.price-oval.big {
		color: var(--accent-ink); /* --green on the cream panel, 5.13:1 */
		font-size: clamp(2.6rem, 5vw, 3.6rem);
		border-width: 3px;
		padding: 0.28em 0.5em 0.34em;
	}
</style>
