<script>
	import '../app.css';
	import Navbar from '$lib/site/Navbar.svelte';
	import Footer from '$lib/site/Footer.svelte';

	let { children } = $props();
</script>

<Navbar />

{@render children()}

<Footer />
