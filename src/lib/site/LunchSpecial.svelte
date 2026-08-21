<script>
	// The printed menu's hot-orange promo panel (brief §4 layout signatures):
	// window badge and bilingual set steps.
	//
	// ⚠️ The big $25 price oval — the panel's other printed-menu signature —
	// was REMOVED 2026-08-21 when the client answered §5 Q5 "no prices on
	// /menu". `LS.price` still carries 25 and is deliberately unrendered.
	// That leaves `.price-oval` in app.css with no caller anywhere; it is kept
	// on purpose, see the note there.
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
	/* The steps run as a ROW since 2026-08-21. They were a stacked column beside
	   the $25 oval; with the oval gone (§5 Q5) that column left the panel's
	   right half empty, and three short steps read naturally as a ①→②→③
	   sequence across the width they inherited. Back to a column under 760px,
	   where a row would break each step mid-phrase. */
	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.9rem 2.6rem;
	}
	.steps li {
		display: flex;
		gap: 0.7rem;
		align-items: baseline;
	}
	@media (max-width: 760px) {
		.steps {
			flex-direction: column;
			gap: 0.7rem;
		}
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
</style>
