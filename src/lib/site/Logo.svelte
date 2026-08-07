<script>
	/**
	 * The real Nón Lá Express logo — the vector lockups the brand already owns,
	 * harvested from the original site (plan §1.4) and optimized by
	 * scripts/svgclean.py. This replaces the interim hat mark that was re-drawn
	 * by hand from the printed menus, and closes the "no logo vector" question
	 * parked in docs/website-brief.md §6.
	 *
	 * Both lockups are monochrome and take `currentColor`, so they repaint from
	 * one token: `--mark`, which every .on-* surface sets. On the cream page
	 * that resolves to terracotta — the red the brand actually draws its logo
	 * in — and on the green/charcoal bands it resolves to cream. Nothing here
	 * hard-codes a colour, and nothing needs re-colouring per placement.
	 *
	 * variant 'h' — horizontal: nón lá mark + "NónLá EXPRESS". Navbar.
	 * variant 'v' — stacked: "NónLá / EXPRESS / VIETNAMESE KITCHEN" with rules.
	 *               The subline and rules are part of the artwork, which is why
	 *               this component no longer draws them in CSS. Footer.
	 */
	import Art from './Art.svelte';

	let {
		variant = 'h',
		/** rendered width; the lockups keep their own aspect ratio */
		width = variant === 'v' ? '190px' : '176px'
	} = $props();
</script>

<Art
	name={variant === 'v' ? 'logo-stacked' : 'logo-horizontal'}
	label={variant === 'v'
		? 'Nón Lá Express — Vietnamese Kitchen'
		: 'Nón Lá Express'}
	{width}
	class="logo"
/>

<style>
	:global(.logo) {
		/* the lockups are drawn tight to their viewBox, so no optical nudge is
		   needed — but keep them from being stretched by a flex parent */
		flex: none;
		/* the brand mark's own colour per surface — terracotta on cream, cream
		   on the dark bands (app.css --mark). Set here rather than on each
		   call site so the header and footer can never drift apart. */
		color: var(--mark);
	}
</style>
