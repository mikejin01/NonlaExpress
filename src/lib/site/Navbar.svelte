<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import Logo from './Logo.svelte';
	import { ORDER_URL } from '$lib/content.js';

	const LINKS = [
		{ label: 'Menu', href: `${base}/menu/` },
		{ label: 'About', href: `${base}/company/` },
		{ label: 'Press', href: `${base}/press/` },
		{ label: 'Find Us', href: `${base}/#find-us` }
	];

	/* headroom-style navbar: solid after 40px, hides on scroll down */
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

<nav class="navbar" class:hidden={navHidden} class:solid={navSolid || menuOpen} aria-label="Main">
	<div class="navbar-inner">
		<a class="brand" href="{base}/" rel="home" aria-label="Nón Lá Express — home">
			<Logo variant="h" />
		</a>
		<div class="nav-links">
			{#each LINKS as l}
				<a class="nav-link" href={l.href}>{l.label}</a>
			{/each}
			<a class="btn btn-cream btn-sm" href={ORDER_URL} target="_blank" rel="noopener">Order Online</a>
		</div>
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
	</div>
	{#if menuOpen}
		<div class="mobile-panel">
			{#each LINKS as l}
				<a class="mobile-link" href={l.href} onclick={() => (menuOpen = false)}>{l.label}</a>
			{/each}
			<a class="btn btn-cream" href={ORDER_URL} target="_blank" rel="noopener">Order Online</a>
		</div>
	{/if}
</nav>

<style>
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 8000;
		padding: 10px 1rem;
		transition:
			transform 0.25s ease-in-out,
			background-color 0.25s ease-in-out;
		background: transparent;
	}
	.navbar.solid {
		background: rgba(33, 69, 57, 0.96);
	}
	.navbar.hidden {
		transform: translateY(-110%);
	}
	.navbar-inner {
		width: 100%;
		max-width: 88rem;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 0.5rem;
	}
	.brand {
		color: var(--cream);
		text-decoration: none;
	}
	.nav-links {
		display: flex;
		align-items: center;
		gap: clamp(1.2rem, 2vw, 2.4rem);
	}
	.nav-link {
		padding: 0.5rem 0;
		color: var(--cream);
		opacity: 0.9;
		font-family: var(--label);
		font-weight: 600;
		font-size: 12.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}
	.nav-link:hover {
		opacity: 1;
	}
	.menu-toggle {
		display: none;
		color: var(--cream);
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
			color: var(--cream);
			font-family: var(--label);
			font-weight: 600;
			font-size: 15px;
			letter-spacing: 0.12em;
			text-transform: uppercase;
			text-decoration: none;
		}
		.mobile-panel .btn {
			margin-top: 0.6rem;
		}
	}
</style>
