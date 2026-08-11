# Nonla Express — client website project

## Content sync rule (live WordPress is the source of truth for content)

Since 2026-08-11 this site also ships as a **WordPress theme** on SiteGround
(`jeffl248.sg-host.com`, theme slug `nonla-express`). Logged-in users edit text,
images and links directly on the live site; those edits are stored in the
WordPress DB and **SHADOW** the defaults in `src/lib/content.js`. The local file
is therefore possibly stale at any moment — and a stale default is invisible on
the live site until someone resets content or greps the repo for copy that no
longer matches production.

- BEFORE editing `src/lib/content.js`, `src/lib/content-overrides.json`, or any
  `getText()` default string in a component: run `make check-content-drift`.
- If it reports drift: **STOP.** Run `make pull-content`, review the diff, commit
  the sync (`chore(content): sync live edits from nonla`), and only then apply
  the requested change on top.
- If SSH is unavailable, say so explicitly and warn that local content may be
  stale — do not edit content silently.
- After deploying content changes (`make build-and-push`), remember DB overrides
  still win over the new defaults. Clearing a stale override means deleting it
  (`wp option delete` / route override), not just redeploying.

⚠️ **Two build shapes, one codebase.** `pnpm build` prerenders for GitHub Pages;
`WP_BUILD=1 pnpm build` emits the client-only SPA the theme needs. `make build`
runs the WordPress one. Anything that bakes content into HTML at build time
breaks the WordPress shape — WordPress must supply content at runtime.
`verify.py`'s `pnpm build && pnpm preview` loop is unaffected and still correct.

## Project status
Intake CLOSED 2026-08-06. **Phase 6 scaffold BUILT 2026-08-06** — full site at
repo root (SvelteKit static, all pages + bilingual menu), builds clean
(`pnpm build`). See README.md for structure. **REDESIGN in progress
(2026-08-06):** matching the original Wix site's look — plan + research + phase
checklist in **docs/redesign-plan.md** (self-contained — start a new session by
reading it). Original-site assets harvested to docs/assets/original-site/
(photos are already gitignored), including the real logo vectors (brief §6 logo
question RESOLVED).

