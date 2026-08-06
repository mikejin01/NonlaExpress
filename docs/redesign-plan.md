# Redesign plan — match the original nonlaexpress.com look

Multi-session working plan. Research done 2026-08-06 (this file is the source of
truth for it — the live Wix site may change or die at cutover; everything needed
is harvested into `docs/assets/original-site/`). Update the checkboxes and the
session log at the bottom as work proceeds.

**Goal:** the client (and we) find the original Wix site stronger than our Phase 6
scaffold. Adopt its typography, palette, illustration language, and page
structure, while keeping our SvelteKit/static/GitHub-Pages stack and the useful
things the scaffold added (bilingual menu data, lunch-special panel, press page,
legal pages, 301-parity routes).

---

## 1. Research findings (original site, captured 2026-08-06)

### 1.1 Typography (**corrected 2026-08-06** — measured, not inferred)

⚠️ An earlier draft of this section read the Wix theme variables and got the
roles wrong. These values come from `getComputedStyle` on the live site at
1440px (see §4), which is authoritative. The correction matters: **the face the
client singled out is TT Nooks Bold, not Maname.**

| Role | Font | Verified usage (size / weight) |
| --- | --- | --- |
| **Display voice** — the look being praised | **TT Nooks Script Bold** (commercial, TypeType) | hero "NATURAL INGREDIENTS, FRESH TASTE." **157.5px / 700**; drinks "COOL DRINKS…" **157.5px / 700**; marquee "nón lá / express" **236px / 700** (italic); intro red text **22.5px / 700** |
| **Workhorse serif** — nearly everything else | **Maname** 400 (Google Fonts, one weight) | newsletter heading **105px**; pho card titles **36px**; body & intro paragraphs **24px**; nav links **18px**; footer SEO text **12px** |
| Button label only | **Expressway Bold** (commercial, Typodermic) | "ORDER ONLINE" pill **14px** — and nothing else on the homepage |
| TT Nooks Script *Regular* | loaded but unused on the homepage | menu "ăn nào!", company script heading |
| (Wix leftovers) | din-next, Madefor, Poppins, Helvetica, Avenir | Wix UI internals — ignore |

Two corrections worth stating plainly, because they invert the earlier plan:

1. **Nav links are Maname 18px, not Expressway.** Expressway appears exactly
   once on the homepage (the ORDER ONLINE pill), so it is a trivial dependency
   — Overpass or any clean grotesque substitutes with no visual loss.
2. **The big statement headlines are TT Nooks Bold**, the same family as the
   marquee. It carries the hero, the drinks band, the marquee and the intro
   text — i.e. it *is* the brand's visual identity, not a one-off accent.

**Type scale to build from** (measured px at 1440): 157.5 · 105 · 36 · 24 · 22.5
· 18 · 14 · 12. Maname is used at both display (105px) and caption (12px) sizes.

**Substitution reality check.** Rendered candidates against the real hero
(`screenshots/fonttest.png` vs `orig-home-hero.png`): **no free font is a true
match** for TT Nooks — it has a condensed, quirky high-contrast character none
of the Google options reproduce. Ranked stand-ins:

| Candidate | Verdict |
| --- | --- |
| **Playfair Display** 900 + Black Italic | **Best free option.** Right weight/contrast for the caps, and its italic is a genuinely good marquee substitute. Has a Vietnamese subset. |
| Bodoni Moda 900 | Higher contrast, more Didone; wider than the original |
| DM Serif Display | Good proportions, less drama |
| Prata / Abril Fatface | Too light / too fat |
| ~~Chewy~~ | **Wrong** — the earlier plan suggested it. It's a fat rounded comic script; nothing like a high-contrast display serif. Do not use. |

Recommendation: since this face carries the identity, licensing TT Nooks is the
honest route (§5 Q2 — now a design-critical decision, not a nicety). Build Phase
A behind a `--display` variable so swapping the file later is a one-line change.

**Role → CSS mapping** (later phases say "display" and "script" — they mean
these two classes, both driven by `--display`, so the TT Nooks swap touches one
variable):

| Class | Font | Used by |
| --- | --- | --- |
| `.display` | `--display`, weight 900, upright | statement hero, drinks headline, section headings. Caps come from the copy — **no `text-transform`** |
| `.script` | `--display`, weight 900, *italic* | marquee rows, "ăn nào!" menu header, company heading, intro red heading |
| (default) | `--body-font` = Maname 400 | body, nav links, card titles, newsletter heading, captions |
| `.zh` | Noto Serif SC | 中文 throughout |

### 1.2 Palette (from Wix `--color_*` vars + screenshots)

| Color | Hex | Role on original site |
| --- | --- | --- |
| Cream | `#F0EAD6` | **Dominant page background** (header, intro, marquee, menu page, blog) |
| Terracotta | `#D14124` | Statement-hero bg, footer bg, buttons, headings, folk illustrations |
| Charcoal | `#2D2926` | Drinks-section bg; near-black text is plain `#000` |
| Green | `#407665` | **Accent only** — herb-leaf illustrations, drink-cup art (matches printed menus) |
| Sand | `#FAE6C0` / `#F4D7A0` / `#FCCCA7` | Warm tints in art |
| Rust / maroon | `#A94C23` / `#501813` | Deep accents |
| Orange | `#E57923` | Small accents |

