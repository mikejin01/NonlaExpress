<script>
	/**
	 * Art.svelte — the brand's folk-art vectors, inlined so they can be themed.
	 *
	 * Everything here is harvested from the original nonlaexpress.com and
	 * re-emitted by `scripts/svgclean.py` (Phase B, plan §1.4). Run that script
	 * to regenerate; do not hand-edit the files in $lib/art.
	 *
	 * WHY INLINE. These assets carry `currentColor` or `var(--art-*)` fills, and
	 * both are inert inside `<img src="…svg">` — an external SVG has no access to
	 * the page's cascade. Inlining is what lets illustration obey the same color
	 * contract as text (app.css): drop a piece on any `.on-*` surface and it
	 * repaints itself. That is the fix for "terracotta is 1.89:1 on the green
	 * ground" (plan Phase C §1) — no per-placement recoloring needed.
	 *
	 * WHAT IS *NOT* HERE, and why. pig / rooster / buffalo and the three dish
	 * illustrations live in `static/assets/art/` and are used as plain `<img>`:
	 * they are 20-63KB each and need no theming (the animals are drawn as a cream
	 * body carrying their own terracotta line-work, so they read on cream, on
	 * green, on the deep band and on charcoal as-is — verified across all four
	 * surfaces in docs/assets/original-site/screenshots/art-sheet.html). On the
	 * cream page the body vanishes into the ground and only the red line-work
	 * shows, which is exactly how the original site renders them (plan §1.2d).
	 * Inlining those six would push ~230KB into the HTML for no benefit.
	 *
	 * COLOR. Monochrome pieces take `currentColor`, so set `color:` on this
	 * component or any ancestor — usually `var(--fg)` or `var(--accent-ink)`.
	 * Two-tone pieces (cup, phin, lime) read `--art-fill` (the body) and
	 * `--art-detail` (the line-work / inner shape); every `.on-*` surface sets
	 * both, so they normally need nothing.
	 *
	 * @example
	 *   <Art name="herb" width="180px" style="color: var(--accent-ink)" />
	 *   <Art name="logo-stacked" label="Nón Lá Express — Vietnamese Kitchen" />
	 */
	import bean from '$lib/art/bean.svg?raw';
	import beans from '$lib/art/beans.svg?raw';
	import cup from '$lib/art/cup.svg?raw';
	import herb from '$lib/art/herb.svg?raw';
	import lime from '$lib/art/lime.svg?raw';
	import logoHorizontal from '$lib/art/logo-horizontal.svg?raw';
	import logoStacked from '$lib/art/logo-stacked.svg?raw';
	import noodles from '$lib/art/noodles.svg?raw';
	import phin from '$lib/art/phin.svg?raw';
	import shrimp from '$lib/art/shrimp.svg?raw';

	const ART = {
		bean,
		beans,
		cup,
		herb,
		lime,
		'logo-horizontal': logoHorizontal,
		'logo-stacked': logoStacked,
		noodles,
		phin,
		shrimp
	};

	let {
		/** key of the piece to render — see ART above */
		name,
		/** accessible name. Omit for decoration (the default), which stays
		 *  hidden from assistive tech. */
		label = '',
		/** any CSS width; the art keeps its own aspect ratio */
		width = '100%',
		class: klass = '',
		style = ''
	} = $props();

	const svg = $derived(ART[name]);
</script>

{#if svg}
	<span
		class="art {klass}"
		style="--art-w:{width};{style}"
		role={label ? 'img' : undefined}
		aria-label={label || undefined}
		aria-hidden={label ? undefined : 'true'}
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time asset, not user input -->
		{@html svg}
	</span>
{/if}

<style>
	.art {
		display: block;
		width: var(--art-w, 100%);
		line-height: 0; /* kill the inline-element descender gap under the svg */
	}
	/* :global — {@html} content is not touched by Svelte's style scoping */
	.art :global(svg) {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible; /* several pieces have strokes that sit on the viewBox edge */
	}
</style>
