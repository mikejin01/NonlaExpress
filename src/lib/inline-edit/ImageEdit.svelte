<script>
	/**
	 * An editable image.
	 *
	 *   <ImageEdit k="hero_photo" src={HERO.photo} altKey="hero_photo_alt"
	 *              alt={HERO.photoAlt} width="1800" height="1200" />
	 *
	 * In edit mode, hovering the image (or tabbing into it) grays it out under
	 * a scrim with a centred "Replace image" button, which opens the WordPress
	 * Media Library (`window.wp.media`, available because functions.php calls
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
	<span class="xo-img-wrap" class:xo-img-wrap--open={picking}>
		<img src={resolvedSrc} alt={resolvedAlt} {...rest} />
		<span class="xo-img-overlay">
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
	/* The wrapper takes the image's layout slot as a real positioned box, so
	   the overlay can anchor to the image itself — the only box guaranteed to
	   be where the image is. (A previous version used `display: contents` and
	   absolutely positioned the tools against "the enclosing tile", assuming it
	   was `position: relative`; on this site most image tiles aren't — .fav-card,
	   .feature-media — so the tools escaped to a distant ancestor and rendered
	   nowhere near the image.)
	   Every ImageEdit site sizes the <img> itself via descendant selectors
	   (width: 100% + aspect-ratio, or height: 100%), so the wrapper only has to
	   pass that sizing through: `height: 100%` matters where the slot is
	   height-constrained (.feature-media's stretched grid half) and computes to
	   auto everywhere the parent is content-sized. */
	.xo-img-wrap {
		position: relative;
		display: block;
		height: 100%;
	}
	.xo-img-wrap img {
		outline: 2px dashed rgba(37, 99, 235, 0.85);
		outline-offset: -2px;
	}
	/* Hidden until the image is hovered or the controls hold focus; the scrim
	   grays the photo out and centres the controls over it. Also forced open
	   (--open) while the manual-URL fallback is up, so it can't vanish mid-type.
	   opacity keeps the hidden button tabbable, unlike display/visibility. */
	.xo-img-overlay {
		position: absolute;
		inset: 0;
		z-index: 60;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px;
		background: rgba(11, 22, 34, 0.55);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s ease;
	}
	.xo-img-wrap:hover .xo-img-overlay,
	.xo-img-wrap:focus-within .xo-img-overlay,
	.xo-img-wrap--open .xo-img-overlay {
		opacity: 1;
		pointer-events: auto;
	}
	/* No hover on touch: keep the controls visible instead, but drop the scrim
	   so edit mode doesn't permanently gray every photo on a tablet. */
	@media (hover: none) {
		.xo-img-overlay {
			opacity: 1;
			pointer-events: auto;
			justify-content: flex-end;
			background: none;
		}
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
		flex: none;
		width: min(100%, 260px);
		padding: 6px 10px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: #fff;
		color: #0b1622;
		font: 400 12px/1.3 system-ui, sans-serif;
	}
	.xo-img-manual {
		display: flex;
		width: min(100%, 320px);
		gap: 6px;
	}
	.xo-img-manual .xo-img-alt {
		flex: 1 1 auto;
		width: auto;
		min-width: 0;
	}
</style>
