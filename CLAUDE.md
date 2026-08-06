# Nonla Express — client website project

## Project status
Intake CLOSED 2026-08-06. **Phase 6 scaffold BUILT 2026-08-06** — full site at
repo root (SvelteKit static, all pages + bilingual menu), builds clean
(`pnpm build`). See README.md for structure. **REDESIGN in progress
(2026-08-06):** matching the original Wix site's look — plan + research + phase
checklist in **docs/redesign-plan.md** (self-contained — start a new session by
reading it). Original-site assets harvested to docs/assets/original-site/
(photos are already gitignored), including the real logo vectors (brief §6 logo
question RESOLVED).

**Phase A SHIPPED 2026-08-06** — the site is now cream/terracotta, not dark
green (see "Design system" below). **Next: Phase B — brand assets**; then git
init + push for Pages deploy. Open client questions are redesign-plan.md §5 (8
of them; Q1 palette direction and Q2 TT Nooks license are the load-bearing
ones).

Two tools, both stdlib-only, both in `scripts/`:
- `verify.py` — **run after every phase.** Real WCAG audit (composites each
  element over its actual background) + webfont + overflow checks across all 7
  routes at 1440 and 540. Needs `pnpm build && pnpm preview` first.
- `cdp.py` — Chrome DevTools driver. Use it for anything scroll-driven: a plain
  full-page `--screenshot` renders those effects in their end state and shows
  nothing. The original's motion system is measured in redesign-plan.md §1.5.

## Design system (post-Phase A)
We take the original site's **layout, typography and motion**, but run the
**brand's own green** through it — not the original's terracotta (client
direction 2026-08-06; redesign-plan.md §1.2a).

**Cream is the dominant surface; green is the ACCENT.** A green-dominant
variant (wide green fields, copying `docs/Menu-1.png`) was built and rejected by
the client — see §1.2b before proposing more green. Menu-1 is a good reference
for type, price ovals, bilingual captions and photo treatment, not for how much
of the page green should own.

Cream `#F0EAD6` page · `--green #1B6E52` primary accent (buttons, accent text) ·
`--green-surface #17543E` the green blocks (footer, newsletter, feature panels,
promo) · `--charcoal #2D2926` drinks band · terracotta/rust a **warm secondary**
(the folk-art SVGs are drawn in it; the printed menu numbers dishes in it). Type:
Playfair Display 900 (`--display`, standing in for TT Nooks) · Maname
(`--body-font`) · Overpass (`--label`) · Noto Serif SC (中文).

**Never hard-code a text color.** Sections carry `.on-cream` / `.on-green` /
`.on-charcoal` / `.on-terracotta` / `.on-media`, which paint `--surface` and
re-point `--fg` / `--fg-muted` / `--fg-dim` / `--rule` / `--accent` /
`--accent-ink` / `--btn-*`. Write `color: var(--fg)` and it reads correctly on
every surface. This contract is why three palette changes in one day were
token-level edits that touched no layout — keep it that way.

Constraints that are easy to violate — full table in redesign-plan.md §2.1:
- `--green` on cream is **5.13:1 — passes both ways**, so the same token is
  accent text on cream AND a fill carrying cream text.
- `--green` and `--green-surface` are split on purpose: only the deeper one has
  headroom for a muted ramp (7.35:1). Don't collapse them.
- The warm label accent on dark surfaces is `--sand #FAE6C0`. **Not `--sand-2`**
  — it looks nearly identical but measures 4.21:1 on green and fails.
- `--green-bright #47927A` (the client's vivid green) is **3.08:1** →
  decorative fills only, never text and never behind text.
- Terracotta is **3.88:1 both ways** → display sizes/fills only; `.on-terracotta`
  has no muted ramp and uses `--cream-bright`. Small red accents use `--rust`.

## Client
Nón Lá Express — fast-casual Vietnamese Kitchen, stall FH17 inside Tangram food
hall, 133-33 39th Ave, Flushing NY. Existing Wix site nonlaexpress.com (replace;
keep URLs for 301s). Styling reference: docs/Menu-1.png / Menu-2.png.

## Build target (Phase 6)
Sora-Sushi-Web-Design-Template (SvelteKit, static, GitHub Pages), **Editorial**
style re-skinned to brand green / cream #F2EBD9 / orange-red accent; fonts
Fraunces Black · Montserrat Bold · Bitter · Noto Serif SC. Imagery in
docs/assets/ (9 high-res originals). Logo: re-draw SVG from menus (no vector yet).
Palette note (2026-08-06): client asked for brighter/more vivid than the printed
menus' #407666 — green ramp lifted (see src/app.css `:root`, green #47927a / bg
#2b584a); homepage hero is a video (static/assets/videos/) with a light overlay.
