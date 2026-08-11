<script>
	/**
	 * An editable link target.
	 *
	 *   <LinkEdit urlKey="nav_0_url" defaultHref="#services" class="…">
	 *     <InlineEdit k="nav_0_label" value="What We Look For" />
	 *   </LinkEdit>
	 *
	 * The href lives under its own content key ending in `_url`; the suffix is
	 * what tells the save handler to sanitise it as a URL (esc_url_raw with an
	 * http/https/mailto/tel allowlist) rather than as prose.
	 *
	 * In edit mode clicking the link opens a small popover instead of
	 * navigating. Applying calls updateDraft, so it rides the existing
	 * draft → save-page-data pipeline with no new endpoint.
	 */
	import { wpEdit } from '$lib/wp/wpEdit.svelte.js';

	let {
		/** Content key for the href. Must end in `_url`. */
		urlKey,
		/** Default href from src/lib/content.js. */
		defaultHref = '#',
		/** Forwarded to the <a> when not editing (e.g. closing the mobile nav). */
		onclick = undefined,
		/** Class for the <a>. */
		class: className = '',
		children
	} = $props();

	const href = $derived(wpEdit.text(urlKey, defaultHref));
	const editing = $derived(wpEdit.isEditing);

	let open = $state(false);
	let value = $state('');

	function begin(/** @type {MouseEvent} */ event) {
		event.preventDefault();
		value = wpEdit.raw(urlKey, defaultHref);
		open = true;
	}

	function apply() {
		wpEdit.updateDraft(urlKey, value.trim());
		open = false;
	}
</script>

{#if editing}
	<span class="xo-le">
		<a {href} class={className} onclick={begin}>{@render children?.()}</a>
		{#if open}
			<span class="xo-le-pop">
				<input
					bind:value
					placeholder="#section | /page | https://… | tel:… | mailto:…"
					onkeydown={(e) => {
						if (e.key === 'Enter') apply();
						if (e.key === 'Escape') open = false;
					}}
				/>
				<button type="button" class="xo-le-ok" onclick={apply} aria-label="Apply link">✓</button>
				<button type="button" class="xo-le-no" onclick={() => (open = false)} aria-label="Cancel">✕</button>
			</span>
		{/if}
	</span>
{:else}
	<a {href} class={className} {onclick}>{@render children?.()}</a>
{/if}

<style>
	.xo-le {
		position: relative;
		display: inline-block;
		outline: 1px dashed rgba(37, 99, 235, 0.85);
		outline-offset: 2px;
		border-radius: 3px;
	}
	.xo-le-pop {
		position: absolute;
		left: 0;
		top: calc(100% + 6px);
		z-index: 80;
		display: flex;
		gap: 4px;
		padding: 6px;
		border-radius: 10px;
		background: #fff;
		box-shadow: 0 18px 40px -12px rgba(8, 18, 30, 0.55);
	}
	.xo-le-pop input {
		width: 17rem;
		max-width: 60vw;
		padding: 6px 10px;
		border: 1px solid rgba(14, 33, 53, 0.2);
		border-radius: 8px;
		font: 400 12.5px/1.3 system-ui, sans-serif;
		color: #0b1622;
	}
	.xo-le-ok,
	.xo-le-no {
		flex: none;
		width: 30px;
		border: 0;
		border-radius: 8px;
		font-size: 13px;
		cursor: pointer;
	}
	.xo-le-ok {
		background: #2563eb;
		color: #fff;
	}
	.xo-le-no {
		background: #e6eaf0;
		color: #0b1622;
	}
</style>