**Key inversion vs our build:** original is a LIGHT cream site with terracotta
statement blocks; green appears only as an accent. Our scaffold is a DARK
green-page site. Note: client asked for "brighter green" on 2026-08-06 — that
feedback was about the green *hue*, given our green-dominant layout. Moving to
cream-dominant/terracotta is a real direction change → **confirm with client**
(§5 Q1), but it is what the user asked us to pursue.

### 1.3 Page structure (original)

**Home** (top→bottom):
1. Cream header — nav left (OUR MENU · OUR COMPANY · BLOG), centered logo, terracotta ORDER ONLINE pill right.
2. Cream intro — **corrected 2026-08-06, see `screenshots/intro-real-0.png`.** Three columns, not the "animals left, text right" the earlier draft described: a giant red line-art **rooster bleeding off the left edge**, a **centred white-framed photo slideshow** (§1.5 M6 — auto-advancing, with ‹ › arrows), and a giant red **buffalo in a nón lá hat bleeding off the right edge**. The red heading "Authentic Vietnamese Restaurant in Flushing, Queens" (TT Nooks Bold 22.5px) + 3-line Maname blurb sit top-right, above the buffalo. The **pig** is lower-left, below the fold. Generous cream whitespace throughout; no large headline here.
3. Terracotta statement hero — huge **TT Nooks Bold 157.5px** "NATURAL INGREDIENTS, FRESH TASTE." + Maname 24px paragraph + `#nonlaexpress` link.
4. Still terracotta — pho favorites: caption line, then 3 cream rounded cards with overhead cut-out pho bowls; below each: name (RIB EYE PHỞ / CHICKEN PHỞ / PHỞ & SPICE) + description in cream text.
5. Cream marquee band — giant scrolling black "nón lá ✦ express" (TT Nooks bold) interleaved with small red zodiac animals (horse, rooster).
6. Interior photo grid — 6 photos, 2-row masonry, full-width.
7. Charcoal drinks section — big cream display "COOL DRINKS WARM MEMORIES IN EVERY SIP." + illustrated phin filter, layered drink cup, coffee beans + two photos tilted like taped polaroids (−8° / +9°) + centered EN + 中文 paragraph. Art and photos drift on scroll (§1.5 M3).
8. Terracotta footer — a **giant terracotta circle grows on scroll** out of the charcoal band (§1.5 M2), and on it: stacked cream logo + SEO paragraph, big cream rounded panel "Subscribe to our newsletter" (black Maname, radius 16px) + email input + Submit; link columns (nav / social / legal), address + phone + © line.

**Menu** (`/menu`): cream throughout. Header: green lime + cut-lime art left,
red script "ăn nào!" + "NónLá Express Menu" + intro paragraph center, cream
noodle-squiggle right. Sections **Appetizers → Phở Noodle Soup → Main Dishes →
Drinks**, each a thin-ruled heading (script/serif) + 3-col grid of cut-out
photos of dishes in branded to-go containers; items numbered 1–10 across
Phở + Mains; protein options listed as sublists. **No prices shown on the web
menu.** Drinks on dark band at page bottom (3 branded cups).

**Company** (`/company`): 50/50 split. Left cream: "About NónLá Express" label,
red script heading "Serving Fresh Healthy Pho, with Modern Convenience", red
serif pull-quote «"phở, the new era"», two story paragraphs, interior photo.
Right: full-bleed kitchen video (Wix-hosted). More terracotta/cream blocks
below the fold (illustrated dishes company-29/30/31 likely used there).

**Blog** (`/blog`): Wix blog card grid, 4-col, mostly Chinese-language SEO
posts (法拉盛/Flushing pho keywords) + a couple EN. Feeds the footer band.

**Order:** all CTAs → `https://order.snackpass.co/67be450e8c2c2460a8b96002`.

### 1.4 Harvested assets (in `docs/assets/original-site/`)

- `svg/` — 34 inline SVGs pulled from the pages. Highlights:
  - **Real logo vectors**: `home-02`/`home-06`/`menu-18`/`company-23` (horizontal lockup), `home-16`/`menu-22` (stacked lockup + "VIETNAMESE KITCHEN"). → replaces our interim re-drawn logo AND resolves the parked "logo vector" question in the brief (§6).
  - Folk animals (red paper-cut, nón lá hats): `home-07` pig, `home-08` rooster, `home-09` buffalo/horse.
  - Herb leaves: `home-03`/`menu-19` (red), `home-04`/`menu-20` (green); noodle squiggle `home-05`; lime+lemon `menu-21`.
  - Drinks art: cup `home-11`/`home-32`, phin `home-13`/`home-34`, bean `home-14`, bean cluster `home-12`/`home-33`.
  - Illustrated dishes (company page): `company-29` pho bowl, `company-30` plate, `company-31` spring rolls.
  - Misc UI (ignore): play button, music notes, arrows, hamburger/close glyphs.
