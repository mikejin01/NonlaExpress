<script>
	/**
	 * DrinkIcon.svelte — line icons for the image-less drinks sub-menu on /menu
	 * (the `extras` array in content.js: soda, bottled water, sparkling water,
	 * beer).
	 *
	 * ⚠️ HAND-AUTHORED, NOT HARVESTED. Everything in `$lib/art` is regenerated
	 * from the original site's vectors by scripts/svgclean.py and must not be
	 * hand-edited; these four pieces have no source there — the original site
	 * never listed bottled drinks — so they live here instead, as plain paths
	 * drawn to sit beside that folk art: one stroke weight, round caps, no
	 * fills. To add a category, draw it in the same 64-unit box and register
	 * it in ICONS; an unknown `name` falls back to the plain glass so the
	 * board never shows a hole.
	 *
	 * COLOUR follows the art contract (plan §1.2d, "terracotta draws"): the
	 * strokes are `currentColor`, so the caller sets `color:` — /menu uses
	 * `var(--warm)`, which is fine for a graphic on cream (3.88:1 needs no
	 * text-size floor when there is no text).
	 */
	const ICONS = {
		// a can: lid seam, pull tab, a wave across the label, fizz off the rim
		soda: `<ellipse cx="32" cy="17" rx="12" ry="4"/>
			<path d="M20 17v34a12 4 0 0 0 24 0V17"/>
			<circle cx="34" cy="16.2" r="2"/>
			<path d="M20 33c6-3.2 18 3.2 24 0M20 40.5c6-3.2 18 3.2 24 0"/>
			<circle cx="50.5" cy="11" r="2.2"/><circle cx="55" cy="19" r="1.5"/><circle cx="48.5" cy="4.5" r="1.3"/>`,
		// a plastic bottle: cap, shoulder, label band with a drop on it
		water: `<rect x="27" y="4" width="10" height="6" rx="1.5"/>
			<path d="M28 10v4c0 3-7 5-7 9v27q0 4 4 4h14q4 0 4-4V23c0-4-7-6-7-9v-4"/>
			<path d="M21 30.5h22M21 45.5h22"/>
			<path d="M32 33.5c-2.3 2.9-3.4 4.4-3.4 5.9a3.4 3.4 0 0 0 6.8 0c0-1.5-1.1-3-3.4-5.9z"/>`,
		// a tumbler with bubbles rising and a citrus wedge hooked on the rim
		sparkling: `<path d="M21 16l3 36q.5 4 4.5 4h7q4 0 4.5-4l3-36"/>
			<path d="M21 16h22"/>
			<circle cx="28" cy="44" r="2"/><circle cx="34" cy="37" r="2.6"/><circle cx="31" cy="29" r="1.5"/><circle cx="36.5" cy="48" r="1.4"/>
			<path d="M38 16a7 7 0 0 1 14 0z"/>
			<path d="M45 16V9M45 16l-4.9-4.9M45 16l4.9-4.9"/>`,
		// a mug: foam over the rim, a handle
		beer: `<path d="M14 22a5 5 0 0 1 7-5 5.5 5.5 0 0 1 9-2 5.5 5.5 0 0 1 9 2 5 5 0 0 1 7 5"/>
			<path d="M15 22v30q0 4 4 4h22q4 0 4-4V22"/>
			<path d="M45 28h4a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6h-4"/>
			<path d="M22 30v18"/>`,
		// the fallback: a plain tumbler
		glass: `<path d="M21 16l3 36q.5 4 4.5 4h7q4 0 4.5-4l3-36"/>
			<path d="M21 16h22"/>`
	};

	let {
		/** key of the icon — see ICONS above; unknown names draw the glass */
		name = 'glass',
		class: klass = ''
	} = $props();

	const paths = $derived(ICONS[name] ?? ICONS.glass);
</script>

<!-- Decorative by contract: the category's name is always the next thing in
     the DOM, so the icon carries no accessible name of its own. -->
<svg
	class="drink-icon {klass}"
	viewBox="0 0 64 64"
	fill="none"
	stroke="currentColor"
	stroke-width="2.4"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time constant above, not user input -->
	{@html paths}
</svg>

<style>
	.drink-icon {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible; /* the fizz and the citrus slice sit near the box edge */
	}
</style>
