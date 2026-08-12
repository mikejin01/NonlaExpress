/**
 * A post's slug only exists in the WordPress database, so there is no entry list
 * to prerender from at build time — this route must opt out of the inherited
 * `prerender = true` in src/routes/+layout.js or the GitHub Pages build fails
 * with "marked as prerenderable, but was not prerendered".
 *
 * On WordPress that costs nothing: the whole WP_BUILD shape is client-rendered
 * anyway, and WordPress answers 200 at /blog/<slug>/ (see xo_configure_blog())
 * so index.php boots the SPA and this route takes over.
 *
 * On GitHub Pages the route resolves through the 404.html fallback and then
 * finds no WordPress to fetch from, so it renders its "not found" state — which
 * is correct, because on that target the post genuinely does not exist.
 */
export const prerender = false;
export const ssr = false;