- `photos/` — 32 full-res originals from Wix CDN (13 home: pho trio, interiors, drinks, brand stickers; 18 menu dish cut-outs on cream; 1 company mural shot). **162MB — already excluded via `.gitignore`** (added 2026-08-06, before any `git init`). Reference only; web renditions go to `static/assets/images/` in Phase B.
- `screenshots/` — full-page captures of original home/menu/blog + company hero + our current home baseline, plus:
  - `intro-real-0.png` / `intro-real-400.png` — the intro at a **real viewport** (the layout to build; the full-page capture gets this wrong)
  - `arc-scroll-5000.png` / `arc-scroll-5300.png` — the footer arc mid-scroll
  - `fonttest.png` / `maname-test.png` — the substitute-font comparisons behind §1.1
  - `svg-sheet.png` — contact sheet of all 34 harvested SVGs
- `video/company-kitchen-1080p.mp4` — the kitchen video from the original `/company` right pane (7.6MB, 720×1062). Grabbed 2026-08-06; this closes the last "not captured" gap. Use it for the /company media column in Phase E.
- `source-html.tar.gz` — the four original pages' HTML (home static + home rendered + menu + company), 1.3MB compressed. Insurance only: at DNS cutover nonlaexpress.com becomes **our** site and the Wix original is gone for good, so this is the only way to re-measure anything later. Everything currently needed has already been extracted into this plan.

**Nothing about this research lives outside the repo anymore** — a fresh session
needs only this file plus `docs/assets/original-site/` and `scripts/cdp.py`.

### 1.5 Motion & interaction spec (measured live via CDP, 2026-08-06)

Numbers below are read off the running site (computed styles + pixel measurement
at a 1440×713 viewport), not guessed. Everything is CSS-driven; **every loop is
wrapped in `@media (prefers-reduced-motion: no-preference)`** — copy that.

**M1 · Type marquee (cream band, the "nón lá / express" rows).** Two rows,
**opposite directions, deliberately different durations so they never sync**:

| Row | Content | Direction | Cycle |
| --- | --- | --- | --- |
| 1 | `nón lá` + buffalo SVG, repeating | scrolls **left** | **30.9s** |
| 2 | `express` + rooster SVG, repeating | scrolls **right** | **36.5s** |

Mechanism is the standard duplicated-track pair: the track is rendered twice and
animated `linear infinite` between `translateX(0)` and `translateX(-100%)` (left
row uses `to{translate(-100%)}`, right row uses `from{translate(-100%)}`), gap
between items ≈20px. Play state is a CSS var so it can pause (Wix pauses when
out of view / on click). Our existing rAF marquee can be replaced by this pure
CSS version — simpler and cheaper.

**M2 · Footer arc (the giant terracotta circle rising behind the newsletter).**
This is the standout effect, and it is **scroll-scrubbed**, which is why it looks
flat in a full-page screenshot. It's a plain circle (`home-15.svg`, viewBox
`20 20 160 160` — a `border-radius:50%` div reproduces it exactly), horizontally
centred, filled `#D14124`, that **grows as the footer scrolls in**:

| scrollY | circle diameter | ≈ viewport widths |
| --- | --- | --- |
| ≤4900 (footer below fold) | 1744px | 1.21× |
| 5100 | 1875px | 1.30× |
| 5300 | 2604px | 1.81× |
| 5500 | 3332px | 2.31× |
| 5590 (page bottom) | 3660px | 2.54× |

Linear once triggered: **≈3.64px of diameter per 1px of scroll**, over roughly
the last 500px of the page; the top arc sweeps up past the stacked logo and the
cream newsletter panel. Reproduce with a `border-radius:50%` div sized
`clamp(120vw → 255vw)` driven by CSS scroll-driven animation
(`animation-timeline: view()`), static at full size where unsupported.

**M3 · Drinks section parallax (charcoal band).** Scroll-linked drift, no
JS-looking jitter — elements move at slightly different rates so the collage
breathes apart as you scroll:

| Element | Drift over ~1600px of scroll | Rate |
| --- | --- | --- |
| Layered cup SVG (`home-11`) | −100px → +104px | ≈0.128 px/px |
| Phin filter SVG (`home-13`) | −107px → +107px | ≈0.134 px/px |
| Polaroid photo A (rotated **−8°**) | +59px → −60px | ≈−0.099 px/px |
| Polaroid photo B (rotated **+9°**) | −57px → +62px | ≈+0.099 px/px |
| Coffee-bean cluster (`home-12`) | none (static) | — |

The two polaroids drift in **opposite** directions to each other — that
counter-motion is what sells the collage. Their static rotations (−8° / +9°)
are part of the look even without motion.