**Phase A SHIPPED 2026-08-06**, then re-skinned three times on palette
direction. As of **2026-08-07 the site is a CREAM page with GREEN as the accent
and TERRACOTTA as a third brand colour** (§1.2d, "the swap" — see "Design
system" below). **Phase B SHIPPED 2026-08-07** — brand assets: the real
logo vectors replace the interim hand-drawn mark, 16 harvested SVGs are
optimized into themed art, and the photo set turned out to need nothing (plan
§2.2). **Phase C SHIPPED 2026-08-07** (amended repeatedly the same day, see
below) — the homepage runs the original's section order around three sections of
our own, **8 sections** after three client trims: video hero · sliding dish
cards · statement hero + three phở cards · feature phở · type marquee ·
interior grid · Find Us · charcoal drinks collage · footer with the newsletter
panel and **the arc** (plan §2.3). **Phase C2 SHIPPED 2026-08-11** — the motion
layer (M4 and M6 died with the intro section, so it was M1/M2/M3/M5). **Phase D
SHIPPED 2026-08-11** — the /menu re-skin: the red "ăn nào!" header with lime +
noodle art bleeding off both edges, ruled section heads, and **cut-out dish
photos directly on cream with NO cards** (plan §2.6).
**Next: Phase E — /company + the remaining pages.**

⚠️ **The dish photos ship on a `#F1EAD7` studio backdrop**, one step off
`--cream`. That is why /menu needs no cards — and it is a constraint, not just a
convenience: **those photos cannot sit on a non-cream surface** without
`mix-blend-mode: multiply` over the fill (the trick the homepage feature row
uses, plan §2.3).

⚠️ **Plan §1.3's claim that the original's /menu ends on a charcoal drinks band
is WRONG**, and is corrected in place. Its drinks are on cream; the dark band in
`orig-menu-full.png` is the **original footer's own ground**. Ours differs on
purpose — our footer is transparent and the arc *is* its surface, so the wedges
show the page — so don't read `arc-scroll-5300.png` as our arrangement. /menu now
closes on a charcoal CTA so the arc rises out of it as on the homepage.

⚠️ **The hero carries the page's only `<h1>`** since the intro was removed —
`INTRO_SEO.h1` + `.blurb`. `.hero-title` has a **measured** off-scale clamp
fitted to break that exact 50-character string at two lines; re-measure if the
copy changes (plan §2.3).

⚠️ **Read redesign-plan.md §2.4 before restructuring any page.** The first
Phase C build reproduced the original too faithfully and deleted things our
scaffold did better; the client asked for them back — then, later the same day,
asked for the Lunch Special section and the Signature Drinks row to go. **§2.4
protects a REASON, not a roster:** don't delete one of our sections *because the
original lacks it*; do delete one when the client asks. It lists removed
sections with their status so nobody "restores" them. The brief is *the
original's layout, typography and motion carrying the brand's own colour* —
**not** "reproduce the original". (`LunchSpecial.svelte` still ships on /menu —
don't delete the component.)

Two live traps that follow from that: the **sliding dish carousel (section 2)
is not the type marquee (section 5)** — an older line in the plan told C2 to
"retire the rAF marquee", which is now cancelled, and deleting the wrong one
would remove a client-kept section. And the **drinks collage must stay last**,
because the footer arc rises out of its charcoal band.

Motion (Phase C2, plan §2.5) is **five effects and no new JavaScript**: the rAF
card carousel and the scroll-arrow bob from Phase C, plus M1 the two-row type
marquee (30.9s left / 36.5s right), M2 the footer arc scrubbing 1.20×→2.55×
viewport widths, and M3 the drinks parallax (phin ±107px, cup ±102px, polaroids
±60px counter-moving, beans static). M5's button transition was already in from
Phase A. Every effect is `@media (prefers-reduced-motion: no-preference)` and
the scroll-driven three are also `@supports (animation-timeline: view())`; both
fallbacks land on the Phase C page, which was already correct. **Nothing motion
adds may be load-bearing** — keep it that way.

⚠️ **The `animation` shorthand RESETS `animation-timeline` and
`animation-range`.** Put the shorthand *before* those longhands, or use
longhands throughout. Get it wrong and the effect silently moves to the document
timeline, runs once on load and parks at its end state — which is
indistinguishable from "broken" in a screenshot and from "correct" in a
full-page capture. ⚠️ **The marquee's seam only hides while one `.mq-track`
stays wider than the viewport + the row's 14vw offset** (measured 3288/3822px at
1440, 1338px at 540) — re-measure if `MQ`'s repeat count or `.mq-word`'s size
changes.

Open client questions are redesign-plan.md §5 (8 of them). **Q4** (BLOG vs
PRESS in the nav) is the only one still blocking anything shipped. **Q2** (TT
Nooks license) now has a measured cost: Playfair 900 is ~9% wider than the real
face, which already forced the drinks headline off the measured type scale
(§2.3). **Q3** (hero video) is a design question again — the video is back as
section 1, so its **33MB of a 37MB deploy** is load-bearing; the open part is
whether a lighter rendition is acceptable.

**Two live deploys, both current as of 2026-08-11 (Phase C2).** ~~The Pages site
is stale~~ — that was true through Phase A and is **fixed**: pushes trigger
Actions runs normally again, and both targets were verified by fetching their
CSS bundles, not by eye (plan §7).
- **GitHub Pages** — `mikejin01.github.io/NonlaExpress/`, prerendered, deployed
  by Actions on every push to `main`.
- **WordPress** — `jeffl248.sg-host.com`, the client-editable theme, deployed by
  `make build-and-push`. **A push to git does NOT deploy this one**; it is a
  separate manual step, and content edits made live shadow the repo's defaults
  (see the content sync rule at the top).

Three tools, all stdlib-only, all in `scripts/`:
- `verify.py` — **run after every phase.** Real WCAG audit (composites each
  element over its actual background) + webfont + overflow checks across all 7
  routes at 1440 and 540. Needs `pnpm build && pnpm preview` first. **Bump
  `OUT_TAG` each phase** or it relabels the previous phase's captures.
- `cdp.py` — Chrome DevTools driver. Use it for anything scroll-driven: a plain
  full-page `--screenshot` renders those effects in their end state and shows
  nothing. The original's motion system is measured in redesign-plan.md §1.5.
  ⚠️ It uses a **fixed** debug port, so a leaked browser used to hijack new
  sessions at *its* window size and silently measure the wrong viewport — it
  invalidated a verify run on 2026-08-07. Now pinned with
  `setDeviceMetricsOverride`; if numbers still look off check `lsof -ti:9333`
  and kill **by port**. Plan §4.
- `svgclean.py` — regenerates the brand art from the harvest. **Don't hand-edit
  anything in `src/lib/art/` or `static/assets/art/`** — edit the MANIFEST and
  re-run. `--sheet` renders every asset on all four surfaces for eyeballing.

Brand art is split on purpose: `src/lib/art/` is inlined by `Art.svelte` because
`currentColor` and `var(--art-*)` are inert inside an `<img>`; `static/assets/art/`
is for pieces that need no theming and shouldn't bloat the HTML. Plan §2.2.

## Design system (current: §1.2d "the swap", 2026-08-07)
We take the original site's **layout, typography and motion** and run **three
brand colours** through it: a **CREAM page**, **GREEN as the accent**, and the
brand's own **TERRACOTTA as a third colour**.

**The rule that makes three colours work: GREEN SPEAKS, TERRACOTTA DRAWS.**
Green carries everything that is text or interaction — accent text, links,
eyebrows, buttons, and the two full-width brand bands (statement hero, footer).
Terracotta carries everything that is a *graphic* — the logo mark on cream, the
folk-art line-work, numbered badges, price ovals, the footer arc's ring, the
hero curve's hairline, and display-size warm headings. This follows from one
measurement: terracotta is **3.88:1 on cream**, enough for large text and fills
and not enough for body copy.

⚠️ Two palette directions were built and rejected before this one. §1.2b was a
**mid-tone flat green field** with no panels; §1.2c was a **deep green ground**
with cream panels. Read both before proposing "more green" or "less green" —
and note that a session half-remembering §1.2c will get every default backwards.

Greens, split by contrast headroom — don't collapse them:
`--green #1B6E52` (**the accent** — accent text, button fills, badges · 5.13:1
against *both* cream and ink) · `--green-surface #17543E` (green panels ·
7.35:1) · `--green-deep #143F32` (the statement band + footer · 9.76:1, so fine
print goes here). Plus `--cream #F0EAD6` (**the page**, the `:root` default),
`--terracotta #D14124` / `--rust #A94C23` (the third colour), and
`--charcoal #2D2926` (both drinks moments). Type: Playfair Display 900
(`--display`, standing in for TT Nooks) · Maname (`--body-font`) · Overpass
(`--label`) · Noto Serif SC (中文).

**Never hard-code a text color.** Sections carry `.on-cream` / `.on-green` /
`.on-green-deep` / `.on-green-lift` / `.on-charcoal` / `.on-terracotta` /
`.on-media`, which paint `--surface` and re-point `--fg` / `--fg-muted` /
`--fg-dim` / `--rule` / `--accent` / `--accent-ink` / `--warm` / `--warm-ink` /
`--mark` / `--btn-*`. Write `color: var(--fg)` and it reads correctly on every
surface. This contract is why **four** palette directions in two days were
token-level edits that touched no layout — keep it that way.

Constraints that are easy to violate — full table in redesign-plan.md §2.1:
- **The `:root` default is cream.** A section with no `.on-*` class is cream;
  **green is the one you have to ask for.** This inverted twice in two days and
  is the most likely thing to trip up a new section.
- **A `.on-cream` panel on the cream page is not a panel** — it needs
  `--cream-lift` plus a `--rule` hairline (what press/company/menu cards and the
  Lunch Special promo do). `.on-cream` itself is still correct on the green
  bands, where it *is* the contrast.
- **`--sand #FAE6C0` is invisible on cream (~1.1:1).** It is the warm accent for
  DARK surfaces only; on cream use `--accent-ink` (green) or `--warm-ink`
  (rust). Also never `--sand-2` on green — looks identical, measures 4.21:1.
- **The third colour has two tokens, use them:** `--warm` for graphics and
  display type, `--warm-ink` (rust, 4.66:1) for small text. Terracotta as text
  needs **≥18.66px at weight 700+** to clear WCAG large text — the intro heading
  carries a 20px clamp floor for exactly this reason.
- `--green-bright #47927A` (the client's vivid green) is 3.08:1 on cream →
  decorative fills only, never text or behind text.
- `.on-terracotta` is **defined but deliberately unused** — it is the statement
  hero's option if the client wants more orange. Don't sweep it as dead CSS.

## Client
Nón Lá Express — fast-casual Vietnamese Kitchen, stall FH17 inside Tangram food
hall, 133-33 39th Ave, Flushing NY. Existing Wix site nonlaexpress.com (replace;
keep URLs for 301s). Styling reference: docs/Menu-1.png / Menu-2.png.

## Build target (Phase 6) — HISTORICAL
⚠️ Everything below describes the original scaffold and is **superseded by
"Design system" above** (fonts, palette and tokens all changed). Kept because
the stack, the imagery inventory and the hero-video note are still accurate —
and because the live Pages site is still serving exactly this. Don't take the
color/font values here as current.

Sora-Sushi-Web-Design-Template (SvelteKit, static, GitHub Pages), **Editorial**
style re-skinned to brand green / cream #F2EBD9 / orange-red accent; fonts
Fraunces Black · Montserrat Bold · Bitter · Noto Serif SC. Imagery in
docs/assets/ (9 high-res originals). Logo: re-draw SVG from menus (no vector yet).
Palette note (2026-08-06): client asked for brighter/more vivid than the printed
menus' #407666 — green ramp lifted (see src/app.css `:root`, green #47927a / bg
#2b584a); homepage hero is a video (static/assets/videos/) with a light overlay.
