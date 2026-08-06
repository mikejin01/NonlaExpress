<script>
	// Interim logo lockup — hat mark re-drawn as SVG from the menu images and
	// cup photography (brief §7.8). Chewy left the project with Phase A, so the
	// wordmark now rides --display; Phase B replaces this whole component with
	// the real vector lockups harvested from the original site
	// (docs/assets/original-site/svg/home-02, home-16). Inherits currentColor.
	// variant 'h' = horizontal (navbar) · 'v' = stacked with subline (footer)
	let { variant = 'h' } = $props();
</script>

{#snippet hat(size)}
	<svg
		viewBox="0 0 124 104"
		width={size}
		aria-hidden="true"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M62,12 Q36,26 13,58" stroke-width="3.4" />
		<path d="M62,12 Q88,26 111,58" stroke-width="3.4" />
		<path d="M13,58 Q62,80 111,58" stroke-width="3.4" />
		<path d="M20,63.5 Q62,83 104,63.5" stroke-width="2.2" />
		<path d="M62,14 Q46,38 38,66" stroke-width="1.9" />
		<path d="M62,14 Q56,40 53,69" stroke-width="1.9" />
		<path d="M62,14 Q68,40 71,69" stroke-width="1.9" />
		<path d="M62,14 Q78,38 86,66" stroke-width="1.9" />
		<path d="M31,41 Q62,53 93,41" stroke-width="1.9" />
		<path d="M36,70 Q48,82 56,86" stroke-width="2.4" />
		<path d="M88,70 Q76,82 66,86" stroke-width="2.4" />
		<path d="M57,86 q-7,1 -6,6 q1,5 7,3 q5,-2 3,-8" stroke-width="2.2" />
		<path d="M63,88 q8,5 16,4 q-4,5 -12,5" stroke-width="2.2" />
	</svg>
{/snippet}

{#if variant === 'v'}
	<span class="logo logo--v" role="img" aria-label="Nón Lá Express — Vietnamese Kitchen">
		{@render hat(64)}
		<span class="wordmark">NónLá</span>
		<span class="express">Express</span>
		<span class="kitchen">Vietnamese Kitchen</span>
	</span>
{:else}
	<span class="logo logo--h" role="img" aria-label="Nón Lá Express">
		{@render hat(40)}
		<span class="stack">
			<span class="wordmark">NónLá</span>
			<span class="express">Express</span>
		</span>
	</span>
{/if}

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		line-height: 1;
		user-select: none;
	}
	.logo--h {
		gap: 10px;
	}
	.logo--h .stack {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
	}
	.wordmark {
		font-family: var(--logo-font);
		font-weight: 900;
		font-size: 23px;
		letter-spacing: 0.01em;
		line-height: 1;
	}
	.express {
		font-family: var(--label);
		font-weight: 700;
		font-size: 8.5px;
		letter-spacing: 0.42em;
		text-indent: 0.42em; /* balance the tracking so the word centers optically */
		text-transform: uppercase;
	}

	.logo--v {
		flex-direction: column;
		gap: 6px;
		text-align: center;
	}
	.logo--v .wordmark {
		font-size: 40px;
		margin-top: 2px;
	}
	.logo--v .express {
		font-size: 13px;
		border-top: 1.5px solid currentColor;
		border-bottom: 1.5px solid currentColor;
		padding: 6px 4px;
		margin-top: 4px;
	}
	.logo--v .kitchen {
		font-family: var(--label);
		font-weight: 600;
		font-size: 9px;
		letter-spacing: 0.3em;
		text-indent: 0.3em;
		text-transform: uppercase;
		opacity: 0.85;
		margin-top: 2px;
	}
</style>
