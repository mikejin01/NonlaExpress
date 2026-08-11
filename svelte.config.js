import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * Static SvelteKit config, with two output shapes.
 *
 * 1. `pnpm build` — prerendered pages for GitHub Pages.
 *    `paths.base` must match the repo name when deployed to a project page
 *    (https://<user>.github.io/<repo>/). The GitHub Actions workflow sets
 *    BASE_PATH to `/<repo>` at build time; locally it defaults to '' so
 *    `pnpm dev` / `pnpm preview` serve from the root. At launch on the
 *    nonlaexpress.com apex domain, BASE_PATH stays ''.
 *
 * 2. `WP_BUILD=1 pnpm build` — SPA mode for the WordPress theme
 *    (scripts/build-wordpress-theme.mjs). SSR and prerendering are off (see
 *    src/routes/+layout.js) and the whole app boots from the fallback page,
 *    which the theme generator splits into header.php/index.php.
 *    BASE_PATH must stay empty here: asset URLs come out root-absolute
 *    (`/_app/...`) and the generator rewrites them to the theme directory.
 */
const dev = process.argv.includes('dev');
const WP_BUILD = process.env.WP_BUILD === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			// SPA mode needs the fallback AT index.html (nothing is prerendered);
			// the GitHub Pages build prerenders / and uses 404.html for deep links.
			fallback: WP_BUILD ? 'index.html' : '404.html',
			precompress: false,
			strict: !WP_BUILD
		}),
		paths: {
			base: dev || WP_BUILD ? '' : process.env.BASE_PATH || ''
		}
	}
};

export default config;
