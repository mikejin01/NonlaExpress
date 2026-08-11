<script>
	/**
	 * The Edit / Save / Cancel control, shown only to logged-in WordPress users.
	 * Mounted once in the root layout.
	 */
	import { wpEdit } from '$lib/wp/wpEdit.svelte.js';

	const dirty = $derived(wpEdit.dirtyCount);

	/** Don't let a click-away lose unsaved edits. */
	function beforeunload(/** @type {BeforeUnloadEvent} */ event) {
		if (wpEdit.dirtyCount > 0) event.preventDefault();
	}
</script>

<svelte:window onbeforeunload={beforeunload} />

<div class="xo-bar" class:editing={wpEdit.isEditing}>
	{#if wpEdit.message}
		<p class="xo-msg" class:error={wpEdit.status === 'error'}>{wpEdit.message}</p>
	{/if}

	{#if wpEdit.isEditing}
		<span class="xo-count">{dirty} change{dirty === 1 ? '' : 's'}</span>
		<button class="xo-btn xo-ghost" onclick={() => wpEdit.cancel()} disabled={wpEdit.status === 'saving'}>
			Cancel
		</button>
		<button class="xo-btn xo-save" onclick={() => wpEdit.save()} disabled={wpEdit.status === 'saving' || dirty === 0}>
			{wpEdit.status === 'saving' ? 'Saving…' : 'Save changes'}
		</button>
	{:else}
		<button class="xo-btn xo-edit" onclick={() => wpEdit.toggle()}>Edit page</button>
	{/if}
</div>

<style>
	.xo-bar {
		position: fixed;
		right: 16px;
		bottom: 16px;
		z-index: 9999;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 8px;
		max-width: calc(100vw - 32px);
		padding: 10px;
		border-radius: 14px;
		background: rgba(11, 22, 34, 0.92);
		box-shadow: 0 24px 60px -20px rgba(8, 18, 30, 0.75);
		backdrop-filter: blur(8px);
		font-family: system-ui, -apple-system, sans-serif;
	}
	.xo-bar.editing {
		outline: 2px solid #eab308;
	}
	.xo-btn {
		border: 0;
		border-radius: 999px;
		padding: 9px 16px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.18s;
	}
	.xo-btn[disabled] {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.xo-edit {
		background: #2563eb;
		color: #fff;
	}
	.xo-edit:hover {
		background: #1d4ed8;
	}
	.xo-save {
		background: #eab308;
		color: #241c00;
	}
	.xo-save:not([disabled]):hover {
		background: #facc15;
	}
	.xo-ghost {
		background: rgba(255, 255, 255, 0.14);
		color: #fff;
	}
	.xo-ghost:not([disabled]):hover {
		background: rgba(255, 255, 255, 0.24);
	}
	.xo-count {
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.72);
	}
	.xo-msg {
		flex: 1 1 100%;
		margin: 0;
		font-size: 12px;
		line-height: 1.45;
		color: #a7f3d0;
	}
	.xo-msg.error {
		color: #fca5a5;
	}

	@media print {
		.xo-bar {
			display: none;
		}
	}
</style>
