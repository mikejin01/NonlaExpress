# Nón Lá Express — nonlaexpress.com rebuild

Client site for **Nón Lá Express**, the fast-casual Vietnamese kitchen at stall
FH17 inside Tangram food hall, Flushing NY. Replaces the existing Wix site.

The build matches the original nonlaexpress.com's **layout, typography and
motion**, running the brand's own colour through it. Full brief:
[docs/website-brief.md](docs/website-brief.md). The design system, every phase's
findings and the open client questions live in
**[docs/redesign-plan.md](docs/redesign-plan.md)** — start there.

**Status:** redesign complete through **Phase F (QA + launch prep), 2026-08-12**,
with **§5 Q4 settled the same day** — `/blog` replaces `/press` and is backed by
real WordPress posts — so **nothing is blocked on the client any more.**
Everything still outstanding is an optional decision, not work. See plan §5.

## The blog

`/blog` renders posts written in the **WordPress dashboard**. Publish a post and
it appears — no deploy, no code change.

- WordPress owns the URLs: `xo_configure_blog()` sets the permalink base to
  `/blog/`, so a post answers **200** at `/blog/<slug>/`, which is exactly the
  URL `src/routes/blog/[slug]` expects.
- The SPA owns rendering: posts arrive over `GET /wp-json/xo/v1/posts`
  (`?slug=` for one post, with content).
- ⚠️ **There is no blog on GitHub Pages or `pnpm dev`** — there is no WordPress
  behind them, so the index shows an explicit "published from WordPress" state
  rather than pretending to be empty. That is by design.
- ⚠️ Blog text is user-authored and may be Chinese, so it uses `--display-intl` /
  `--body-intl`. Those exist because `var(--display), var(--zh-font)` does **not**
  work: both base tokens end in a generic `serif`, which catches Han glyphs
  before Noto Serif SC is reached.

## Legacy URLs

The old Wix blog's **12 posts** under `/post/…` (11 Chinese-language Flushing SEO
articles), plus `/tracker-page` and our own retired `/press`, all 301 rather than
404 — phở/noodle guides to `/menu/`, general pieces to `/`, `/press` to `/blog/`.
**`scripts/redirects.js` is the canonical map**; it is compiled into the theme's
`functions.php`. The other nine legacy pages need no redirect: they are the same
paths on the new site, which is why the routes are named as they are.

⚠️ **`/blog` is deliberately not in the map** — it is a live route now, and
listing a live route in a redirect map is how you 301 your own blog away. The
redirects are gated on `is_404()`, so they also stand aside automatically if
real content ever appears at a mapped path.

⚠️ These are `template_redirect` 301s, so they exist on the **WordPress target
only** — GitHub Pages cannot do server-side redirects. That is fine while
WordPress is production, and silently wrong if nonlaexpress.com is ever pointed
at Pages instead.

## Two build shapes, one codebase

⚠️ This is the single easiest thing to get wrong.

| Command | Output | Target |
| --- | --- | --- |
| `pnpm build` | prerendered static site → `build/` | GitHub Pages |
| `make build` (`WP_BUILD=1 pnpm build`) | client-only SPA → `wordpress-theme/` | the WordPress theme |

Anything that bakes content into HTML at build time breaks the WordPress shape,
because WordPress must supply content at runtime.

```sh
pnpm install
pnpm dev                # local dev
pnpm build && pnpm preview
make build-and-push     # build the theme, rsync to SiteGround, purge caches
```

## Content sync — the live WordPress site is the source of truth for copy

Logged-in users edit text, images and links on the live site. Those edits live
in the WordPress DB and **shadow** the defaults in `src/lib/content.js`, so the
local file can be stale at any moment and a stale default is invisible in
production.

**Before editing `src/lib/content.js`, `content-overrides.json`, or any
`getText()` default, run `make check-content-drift`.** If it reports drift, stop,
`make pull-content`, commit the sync, then apply the change on top. Full rule in
[CLAUDE.md](CLAUDE.md).

## Stack