**M4 · Intro animals (cream top section).** Positions at 1440px: rooster left
(x=63, y=137), buffalo right (x=754, y=278), pig lower-left (x=21, y=614) —
all three drift on desktop, subtly and at different rates: rooster +18px,
buffalo +35px, pig +25px over the first 700px of scroll (≈0.026–0.05 px/px).
**On mobile only (≤750px) they also get idle loops** — worth copying, it's
where the personality lives on small screens:

- rooster: swing ±5° around a point 50% down, **5.4s**, `linear infinite`
- buffalo: same swing, **6.7s** (de-synced from the rooster)
- pig: bounce, **2.9s**, amplitude factor 1.2 (a ~49px arc, easing per keyframe)
- drinks cup / phin: "breathe" float ±10px, **14.3s / 14.7s**; bean cluster ±25px, **5.0s**

**M6 · Intro slideshow (centre of the intro section).** A white-framed photo
carousel between the rooster and the buffalo — **3 slides, auto-advancing every
≈4s** (measured: the frame changes at t+4s and t+8s and is back to the first at
t+12s), with **Previous / Next arrow buttons** for manual control. Slide
transition is a horizontal push (Wix's `slideNextIn/Out`, `slidePrevIn/Out`
keyframes). Photos used are already harvested:
`pho-near-me-restaurant-flushing-queens-dining-area.jpg` and
`nonla-express-vietnamese-restaurant-flushing-queens-brand-stickers.jpg`
(cropped 467×584). Under reduced motion, hold on slide 1 and rely on the arrows.

**M5 · Buttons / links.** ORDER ONLINE pill: `border-radius:50px`, background
`#D14124`, `transition: border-color .4s, background-color .4s`. No hover
zoom on photos, **no scroll-entrance/fade-in reveals anywhere** (0 elements) —
the site's motion budget goes entirely into M1–M4 and M6. Don't add fade-ins.

### 1.6 Gap analysis (current build → original)

| # | Gap | Severity |
| --- | --- | --- |
| G1 | Palette inverted: dark-green site vs cream/terracotta site | big |
| G2 | Fonts: Fraunces/Montserrat/Bitter/Chewy vs **TT Nooks Bold (display) + Maname (everything else)** — see §1.1 | big |
| G3 | Logo: interim redraw vs real vector (now harvested) | easy win |
| G4 | Zero illustration language — original leans on folk-art SVGs everywhere | big |
| G5 | Home structure: video hero + template sections vs intro/statement/cards/marquee/interiors/drinks | big |
| G6 | Menu: dark w/ price ovals + text lists vs cream w/ cut-out dish photos, script headers, no prices | big |
| G7 | Company: single column vs 50/50 split with story + media | medium |
| G8 | Nav labels: MENU·ABOUT·PRESS·FIND US vs OUR MENU·OUR COMPANY·BLOG | small |
| G9 | Newsletter: plain section vs cream panel on terracotta footer | small |
| G10 | Marquee: our photo-card marquee vs giant type marquee w/ animals | medium |
| G11 | No footer arc — the scroll-grown terracotta circle (M2) is the site's signature move | big |
| G12 | No scroll parallax anywhere (M3/M4); our motion is one rAF photo marquee | medium |
| G13 | Drinks collage: no tilted polaroids (−8°/+9°) or scattered illustration art | medium |
| G14 | No intro slideshow (M6) — our intro is a full-bleed video hero instead | medium |

---

## 2. Phases (one session ≈ one phase; check off as done)

### Phase A — design tokens: fonts + palette flip

Two variables carry the type system, so the TT Nooks decision never blocks work:
`--display` (statement headlines + marquee) and `--body-font` (everything else).

- [ ] Fonts in: **Maname** 400 (`--body-font`) and **Playfair Display** 900 + 900 italic (`--display`, the TT Nooks stand-in), both with latin + latin-ext + **vietnamese** subsets. Keep Noto Serif SC for 中文. Drop Fraunces/Montserrat/Bitter/Chewy.
- [ ] Delivery: `src/app.html` currently pulls fonts from the **Google Fonts CDN** via `<link>`. Cheapest correct move is to swap that one URL now and self-host later if we want zero third-party requests — don't spend Phase A on a font pipeline. (Self-hosting to `static/fonts/` stays a nice-to-have, not a blocker.)
- [ ] Type scale from §1.1 measured values: 157.5 · 105 · 36 · 24 · 22.5 · 18 · 14 · 12.
- [ ] `src/app.css` `:root` rework: `--bg: cream #F0EAD6`, `--ink: near-black`, `--terracotta: #D14124`, `--charcoal: #2D2926`, green demoted to `--green-accent: #407665`; keep old names aliased during migration so pages don't break mid-phase.
- [ ] Re-map type utilities: `.display` → `--display` at **weight 900**, caps come from the copy not `text-transform`; `.script` → `--display` italic (marquee); body/nav/headings → Maname 400. `.eyebrow` and `.btn` are the only Expressway-ish roles — any clean grotesque is fine.
- [ ] Buttons: terracotta pill (`#D14124` bg, cream text), `border-radius: 50px`, `transition: background-color .4s, border-color .4s` (§1.5 M5); outline variant on cream.
- [ ] Sweep every page after the flip — text/section colors that assumed dark bg (hero overlay, footer, cards, prose pages) must still pass contrast on cream.
- Verify: rebuild + preview (kill port 4173 first — see §4), capture all pages 1440×900 + full + 540px.

