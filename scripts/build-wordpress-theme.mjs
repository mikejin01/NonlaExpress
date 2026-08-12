#!/usr/bin/env node
/* =============================================================================
   SvelteKit SPA  →  WordPress theme.

   Run with:  pnpm run build:wordpress      (then `make push` to deploy)

   What it does, in order:

     1. WP_BUILD=1 vite build          → build/ (SPA mode: no SSR, no prerender)
     2. recreate wordpress-theme/      → clean slate every time
     3. copy the build output in       → hashed _app/ tree + static assets
     4. split build/index.html         → boot tags for <head>, mount markup for
                                         <body>, rewriting /_app/ URLs to the
                                         theme directory
     5. generate the PHP               → style.css, header/index/404/footer,
                                         functions.php
     6. zip it                         → for a manual Appearance → Themes upload

   IRON RULE: everything under wordpress-theme/ is generated and is overwritten
   on the next build. Never hand-edit it — edit THIS file. Every generated PHP
   file carries a banner saying the same thing.
   ============================================================================= */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEGACY_REDIRECTS, POST_PREFIX_FALLBACK } from './redirects.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD_DIR = path.join(ROOT, 'build');
const THEME_DIR = path.join(ROOT, 'wordpress-theme');

/* ----------------------------------------------------------------- config */

const THEME = {
	slug: 'nonla-express',
	name: 'Nón Lá Express',
	description: 'SvelteKit SPA compiled into an editable WordPress theme. Generated — do not hand-edit.',
	author: 'X.O.',
	// Function names, option names (xo_global_*) and the admin page.
	prefix: 'xo',
	restNamespace: 'xo/v1',
	adminPageTitle: 'X.O. Admin',
	adminMenuLabel: 'X.O. Admin',
	// slug => page title. '' is the front page.
	//
	// MUST stay in sync with src/routes/**/+page.svelte — one WordPress page per
	// SPA route is what makes deep links resolve without rewrite hacks, and what
	// gives each route its own Yoast fields and sitemap entry. FIND US is not
	// here on purpose: it is an in-page anchor (/#find-us), not a route.
	pages: {
		'': 'Home',
		menu: 'Our Menu',
		company: 'Our Company',
		// Replaced `press` on 2026-08-12. /blog is BOTH a WordPress page (so the
		// index URL resolves) and the posts base (so /blog/<slug>/ resolves to a
		// real post) — see xo_configure_blog().
		blog: 'Blog',
		'privacy-policy': 'Privacy Policy',
		'terms-and-conditions': 'Terms & Conditions',
		'accessibility-statement': 'Accessibility Statement'
	},
	// Posts live under this base so the SPA route /blog/[slug] and WordPress's
	// own permalink agree. Changing it means changing src/routes/blog/ too.
	blogBase: 'blog'
};

const BANNER = `<?php
/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Produced by scripts/build-wordpress-theme.mjs and overwritten on every
 * \`pnpm run build:wordpress\`. Make changes in that script instead.
 */
`;

const log = (msg) => console.log(msg);

/* ------------------------------------------------------- 1. build the SPA */

log('🏗  Building the SPA in WordPress mode (no SSR, no prerender)…');
execSync('pnpm exec vite build', {
	cwd: ROOT,
	stdio: 'inherit',
	env: { ...process.env, WP_BUILD: '1' }
});

const fallbackPath = path.join(BUILD_DIR, 'index.html');
if (!fs.existsSync(fallbackPath)) {
	throw new Error(
		`Expected an SPA fallback at ${fallbackPath}. Check that WP_BUILD=1 turned off prerendering ` +
			'(src/routes/+layout.js) and that svelte.config.js set fallback: index.html.'
	);
}

/* --------------------------------------------- 2/3. fresh theme directory */

log('📁 Recreating wordpress-theme/…');
fs.rmSync(THEME_DIR, { recursive: true, force: true });
fs.mkdirSync(THEME_DIR, { recursive: true });
fs.cpSync(BUILD_DIR, THEME_DIR, { recursive: true });

// .DS_Store files have no business on a web server.
for (const junk of ['.DS_Store', 'assets/.DS_Store', 'assets/images/.DS_Store']) {
	fs.rmSync(path.join(THEME_DIR, junk), { force: true });
}

/* ---------------------------------- 4. split the fallback page into parts */

log('✂️  Extracting boot markup from the fallback page…');
const html = fs.readFileSync(fallbackPath, 'utf8');

/**
 * SvelteKit emits root-absolute `/_app/...` URLs — relative ones cannot work on
 * a fallback served from every route. Point them at the theme directory,
 * resolved by PHP at render time so the same bundle works on any domain and in
 * a subdirectory install.
 * @param {string} source
 */
const themify = (source) =>
	source
		.replaceAll('"/_app/', '"<?php echo esc_url(get_template_directory_uri()); ?>/_app/')
		.replaceAll("'/_app/", "'<?php echo esc_url(get_template_directory_uri()); ?>/_app/")
		.replaceAll('("/_app/', '("<?php echo esc_url(get_template_directory_uri()); ?>/_app/');