SvelteKit (Svelte 5) · `adapter-static` · pnpm. Deployed to **two** live targets:

| Target | URL | Deployed by |
| --- | --- | --- |
| GitHub Pages | `mikejin01.github.io/NonlaExpress/` | Actions, on every push to `main` |
| WordPress | `jeffl248.sg-host.com` | `make build-and-push` — **a git push does NOT deploy this** |

## Design system (plan §1.2d)

A **cream page**, **green as the accent**, **terracotta as a third colour**. The
rule that makes three colours work: **green speaks, terracotta draws** — green
carries text and interaction, terracotta carries graphics and display type
(it measures 3.88:1 on cream, enough for large text and fills, not for body).

`--cream #F0EAD6` is the `:root` default, so **a section with no `.on-*` class is
cream and green is the one you ask for**. Sections carry
`.on-cream` / `.on-green` / `.on-green-deep` / `.on-charcoal` / `.on-terracotta` /
`.on-media`, which repoint `--fg` / `--accent` / `--warm` / `--btn-*`.
**Never hard-code a text colour** — write `color: var(--fg)` and it reads
correctly on every surface. That contract is why four palette directions in two
days were token-level edits that touched no layout.

Type: Playfair Display 900 (`--display`, standing in for TT Nooks — plan §5 Q2) ·
Maname (`--body-font`) · Overpass (`--label`) · Noto Serif SC 600 (中文).

## Structure

| Path | Purpose |
| --- | --- |
| `src/lib/content.js` | **All copy + menu data** (EN / 中文 / Việt) — but read the content-sync rule first |
| `src/lib/site/` | Logo, Navbar, Footer, LunchSpecial |
| `src/lib/wp/` | The WordPress bridge — `posts.js` (blog), `client.js`, `wpEdit`, `leads`. All of it degrades to sane defaults off WordPress |
| `scripts/redirects.js` | Canonical legacy-URL → 301 map, compiled into the theme |
| `src/lib/art/` | Brand SVGs **inlined** by `Art.svelte` (needs `currentColor` / `var(--art-*)`) |
| `static/assets/art/` | Brand SVGs that need no theming |
| `src/routes/` | `/` · `/menu` · `/company` · `/blog` (+ `/blog/[slug]`) + 3 legal routes; `/press` is a retired redirect stub |
| `wordpress-theme/` | **Generated** by `scripts/build-wordpress-theme.mjs` — never hand-edit |

## Tools (`scripts/`, all stdlib-only)

- **`verify.py`** — run after every phase. Real WCAG audit (composites each
  element over its actual background) + webfont + overflow checks across all 7
  routes at 1440 and 540. Needs `pnpm build && pnpm preview` first, and
  **bump `OUT_TAG`** or it relabels the previous phase's captures.
- **`cdp.py`** — Chrome DevTools driver. Use it for anything scroll-driven: a
  plain full-page `--screenshot` renders those effects in their end state and
  shows nothing. `emulate_media()` forces `prefers-reduced-motion`; call it
  before `goto`.
- **`svgclean.py`** — regenerates brand art from the harvest. Don't hand-edit
  `src/lib/art/` or `static/assets/art/` — edit the MANIFEST and re-run.

## Outstanding before launch

All of it is waiting on the client, not on the build — plan §5 has the full list
with measured costs.

- **Q3 — hero video weight.** 17.86 MB of a 17.90 MB homepage. /company's video
  was re-encoded 7.9 MB → 1.12 MB with no visible loss as a worked example.
- **Q9 — Chinese webfont.** 767 KB on `/menu/`; a `&text=` subset measures
  25.1 KB, at the cost of freezing the glyph set against live editing.
- **Q2** (TT Nooks license) · **Q5** (show menu prices?) · **Q6** (is the Burger
  section current?) · **Q7** (Maname's Vietnamese diacritics).
- Brief §6 leftovers: hours confirmation, newsletter provider, and DNS/registrar
  access at cutover. (Press entry details are moot — that page is a blog now, so
  a mention is just a post. The `/post/*` redirect map is **done**.)