### Phase B — brand assets
- [ ] Optimize + rename harvested SVGs into `static/assets/art/` with kebab names (`rooster.svg`, `pig.svg`, `buffalo.svg`, `herb-red.svg`, `herb-green.svg`, `noodles.svg`, `lime.svg`, `cup.svg`, `phin.svg`, `bean.svg`, `dish-pho.svg`, `dish-plate.svg`, `dish-rolls.svg`, `logo-horizontal.svg`, `logo-stacked.svg`). Strip Wix `data-*` attrs; run through svgo if available.
- [ ] Replace `src/lib/site/Logo.svelte` + `static/favicon.svg` with the real vector lockups. The logo becomes pure SVG, so Chewy leaves the project entirely (it is no longer the script stand-in either — see §1.1).
- [ ] ⚠️ **`static/assets/images/` already holds 31 web-ready photos**, and `content.js` MENU items reference them by filename (`img: 'spring-roll.jpg'` etc.). Do **not** bulk-import the harvest over the top — diff first, add only what's genuinely new or better (the 18 cut-out dish shots on cream and the pho-trio cut-outs are the real gain), and **keep existing filenames stable** or update every `img:` field with them.
- [ ] Web renditions of whatever survives that diff → `static/assets/images/` (max ~1600px, ~80% quality, SEO-ish filenames).
- [ ] Originals stay out of git — `docs/assets/original-site/photos/` is **already in `.gitignore`** (added 2026-08-06, before any `git init`, so the 162MB never lands in history). Leave that line in place.
- [ ] Decide the hero video's fate (§5 Q3): `static/assets/videos/` holds a 16MB `.mov` + 18MB `.mp4`. If the video is dropped everywhere, delete both — otherwise they ship 34MB of dead weight to Pages.
- [ ] Update `docs/website-brief.md` §6: logo-vector question RESOLVED (harvested from Wix site).
- Verify: favicon + navbar logo render at both sizes; page weight sane.

### Phase C — homepage restructure (original section order)
- [ ] Header: cream navbar, centered logo, nav labels OUR MENU · OUR COMPANY (§5 Q4 for BLOG/PRESS), terracotta ORDER ONLINE pill.
- [ ] Section 1: cream intro — three columns (§1.3 item 2): rooster bleeding off the left edge, **centred photo slideshow** (markup + arrows now; auto-advance in C2), buffalo bleeding off the right edge; red heading + blurb top-right (keep as a real `h1` for SEO); pig lower-left. Let the animals overflow their column and clip at the viewport — that bleed is the whole effect.
- [ ] Section 2: terracotta statement hero — "NATURAL INGREDIENTS, FRESH TASTE." in `--display` at **~157.5px** (not Maname — §1.1) + Maname 24px paragraph + #nonlaexpress link (→ Instagram). Decide hero-video fate (§5 Q3): default = drop from home, reuse on /company right pane.
- [ ] Section 3: pho favorites — 3 cream cards w/ cut-out pho photos + names/descriptions (data from `content.js`).
- [ ] Section 4: type marquee — giant "nón lá ✦ express" in script + inline animal SVGs; **two rows, opposite directions** (§1.5 M1). Retire the rAF photo marquee in favour of the CSS duplicated-track version.
- [ ] Section 5: interior grid (6 photos, tight masonry).
- [ ] Section 6: charcoal drinks section — display headline, phin/cup/bean SVGs scattered, 2 polaroids at **−8° / +9°**, EN + 中文 paragraph. Note the bilingual drinks copy is **not** in `content.js` yet — add `DRINKS_BLURB { en, zh }` from §3.
- [ ] Section 7: terracotta footer w/ stacked logo, SEO paragraph, cream newsletter panel, link columns, address/phone/©, and the **arc circle** behind it (§1.5 M2 — build the circle div now, wire the scroll-scrub in C2). (Footer is shared — this restyles `Footer.svelte` site-wide.)
- [ ] Keep, restyled as cream/terracotta bands: Lunch Special panel (real promo the original lacks) and a slim Find Us strip (address/hours/map link) — original buries this in footer; ours earns its keep. Cut: old mission/feature sections (absorbed above).
- Verify: full-page + 540px captures vs `screenshots/orig-home-full.png` side by side.

### Phase C2 — motion layer (needs Phase C sections to exist first)

Implement §1.5 in order of payoff. All of it goes inside
`@media (prefers-reduced-motion: no-preference)`; the page must be complete and
correct with every animation removed.

