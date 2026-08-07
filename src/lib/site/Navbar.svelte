<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import Logo from './Logo.svelte';
	import { ORDER_URL } from '$lib/content.js';

	// Uppercase in the copy, not via text-transform (plan §1.1). Final labels
	// land in Phase C once §5 Q4 (BLOG vs PRESS) comes back from the client.
	const LINKS = [
		{ label: 'OUR MENU', href: `${base}/menu/` },
		{ label: 'OUR COMPANY', href: `${base}/company/` },
		{ label: 'PRESS', href: `${base}/press/` },
		{ label: 'FIND US', href: `${base}/#find-us` }
	];

	/* headroom-style navbar: gains a rule after 40px, hides on scroll down */
	let navHidden = $state(false);
	let navSolid = $state(false);
	let menuOpen = $state(false);
	let lastY = 0;
	function onScroll() {
		const y = window.scrollY;
		navSolid = y > 40;
		navHidden = y > 120 && y > lastY && !menuOpen;
		lastY = y;
	}
	onMount(() => {
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<nav
	class="navbar on-cream"
	class:scrolled={navSolid || menuOpen}
	class:hidden={navHidden}
	aria-label="Main"
>
	<div class="navbar-inner">
		<div class="nav-zone nav-zone--start">
			<button
				class="menu-toggle"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				{#if menuOpen}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="5" x2="23" y2="5" /><line x1="1" y1="12" x2="23" y2="12" /><line x1="1" y1="19" x2="23" y2="19" /></svg>
				{/if}
			</button>
			<div class="nav-links">
				{#each LINKS as l}
					<a class="nav-link" href={l.href}>{l.label}</a>
				{/each}
			</div>
		</div>

		<a class="brand" href="{base}/" rel="home" aria-label="Nón Lá Express — home">
			<Logo variant="h" width="clamp(132px, 13vw, 176px)" />
		</a>

		<div class="nav-zone nav-zone--end">
			<a class="btn btn-primary btn-sm" href={ORDER_URL} target="_blank" rel="noopener">Order Online</a>
		</div>
	</div>
	{#if menuOpen}
		<div class="mobile-panel">
			{#each LINKS as l}
				<a class="mobile-link" href={l.href} onclick={() => (menuOpen = false)}>{l.label}</a>
			{/each}
			<a class="btn btn-primary panel-order" href={ORDER_URL} target="_blank" rel="noopener">Order Online</a>
		</div>
	{/if}
</nav>

<style>
	/* Opaque at every scroll position — the original's header is too. No
	   transparent-over-hero state, so nav text is never at the mercy of
	   whatever frame the video happens to be on. It runs on CREAM, which is
	   both the page ground and what the original's header uses; the logo
	   inside it resolves to terracotta via --mark, so the bar reads as the
	   brand's own red-on-cream lockup (plan §1.2d). */
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 8000;
		padding: 10px 1rem;
		border-bottom: 1px solid transparent;
		transition:
			transform 0.25s ease-in-out,
			border-color 0.25s ease-in-out,
			box-shadow 0.25s ease-in-out;
	}
	.navbar.scrolled {
		border-bottom-color: var(--rule);
		/* light bar, light page — the heavy dark shadow the green bar used
		   reads as dirt on cream */
		box-shadow: 0 6px 24px rgba(26, 22, 19, 0.12);
	}
	.navbar.hidden {
		transform: translateY(-110%);
	}
	/* Three zones so the logo is optically CENTRED on the page, not merely
	   between its neighbours — the original's header does the same (plan §1.3
	   item 1). The outer columns are equal-width, so unequal link/pill widths
	   don't drag the mark off centre. */
	.navbar-inner {
		width: 100%;
		max-width: 88rem;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 0.75rem;
		padding: 0 0.5rem;
	}
	.nav-zone {
		display: flex;
		align-items: center;
		min-width: 0;
	}
	.nav-zone--end {
		justify-content: flex-end;
	}
	.brand {
		color: var(--fg);
		text-decoration: none;
		justify-self: center;
	}
	.nav-links {
		display: flex;
		align-items: center;
		gap: clamp(1.2rem, 2vw, 2.4rem);
	}
	/* Maname 18px — measured off the original, which does NOT set its nav in
	   the button grotesque (plan §1.1) */
	.nav-link {
		padding: 0.5rem 0;
		color: var(--fg);
		font-family: var(--body-font);
		font-size: var(--fs-nav);
		letter-spacing: 0.02em;
		text-decoration: none;
		transition: color 0.25s ease;
	}
	.nav-link:hover {
		color: var(--accent);
	}
	.menu-toggle {
		display: none;
		color: var(--fg);
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px;
	}
	.mobile-panel {
		display: none;
	}
	@media (max-width: 860px) {
		.nav-links {
			display: none;
		}
		.menu-toggle {
			display: block;
			margin-left: -6px;
		}
		.mobile-panel {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 0.4rem;
			padding: 1rem 1rem 1.4rem;
		}
		.mobile-link {
			display: block;
			padding: 0.55rem 0;
			color: var(--fg);
			font-family: var(--body-font);
			font-size: var(--fs-nav);
			letter-spacing: 0.02em;
			text-decoration: none;
		}
	}
	/* The pill lives in the bar at every width where it fits. Below ~430px the
	   bar can't hold hamburger + mark + pill on one line, so the pill moves into
	   the panel — never duplicated, never dropped. */
	.panel-order {
		display: none;
	}
	@media (max-width: 430px) {
		.nav-zone--end {
			display: none;
		}
		.panel-order {
			display: inline-block;
			margin-top: 0.6rem;
		}
	}
</style>