// The app's own JS/CSS: every <link> whose href points into /_app/.
const appAssetTags = (html.match(/<link[^>]+href="\/_app\/[^"]*"[^>]*>/g) ?? []).join('\n\t');
if (!appAssetTags) {
	throw new Error(
		'No /_app/ asset tags found in the fallback page. SvelteKit changed its output shape — ' +
			're-check the extraction in scripts/build-wordpress-theme.mjs (playbook §1.3b).'
	);
}

// Web fonts, kept verbatim from src/app.html.
const fontTags = (html.match(/<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>/g) ?? []).join(
	'\n\t'
);

// The wrapper element and its inline init script, verbatim: the script mounts
// the app into its own parent element, so the nesting must survive intact.
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (!bodyMatch) throw new Error('Could not find <body> in the fallback page.');
const bootMarkup = themify(bodyMatch[1].trim());

// WordPress must never serve the raw fallback.
fs.rmSync(path.join(THEME_DIR, 'index.html'), { force: true });

/* ------------------------------------------------------ 5. generate the PHP */

log('🐘 Generating theme PHP…');
const today = new Date().toISOString().slice(0, 10);
const P = THEME.prefix;

const write = (/** @type {string} */ file, /** @type {string} */ contents) =>
	fs.writeFileSync(path.join(THEME_DIR, file), contents);

/* style.css — the header is how WordPress recognises a theme at all. */
write(
	'style.css',
	`/*
Theme Name: ${THEME.name}
Theme URI: https://${THEME.slug}.com
Author: ${THEME.author}
Description: ${THEME.description}
Version: ${today}
Requires at least: 6.0
Tested up to: 7.0
License: Proprietary
Text Domain: ${THEME.slug}
*/

/* GENERATED FILE — DO NOT EDIT. See scripts/build-wordpress-theme.mjs.
   All real styling is compiled into the SPA bundle under _app/immutable/. */
`
);

/* header.php — charset, favicon, fonts, then the app's boot tags. */
write(
	'header.php',
	`${BANNER}?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php // Keep in step with src/app.html and app.css --surface: the cream page
	      // ground from the 2026-08-07 palette swap (redesign-plan.md §1.2d). ?>
	<meta name="theme-color" content="#F0EAD6">
	<?php // Modern browsers prefer the crisp SVG; WordPress's own wp_site_icon()
	      // output (in wp_head below) covers /favicon.ico, apple-touch-icon and
	      // the admin bar, which is why Settings → Site Icon must also be set. ?>
	<link rel="icon" type="image/svg+xml" href="<?php echo esc_url(get_template_directory_uri()); ?>/favicon.svg">
	${fontTags}
	${themify(appAssetTags)}
<?php wp_head(); ?>
</head>
<?php // data-xo-theme is how assetUrl() in src/lib/wp/assets.js finds the theme
      // directory. It duplicates wpRest.themeUri on purpose: an <img src> is
      // resolved the instant it renders and cannot wait for the /bootstrap
      // fallback, so the theme path has to survive a plugin that strips inline
      // scripts. An attribute does. ?>
<body <?php body_class(); ?> data-xo-theme="<?php echo esc_url(get_template_directory_uri()); ?>">
`
);

write('footer.php', `${BANNER}?>\n<?php wp_footer(); ?>\n</body>\n</html>\n`);

/* index.php — an SEO-only <h1> plus the app's own mount markup. */
/**
 * No SEO <h1> here, deliberately.
 *
 * The playbook's shell prints a screen-reader-only <h1> for crawlers that do
 * not run JS. This site can't use it: the hero renders the page's real <h1>
 * (INTRO_SEO.h1) once the app mounts, so a shell heading means two <h1>
 * elements with different text — bad for screen readers, and it contradicts
 * the rule in CLAUDE.md that the hero carries the only one. Google renders
 * JavaScript, so the hero heading is what actually gets indexed.
 *
 * `${P}_current_route_h1()` is still generated and still feeds <title>.
 */
const shell = () => `${BANNER}get_header(); ?>
${bootMarkup}
<?php get_footer(); ?>
`;

write('index.php', shell());
// A stray URL still boots the app; the SPA router renders its own not-found
// view while WordPress keeps the 404 status code intact.
write('404.php', shell());

write('functions.php', functionsPhp());

/* ---------------------------------------------------------------- 6. zip */

log('🗜  Zipping the theme…');
try {
	execSync(`cd "${THEME_DIR}" && zip -qr "../${THEME.slug}.zip" . -x "*.DS_Store"`, {
		cwd: ROOT,
		stdio: 'inherit',
		shell: '/bin/bash'
	});
	log(`   ${THEME.slug}.zip written (manual Appearance → Themes → Upload fallback)`);
} catch {
	log('   ⚠️  zip unavailable — skipping the archive (rsync deploy is unaffected)');
}

log('');
log(`✅ wordpress-theme/ ready — deploy with: make build-and-push`);

/* =============================================================================
   functions.php
   ============================================================================= */

function functionsPhp() {
	const NS = THEME.restNamespace;
	const pageList = Object.entries(THEME.pages)
		.map(([slug, title]) => `        '${slug}' => '${title.replace(/'/g, "\\'")}',`)
		.join('\n');

	// Legacy Wix URLs → 301 targets (scripts/redirects.js). PHP single-quoted
	// strings only honour \\ and \', so those are the only two to escape — and
	// the UTF-8 slugs pass through literally, which is what the decoded
	// REQUEST_URI is compared against.
	const phpStr = (/** @type {string} */ s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
	const REDIRECT_MAP_PHP = `array(\n${Object.entries(LEGACY_REDIRECTS)
		.map(([from, to]) => `        ${phpStr(from)} => ${phpStr(to)},`)
		.join('\n')}\n    )`;
	const POST_PREFIX = POST_PREFIX_FALLBACK.prefix;
	const POST_TARGET = POST_PREFIX_FALLBACK.target;
	const BLOG_BASE = THEME.blogBase;

	return `${BANNER}
if (!defined('ABSPATH')) exit;

define('${P.toUpperCase()}_THEME_VERSION', '${today}');
define('${P.toUpperCase()}_REST_NS', '${NS}');

/* =============================================================================
   1. Theme setup
   ============================================================================= */

function ${P}_setup() {
    add_theme_support('title-tag');          // Yoast filters this when active
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list'));
}
add_action('after_setup_theme', '${P}_setup');

/**
 * The SPA reads all content from the database at runtime, so an HTML response
 * cached for hours shows a client their old copy after they just edited it.
 * Hashed assets under /_app/immutable/ are the opposite case and are safe to
 * cache forever — that belongs in .htaccess, not here.
 */
function ${P}_send_nocache_headers() {
    if (is_admin()) return;
    header('Cache-Control: no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
}
add_action('send_headers', '${P}_send_nocache_headers');

/** Editors need the Media Library on the front end for ImageEdit. */
function ${P}_enqueue_media_for_editors() {
    if (current_user_can('edit_posts')) wp_enqueue_media();
}
add_action('wp_enqueue_scripts', '${P}_enqueue_media_for_editors');

/* =============================================================================
   2. Pages — one WordPress page per SPA route
   ============================================================================= */

function ${P}_required_pages() {
    // slug => page title. '' is the front page.
    return array(
${pageList}
    );
}

function ${P}_ensure_required_pages() {
    foreach (${P}_required_pages() as $slug => $title) {
        if ($slug === '') {
            $front = (int) get_option('page_on_front');
            if (!$front || get_post_status($front) !== 'publish') {
                $existing = get_page_by_path('home');
                $id = $existing ? $existing->ID : wp_insert_post(array(
                    'post_type'   => 'page',
                    'post_status' => 'publish',
                    'post_title'  => $title,
                    'post_name'   => 'home',
                ));
                if ($id && !is_wp_error($id)) {
                    update_option('show_on_front', 'page');
                    update_option('page_on_front', $id);
                }
            }
            continue;
        }
        $existing = get_page_by_path($slug);
        if (!$existing) {
            wp_insert_post(array(
                'post_type'   => 'page',
                'post_status' => 'publish',
                'post_title'  => $title,
                'post_name'   => $slug,
            ));
            continue;
        }
        // get_page_by_path() matches drafts too. WordPress ships a draft
        // "Privacy Policy" on every new install, so without this the slug looks
        // taken, no page is created, and that route 404s for logged-out
        // visitors while looking fine to whoever is logged in.
        if ($existing->post_status !== 'publish') {
            wp_update_post(array('ID' => $existing->ID, 'post_status' => 'publish'));
        }
    }
    flush_rewrite_rules();
}
add_action('after_switch_theme', '${P}_ensure_required_pages');

/* =============================================================================
   3. Business details — the options behind X.O. Admin
   ============================================================================= */

function ${P}_default_options() {
    // Seeded on activation so {{TOKENS}} resolve to something sane before the
    // client ever opens X.O. Admin. Mirrors src/lib/content.js — when a value
    // changes there, change it here too, or a fresh install disagrees with the
    // bundled defaults.
    return array(
        '${P}_global_business_name'   => 'Nón Lá Express',
        '${P}_global_contact_phone'   => '(347) 690-1999',
        // The Leads notification address. Empty means wp_mail silently drops
        // every submission, so ${P}_admin_notices() nags until it is filled in.
        '${P}_global_contact_email'   => '',
        // Newline-separated: both are textareas in ${THEME.adminPageTitle}, and the Find Us
        // columns render one line per line. Anything joining them for a
        // single-line context does it at the point of use.
        '${P}_global_contact_address' => "Tangram Food Hall · Stall FH17\\n133-33 39th Ave\\nFlushing, NY 11354",
        '${P}_global_city_state'      => 'Flushing, NY',
        '${P}_global_contact_hours'   => "Monday – Sunday\\n11:00 AM – 10:00 PM",
        // A restaurant's primary CTA. Editable here because the ordering
        // provider is the single most likely thing to change without a deploy.
        '${P}_global_order_url'       => 'https://order.snackpass.co/67be450e8c2c2460a8b96002',
        // Fed to schema.org sameAs, which is how the site claims the profiles
        // already carrying this restaurant's reviews.
        '${P}_global_instagram_url'   => 'https://www.instagram.com/nonlaexpress',
        '${P}_global_yelp_url'        => 'https://www.yelp.com/biz/non-la-express-flushing',
    );
}

function ${P}_set_defaults() {
    foreach (${P}_default_options() as $key => $value) {
        if (get_option($key) === false) add_option($key, $value);
    }
}
add_action('after_switch_theme', '${P}_set_defaults');

/**
 * Make /blog/ and /blog/<slug>/ resolve natively in WordPress.
 *
 * The SPA owns the rendering, but WordPress still owns ROUTING: it has to
 * answer 200 at these URLs, or index.php never runs and the Svelte router never
 * gets a chance. Three settings do that, and all three matter:
 *
 *   1. permalink_structure = /blog/%postname%/  → a post published in the
 *      dashboard lives at exactly the URL src/routes/blog/[slug] expects.
 *      Without it WordPress serves posts at /%postname%/ and every /blog/<slug>/
 *      is a 404 that only renders because 404.php happens to boot the SPA too.
 *   2. page_for_posts = the Blog page → /blog/ is the posts index rather than an
 *      empty page, so the SPA index and WordPress agree about what lives there.
 *   3. flush_rewrite_rules() → rewrite rules are cached in the DB; changing the
 *      structure without flushing leaves the OLD routing live and looks exactly
 *      like the change did nothing.
 *
 * Only ever runs on theme activation, and only fills settings that are unset or
 * still WordPress's plain default — it must not stamp on a permalink structure
 * someone chose deliberately.
 */
function ${P}_configure_blog() {
    $structure = get_option('permalink_structure');
    if (!$structure || strpos($structure, '%postname%') === false) {
        global $wp_rewrite;
        $target = '/${BLOG_BASE}/%postname%/';
        if ($wp_rewrite) {
            $wp_rewrite->set_permalink_structure($target);
        } else {
            update_option('permalink_structure', $target);
        }
    }

    $blog = get_page_by_path('${BLOG_BASE}');
    if ($blog && get_post_status($blog->ID) === 'publish' && !get_option('page_for_posts')) {
        update_option('show_on_front', 'page');
        update_option('page_for_posts', $blog->ID);
    }

    flush_rewrite_rules();
}
// Priority 20: ${P}_ensure_required_pages() creates the Blog page at the default
// priority, and page_for_posts cannot point at a page that does not exist yet.
add_action('after_switch_theme', '${P}_configure_blog', 20);

/**
 * ⚠️ Run first-time setup after a REDEPLOY, not only after an activation.
 *
 * The three routines above are hooked to after_switch_theme, which fires when
 * someone activates the theme in wp-admin. But this theme is deployed by
 * "make build-and-push", which is an **rsync over an already-active theme** —
 * so after_switch_theme never fires again for the life of the install.
 *
 * That is silent and it bites exactly when the theme gains a route: shipping
 * /blog this way created no Blog page and set no permalink base, so /blog/
 * 404'd on the live site and looked precisely like "the blog feature does not
 * work". Nothing in the deploy would have told anyone.
 *
 * Gate on the build version so this is one option read per request in the
 * steady state, and a single full setup pass on the first request after each
 * deploy. Every routine it calls is idempotent.
 */
function ${P}_maybe_run_setup() {
    if (get_option('${P}_setup_version') === ${P.toUpperCase()}_THEME_VERSION) return;
    ${P}_ensure_required_pages();
    ${P}_set_defaults();
    ${P}_configure_blog();
    update_option('${P}_setup_version', ${P.toUpperCase()}_THEME_VERSION);
}
add_action('init', '${P}_maybe_run_setup', 5);

/** Multi-line option (address, hours) flattened for single-line contexts. */
function ${P}_one_line($value) {
    return trim(preg_replace('/\\s*\\n+\\s*/', ', ', (string) $value));
}

/** Digits-only tel: href for whatever format the phone is stored in. */
function ${P}_tel_href($phone) {
    $digits = preg_replace('/[^0-9+]/', '', (string) $phone);
    if ($digits === '') return 'tel:';
    if (strlen($digits) === 10) $digits = '+1' . $digits;
    return 'tel:' . $digits;
}

/**
 * Resolve {{TOKENS}} in content. Mirrors resolve() in
 * src/lib/wp/wpEdit.svelte.js — keep the two token lists in step.
 */
function ${P}_resolve_placeholders($text) {
    if (!is_string($text) || strpos($text, '{{') === false) return $text;

    $phone = get_option('${P}_global_contact_phone', '');
    $email = get_option('${P}_global_contact_email', '');

    return strtr($text, array(
        '{{BUSINESS_NAME}}' => get_option('${P}_global_business_name', ''),
        '{{PHONE}}'         => $phone,
        '{{PHONE_HREF}}'    => ${P}_tel_href($phone),
        '{{EMAIL}}'         => $email,
        '{{EMAIL_HREF}}'    => 'mailto:' . $email,
        // Collapsed to one line: a {{TOKEN}} lands mid-sentence in running copy,
        // where the stored line breaks would be wrong.
        '{{ADDRESS}}'       => ${P}_one_line(get_option('${P}_global_contact_address', '')),
        '{{LOCATION}}'      => ${P}_one_line(get_option('${P}_global_contact_address', '')),
        '{{CITY_STATE}}'    => get_option('${P}_global_city_state', ''),
        '{{HOURS}}'         => get_option('${P}_global_contact_hours', ''),
        '{{ORDER_URL}}'     => get_option('${P}_global_order_url', ''),
    ));
}

/* =============================================================================
   4. The wpRest payload — WordPress's half of the contract with the SPA
   ============================================================================= */

/** Route key format shared with routeKey() in src/lib/wp/client.js. */
function ${P}_normalize_route_key($route) {
    $route = trim((string) $route);
    if ($route === '') return '/';
    $path = explode('?', $route, 2)[0];
    if ($path === '') $path = '/';
    if ($path[0] !== '/') $path = '/' . $path;
    if (strlen($path) > 1) $path = rtrim($path, '/');
    return $path === '' ? '/' : $path;
}

/**
 * Post meta prefix for content keys. Namespaced rather than a bare leading
 * underscore, because xo_page_data is printed publicly in <head> — reading
 * every underscore-prefixed key would hand out whatever private meta any other
 * plugin happens to store on this page.
 */
define('${P.toUpperCase()}_META_PREFIX', '_${P}_');

/** Raw content for a page: its own meta, plus every xo_global_* option. */
function ${P}_page_data($post_id = 0) {
    $data = array();

    if ($post_id) {
        $prefix = ${P.toUpperCase()}_META_PREFIX;
        $length = strlen($prefix);
        foreach ((array) get_post_meta($post_id) as $key => $value) {
            if (strpos($key, $prefix) !== 0) continue;
            $data[substr($key, $length)] = is_array($value) ? reset($value) : $value;
        }
    }

    global $wpdb;
    $like = $wpdb->esc_like('${P}_global_') . '%';
    $names = $wpdb->get_col($wpdb->prepare(
        "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s", $like
    ));
    foreach ((array) $names as $name) {
        $data[str_replace('${P}_global_', 'global_', $name)] = get_option($name, '');
    }

    return $data;
}

function ${P}_route_overrides() {
    $routes = get_option('${P}_route_overrides', array());
    return is_array($routes) ? $routes : array();
}

function ${P}_wprest_payload($post_id = 0) {
    if (!$post_id) $post_id = (int) get_queried_object_id();
    if (!$post_id) $post_id = (int) get_option('page_on_front');

    $raw = ${P}_page_data($post_id);
    $resolved = array();
    foreach ($raw as $key => $value) $resolved[$key] = ${P}_resolve_placeholders($value);

    $can_edit = current_user_can('edit_posts');

    return array(
        'root'           => esc_url_raw(rest_url()),
        'nonce'          => $can_edit ? wp_create_nonce('wp_rest') : '',
        'postId'         => $post_id,
        'isLoggedIn'     => $can_edit,
        'themeUri'       => esc_url_raw(get_template_directory_uri()),
        'pageData'       => $resolved,
        'rawPageData'    => $can_edit ? $raw : null,
        'routeOverrides' => ${P}_route_overrides(),
    );
}

/**
 * Print the payload early in <head>: the app's inline init script runs in the
 * body and must find window.wpRest already set.
 */
function ${P}_print_wprest() {
    echo '<script id="' . esc_attr('${P}-wprest') . '">window.wpRest = '
        . wp_json_encode(${P}_wprest_payload()) . ';</script>' . "\\n";
}
add_action('wp_head', '${P}_print_wprest', 5);

/** SEO-only heading, rendered before the app hydrates. */
function ${P}_current_route_h1() {
    if (is_404()) return 'Page not found';
    $title = get_option('${P}_global_business_name', get_bloginfo('name'));
    if (!is_front_page() && ($queried = get_queried_object()) && !empty($queried->post_title)) {
        $title = $queried->post_title . ' — ' . $title;
    }
    return ${P}_resolve_placeholders($title);
}

/* =============================================================================
   5. SEO — LocalBusiness schema, deferring to Yoast where it is authoritative
   ============================================================================= */

function ${P}_seo_plugin_active() {
    return defined('WPSEO_VERSION') || defined('RANK_MATH_VERSION') || class_exists('All_in_One_SEO_Pack');
}

/**
 * The Restaurant node.
 *
 * @param bool $standalone true for our own <script>, false when it is being
 *                         merged into another plugin's @graph (which supplies
 *                         its own @context and needs an @id to link against).
 */
function ${P}_restaurant_schema($standalone = true) {
    $phone = get_option('${P}_global_contact_phone', '');
    $schema = array(
        // Restaurant, not the generic LocalBusiness: it is what earns the
        // cuisine/menu/hours treatment in local results.
        '@type'         => 'Restaurant',
        'name'          => get_option('${P}_global_business_name', get_bloginfo('name')),
        'url'           => home_url('/'),
        'telephone'     => $phone,
        'servesCuisine' => 'Vietnamese',
        'hasMenu'       => home_url('/menu/'),
        // A counter stall inside a food hall — no reservations, no table service.
        'acceptsReservations' => false,
    );

    $email = get_option('${P}_global_contact_email', '');
    if ($email) $schema['email'] = $email;

    // The address is one editable string, so emit it as PostalAddress only in
    // the parts we can state without guessing: the free-text street line, plus
    // locality/region split off "City, ST". Anything unparseable degrades to
    // the plain string rather than shipping a wrong structured field.
    // Stored one line per line for the Find Us columns; structured data wants
    // one string.
    $address = trim(preg_replace('/\\s*\\n+\\s*/', ', ', (string) get_option('${P}_global_contact_address', '')));
    $city_state = get_option('${P}_global_city_state', '');
    if ($address && preg_match('/^\\s*(.+?)\\s*,\\s*([A-Z]{2})\\s*$/', $city_state, $m)) {
        $schema['address'] = array(
            '@type'           => 'PostalAddress',
            'streetAddress'   => $address,
            'addressLocality' => $m[1],
            'addressRegion'   => $m[2],
            'addressCountry'  => 'US',
        );
    } elseif ($address) {
        $schema['address'] = $address;
    }

    $hours = get_option('${P}_global_contact_hours', '');
    if ($hours) $schema['openingHours'] = $hours;

    $order_url = get_option('${P}_global_order_url', '');
    if ($order_url) {
        $schema['potentialAction'] = array(
            '@type'  => 'OrderAction',
            'target' => $order_url,
        );
    }

    // sameAs is how Google ties the site to the profiles that already carry
    // this restaurant's reviews.
    $same_as = array_values(array_filter(array(
        get_option('${P}_global_instagram_url', ''),
        get_option('${P}_global_yelp_url', ''),
    )));
    if ($same_as) $schema['sameAs'] = $same_as;

    // Google asks for several aspect ratios of the same subject for a
    // Restaurant — 16:9, 4:3 and 1:1 — and picks per surface. These ship in the
    // theme, so they are always present and always resolve.
    $theme = get_template_directory_uri() . '/assets/images/';
    $schema['image'] = array(
        $theme . 'interior-entrance.jpg',   // 1600×1067, landscape
        $theme . 'drinks-trio.jpg',         // 1080×1350, portrait
        $theme . 'pho-special.jpg',         // 800×600
    );

    // This node is a Restaurant, which IS an Organization subtype, and the
    // WebPage points at it via "about". That is why Yoast's own Organization is
    // left unset: two nodes describing one business, one of them vaguer, is
    // worse for disambiguation than a single specific one.

    if ($standalone) {
        $schema = array('@context' => 'https://schema.org') + $schema;
    } else {
        $schema['@id'] = home_url('/#restaurant');
    }
    return $schema;
}

/**
 * Standalone output — only when no SEO plugin owns the page's structured data.
 * With Yoast active this stays silent and the node joins its @graph instead
 * (below): two disconnected JSON-LD blocks describing the same business is
 * exactly the ambiguity the @graph format exists to prevent.
 */
function ${P}_print_schema() {
    if (!is_front_page() || ${P}_seo_plugin_active()) return;
    echo '<script type="application/ld+json">'
        . wp_json_encode(${P}_restaurant_schema(true)) . '</script>' . "\\n";
}
add_action('wp_head', '${P}_print_schema', 20);

/**
 * Merge the Restaurant into Yoast's @graph and point the front page's WebPage
 * node at it, so the whole thing is one connected graph with real @id
 * references rather than two islands.
 */
add_filter('wpseo_schema_graph', function ($graph) {
    if (!is_front_page() || !is_array($graph)) return $graph;

    $restaurant = ${P}_restaurant_schema(false);
    $restaurant_id = $restaurant['@id'];

    foreach ($graph as &$piece) {
        if (!is_array($piece) || empty($piece['@type'])) continue;
        $types = (array) $piece['@type'];
        if (in_array('WebPage', $types, true) || in_array('CollectionPage', $types, true)) {
            $piece['about'] = array('@id' => $restaurant_id);
        }
    }
    unset($piece);

    $graph[] = $restaurant;
    return $graph;
}, 20);

/** Only fill the description when no SEO plugin owns it. */
function ${P}_print_meta_description() {
    if (${P}_seo_plugin_active()) return;
    $description = get_bloginfo('description');
    if (!$description) return;
    echo '<meta name="description" content="' . esc_attr($description) . '">' . "\\n";
}
add_action('wp_head', '${P}_print_meta_description', 6);

/* =============================================================================
   5b. Legacy Wix URLs — 301s for the retired blog (plan §5 Q4)
   ============================================================================= */

/**
 * The old site's blog is retired, but its 12 posts — 11 of them Chinese-language
 * Flushing local-SEO articles — were still ranking when it was switched off, so
 * every one of them 301s to the page that covers its topic rather than 404ing.
 * The map is generated from scripts/redirects.js; edit it there.
 *
 * Runs on template_redirect, and ONLY for requests WordPress could not resolve
 * itself — real content at one of these paths always wins.
 *
 * ⚠️ The is_404() guard is load-bearing, not defensive. Without it this function
 * would hijack a path even after someone created real content there, and the
 * /post/ prefix rule below would then 301 EVERY post of a future blog to
 * /menu/ — permanently, and looking exactly like "WordPress is broken". The
 * legacy URLs all 404 today (nothing on this site claims them), so gating on
 * is_404() costs the redirects nothing and makes them self-retiring.
 */
function ${P}_legacy_redirects() {
    if (is_admin() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    if (!is_404()) return;

    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if (!is_string($path)) return;
    // Wix sent these slugs as UTF-8, so an inbound link arrives percent-encoded.
    $path = trim(rawurldecode($path), '/');
    if ($path === '') return;

    $map = ${REDIRECT_MAP_PHP};

    if (isset($map[$path])) {
        wp_redirect(home_url($map[$path]), 301);
        exit;
    }

    // Encoding safety net + anything published after the map was captured. Those
    // slugs carry Han characters, a fullwidth colon, a fullwidth '!' and an
    // accented 'o', so an exact match is one Unicode normalisation away from
    // silently missing. Anything else under /post/ is a phở article by
    // construction, so the menu is the right home for it.
    if (strpos($path, '${POST_PREFIX}') === 0) {
        wp_redirect(home_url('${POST_TARGET}'), 301);
        exit;
    }
}
add_action('template_redirect', '${P}_legacy_redirects', 1);

/* =============================================================================
   6. REST — bootstrap, save-page-data, leads
   ============================================================================= */

add_action('rest_api_init', function () {
    // Public read-only copy of the wpRest payload. Speed plugins that strip
    // inline <script> tags otherwise take edit mode down with them.
    register_rest_route('wp-theme/v1', '/bootstrap', array(
        'methods'             => 'GET',
        'callback'            => '${P}_rest_bootstrap',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('wp-theme/v1', '/save-page-data', array(
        'methods'             => 'POST',
        'callback'            => '${P}_rest_save_page_data',
        'permission_callback' => function () { return current_user_can('edit_posts'); },
    ));

    register_rest_route('${NS}', '/lead', array(
        'methods'             => 'POST',
        'callback'            => '${P}_rest_handle_lead',
        'permission_callback' => '__return_true',   // public form
    ));

    // Blog posts for the SPA's /blog routes. Our own endpoint rather than
    // wp/v2/posts for two reasons: the list response stays small (no
    // content.rendered per item, no _embed round-trip for the image), and it
    // keeps working on installs where a security plugin has locked down the
    // default wp/v2 namespace for logged-out visitors.
    register_rest_route('${NS}', '/posts', array(
        'methods'             => 'GET',
        'callback'            => '${P}_rest_posts',
        'permission_callback' => '__return_true',   // a public blog
    ));
});

/**
 * GET /wp-json/${NS}/posts
 *   ?slug=<slug>   one post, WITH rendered content
 *   ?page= &per_page=   otherwise a page of the index, WITHOUT content
 *
 * Everything is passed through the same filters the theme layer would apply, so
 * shortcodes and blocks render the way they do in WordPress rather than arriving
 * as raw block comments.
 */
function ${P}_rest_posts($request) {
    $slug = sanitize_title((string) $request->get_param('slug'));

    if ($slug !== '') {
        $found = get_posts(array(
            'name'        => $slug,
            'post_type'   => 'post',
            'post_status' => 'publish',
            'numberposts' => 1,
        ));
        if (!$found) {
            return new WP_Error('not_found', 'No such post.', array('status' => 404));
        }
        return rest_ensure_response(array('post' => ${P}_post_payload($found[0], true)));
    }

    $per_page = max(1, min(50, (int) ($request->get_param('per_page') ?: 12)));
    $paged    = max(1, (int) ($request->get_param('page') ?: 1));

    $query = new WP_Query(array(
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => $per_page,
        'paged'          => $paged,
        'orderby'        => 'date',
        'order'          => 'DESC',
        // The SPA needs no pagination links, and skipping the found-rows count
        // would break the "pages" figure below, so leave counting on.
        'ignore_sticky_posts' => true,
    ));

    $posts = array_map(function ($p) { return ${P}_post_payload($p, false); }, $query->posts);

    return rest_ensure_response(array(
        'posts' => $posts,
        'total' => (int) $query->found_posts,
        'pages' => (int) $query->max_num_pages,
        'page'  => $paged,
    ));
}

/** One post, shaped for the SPA. $full adds the rendered content. */
function ${P}_post_payload($post, $full = false) {
    $thumb = get_post_thumbnail_id($post);
    $out = array(
        'id'      => (int) $post->ID,
        'slug'    => $post->post_name,
        // Titles can carry entities (&amp;, curly quotes) — decode once here so
        // the SPA can render them as TEXT and never needs to trust post titles
        // as HTML.
        'title'   => html_entity_decode(get_the_title($post), ENT_QUOTES, 'UTF-8'),
        'date'    => get_the_date('F j, Y', $post),
        'dateISO' => get_the_date('c', $post),
        'url'     => '/${BLOG_BASE}/' . $post->post_name . '/',
        'image'   => $thumb ? wp_get_attachment_image_url($thumb, 'large') : '',
        'imageAlt'=> $thumb ? (string) get_post_meta($thumb, '_wp_attachment_image_alt', true) : '',
        'excerpt' => html_entity_decode(
            wp_strip_all_tags(get_the_excerpt($post)), ENT_QUOTES, 'UTF-8'),
    );
    if ($full) {
        // apply_the_content, not raw post_content: blocks and shortcodes are
        // stored unrendered and would otherwise reach the page as markup soup.
        $out['content'] = apply_filters('the_content', $post->post_content);
    }
    return $out;
}

function ${P}_rest_bootstrap($request) {
    $url   = (string) $request->get_param('url');
    $route = ${P}_normalize_route_key((string) $request->get_param('route'));

    $post_id = $url ? (int) url_to_postid(preg_replace('/#.*/', '', $url)) : 0;
    if (!$post_id) $post_id = (int) get_option('page_on_front');

    $payload = ${P}_wprest_payload($post_id);

    // A REST request without a nonce is unauthenticated by design, so this
    // endpoint can never hand out editing credentials. See xo_edit_context.
    $payload['nonce'] = '';
    $payload['isLoggedIn'] = false;
    $payload['rawPageData'] = null;
    $payload['route'] = $route;

    return new WP_REST_Response($payload, 200);
}

/** Content keys whose values are image URLs. */
function ${P}_is_image_key($key) {
    return (bool) preg_match('/(_img|_photo|_image|_logo|_mark)$/', (string) $key);
}

/** Store uploads root-relative so they survive a domain or protocol change. */
function ${P}_normalize_image_value($value) {
    $value = trim((string) $value);
    if (preg_match('#^https?://[^/]+(/wp-content/uploads/.*)$#i', $value, $m)) return $m[1];
    return $value;
}

function ${P}_rest_save_page_data($request) {
    $params = $request->get_json_params();
    if (!is_array($params)) $params = $request->get_body_params();
    if (!is_array($params)) $params = array();

    $page_data = isset($params['pageData']) ? $params['pageData'] : null;
    if (!is_array($page_data)) {
        return new WP_Error('missing_data', 'pageData missing', array('status' => 400));
    }

    $post_id = isset($params['postId']) ? (int) $params['postId'] : 0;
    if (!$post_id && !empty($params['url'])) {
        $post_id = (int) url_to_postid(preg_replace('/#.*/', '', (string) $params['url']));
    }
    if (!$post_id) $post_id = (int) get_option('page_on_front');

    $route = ${P}_normalize_route_key(isset($params['route']) ? $params['route'] : '/');
    $routes = ${P}_route_overrides();
    $routes_changed = false;
    $skipped = 0;

    foreach ($page_data as $key => $value) {
        $key = sanitize_key(str_replace('-', '_', (string) $key));
        if ($key === '') continue;

        if (substr($key, -4) === '_url') {
            // URLs must not go through a text sanitiser, and the allowlist is
            // what keeps javascript: out.
            $value = esc_url_raw(trim((string) $value), array('http', 'https', 'mailto', 'tel'));
        } elseif (${P}_is_image_key($key)) {
            $value = ${P}_normalize_image_value($value);
        } else {
            $value = sanitize_textarea_field((string) $value);
        }

        if (strpos($key, 'global_') === 0) {
            if ($key === 'global_contact_email') $value = sanitize_email($value);
            update_option('${P}_' . $key, $value);
            continue;
        }

        if (!isset($routes[$route]) || !is_array($routes[$route])) $routes[$route] = array();
        if (!array_key_exists($key, $routes[$route]) || (string) $routes[$route][$key] !== (string) $value) {
            $routes[$route][$key] = $value;
            $routes_changed = true;
        }

        if ($post_id) {
            update_post_meta($post_id, ${P.toUpperCase()}_META_PREFIX . $key, $value);
        } else {
            $skipped++;
        }
    }

    if ($routes_changed) update_option('${P}_route_overrides', $routes);

    // SiteGround's dynamic cache will happily serve the old HTML otherwise.
    if (function_exists('sg_cachepress_purge_cache')) sg_cachepress_purge_cache();
    wp_cache_flush();

    if (!$post_id && $skipped > 0) {
        return array(
            'success' => true,
            'message' => 'Saved as route overrides. Set a static front page so per-page fields save too.',
        );
    }
    return array('success' => true, 'message' => 'Changes saved.');
}

/**
 * Cookie-authenticated editor context. admin-ajax authenticates from the login
 * cookie, which the REST API deliberately does not do without a nonce — so this
 * is where an editor recovers a working nonce when the inline payload is gone.
 */
add_action('wp_ajax_${P}_edit_context', function () {
    $post_id = isset($_GET['post_id']) ? (int) $_GET['post_id'] : (int) get_option('page_on_front');
    if (!current_user_can('edit_posts')) wp_send_json_error(array('message' => 'Not allowed'), 403);
    wp_send_json(${P}_wprest_payload($post_id));
});

/* =============================================================================
   7. Leads
   ============================================================================= */

function ${P}_register_leads() {
    register_post_type('lead_submission', array(
        'labels'          => array('name' => 'Leads', 'singular_name' => 'Lead'),
        'public'          => false,   // never a front-end URL
        'show_ui'         => true,
        'show_in_menu'    => false,   // we add our own menu item, with a badge
        'supports'        => array('title', 'editor', 'custom-fields'),
        'capability_type' => 'post',
    ));
}
add_action('init', '${P}_register_leads');

function ${P}_count_new_leads() {
    $query = new WP_Query(array(
        'post_type'      => 'lead_submission',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
        'meta_query'     => array(array('key' => 'lead_reviewed', 'value' => '1', 'compare' => '!=')),
    ));
    return count($query->posts);
}

function ${P}_rest_handle_lead($request) {
    $p = $request->get_json_params();
    if (!is_array($p)) $p = array();

    // Honeypot. Return success so a bot learns nothing from the difference.
    if (!empty($p['company'])) return new WP_REST_Response(array('success' => true), 200);

    $name    = sanitize_text_field($p['name'] ?? '');
    $email   = sanitize_email($p['email'] ?? '');
    $phone   = sanitize_text_field($p['phone'] ?? '');
    $message = sanitize_textarea_field($p['message'] ?? '');
    $page    = sanitize_text_field($p['page'] ?? '');

    // Two form shapes share this endpoint rather than a second CPT, because the
    // fields differ but the handling does not. The footer newsletter panel
    // collects an email and nothing else, so requiring a name would mean
    // inventing a field the visitor never filled in.
    $kind = sanitize_key($p['kind'] ?? 'contact');
    if (!in_array($kind, array('newsletter', 'contact'), true)) $kind = 'contact';
    $is_newsletter = ($kind === 'newsletter');

    if (!is_email($email) || (!$is_newsletter && !$name)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => $is_newsletter
                ? 'Please enter a valid email address.'
                : 'Please include a name and a valid email address.',
        ), 400);
    }

    // Subscribing twice is normal behaviour, not a new lead — the client should
    // not have to hand-dedupe the list. Answer success either way so the form
    // reads the same to the visitor.
    if ($is_newsletter) {
        $dupes = get_posts(array(
            'post_type'      => 'lead_submission',
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'fields'         => 'ids',
            'no_found_rows'  => true,
            'meta_query'     => array(
                'relation' => 'AND',
                array('key' => 'lead_email', 'value' => $email),
                array('key' => 'lead_kind',  'value' => 'newsletter'),
            ),
        ));
        if (!empty($dupes)) {
            return new WP_REST_Response(array('success' => true, 'id' => (int) $dupes[0], 'duplicate' => true), 200);
        }
    }

    $body = '';
    if ($name) $body .= "Name: {$name}\\n";
    $body .= "Email: {$email}\\n";
    if ($phone) $body .= "Phone: {$phone}\\n";
    $body .= 'Submitted: ' . current_time('M j, Y g:ia') . "\\n";
    if ($page) $body .= "Page: {$page}\\n";
    if ($message) $body .= "\\n{$message}\\n";

    $post_id = wp_insert_post(array(
        'post_type'    => 'lead_submission',
        'post_status'  => 'publish',
        'post_title'   => sprintf(
            '%s%s — %s',
            $is_newsletter ? 'Newsletter: ' : '',
            $name ?: $email,
            current_time('M j, Y g:ia')
        ),
        'post_content' => $body,
    ), true);

    if (is_wp_error($post_id)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Could not save the request.'), 500);
    }

    update_post_meta($post_id, 'lead_name', $name);
    update_post_meta($post_id, 'lead_email', $email);
    update_post_meta($post_id, 'lead_phone', $phone);
    update_post_meta($post_id, 'lead_message', $message);
    update_post_meta($post_id, 'lead_reviewed', '0');
    update_post_meta($post_id, 'lead_kind', $kind);
    update_post_meta($post_id, 'lead_page', $page);

    // Forward to whatever address is set in ${THEME.adminPageTitle}. Read live on every
    // submission, so changing it there is the only step required.
    $to = get_option('${P}_global_contact_email', '');
    if ($to && is_email($to)) {
        $brand = get_option('${P}_global_business_name', '') ?: get_bloginfo('name');
        wp_mail(
            $to,
            sprintf(
                '[%s] %s: %s',
                $brand,
                $is_newsletter ? 'New newsletter signup' : 'New message',
                $name ?: $email
            ),
            $body . "\\nView: " . admin_url('post.php?post=' . $post_id . '&action=edit') . "\\n",
            array(
                'Content-Type: text/plain; charset=UTF-8',
                'Reply-To: ' . ($name ? $name . ' <' . $email . '>' : $email),
            )
        );
    }

    return new WP_REST_Response(array('success' => true, 'id' => (int) $post_id), 200);
}

add_filter('manage_lead_submission_posts_columns', function ($columns) {
    return array(
        'cb'          => isset($columns['cb']) ? $columns['cb'] : '',
        'title'       => 'Name',
        'lead_kind'   => 'Type',
        'lead_email'  => 'Email',
        'lead_phone'  => 'Phone',
        'lead_status' => 'Status',
        'date'        => 'Received',
    );
});

add_action('manage_lead_submission_posts_custom_column', function ($column, $post_id) {
    if ($column === 'lead_kind') {
        $kind = (string) get_post_meta($post_id, 'lead_kind', true);
        echo $kind === 'newsletter'
            ? '<span class="dashicons dashicons-email-alt" style="color:#1B6E52;"></span> Newsletter'
            : '<span class="dashicons dashicons-format-chat" style="color:#D14124;"></span> Message';
    } elseif ($column === 'lead_email') {
        $value = (string) get_post_meta($post_id, 'lead_email', true);
        echo $value ? '<a href="mailto:' . esc_attr($value) . '">' . esc_html($value) . '</a>' : '—';
    } elseif ($column === 'lead_phone') {
        $value = (string) get_post_meta($post_id, 'lead_phone', true);
        echo $value ? esc_html($value) : '—';
    } elseif ($column === 'lead_status') {
        if (get_post_meta($post_id, 'lead_reviewed', true) === '1') {
            echo '<span style="color:#065f46;font-weight:600;">Reviewed</span>';
            return;
        }
        $url = wp_nonce_url(
            admin_url('admin-post.php?action=${P}_mark_reviewed&lead_id=' . (int) $post_id),
            '${P}_mark_reviewed_' . (int) $post_id
        );
        echo '<a class="button button-small" href="' . esc_url($url) . '">Mark reviewed</a>';
    }
}, 10, 2);

add_action('admin_post_${P}_mark_reviewed', function () {
    $id = isset($_GET['lead_id']) ? (int) $_GET['lead_id'] : 0;
    if ($id && current_user_can('edit_posts') && check_admin_referer('${P}_mark_reviewed_' . $id)) {
        update_post_meta($id, 'lead_reviewed', '1');
    }
    wp_safe_redirect(admin_url('edit.php?post_type=lead_submission'));
    exit;
});

/* =============================================================================
   8. ${THEME.adminPageTitle}
   ============================================================================= */

add_action('admin_menu', function () {
    add_menu_page(
        '${THEME.adminPageTitle}',
        '${THEME.adminMenuLabel}',
        'manage_options',
        '${P}-admin',
        '${P}_render_admin_page',
        'dashicons-admin-home',
        3
    );

    $new = ${P}_count_new_leads();
    $label = 'Leads';
    if ($new > 0) {
        $label .= ' <span class="awaiting-mod count-' . (int) $new . '"><span class="pending-count">'
            . (int) $new . '</span></span>';
    }
    add_menu_page('Leads', $label, 'edit_posts', 'edit.php?post_type=lead_submission', '', 'dashicons-email-alt', 4);
});

/** Media Library picker for the logo fields. */
add_action('admin_enqueue_scripts', function ($hook) {
    if (strpos((string) $hook, '${P}-admin') !== false) wp_enqueue_media();
});

/**
 * Every form POST is handled here rather than in the render callback: admin_init
 * runs before any output, which is what makes wp_redirect (POST → Redirect → GET)
 * safe and stops "resubmit this form?" prompts.
 */
add_action('admin_init', function () {
    if (!current_user_can('manage_options')) return;
    $back = admin_url('admin.php?page=${P}-admin');

    if (isset($_POST['${P}_save_details'])) {
        check_admin_referer('${P}_save_details');
        update_option('${P}_global_business_name',   sanitize_text_field($_POST['business_name'] ?? ''));
        update_option('${P}_global_contact_phone',   sanitize_text_field($_POST['phone'] ?? ''));
        update_option('${P}_global_contact_email',   sanitize_email($_POST['contact_email'] ?? ''));
        update_option('${P}_global_contact_address', sanitize_textarea_field($_POST['address'] ?? ''));
        update_option('${P}_global_city_state',      sanitize_text_field($_POST['city_state'] ?? ''));
        update_option('${P}_global_contact_hours',   sanitize_textarea_field($_POST['hours'] ?? ''));
        // URLs get esc_url_raw, never the text sanitiser — and the allowlist is
        // what stops a javascript: URL reaching an href.
        $allowed_schemes = array('http', 'https');
        update_option('${P}_global_order_url',       esc_url_raw(trim((string) ($_POST['order_url'] ?? '')), $allowed_schemes));
        update_option('${P}_global_instagram_url',   esc_url_raw(trim((string) ($_POST['instagram_url'] ?? '')), $allowed_schemes));
        update_option('${P}_global_yelp_url',        esc_url_raw(trim((string) ($_POST['yelp_url'] ?? '')), $allowed_schemes));

        if (function_exists('sg_cachepress_purge_cache')) sg_cachepress_purge_cache();
        wp_cache_flush();
        wp_safe_redirect(add_query_arg('${P}_saved', '1', $back));
        exit;
    }

    if (isset($_POST['${P}_repair_pages'])) {
        check_admin_referer('${P}_repair_pages');
        ${P}_ensure_required_pages();
        wp_safe_redirect(add_query_arg('${P}_repaired', '1', $back));
        exit;
    }

    if (isset($_POST['${P}_import_images'])) {
        check_admin_referer('${P}_import_images');
        $result = ${P}_import_theme_images();
        wp_safe_redirect(add_query_arg(
            array('${P}_imported' => $result['imported'], '${P}_skipped' => $result['skipped']),
            $back
        ));
        exit;
    }

    if (isset($_POST['${P}_reset_content'])) {
        check_admin_referer('${P}_reset_content');
        // Only the live edits go: the site falls back to the copy shipped in the
        // theme. Business details in the form above are left alone.
        delete_option('${P}_route_overrides');
        $front = (int) get_option('page_on_front');
        if ($front) {
            foreach ((array) get_post_meta($front) as $key => $value) {
                if (strpos($key, ${P.toUpperCase()}_META_PREFIX) === 0) delete_post_meta($front, $key);
            }
        }
        if (function_exists('sg_cachepress_purge_cache')) sg_cachepress_purge_cache();
        wp_cache_flush();
        wp_safe_redirect(add_query_arg('${P}_reset', '1', $back));
        exit;
    }
});

/**
 * Copy the photography shipped in the theme into the Media Library, so a client
 * replacing an image has real starting material to work from.
 */
function ${P}_import_theme_images() {
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    $source = get_template_directory() . '/assets/images/';
    $imported = 0;
    $skipped  = 0;

    foreach ((array) glob($source . '*.{jpg,jpeg,png,webp,svg}', GLOB_BRACE) as $file) {
        if (!is_file($file)) continue;
        $filename = basename($file);

        $existing = get_posts(array(
            'post_type'      => 'attachment',
            'posts_per_page' => 1,
            'fields'         => 'ids',
            'meta_query'     => array(array(
                'key' => '_wp_attached_file', 'value' => $filename, 'compare' => 'LIKE',
            )),
        ));
        if ($existing) { $skipped++; continue; }

        // wp_upload_bits puts the file in the CURRENT month's uploads folder —
        // no hardcoded date path to go stale.
        $upload = wp_upload_bits($filename, null, file_get_contents($file));
        if (!empty($upload['error'])) continue;

        $type = wp_check_filetype($upload['file']);
        $attachment_id = wp_insert_attachment(array(
            'guid'           => $upload['url'],
            'post_mime_type' => $type['type'],
            'post_title'     => ucwords(str_replace(array('-', '_'), ' ', preg_replace('/\\.[^.]+$/', '', $filename))),
            'post_status'    => 'inherit',
        ), $upload['file']);

        if ($attachment_id) {
            wp_update_attachment_metadata(
                $attachment_id,
                wp_generate_attachment_metadata($attachment_id, $upload['file'])
            );
            $imported++;
        }
    }

    return array('imported' => $imported, 'skipped' => $skipped);
}

function ${P}_admin_notices() {
    if (isset($_GET['${P}_saved']))    echo '<div class="notice notice-success is-dismissible"><p>Business details saved.</p></div>';
    if (isset($_GET['${P}_repaired'])) echo '<div class="notice notice-success is-dismissible"><p>Pages checked — anything missing has been created.</p></div>';
    if (isset($_GET['${P}_reset']))    echo '<div class="notice notice-success is-dismissible"><p>Live content edits cleared. The site is showing the copy shipped in the theme again.</p></div>';
    if (isset($_GET['${P}_imported'])) {
        printf(
            '<div class="notice notice-success is-dismissible"><p>Imported %d image(s); %d already in the Media Library.</p></div>',
            (int) $_GET['${P}_imported'],
            (int) ($_GET['${P}_skipped'] ?? 0)
        );
    }
}

function ${P}_field_row($label, $name, $value, $description = '', $type = 'text') {
    echo '<tr><th scope="row"><label for="' . esc_attr($name) . '">' . esc_html($label) . '</label></th><td>';
    if ($type === 'textarea') {
        echo '<textarea id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" rows="3" class="large-text">'
            . esc_textarea($value) . '</textarea>';
    } else {
        echo '<input id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" type="' . esc_attr($type)
            . '" class="regular-text" value="' . esc_attr($value) . '">';
    }
    if ($description) echo '<p class="description">' . wp_kses_post($description) . '</p>';
    echo '</td></tr>';
}

function ${P}_render_admin_page() {
    ${P}_admin_notices();
    $email = get_option('${P}_global_contact_email', '');
    ?>
    <div class="wrap">
        <h1><?php echo esc_html('${THEME.adminPageTitle}'); ?></h1>
        <p class="description" style="max-width:70ch;">
            Everything here is used across the whole site — the header, the footer, the Find Us section,
            every Order Online button, and the address newsletter signups are emailed to.
        </p>

        <?php if (!$email || !is_email($email)) : ?>
            <div class="notice notice-error">
                <p><strong>No notification email is set.</strong> Signups and messages are still saved under
                <a href="<?php echo esc_url(admin_url('edit.php?post_type=lead_submission')); ?>">Leads</a>,
                but nothing is emailed to anyone until you fill in the Email field below.</p>
            </div>
        <?php endif; ?>

        <div style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:20px;margin-top:20px;align-items:start;">
            <div style="background:#fff;padding:24px;border-radius:12px;border:1px solid #e2e8f0;">
                <h2 style="margin-top:0;">Business details</h2>
                <form method="post">
                    <?php wp_nonce_field('${P}_save_details'); ?>
                    <table class="form-table">
                        <?php
                        ${P}_field_row('Business name', 'business_name', get_option('${P}_global_business_name', ''));
                        ${P}_field_row('Phone', 'phone', get_option('${P}_global_contact_phone', ''),
                            'Shown in the header, the call tile, the footer and every tel: link.');
                        ${P}_field_row('Email', 'contact_email', $email,
                            '<strong>Newsletter signups and messages are emailed here.</strong>', 'email');
                        ${P}_field_row('Address', 'address', get_option('${P}_global_contact_address', ''),
                            'The stall and street address. Feeds the search-engine listing.', 'textarea');
                        ${P}_field_row('City, State', 'city_state', get_option('${P}_global_city_state', ''),
                            'Format as <code>Flushing, NY</code> — the two-letter state is what lets the address be published as structured data.');
                        ${P}_field_row('Hours', 'hours', get_option('${P}_global_contact_hours', ''),
                            'One line per group of days.', 'textarea');
                        ?>
                        <tr><td colspan="2"><hr><strong>Ordering &amp; social</strong></td></tr>
                        <?php
                        ${P}_field_row('Order online URL', 'order_url', get_option('${P}_global_order_url', ''),
                            'Every <strong>Order Online</strong> button points here. Change it when the ordering provider changes — no redeploy needed.', 'url');
                        ${P}_field_row('Instagram URL', 'instagram_url', get_option('${P}_global_instagram_url', ''),
                            'Listed as an official profile for this restaurant in search results.', 'url');
                        ${P}_field_row('Yelp URL', 'yelp_url', get_option('${P}_global_yelp_url', ''),
                            'Same — this is how the site claims the profile holding your reviews.', 'url');
                        ?>
                    </table>
                    <input type="hidden" name="${P}_save_details" value="1">
                    <?php submit_button('Save changes'); ?>
                </form>
            </div>

            <div style="display:flex;flex-direction:column;gap:20px;">
                <div style="background:#fff;padding:24px;border-radius:12px;border:1px solid #e2e8f0;">
                    <h2 style="margin-top:0;">Editing the page itself</h2>
                    <p>Open <a href="<?php echo esc_url(home_url('/')); ?>">the site</a> while logged in and use the
                       <strong>Edit page</strong> button in the bottom-right corner. Text, images and links become
                       editable in place; <strong>Save changes</strong> publishes them.</p>
                </div>

                <div style="background:#fff;padding:24px;border-radius:12px;border:1px solid #e2e8f0;">
                    <h2 style="margin-top:0;">Placeholders</h2>
                    <p class="description">Type any of these into editable text and it fills in automatically.</p>
                    <table class="widefat striped" style="margin-top:8px;">
                        <tbody>
                        <?php foreach (array(
                            '{{BUSINESS_NAME}}' => get_option('${P}_global_business_name', ''),
                            '{{PHONE}}'         => get_option('${P}_global_contact_phone', ''),
                            '{{EMAIL}}'         => $email,
                            '{{ORDER_URL}}'     => get_option('${P}_global_order_url', ''),
                            '{{CITY_STATE}}'    => get_option('${P}_global_city_state', ''),
                            '{{ADDRESS}}'       => get_option('${P}_global_contact_address', ''),
                            '{{HOURS}}'         => get_option('${P}_global_contact_hours', ''),
                        ) as $token => $value) : ?>
                            <tr>
                                <td style="width:42%;"><code><?php echo esc_html($token); ?></code></td>
                                <td><?php echo $value ? esc_html($value) : '<em>not set</em>'; ?></td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <div style="background:#fff;padding:24px;border-radius:12px;border:1px solid #e2e8f0;">
                    <h2 style="margin-top:0;">Maintenance</h2>

                    <form method="post" style="margin-bottom:14px;">
                        <?php wp_nonce_field('${P}_repair_pages'); ?>
                        <input type="hidden" name="${P}_repair_pages" value="1">
                        <p class="description">Recreates any WordPress page the site expects and re-sets the front page.</p>
                        <?php submit_button('Check &amp; create missing pages', 'secondary', 'submit', false); ?>
                    </form>

                    <form method="post" style="margin-bottom:14px;">
                        <?php wp_nonce_field('${P}_import_images'); ?>
                        <input type="hidden" name="${P}_import_images" value="1">
                        <p class="description">Copies the photography shipped with the theme into the Media Library so you can edit or replace it. Safe to run more than once.</p>
                        <?php submit_button('Import theme images', 'secondary', 'submit', false); ?>
                    </form>

                    <form method="post" onsubmit="return confirm('Clear every live text, image and link edit and go back to the copy shipped with the theme?');">
                        <?php wp_nonce_field('${P}_reset_content'); ?>
                        <input type="hidden" name="${P}_reset_content" value="1">
                        <p class="description">Discards all inline edits. Business details above are kept.</p>
                        <?php submit_button('Reset page content', 'delete', 'submit', false); ?>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <?php
}
`;
}
