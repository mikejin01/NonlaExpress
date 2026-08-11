<script>
	/**
	 * An editable image.
	 *
	 *   <ImageEdit k="hero_photo" src={HERO.photo} altKey="hero_photo_alt"
	 *              alt={HERO.photoAlt} width="1800" height="1200" />
	 *
	 * In edit mode a hover overlay opens the WordPress Media Library
	 * (`window.wp.media`, available because functions.php calls
	 * wp_enqueue_media() for editors on the front end). The chosen URL is
	 * normalised to a root-relative /wp-content/uploads/… path so it survives a
	 * domain or protocol change.
	 *
	 * Alt text is editable in the same overlay: it is the one image field that
	 * matters for both accessibility and SEO, and clients never find it in the
	 * Media Library.
	 */
	import { wpEdit } from '$lib/wp/wpEdit.svelte.js';
	import { assetUrl } from '$lib/wp/assets.js';

	let {
		/** Content key holding the image URL. */
		k,
		/** Default image path from src/lib/content.js. */
		src = '',
		/** Content key holding the alt text. Omit for decorative images. */
		altKey = '',
		/** Default alt text. */
		alt = '',
		/** Anything else — class, width, height, loading, fetchpriority… */
		...rest
	} = $props();

	const resolvedSrc = $derived(assetUrl(wpEdit.text(k, src)));
	const resolvedAlt = $derived(altKey ? wpEdit.text(altKey, alt) : alt);
	const editing = $derived(wpEdit.isEditing);

	let picking = $state(false);
	let manualUrl = $state('');

	/** The Media Library frame, or null when WordPress hasn't provided one. */
	function mediaFrame() {
		const wp = /** @type {any} */ (globalThis).wp;
		return wp?.media ? wp.media : null;
	}

	function choose() {
		const media = mediaFrame();
		if (!media) {
			// No Media Library (running outside WordPress, or wp.media was
			// deregistered) — fall back to typing a URL.
			manualUrl = wpEdit.raw(k, src);
			picking = true;
			return;
		}
		const frame = media({
			title: 'Choose an image',
			button: { text: 'Use this image' },
			library: { type: 'image' },
			multiple: false
		});
		frame.on('select', () => {
			const chosen = frame.state().get('selection').first()?.toJSON();
			if (chosen?.url) wpEdit.updateDraft(k, chosen.url);
			if (altKey && chosen?.alt) wpEdit.updateDraft(altKey, chosen.alt);
		});
		frame.open();
	}

	function applyManual() {
		if (manualUrl.trim()) wpEdit.updateDraft(k, manualUrl.trim());
		picking = false;
	}
</script>

{#if editing}
	<span class="xo-img-wrap">
		<img src={resolvedSrc} alt={resolvedAlt} {...rest} />
		<span class="xo-img-tools">
			<button type="button" class="xo-img-btn" onclick={choose}>Replace image</button>
			{#if altKey}
				<input
					class="xo-img-alt"
					placeholder="Alt text (describe the image)"
					value={wpEdit.raw(altKey, alt)}
					onblur={(e) => wpEdit.updateDraft(altKey, e.currentTarget.value)}
				/>
			{/if}
			{#if picking}
				<span class="xo-img-manual">
					<input
						class="xo-img-alt"
						bind:value={manualUrl}
						placeholder="/wp-content/uploads/…"
						onkeydown={(e) => e.key === 'Enter' && applyManual()}
					/>
					<button type="button" class="xo-img-btn" onclick={applyManual}>Apply</button>
				</span>
			{/if}
		</span>
	</span>
{:else}
	<img src={resolvedSrc} alt={resolvedAlt} {...rest} />
{/if}

<style>
	/* `display: contents` keeps the <img> in its original grid/flex slot, so
	   entering edit mode never reflows the bento layout. The tools then anchor
	   to the enclosing tile, which is always `position: relative`. */
	.xo-img-wrap {
		display: contents;
	}
	.xo-img-wrap img {
		outline: 2px dashed rgba(37, 99, 235, 0.85);
		outline-offset: -2px;
	}
	.xo-img-tools {
		position: absolute;
		z-index: 60;
		inset: auto 8px 8px 8px;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
		padding: 8px;
		border-radius: 10px;
		background: rgba(11, 22, 34, 0.86);
		backdrop-filter: blur(6px);
	}
	.xo-img-btn {
		flex: none;
		padding: 6px 12px;
		border-radius: 999px;
		border: 0;
		background: #2563eb;
		color: #fff;
		font: 600 12px/1.2 system-ui, sans-serif;
		cursor: pointer;
	}
	.xo-img-btn:hover {
		background: #1d4ed8;
	}
	.xo-img-alt {
		flex: 1 1 160px;
		min-width: 0;
		padding: 6px 10px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: #fff;
		color: #0b1622;
		font: 400 12px/1.3 system-ui, sans-serif;
	}
	.xo-img-manual {
		display: flex;
		flex: 1 1 100%;
		gap: 6px;
	}
</style>