- [ ] **M1 marquee** — pure CSS, duplicated track, `linear infinite`; row 1 left/30.9s, row 2 right/36.5s, ~20px item gap. Delete the old rAF marquee code + its `$state` plumbing from `+page.svelte`.
- [ ] **M2 footer arc** — `border-radius:50%` terracotta div, centred, `aspect-ratio:1`, width scrubbed ~120vw→255vw across the footer's view progress. Use `animation-timeline: view()`; where unsupported the circle just sits at full size (still looks right). Verify it never introduces horizontal scroll (`overflow-x` clipped on the section).
- [ ] **M3 drinks parallax** — cup/phin drift ≈±105px, polaroids ≈±60px in opposite directions, bean cluster static. Same `view()` timeline approach; keep rates small and unequal.
- [ ] **M4 intro parallax** — rooster/buffalo/pig drift ≈+18/+35/+25px over the first ~700px. Mobile (≤750px) idle loops: swing 5.4s / 6.7s, bounce 2.9s, breathe 14.3s / 14.7s / 5.0s.
- [ ] **M6 intro slideshow** — 3 slides, auto-advance ≈4s, horizontal push transition, working Previous/Next arrows. Pause the auto-advance under reduced motion (arrows still work) and when the section is off-screen.
- [ ] **M5** — ORDER ONLINE pill transition `.4s` on background/border. Deliberately add **no** scroll-entrance fades (the original has none).
- [ ] Prefer CSS scroll-driven animations over scroll listeners; if a JS fallback is needed, rAF-throttle it and bail out under reduced-motion.
- Verify: capture at several scroll offsets (the arc is invisible in a full-page render — see §4), and once with reduced-motion forced.

