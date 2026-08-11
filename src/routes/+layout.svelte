<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import Navbar from '$lib/site/Navbar.svelte';
	import Footer from '$lib/site/Footer.svelte';
	import EditToolbar from '$lib/inline-edit/EditToolbar.svelte';
	import { wpEdit } from '$lib/wp/wpEdit.svelte.js';
	import { BRAND, ADDRESS, PHONE, HOURS, ORDER_URL, SOCIAL } from '$lib/content.js';

	let { children } = $props();

	// Code defaults for the site-wide keys. These back the {{TOKEN}} resolver
	// until (and unless) WordPress supplies its own values from X.O. Admin.
	// Registered here in the script body rather than onMount, so tokens also
	// resolve while the GitHub Pages build is being prerendered.
	//
	// Keep in step with xo_default_options() in
	// scripts/build-wordpress-theme.mjs — those are the same keys, seeded on
	// theme activation.
	wpEdit.setGlobals({
		global_business_name: BRAND,
		global_contact_phone: PHONE.display,
		// Newline-separated to match the X.O. Admin textareas and the Find Us
		// columns, which render one line per line.
		global_contact_address: ADDRESS.lines.join('\n'),
		global_city_state: 'Flushing, NY',
		global_contact_hours: HOURS.map((h) => `${h.days}\n${h.time}`).join('\n'),
		global_order_url: ORDER_URL,
		global_instagram_url: SOCIAL.instagram.url,
		global_yelp_url: SOCIAL.yelp.url
	});

	onMount(() => wpEdit.init());
</script>

<Navbar />

{@render children()}

<Footer />

{#if wpEdit.isLoggedIn}
	<EditToolbar />
{/if}
