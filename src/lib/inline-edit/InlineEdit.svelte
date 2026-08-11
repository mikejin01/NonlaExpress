<script>
	/**
	 * An editable text node.
	 *
	 *   <p class="bt-lead"><InlineEdit k="services_lead" value={SERVICES.lead} /></p>
	 *
	 * Logged out it renders plain resolved text and adds no markup weight worth
	 * worrying about. In edit mode it becomes a contenteditable span with a
	 * dashed outline; blur commits the value to the draft.
	 *
	 * While editing it shows the RAW value, so a client can see and keep
	 * `{{PHONE}}`-style placeholders instead of accidentally freezing today's
	 * phone number into the copy.
	 */
	import { wpEdit } from '$lib/wp/wpEdit.svelte.js';

	let {
		/** Content key. Keys starting `global_` are site-wide (stored as options). */
		k,
		/** Default from src/lib/content.js — used until the database has a value. */
		value = '',
		/** Allow Enter to insert a line break instead of committing. */
		multiline = false
	} = $props();

	const shown = $derived(wpEdit.text(k, value));
	const editing = $derived(wpEdit.isEditing);

	/** @type {HTMLElement | undefined} */
	let el = $state();

	/**
	 * Write text into the element without fighting the caret: only sync from
	 * the outside while the element is unfocused.
	 * @param {HTMLElement} node
	 * @param {string} initial
	 */
	function seed(node, initial) {
		node.textContent = initial;
		return {
			/** @param {string} next */
			update(next) {
				if (document.activeElement !== node && node.textContent !== next) {
					node.textContent = next;
				}
			}
		};
	}

	function commit() {
		if (el) wpEdit.updateDraft(k, (el.textContent ?? '').trim());
	}

	/** @param {KeyboardEvent} event */
	function onkeydown(event) {
		if (event.key === 'Enter' && !multiline) {
			event.preventDefault();
			el?.blur();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			if (el) el.textContent = wpEdit.raw(k, value);
			el?.blur();
		}
	}

	/** Paste as plain text — pasted markup has no business in a content key. */
	function onpaste(/** @type {ClipboardEvent} */ event) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') ?? '';
		document.execCommand('insertText', false, multiline ? text : text.replace(/\s*\n+\s*/g, ' '));
	}
</script>

{#if editing}
	<span
		class="xo-ie"
		role="textbox"
		tabindex="0"
		aria-label="Edit content: {k}"
		contenteditable="true"
		spellcheck="true"
		bind:this={el}
		use:seed={wpEdit.raw(k, value)}
		onblur={commit}
		{onkeydown}
		{onpaste}
	></span>
{:else}{shown}{/if}

<style>
	.xo-ie {
		display: inline-block;
		min-width: 1ch;
		outline: 1px dashed rgba(234, 179, 8, 0.9);
		outline-offset: 2px;
		border-radius: 3px;
		background: rgba(250, 204, 21, 0.1);
		cursor: text;
	}
	.xo-ie:hover {
		background: rgba(250, 204, 21, 0.18);
	}
	.xo-ie:focus {
		outline: 2px solid #eab308;
		background: rgba(250, 204, 21, 0.22);
	}
</style>