### Phase D — menu page re-skin
- [ ] Cream page; header = lime SVG + script "ăn nào!" + "NónLá Express Menu" + intro; noodle squiggle right.
- [ ] ⚠️ **Section mismatch — resolve before building (§5 Q6).** Our `content.js` MENU has five sections: Appetizer $9 · **Burger $12** · Noodle $17 · Main $17 · Signature Drink $6. The original web menu shows only four (Appetizers / Phở Noodle Soup / Main Dishes / Drinks) — **no burgers**. Either the Wix menu is out of date or burgers were dropped. Don't silently delete a real menu section; default is to keep Burger and give it the same treatment.
- [ ] Sections w/ thin rules + script headings; 3-col cut-out photo grid (18 harvested dish photos map to `content.js` items), numbered 1–10 items, protein sublists.
- [ ] Prices: original shows none on the web (§5 Q5). Default: keep our prices (useful) but restyle — small terracotta text, retire the price-oval on this page (it's a printed-menu signature, keep for LunchSpecial only).
- [ ] Keep bilingual EN/中文/Viet names from `content.js` — that's our value-add; set 中文 in Noto Serif SC on cream.
- [ ] Drinks band: charcoal strip w/ 3 branded cup photos.
- Verify vs `screenshots/orig-menu-full.png`.

### Phase E — company page + remaining pages
- [ ] /company: 50/50 split — left cream story column (label, script heading, «phở, the new era» pull-quote, story paragraphs from `content.js`, mural photo), right full-bleed media (hero video from Phase C, else `pho-near-me-…-dining-area.jpg`). Below-fold: illustrated-dish SVG row + values/terracotta band.
- [ ] /press, legal pages, accessibility: re-skin to cream tokens (mostly automatic after Phase A aliases removed), check prose contrast.
- [ ] Nav labels + footer links aligned with §5 Q4 outcome (BLOG vs PRESS).
- [ ] Remove dead CSS: old green-era vars, `.price-oval` if unused, hero-video styles if dropped.
- Verify all 7 routes, both widths.

### Phase F — QA + launch prep
- [ ] Cross-page consistency pass at 1440 + 540 (memory: headless Chrome clamps <~540px; judge narrower via CSS).
- [ ] Reduced-motion: force it on and confirm every §1.5 effect is inert and the page still reads correctly (marquee static, arc at full size, no parallax drift).
- [ ] Contrast audit on cream (terracotta-on-cream body text is borderline — keep body text near-black, terracotta for display sizes only).
- [ ] Font subset sizes; Lighthouse-ish sanity (static, should be fast).
- [ ] Update README.md + CLAUDE.md (new design system), refresh `docs/website-brief.md` §6 parked list (logo Q resolved; hours/newsletter/press/redirects still open).
- [ ] Then resume the original next step: git init + push for Pages deploy (the 162MB photo exclusion is already in `.gitignore` — just confirm `git status` is clean of it before the first commit).

---

## 3. Content deltas — verbatim copy from the original

The original site is the only source for this text and it disappears at DNS
cutover, so it is written out in full here rather than referenced. Order URL:
`https://order.snackpass.co/67be450e8c2c2460a8b96002` (already matches
`ORDER_URL` in `content.js`).

**Intro / SEO (h1 is visually small on the original):**
> Authentic Vietnamese Restaurant in Flushing, Queens
>
> Nón Lá Express serves fresh pho, Vietnamese noodle soups, rice dishes, and signature drinks in Flushing, Queens.

**Statement hero:**
> NATURAL INGREDIENTS, FRESH TASTE.
>
> At Nón Lá Express, we bring fresh Vietnamese flavors to Flushing with warm bowls of pho, flavorful noodle dishes, rice dishes, and refreshing drinks. Our Vietnamese restaurant in Queens focuses on fresh ingredients, bold flavor, and convenient service.

Followed by a `#nonlaexpress` link (→ Instagram).

**Pho-favorites caption + the three cards** (descriptions match `content.js`
MENU entries closely — reconcile, don't duplicate):
> Explore popular pho favorites at Nón Lá Express, including rib eye pho, chicken pho, spicy pho, and Vietnamese noodle soup in Flushing, Queens.

RIB EYE PHỞ · CHICKEN PHỞ · PHỞ & SPICE

**Drinks band** (EN + 中文, one block, centred):
> COOL DRINKS WARM MEMORIES IN EVERY SIP.
>
> Our drinks are crafted to cool you down and bring back warm, familiar moments. From bold Vietnamese coffee to sweet sugarcane juice and refreshing salted limeade, every sip is made to brighten your day and pair perfectly with our authentic Vietnamese food.
>
> 我们的饮品为清凉而生，也为温暖回忆而来。从浓郁的越南咖啡，到清甜的甘蔗汁与清爽的咸柠水，每一口都让你感受轻松惬意，也与我们的地道越南美食完美搭配。

**Footer:**
> Nón Lá Express is a Vietnamese restaurant in Flushing, Queens, serving fresh pho, noodle soups, rice dishes, and signature drinks. Visit us for a quick meal or order online when you are craving Vietnamese food near Flushing.
>
> Subscribe to our newsletter — Sign up for exclusive promos, new menu drops, store openings, and more.

Note our `SEO_BLURB` says "Visit us at Tangram Food Hall"; the original says
"Visit us for a quick meal". Ours is better — keep it.

**Company page** — heading "Serving Fresh Healthy Pho, with Modern Convenience",
pull-quote «"phở, the new era"», then:
> Born from a group of friends' shared love for great pho — but they realized that Pho has always been a meal to be savored slowly in a traditional sit-down setting. But as they grew older and their lives became busier, they found it harder to find time for those slow, shared meals and turns to unhealthy fast foods.
>
> Thats when they saw their opportunity to create a convenient option for enjoying pho on the go without sacrificing quality or flavor. The group of friends set out to bring the healthiness of Vietnamese food into the fast-food world—offering fresh, nourishing pho and dishes that could be made and enjoyed quickly, but still delivered the same comforting experience of a home-cooked meal.

(The original has two typos — "Thats", and "turns" for "turned". Our `STORY` in
`content.js` is a cleaned-up rewrite of the same text; **keep ours**.)

Mission + values below the fold, which map onto our `MISSION` / `VALUES`:
> Our mission is to make healthy & delicious Vietnamese food accessible and convenient for everyone in our community.
>
> We're committed to using fresh, quality ingredients to create nourishing meals that fit into busy lives of our customers.
>
> We strongly believe that great food can be served up fast, healthy, and satisfying, without compromising on taste.

**Menu page intro:**
> Our team ensures every dish in our menu is prepared quickly without cutting corners, capturing the rich and aromatic essence of Vietnamese cuisine.

**New `content.js` keys Phase C needs** (everything else already exists):
`STATEMENT` (headline + paragraph), `PHO_FAVORITES` (caption + 3 card refs),
`DRINKS_BLURB` (`{ en, zh }`), `INTRO_SEO` (h1 + blurb).

## 4. Verify workflow (per memory note, every phase)

`pnpm build` → `lsof -ti:4173 -sTCP:LISTEN | xargs kill` → `pnpm preview` →
confirm port in log → headless Chrome captures at `1440×900`, tall full-page,
and `540px` wide (Chrome clamps narrower). vh-sized sections stretch in tall
captures — re-check heroes at 1440×900.

⚠️ **Never judge a page from a tall full-page capture alone.** A
`--window-size=1440,9000` screenshot lies in two different ways, and both bit
this project:

1. **Scroll effects render in their end state.** The footer arc measured as a
   perfectly flat edge that way; it only appears at a real viewport (compare
   `screenshots/orig-home-full.png` with `arc-scroll-5300.png`).
2. **Layout itself can differ.** The tall capture showed the intro as two
   animals and some whitespace. At a real 1440×713 viewport it is three columns
   with a photo slideshow in the middle (`intro-real-0.png`) — an entire
   component that the tall capture simply did not render.

So: use tall captures for a rough content inventory only, and confirm every
layout and motion claim at a real viewport with `scripts/cdp.py` — a
stdlib-only Chrome DevTools Protocol driver written for this project:

```python
from cdp import Chrome
c = Chrome(1440, 800)                      # real viewport
c.goto("http://localhost:4173/", wait=8)
c.js("scrollTo(0,5300)"); time.sleep(2)    # then screenshot or measure
c.shot("footer-arc.png")
print(c.js("getComputedStyle(document.querySelector('.arc')).width"))
c.close()
```

`c.js()` returns real values, so it also reads computed styles, element rects,
transform matrices, and `getAnimations()` states — that's how §1.5's numbers
were measured, and how to check ours match.

## 5. Open questions for the client (batch before Phase C ships)

1. **Palette direction:** OK to go cream-dominant + terracotta like the current Wix site (green becomes an accent, as on the printed menus)? Their earlier "brighter green" note was within our green-dominant layout.
2. **TT Nooks license — now the biggest one.** §1.1 proved this face carries the hero, the drinks headline, the marquee and the intro text: it *is* the identity, and **no free font matches it** (see `screenshots/fonttest.png`). Buy TT Nooks Bold (+ Regular for the menu/company script headings), or ship Playfair Display 900 as a knowingly-approximate stand-in? Ask whether the client already licensed it for the Wix build — if so we may be able to reuse the license.
3. **Hero video:** keep anywhere (proposal: /company right pane) or drop? Dropping it removes 34MB from the repo.
4. **BLOG vs PRESS in nav:** original has an active (Chinese-SEO) Wix blog; our static site has /press instead. Blog content strategy + the parked `/blog`, `/post/*` redirect map are one decision.
5. **Menu prices on the website:** original shows none; we currently show prices. Keep or hide?
6. **Burger section:** our menu data has it, the live site's menu doesn't (Phase D). Still on the menu, or discontinued?
7. (Existing §6 items still open: hours confirmation, newsletter provider, press details.)

## 6. Session log

- **2026-08-06 — research session:** captured original site (screenshots, fonts, palette, structure), harvested 34 SVGs (incl. real logo vectors — brief §6 logo question resolved) + 32 photos into `docs/assets/original-site/`, verified Maname has a Vietnamese subset on Google Fonts, identified Snackpass order URL, baselined current build. Wrote this plan. Next: Phase A.
- **2026-08-06 — motion research (follow-up):** client flagged the marquee, drinks
  section and footer as the strongest parts. Measured the whole motion system
  live over the DevTools Protocol → new **§1.5**: marquee durations/directions,
  the scroll-grown footer arc (the effect that doesn't show up in screenshots),
  drinks/intro parallax rates, mobile-only idle loops, and the fact that there
  are **no** scroll-entrance fades. Added **Phase C2 (motion layer)**, gaps
  G11–G13, and committed the reusable CDP driver at `scripts/cdp.py` with usage
  in §4. Next: still Phase A.
- **2026-08-06 — readiness audit (plan checked against the repo before starting
  Phase A).** Found and fixed five things that would have cost a session each:
  1. **§1.1 was wrong.** It was inferred from Wix theme variables; measuring
     computed styles showed the praised hero face is **TT Nooks Bold**, not
     Maname, that **nav links are Maname** rather than Expressway, and that
     **Chewy is a bad stand-in**. Section rewritten from measurements, with a
     rendered comparison of free substitutes (Playfair Display 900 wins).
  2. **§3 pointed at scratchpad notes that don't survive a session.** All
     original copy (including the 中文 drinks paragraph and the company story)
     is now written out verbatim in the plan, with notes on where ours is
     already better.
  3. **`.gitignore` didn't exclude the 162MB photo harvest** while CLAUDE.md
     said "next: git init" — one `git add .` would have baked it into history.
     Line added.
  4. **Phase B would have collided with the 31 existing images** in
     `static/assets/images/` that `content.js` references by filename.
  5. **Phase D would have silently dropped the Burger section** (in our menu
     data, absent from the live site) — now an explicit question (§5 Q6).
- **2026-08-06 — second pass, same day.** Re-checked every remaining claim at a
  **real viewport** instead of a tall full-page capture, which turned up two
  more corrections: the intro is **three columns with an auto-advancing photo
  slideshow in the middle** (a whole component the tall capture never rendered
  — new **M6**, gap **G14**), and the statement hero is TT Nooks 157.5px where
  Phase C still said "Maname ~105px". Also swept out the last stale
  Maname/Chewy references, marked the `DRINKS_BLURB` copy as a new key, and
  rewrote §4 to warn that tall captures distort **layout** as well as motion.
  Verdict: **plan is consistent and ready — start Phase A.**
- **2026-08-06 — session closed / handoff.** Pulled the last two things that
  existed only in a disposable scratchpad into the repo: the `/company` kitchen
  video and a compressed archive of the original pages' HTML. Research is now
  fully self-contained. **A new session starts here:** read this file, then work
  Phase A top to bottom; §4 is the verify loop, §5 is what still needs the
  client. Only Phase A's font choice is provisional (Playfair Display standing
  in for TT Nooks behind `--display`, §5 Q2).
