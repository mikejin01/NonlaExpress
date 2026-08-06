<script>
	// The printed menu's hot-orange promo panel (brief §4 layout signatures):
	// window badge, bilingual set steps, big $25 price oval.
	import { LUNCH_SPECIAL as LS } from '$lib/content.js';
</script>

<div class="promo on-green">
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
	/* Flat brand green, not the old orange-red gradient. Two reasons: the
	   original site uses flat color everywhere (no gradients), and the
	   gradient's #E57923 end measures 2.9:1 against any white — small text
	   on it could never pass AA. */
	.promo {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
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
		color: var(--green); /* 5.13:1 on cream — passes at this size */
		background: var(--cream);
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
		font-size: clamp(2.6rem, 5vw, 3.6rem);
		border-width: 3px;
		padding: 0.28em 0.5em 0.34em;
	}
</style>
