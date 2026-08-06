# Nonla Express — client website project

## Project status
Intake CLOSED 2026-08-06. **Phase 6 scaffold BUILT 2026-08-06** — full site at
repo root (SvelteKit static, Editorial re-skin, all pages + bilingual menu),
builds clean (`pnpm build`), verified in headless Chrome. See README.md for
structure. **REDESIGN in progress (2026-08-06):** matching the original Wix
site's look (TT Nooks Bold display + Maname body, cream/terracotta palette,
folk-art SVGs, scroll-driven motion) — plan +
research + phase checklist in **docs/redesign-plan.md** (self-contained — start
a new session by reading it). Original-site assets harvested to
docs/assets/original-site/ (photos are already gitignored). Real
logo vectors found there (brief §6 logo question RESOLVED). **Next:** redesign
Phase A (fonts+palette tokens); then git init + push for Pages deploy; remaining
§6 questions: hours, newsletter provider, press details, /blog redirect map.
The original's motion system (marquee, scroll-grown footer arc, parallax) is
measured in redesign-plan.md §1.5. Inspect scroll-driven effects with
`scripts/cdp.py` (stdlib CDP driver) — a plain `--screenshot` renders them in
their end state and shows nothing.

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
