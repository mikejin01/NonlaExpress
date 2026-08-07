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

⚠️ **Maname has two rendering defects — found when it went in, Phase A.** It is
a Sinhala-first family and its Latin/Vietnamese is clearly secondary. Both are
inherited from the original site, which uses the same font:

1. **Vietnamese tone marks stack much too high on the horn vowels ơ / ư.** In
   *phở*, *Cơm*, *Sườn*, *Nướng*, *Cuốn*, *Nước* the mark floats toward the line
   above with a visible gap. Plain-vowel marks (*Nón*, *Lá*, *Chả*, *Giò*) are
   fine. This is a font-internal metric — **no CSS fixes it** — and it touches
   most of the menu, so it is now §5 Q8.
2. **The `fi` ligature has a broken advance width** ("sacrifi cing"). *Fixed* in
   Phase A with `font-variant-ligatures: no-common-ligatures` on `body`.

Verified with `CSS.getPlatformFontsForNode` that Maname itself renders all 266
glyphs in our copy (no fallback font involved), so this is Maname's own drawing.
Playfair Display sets Vietnamese correctly.

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
statement blocks; green appears only as an accent. Our scaffold was a DARK
green-page site.

### 1.2a Cream layout, BRAND green as ACCENT ⚠️ SUPERSEDED — but see §1.2d

⚠️ **Read this one.** It was current for a day, was replaced by the green ground
(§1.2c), and then **the client's 2026-08-07 "swap colors" direction brought this
arrangement back** — cream page, green accent — with terracotta added as a third
colour on top. **§1.2d is the current palette**; this section is where the
reasoning for *why green rather than terracotta* was first written down, and all
of it still holds.

⚠️ **§5 Q1 is answered, and the answer is a deliberate split from the original.**
After seeing Phase A ship in the original's terracotta, the client asked to keep
the light cream layout but **restore the brand green as the accent/primary in
place of the terracotta-orange**. So we take the original's *layout, typography
and motion* and run the *brand's own color* through it — as an **accent on a
cream page**, not as the dominant surface (see §1.2b for why that distinction
is load-bearing).

| Token | Hex | Role |
| --- | --- | --- |
| `--cream` | `#F0EAD6` | **dominant page surface** |
| `--green` | `#1B6E52` | **primary accent** — buttons, accent text on cream, small accents |
| `--green-surface` | `#17543E` | the green blocks — footer, newsletter, statement/feature panels, promo |
| `--green-bright` | `#47927A` | the client's vivid green — **decorative fills only** (3.08:1) |
| `--green-deep` | `#143F32` | pill hover, deepest accents |
| `--charcoal` | `#2D2926` | drinks band |
| `--terracotta` / `--rust` | `#D14124` / `#A94C23` | **warm secondary** |

**Terracotta is demoted, not deleted** — deliberately. The harvested folk-art
SVGs (rooster, buffalo, pig, herb-red) are *drawn* in that red, and the printed
menu numbers its dishes in it, so it survives as the warm secondary accent
against the green. Phase B brings that art in; it should read as accent, not
theme. `.on-terracotta` stays defined and AA-correct for any block that wants it.

**Why green is the better-behaved brand color here** — this is the practical
payoff, not just taste: `--green` at 5.13:1 against cream **passes AA in both
directions**, so one token is both the accent text on cream *and* a fill that
carries cream text. Terracotta measures 3.88:1 either way and can do neither —
it forced a near-white text hack and lost its muted ramp entirely. Green keeps a
real `--fg-muted` / `--fg-dim` ramp. Full numbers in §2.1.

### 1.2b ❌ REJECTED: the printed-menu green-field variant (built and reverted 2026-08-06)

**Do not rebuild this.** On "use more green, like `docs/Menu-1.png`" the whole
site was flipped to the printed menu's proportions — wide flat **mid-tone**
`#3B6E5F` fields carrying the content directly, cream demoted to breathing room
between them, and one warm red band for the Lunch Special. It was built, it
passed the audit, and it was rejected on sight.

⚠️ **This is not the same thing as §1.2c**, and the difference is the whole
lesson. What failed here was a *mid-tone field with content sitting straight on
it and no panels* — a flat wall of saturated green. §1.2c is a **deep** ground
(`#17543E`, a third darker) that behaves like a backdrop, with **cream panels**
carrying every block of dense text. Same family, opposite effect: one competes
with the content, the other sits behind it. Before proposing "more green" or
"less green" again, check which of the two is meant.

The research behind it is still good and is kept here so it never has to be
redone. Sampled pixel-for-pixel from `docs/Menu-1.png`:

| Sampled | Hex | How the printed menu uses it |
| --- | --- | --- |
| Green field | `#407666` | one perfectly flat field carrying all menu content |
| Cream type | `#F1EAD6` | every word on the green — titles, names, 中文, Vietnamese |
| Warm band | `#DD4307` → `#C31D04` | one strip at the top: the Lunch Special |

Three measurements from that pass that stay useful regardless of direction:

1. **True cream on the sampled `#407666` is 4.36:1** — just under AA. Any future
   use of the printed green as a text-bearing surface needs ~3% more depth
   (`#3B6E5F` → 4.87:1) or lifted type.
2. **`--sand-2` `#F4D7A0` fails on green** (4.21:1) though it looks nearly
   identical to `--sand` `#FAE6C0` (4.79:1). **This fix was kept** — `--sand` is
   the warm label accent on every dark surface. Don't "restore" `--sand-2`.
3. The warm band's light end `#DD4307` is only 3.57:1 with cream; `#C31D04` is
   4.99:1. If a red band is ever wanted, use the deep end.

**Print ≠ screen, and that is the lesson.** A printed menu is a single held
object where a saturated field reads as confident; a scrolling site turns the
same field into an oppressive wall. The printed menu remains the right reference
for *type, price ovals, bilingual captions and photo treatment* — but not for
how much of the page the green should own.

### 1.2c DEEP GREEN ground, cream panels ⚠️ SUPERSEDED 2026-08-07 by §1.2d

⚠️ **Current for less than a day; the client then asked to swap the ground and
the accent (see §1.2d, which is the current palette).** Keep reading this
section anyway — the **three-step green ladder it introduced survives intact**,
and so does every contrast number in it. What changed is only which of the two
colours is the page and which is the accent, plus the promotion of terracotta
to a third brand colour. Nothing here about *why the greens are split* is stale.

**Direction:** keep every structural, typographic and motion decision from the
redesign, but put the brand green back where the pre-redesign scaffold had it —
**as the page ground** — instead of on a cream page. Prompted by comparing the
live GitHub Pages build (still serving the pre-Phase-A dark-green scaffold, see
§7) against local: the green ground was preferred.

The rule that makes this work, and the thing §1.2b got wrong: **go deeper, and
give dense text a cream panel.**

| Token | Hex | Role | Cream on it |
| --- | --- | --- | --- |
| `--green-deep` | `#143F32` | bands that must separate from the page: header, newsletter, footer, CTA strips. Fine print lives here. | **9.76:1** |
| `--green-surface` | `#17543E` | **THE PAGE GROUND** — the `:root` default, so a section with no class is green | **7.35:1** |
| `--green` | `#1B6E52` | accents, button fills on cream panels, `.on-green-lift` raised panels | **5.13:1** |
| `--green-bright` | `#47927A` | decorative fills only — 2.38:1 on the ground | ✗ |
| `--cream` / `--cream-lift` | `#F0EAD6` / `#F7F2E3` | the type color on green **and** the panel surface | ink 14.9 / 16.1:1 |
| `--charcoal` | `#2D2926` | drinks band, unchanged | 12.0:1 |
| `--terracotta` / `--rust` | `#D14124` / `#A94C23` | warm secondary — **cannot be text on green** (1.89:1) | ✗ |
| `--sand` | `#FAE6C0` | the warm label accent on every green surface | 7.2 / 9.6:1 |

**Three greens, not one.** They are split by the contrast headroom each job
needs, and collapsing them is what broke the first green attempt (§6, first
green-accent entry): only `--green-deep` and `--green-surface` have room for a
muted/dim ramp, so `.on-green-lift` runs full cream at every level and takes no
fine print.

**Cream is now the panel material.** Anything carrying dense small text gets
`.on-cream`: menu item cards, the Lunch Special promo, company value cards,
press cards, the pho feature panel, and legal prose (`.prose-panel`). That is
what keeps a dark site readable and is exactly what §1.2b lacked. Cream also
still carries the accent role *inside* those panels — `--green` at 5.13:1 is the
accent text on them, which is why that token survives unchanged.

**What did NOT change:** the type system, the type scale, all of §1.5's motion
spec, the `.on-*` color contract, `--sand` over `--sand-2`, and every Phase
B–F task. This was a token-and-surface-class change; no layout was touched.

### 1.2d THE SWAP — cream ground, GREEN accent, TERRACOTTA third ✅ CURRENT (2026-08-07)

**Client direction, verbatim:** *"swap colors… we will have the light beige
colour as theme or background colour and use green colour as accent colour.
Actually we should add a third colour which is their accent branding orange
colour in their original site and logo."*

So two changes, not one: the ground and the accent trade places (back to the
§1.2a arrangement), **and terracotta is promoted** from a buried secondary that
only ever showed up inside the folk art to a real, named third brand colour.

| Token | Hex | Role | Notes |
| --- | --- | --- | --- |
| `--cream` | `#F0EAD6` | **THE PAGE GROUND** — the `:root` default | ink on it is 14.9:1 |
| `--cream-lift` | `#F7F2E3` | panels raised off the page | a whisper on cream — **always pair with a `--rule` hairline** or the panel does not read |
| `--green` | `#1B6E52` | **THE ACCENT** — accent text, button fills, badges, price ovals | 5.13:1 **both ways** |
| `--green-surface` | `#17543E` | green panels on the cream page (the phở feature row) | cream 7.35:1, real muted ramp |
| `--green-deep` | `#143F32` | the two full-width brand bands: **statement hero** and **footer** | cream 9.76:1 — fine print goes here |
| `--terracotta` | `#D14124` | **THE THIRD COLOUR** | 3.88:1 on cream → **graphics and display type only** |
| `--rust` | `#A94C23` | the third colour as small text | 4.66:1, exposed as `--warm-ink` |
| `--charcoal` | `#2D2926` | the two drinks moments, unchanged | 12.0:1 |

**The rule that makes three colours work: GREEN SPEAKS, TERRACOTTA DRAWS.**
Green carries everything that is text or interaction — links, eyebrows, buttons,
accent copy, the two dark bands. Terracotta carries everything that is a
*graphic*: the logo mark on cream, the folk-art line-work, the numbered badges,
the price ovals, the footer arc's ring, the hero curve's hairline, and
display-size warm headings. Stated that way, terracotta is never asked for the
contrast headroom it does not have, and the split is easy to apply to a new
component without re-reading the contrast table.

**Three new tokens carry it,** so no component hard-codes a red:

| Token | On cream | On any dark surface | For |
| --- | --- | --- | --- |
| `--warm` | `--terracotta` | `--sand` | the third colour at **display size** or as a fill |
| `--warm-ink` | `--rust` (4.66:1) | `--sand` | the third colour as **small text** |
| `--mark` | `--terracotta` | `--cream` | the **logo lockup**, set once in `Logo.svelte` |

`--mark` is why the navbar now reads as the client's actual logo — red on cream,
exactly the artwork they sent — while the footer lockup stays cream on green,
with neither call site hard-coding anything.

**Three things the swap improved for free,** all of them consequences of the
artwork rather than of new CSS:

1. **The folk animals became the original's red line-art.** Each is drawn as a
   cream body carrying terracotta line-work (§2.2). On the green ground the
   body read as a cream paper-cut; on cream the body *disappears into the page*
   and only the red line-work remains — which is precisely what the original
   site shows. The type marquee gained the same thing: black type, red animals.
2. **The dish cut-outs lost their seam.** Their backdrop is `#F1EAD7`, one step
   off `--cream` (§2.2), so on the cream page they composite invisibly and no
   longer need a panel to hide the rectangle.
3. **The footer arc reads as a shape for the first time.** On green it was one
   ladder step from the ground and needed the `--sand-3` hairline just to exist
   (§2.3). On cream the dome separates on its own, so the ring is now a pure
   brand line — and it is **terracotta**, echoing the original's red arc and
   rhyming with the hero curve's hairline, so the page opens and closes on the
   same shape in the same red.

**What did NOT change:** the type system, the type scale, all of §1.5's motion
spec, the `.on-*` colour contract, the three-step green ladder, `--sand` over
`--sand-2`, and every Phase C2–F task. This was — for the fourth time — a
token-and-surface-class change. Full scope: `app.css` tokens + surface classes,
five one-line markup/CSS changes (navbar surface, logo colour, arc ring, hero
curve, the phở panel), one promo panel given a lift treatment, and
`theme-color`. **No layout and no component logic.**

**Traps this specific direction introduces** — all of them are the §1.2c traps
running the other way, so a session that half-remembers the green ground will
get each of these backwards:

- **The `:root` default is CREAM again.** A section with no `.on-*` class is
  cream; **green is the one you have to ask for.** This has now inverted twice
  in two days and is the single most likely thing to trip up a new section.
- **`--sand` is invisible on cream (~1.1:1).** It was `--accent-ink` on the
  default surface until this swap. Anything reaching for `var(--sand)` as text
  outside a dark band is now unreadable — use `--accent-ink` or `--warm-ink`.
- **A `.on-cream` panel on the cream page is not a panel.** Cards that paint
  their own `--cream-lift` + `--rule` (press, company values, menu dishes, the
  homepage fav-card) were already fine; the Lunch Special promo was not and had
  to be given the same treatment. Check this before adding a card.
- **Terracotta as text needs ≥18.66px at weight 700+** to clear WCAG large text
  at 3:1. The intro's red heading has a **20px clamp floor for exactly this
  reason** — `--fs-lead` alone resolves to 18.4px at 540px and would drop it
  under the wire. Anything smaller must use `--warm-ink`.
- **No section uses `.on-terracotta`.** It stays defined and AA-correct on
  purpose: the statement hero is the one block that could take it if the client
  wants more orange (the original runs exactly that block in this colour). Don't
  delete it in Phase E's dead-CSS sweep without asking.

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

- `svg/` — 34 inline SVGs pulled from the pages. **All of these are now processed
  by `scripts/svgclean.py` into `src/lib/art/` + `static/assets/art/` (Phase B);
  the notes below describe the raw harvest.** Highlights:
  - **Real logo vectors**: `home-02`/`home-06`/`menu-18`/`company-23` (horizontal lockup), `home-16`/`menu-22` (stacked lockup + "VIETNAMESE KITCHEN"). → replaces our interim re-drawn logo AND resolves the parked "logo vector" question in the brief (§6).
  - Folk animals (red paper-cut, nón lá hats): `home-07` pig, `home-08` rooster, `home-09` buffalo/horse.
  - ⚠️ **Corrected Phase B:** `home-03`/`menu-19`/`company-24` is a **SHRIMP**, not
    the "red herb leaf" this list called it for two sessions — see
    `screenshots/svg-sheet.png`. `home-04`/`menu-20`/`company-25` is the herb
    (cilantro sprig). Noodle squiggle `home-05`; lime+lemon `menu-21`.
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

`docs/Menu-1.png` / `Menu-2.png` — the client's printed menu. Sampled
2026-08-06: green field `#407666`, cream type `#F1EAD6`, one warm band
`#DD4307`→`#C31D04`. Useful as a reference for **type, price ovals, bilingual
captions and photo treatment** — but *not* for how much of the page green should
own; copying its proportions was tried and rejected (**§1.2b**).

**Nothing about this research lives outside the repo anymore** — a fresh session
needs only this file plus `docs/assets/original-site/`, `docs/Menu-*.png` and
`scripts/cdp.py`.

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
| G1 | ~~Palette: dark-green site vs a light site~~ — **closed, re-opened and closed three times.** Phase A went cream-dominant (§1.2a); 2026-08-07 put green back as the ground (§1.2c); the client then swapped them again and added terracotta as a third colour (**§1.2d**, current). Net result: a light cream page like the original, in the brand's own green, with the original's red back as a real accent. | resolved |
| G2 | Fonts: Fraunces/Montserrat/Bitter/Chewy vs **TT Nooks Bold (display) + Maname (everything else)** — see §1.1 | big |
| G3 | ~~Logo: interim redraw vs real vector~~ — **CLOSED Phase B.** Both real lockups ship, `currentColor`-themed; favicon redrawn from the real mark. | resolved |
| G4 | Zero illustration language — original leans on folk-art SVGs everywhere. Phase B shipped the assets; **Phase C placed the homepage set** (3 animals in the intro, 2 in the marquee, phin/cup/beans in the drinks collage). **Phase D/E still has to place the menu + company pieces** (lime, noodles, shrimp, herb, the three dish illustrations). | home done, D/E open |
| G5 | ~~Home structure: video hero + template sections~~ — **CLOSED Phase C**, but *not* by wholesale replacement: the original's section order ships **around** five of our own sections, video hero included (**§2.4** — the keep list). | resolved |
| G6 | Menu: dark w/ price ovals + text lists vs cream w/ cut-out dish photos, script headers, no prices | big |
| G7 | Company: single column vs 50/50 split with story + media | medium |
| G8 | Nav labels: MENU·ABOUT·PRESS·FIND US vs OUR MENU·OUR COMPANY·BLOG | small — **blocked on §5 Q4**, everything else about the header shipped in Phase C |
| G9 | ~~Newsletter: plain section vs cream panel on terracotta footer~~ — **CLOSED Phase C**, and it is now in the footer on every route. | resolved |
| G10 | ~~Marquee: our photo-card marquee vs giant type marquee w/ animals~~ — **CLOSED Phase C, and it was never an either/or.** The type band ships (static; C2 animates) **and** the photo carousel stays as its own section (§2.4). | resolved |
| G11 | ~~No footer arc~~ — **CLOSED Phase C**: the circle ships at full size with a `--sand-3` hairline; C2 adds only the scroll-scrub. | resolved |
| G12 | No scroll parallax anywhere (M3/M4). The site's only motion is the rAF card carousel and the scroll-arrow bob, both reduced-motion-guarded. | medium — all of C2 |
| G13 | ~~Drinks collage: no tilted polaroids or scattered illustration art~~ — **CLOSED Phase C**; the −8°/+9° tilts are static CSS, so they survive reduced motion. | resolved |
| G14 | ~~No intro slideshow (M6)~~ — **CLOSED Phase C** for markup + arrows; auto-advance and the push transition are C2. | assets done, motion open |

---

## 2. Phases (one session ≈ one phase; check off as done)

### Phase A — design tokens: fonts + palette flip ✅ DONE 2026-08-06

Two variables carry the type system, so the TT Nooks decision never blocks work:
`--display` (statement headlines + marquee) and `--body-font` (everything else).

- [x] Fonts in: **Maname** 400 (`--body-font`) and **Playfair Display** 900 + 900 italic (`--display`, the TT Nooks stand-in), both with latin + latin-ext + **vietnamese** subsets. Keep Noto Serif SC for 中文. Drop Fraunces/Montserrat/Bitter/Chewy. → All three new faces confirmed to carry a `vietnamese` subset; **Overpass** 600/700 took the `--label` slot (it and the original's Expressway Bold are both FHWA-highway-gothic descendants). Chewy left in this phase, not Phase B: `--logo-font` now points at `--display`.
- [x] Delivery: `src/app.html` currently pulls fonts from the **Google Fonts CDN** via `<link>`. Cheapest correct move is to swap that one URL now and self-host later if we want zero third-party requests — don't spend Phase A on a font pipeline. (Self-hosting to `static/fonts/` stays a nice-to-have, not a blocker.)
- [x] Type scale from §1.1 measured values: 157.5 · 105 · 36 · 24 · 22.5 · 18 · 14 · 12. → `--fs-hero/xl/lg/md/body/lead/nav/label/fine`; verified body resolves to 23.9px and `.display-xl` to 105.0px at 1440.
- [x] `src/app.css` `:root` rework: cream page, near-black ink, charcoal drinks band. **Amended same day (§1.2a): the brand green carries the accent/primary role, not terracotta** — client direction. → Went further than aliasing (see §2.1): surfaces are `.on-cream` / `.on-terracotta` / `.on-charcoal` / `.on-green` / `.on-media` context classes that re-point a `--fg` ramp, so no rule hard-codes a text color. Every old green-era token is gone — the aliases turned out to be unnecessary because the sweep finished in-phase.
- [x] Re-map type utilities: `.display` → `--display` at **weight 900**, caps come from the copy not `text-transform`; `.script` → `--display` italic (marquee); body/nav/headings → Maname 400. `.eyebrow` and `.btn` are the only Expressway-ish roles — any clean grotesque is fine. → Verified: `.display` computes to Playfair Display / 900 / `text-transform: none`; nav links to Maname 18px. Nav labels were uppercased **in the copy**.
- [x] Buttons: brand-green pill (`--green` bg, cream text), `border-radius: 50px`, `transition: background-color .4s, border-color .4s` (§1.5 M5); outline variant on cream. → `.btn-cream` renamed `.btn-primary`; it resolves per surface (green fill on cream, cream fill on the dark bands) so one class is correct everywhere.
- [x] Sweep every page after the flip — text/section colors that assumed dark bg (hero overlay, footer, cards, prose pages) must still pass contrast on cream.
- [x] Verify: rebuild + preview (kill port 4173 first — see §4), capture all pages 1440×900 + full + 540px. → Automated WCAG audit over all 7 routes × 2 widths: **0 failures, no horizontal scroll**. Captures in `screenshots/phaseA/`.

#### 2.1 What Phase A actually shipped (read before Phase B/C)

**The color contract.** Never hard-code a text color again. Each section gets an
`.on-*` class that paints `--surface` and re-points `--fg` / `--fg-muted` /
`--fg-dim` / `--rule` / `--accent` / `--accent-ink` / `--warm` / `--warm-ink` /
`--mark` / `--btn-*`. Write `color: var(--fg)` and the same markup reads
correctly on every surface. `.on-media` flips the ramp without painting a
background, for content over the hero video/photo.

The full set, after §1.2d: **`.on-cream`** (the page — also the `:root` default,
so most sections need no class), **`.on-green`** (green panels),
**`.on-green-deep`** (the statement band + the footer), `.on-green-lift`,
`.on-charcoal`, `.on-terracotta` (defined, currently unused — see §1.2d),
`.on-media`. Since the default is cream, **green is the one you have to ask
for** — that inverted with §1.2c and inverted back with §1.2d, which makes it
the single most likely thing to trip up a new section.

This contract is why four palette directions in two days (terracotta → green
accent → green ground → the swap) were each token-and-class edits that touched
no layout and no component logic. Keep it that way.

**Contrast facts this palette forces** (measured, not estimated). Consult this
before picking any color. Rows marked ⬛ are the green set added 2026-08-07 with
§1.2c; rows marked 🔶 are the third-colour set added with §1.2d. Note that the
⬛ rows still apply — the greens did not change, only how much page they own:

| Pair | Ratio | Consequence |
| --- | --- | --- |
| ⬛ cream on `--green-deep` `#143F32` | **9.76:1** | the two full-width brand bands — statement hero, footer (+ newsletter panel's host). The most headroom on the site, so 12px legal copy belongs here (`--fg-muted` 7.9:1, `--fg-dim` 5.9:1) |
| ⬛ cream on `--green-surface` `#17543E` | **7.35:1** | green **panels** on the cream page; room for a real ramp (`--fg-muted` 6.1:1, `--fg-dim` 5.2:1) |
| ⬛ `--sand` `#FAE6C0` on ground / deep | 7.2 / 9.6:1 | the warm label accent on every green surface |
| ⬛ cream on `--green` `#1B6E52` | 5.13:1 | `.on-green-lift` raised panels — passes, but with **no ramp left**: full cream at every level, no fine print |
| ⬛ terracotta / orange on the green ground | **1.89 / 2.99:1** | ✗ the warm secondary can never be text on green — folk-art fills only. On cream it still works (below). |
| ⬛ `--green-bright` on the green ground | **2.38:1** | ✗ decorative only here too |
| 🔶 ink `#1A1613` on cream | **14.9:1** | **THE PAGE GROUND** since §1.2d; `--fg-muted` 6.5:1, `--fg-dim` 4.7:1 — the dim step is *at* the AA floor, so don't go lower |
| 🔶 terracotta `#D14124` on cream | **3.88:1** | **the third colour.** Clears large text (3:1) at **≥18.66px / weight 700+**, fails normal text. Graphics, fills and display type only — this single number is the whole "green speaks, terracotta draws" rule |
| 🔶 rust `#A94C23` on cream | **4.66:1** | `--warm-ink` — the third colour when it must be small text |
| 🔶 `--sand` `#FAE6C0` on cream | **~1.1:1** | ✗ **invisible.** It was `--accent-ink` on the default surface before the swap; on the cream page it is a warm accent for DARK surfaces only |
| ink `#1A1613` on `--cream-lift` | 16.1:1 | raised panels. On the cream page the lift itself is nearly invisible — pair with a `--rule` hairline |
| **`--green` `#1B6E52` on cream** | **5.13:1** | ✅ passes **both ways** — one token is the accent text on a cream panel AND a fill carrying cream text. This is why green works where terracotta didn't. |
| ~~`--sand-2` `#F4D7A0`~~ | **4.21:1 on lighter greens** | ✗ looks identical to `--sand` but fails — use `--sand` (§1.2b) |
| `--green-bright` `#47927A` on cream | **3.08:1** | ✗ decorative fills only — never text, never behind text |
| cream on charcoal | 12.0:1 | plenty of headroom; alpha ramp works |
| cream on terracotta | **3.88:1** | ✗ — hence `--cream-bright` (4.67:1) and **no muted ramp** on `.on-terracotta` |
| any white on orange `#E57923` | ≤2.9:1 | orange can never carry text — decorative only |

(Terracotta-on-cream and rust-on-cream are the two 🔶 rows above; they were
listed here as a demoted "secondary" before §1.2d made them the third colour.)

Three consequences worth remembering:
1. **The three greens are different on purpose.** Bigger/darker areas get the
   deeper token — partly because big blocks want more weight, but mainly because
   only `#17543E` and `#143F32` have the headroom for a muted ramp. Don't
   collapse them.
2. **`--green-bright` is the client's vivid green and it cannot carry text.** It
   is for illustration and decorative shapes; reaching for it on a surface will
   fail the audit.
3. The promo gradient was dropped for a flat fill — its orange end could never
   have passed, and the original uses flat color everywhere anyway.
4. **The third colour's whole design follows from one number.** Terracotta is
   3.88:1 on cream: enough for large text and fills, not enough for body copy.
   Everything in §1.2d — `--warm` vs `--warm-ink`, "green speaks / terracotta
   draws", the 20px clamp floor on the intro heading — is that one measurement
   turned into rules you can apply without re-measuring.

**`verify.py` had a blind spot that only cream exposed** (fixed 2026-08-07 with
the swap). Its `bgOf()` walks *ancestors* for the first opaque background, but
the site footer is deliberately `background: transparent` — its 255vw `.arc`
sibling paints the ground (§2.3), and a square slab would destroy the dome. So
the walk ran straight past the footer to the page behind it. That was harmless
while the page was green (it happened to measure ~7:1 anyway) and became **18
bogus 1:1 failures per route** the instant the ground went cream. The fix
leans on the colour contract itself: if an element carries an `.on-*` class but
paints no background, trust its declared `--surface`. `.on-media` is excluded on
purpose — a *video* is behind it, which no token can stand in for, so those stay
flagged for the manual frame-sampling check. Verified against the real paint
stack (`elementsFromPoint` puts `.arc` directly under `.footer-body`; cream on it
is **9.76:1**, not 1:1). **Generalisable: a checker that walks the DOM cannot see
a sibling that paints — when a shape is the surface, tell the checker.**

**Hero video scrim** is 0.55, chosen by sampling the actual video at 7
timestamps: it leaves 0.17% of the pixels behind the hero text below 4.5:1,
where 0.46 left 2.7% and 0.30 left 8.0%. If Phase C drops the video (§5 Q3),
this goes with it.

### Phase B — brand assets ✅ DONE 2026-08-07

- [x] Optimize + rename harvested SVGs with kebab names. → **`scripts/svgclean.py`**, stdlib-only (svgo isn't installed and isn't needed). 16 assets, 288KB → 263KB. Names as planned except **`shrimp.svg`** (the file the plan called `herb-red` is a shrimp) and **`beans.svg`** for the cluster. See §2.2 for what the script does beyond minifying — the Wix color resolution is the part that matters.
- [x] Replace `src/lib/site/Logo.svelte` + `static/favicon.svg` with the real vector lockups. → Logo.svelte is now a thin wrapper over `<Art>`; the hand-drawn hat and all its CSS are gone, as is `--logo-font`'s reason to exist. Favicon is the hat cluster (paths 12-14 of the horizontal lockup) on a `--green-deep` tile.
- [x] ⚠️ Diff the harvest against the 31 existing photos rather than bulk-importing. → Done by perceptual hash, and **the answer inverts the plan's assumption: there is nothing to import.** All 31 existing files already *are* these photographs (dHash distance ≤4 on every one), including the 18 cut-out dish shots and the pho cut-outs this bullet expected to gain. The harvest's 32nd file is a byte-identical rename of another. **No filenames changed, no `content.js` edits needed.** Numbers in §2.2.
- [x] Web renditions (max ~1600px, ~80% quality). → Already satisfied, with two exceptions that broke the rule: `interior-hat-wide.jpg` and `interior-murals-wide.jpg` were 2560px/~660KB each. Resampled to 1600px q82 — **4.3MB → 3.6MB**, filenames unchanged.
- [x] Originals stay out of git — `.gitignore` line left in place, verified still effective.
- [ ] ⚠️ **Hero video: NOT decided — this is client question §5 Q3 and it is now the single biggest thing in the deploy.** Measured, not estimated: `build/` is **38MB, of which 33MB (87%) is the two hero videos**. They are tracked in git and still wired into the homepage hero (`+page.svelte:89-92`), so deleting them would break the page and pre-empt Q3. Left in place deliberately. Phase C re-decides the hero anyway; note `/company` already has its own 7.6MB kitchen video harvested, so the hero pair may be redundant rather than merely oversized.
- [x] Update `docs/website-brief.md` §6: logo-vector question RESOLVED. → Updated in three places (§4 Logo, §6 #2, §7 assumption 8). The brief said "no vector found" because the media-library sweep only saw the 48px favicon — **the real lockups were inline SVG in the page markup all along.**
- [x] Verify: favicon + navbar logo render at both sizes; page weight sane. → `verify.py` (now `OUT_TAG="phaseB"`): **0 contrast failures across 7 routes × 2 widths, no horizontal scroll.** Logo confirmed rendering cream-on-green in navbar and footer at 1440 and 540.

#### 2.2 What Phase B actually shipped (read before Phase C/D)

**`scripts/svgclean.py` is not a minifier**, and the two things it does instead
are both load-bearing:

1. **It resolves Wix's color overrides.** The harvested files' inline `fill=`
   attributes are *not* what the live site showed. Wix ships a scoped
   stylesheet (`#comp-… svg [data-color="1"] {fill:#D14124}`) whose selector
   needs a page ancestor that a harvested file doesn't have — so the raw file
   renders its **source-art** colors. That is why `svg-sheet.png` shows a teal
   drink cup that was terracotta on the real site, and why the herb reads
   `#00b48c` rather than the `#53B28F` it actually displayed. The script folds
   those rules in *before* remapping to our tokens.
2. **Its path rounding is command-aware, and has a self-check.** An elliptical
   arc's two flags are single characters that are legally written with no
   separator (`a5 5 0 015 5`); a plain number regex reads `015` as one number,
   eats both flags and shifts every later argument. This silently turned the
   three `/company` dish illustrations into solid brown blobs. `path_signature()`
   now fingerprints each path's command/argument structure before and after
   rounding and aborts on any change — **if you touch the rounding, that guard
   is what tells you it broke.**

**Where the art lives, and why it's split.** The plan said
`static/assets/art/`; it ended up in two places for a reason:

| | Contents | Why |
| --- | --- | --- |
| `src/lib/art/` (10) | logo ×2, shrimp, herb, noodles, bean, beans, cup, phin, lime | Carry `currentColor` / `var(--art-*)`, which are **inert inside `<img src>`**. Inlined by `Art.svelte` so illustration obeys the color contract. 41KB total. |
| `static/assets/art/` (6) | pig, rooster, buffalo, dish-pho, dish-plate, dish-rolls | Need no theming; 20-63KB each. Served as files so ~230KB stays out of the HTML. |

**The folk-art recolor question (Phase C §1) is ANSWERED, and the artwork
answered it.** Each animal's path 0 is a single large **cream silhouette of the
whole body**, with 45-49 terracotta detail paths on top. On the original's cream
page that base is invisible, so it reads as red line-art; on a green ground the
same file reads as a **cream paper-cut with red line-work**. Either way
terracotta is never asked to sit on green (its 1.89:1 problem) — it only ever
sits on the cream body it ships with. **No recoloring, no cream panel needed.**
Verified on all four surfaces in `screenshots/art-sheet.html`. ✅ **Since the
§1.2d swap our page is cream too, so the animals now read as the original's pure
red line-art** — the same files, no change, one of three things the swap
improved for free (§1.2d).

**New tokens: `--art-fill` (body) and `--art-detail` (line-work),** set by every
`.on-*` class. Dark surfaces get cream-on-terracotta — deliberately the same
pairing the animals are drawn in, so the inlined art and the `<img>` animals
read as one set. `.on-cream` inverts them. Monochrome pieces ignore both and
take `currentColor`, so set `color:` on them (usually `--fg` or `--accent-ink`).

**Two facts Phase C/D will want:**

- **The dish cut-outs' background is `#F1EAD7`** — one step off our `--cream`
  `#F0EAD6`, i.e. visually identical. ✅ **Since the §1.2d swap the page itself
  is cream, so they composite invisibly anywhere and need neither a panel nor a
  mask** — exactly as the original does it. (Under §1.2c's green ground they
  showed a cream rectangle and had to be panelled; that constraint is gone.)
- **The existing photo set is already the right one.** 18 cut-out dishes on
  cream, 7 pho-bowl cut-outs, 7 interiors, drinks, stickers, a b/w lifestyle
  shot. Re-encoding from the harvest was measured and rejected: same pixel
  dimensions, PSNR 32-40dB, and the difference is invisible at display size
  while costing ~1-2MB. A contact sheet of all 31 is worth regenerating from
  the snippet in the session log if you need to pick images.

### Phase C — homepage restructure (original section order) ✅ DONE 2026-08-07

⚠️ **This checklist records what Phase C shipped and the surface names in it are
from §1.2c (the green ground). It is HISTORY — the shipped surfaces changed with
the §1.2d swap and the current mapping is the table in §2.3.** Read it for
*what* each section is and why; read §2.3 for what colour it is now. The
structure is unchanged; only the colours moved.

- [x] Header: `.on-green-deep` navbar, centered logo, nav labels OUR MENU · OUR COMPANY (§5 Q4 for BLOG/PRESS), **cream** ORDER ONLINE pill (`--btn-bg` resolves to cream on green — don't hard-code it). → Three-zone CSS grid (`1fr auto 1fr`) so the mark is centred **on the page**, not merely between its neighbours; the hamburger moved into the left zone to make that work. Labels unchanged pending Q4.
- [x] Section 1: intro on the green ground — three columns (§1.3 item 2): rooster bleeding off the left edge, **centred photo slideshow** (markup + arrows now; auto-advance in C2), buffalo bleeding off the right edge; heading + blurb top-right (keep as a real `h1` for SEO); pig lower-left. Let the animals overflow their column and clip at the viewport — that bleed is the whole effect. ✅ **The recolor worry is resolved — do nothing.** Each animal is drawn as a cream body carrying its own terracotta line-work, so it reads on the green ground as-is; the red never touches the green. Use `<img src="{base}/assets/art/rooster.svg">` etc. (they are files, not `<Art>` — see §2.2).
- [x] Section 2: statement hero on `.on-green-deep` — "NATURAL INGREDIENTS, FRESH TASTE." in `--display` at **~157.5px** (not Maname — §1.1) + Maname 24px paragraph + #nonlaexpress link (→ Instagram). Decide hero-video fate (§5 Q3): default = drop from home, reuse on /company right pane. → ⚠️ **Reversed the same day.** It was dropped per that default, then **restored by client direction** along with the sliding cards and the feature rows — the video hero is now section 1 and the statement hero is section 4. See **§2.4**; Q3 is a live design question again.
- [x] Section 3: pho favorites — 3 `.on-cream` cards w/ cut-out pho photos + names/descriptions (data from `content.js`), sitting ON the deep-green statement band exactly as the originals sit on terracotta. → `PHO_FAVORITES` **resolves against `MENU`** instead of restating the descriptions, so a menu edit can't leave the homepage stale.
- [x] Section 4: type marquee — giant "nón lá ✦ express" in script + animal SVGs; **two rows, opposite directions** (§1.5 M1). ~~Retire the rAF photo marquee in favour of the CSS duplicated-track version.~~ On the green ground the type is cream; the animals need no recolor (§2.2). → Tracks and type in place. ⚠️ **The "retire the rAF marquee" instruction is CANCELLED** — the photo marquee is a separate, client-kept section (§2.4). The two coexist: this type band is section 6 (was 8 before the 2026-08-07 trim) and gets CSS keyframes in C2; the photo carousel is section 2 and keeps its rAF loop and its controls.
- [x] Section 5: interior grid (6 photos, tight masonry).
- [x] Section 6: charcoal drinks section — display headline, phin/cup/bean SVGs scattered, 2 polaroids at **−8° / +9°**, EN + 中文 paragraph. Note the bilingual drinks copy is **not** in `content.js` yet — add `DRINKS_BLURB { en, zh }` from §3. Charcoal against the green ground is a subtle step — give it a full-bleed edge so the change of surface reads. → Done; the headline needed a 10% type shave to keep the original's three-line break (§2.3).
- [x] Section 7: `.on-green-deep` footer w/ stacked logo, SEO paragraph, cream newsletter panel, link columns, address/phone/©, and the **arc circle** behind it (§1.5 M2 — build the circle div now, wire the scroll-scrub in C2; the arc is `--green-deep` rising out of the ground, not `#D14124`. It needs to be visible against `--green-surface`: if the two read as one, use `--green` for the arc instead and keep the footer deep). (Footer is shared — this restyles `Footer.svelte` site-wide.) → Built a third way: keep the same green and add a **`--sand-3` hairline**, which is what actually makes the dome read. The newsletter moved out of the homepage into the footer, so it is now on every route. §2.3.
- [x] Keep, restyled: Lunch Special panel (a real promo the original lacks — currently `.on-cream`, and it should stay a panel: it holds the densest small text on the site) and a slim Find Us strip (address/hours/map link) — the original buries this in the footer; ours earns its keep. Cut: old mission/feature sections (absorbed above). **Green is the ground, cream is for panels** — §1.2c, and see §1.2b for the version that got this wrong. → Find Us sits **before** the drinks band, so charcoal still lands directly on the footer as it does on the original — that is what the arc rises out of.
- [x] Verify: full-page + 540px captures vs `screenshots/orig-home-full.png` side by side. → `verify.py` at `OUT_TAG="phaseC"`: **0 contrast failures across 7 routes × 2 widths, no horizontal scroll**; every layout claim above re-checked at a real viewport with `cdp.py` (§4).

#### 2.3 What Phase C actually shipped (read before C2/D/E)

**The homepage takes the original's spine and keeps four of our own sections.**
The order below is what shipped after the client's 2026-08-07 correction (see
**§2.4**, which is the binding list) — it is *not* §1.3's, and every difference
is deliberate:

⚠️ **Surfaces are as of §1.2d (the swap) — the ground is CREAM — and the section
list is as of the 2026-08-07 trims**, which removed the Lunch Special section,
the Signature Drinks feature row and the three-column intro from the homepage
(all client direction; see §2.4). The page is **8 sections**, down from 11.

⚠️ **The `<h1>` moved into the hero** when the intro went, since the intro's SEO
line was the page's only heading. The hero headline was a `<p>` precisely
*because* that h1 lived below it — it is now a real `<h1>` carrying
`INTRO_SEO.h1`, and the hero sub carries `INTRO_SEO.blurb`. Verified one h1 on
the page. **`--fs-xl` no longer fits it**: at 105px a 50-character line sets
three and swallows the hero, and the measured scale has no step between 36 and
105, so `.hero-title` gets its own clamp fitted to break at two lines
(63.2px at 1440, 28px at 540 — both measured). It is fitted to *that exact
string*; re-measure if the copy changes.

| # | Section | Surface | vs original |
| --- | --- | --- | --- |
| 1 | **video hero** + curve w/ terracotta ring — carries the page's **only `<h1>`** | `.on-media` | **OURS** |
| 2 | **sliding dish cards** (rAF, prev/next/pause) | ground (cream) | **OURS** |
| 3 | statement hero + 3 phở cards | `.on-green-deep` + `.on-cream` cards | their terracotta block |
| 4 | **feature: phở** — panel + photo | `.on-green` + `--sand` media half | **OURS** |
| 5 | type marquee, two rows | ground (cream) | same — black type, red animals, as the original |
| 6 | interior grid, 3×2 | full-bleed | same |
| 7 | Find Us | ground (cream) | **OURS** |
| 8 | drinks collage | `.on-charcoal` | same |
| → | footer: arc + newsletter + columns | `.on-green-deep` | same |

**The feature row's media half needed its own surface, and a background alone
would not have given it one.** The dish photos are JPGs with the studio's cream
backdrop **baked in** (~`#F1EAD7`, a hair off `--cream` — §2.2), and the `<img>`
is `object-fit: cover`, so it covers any background the container paints. What
actually works is **`mix-blend-mode: multiply` over a `--sand` fill**:
multiplying a near-white field over sand leaves the sand, while the bowl is dark
enough to survive with only a mild warm tint. Where multiply is unsupported the
image simply paints over the sand and the half falls back to its previous
appearance — no broken state. **This technique is available to the whole
harvested dish set**, since all 31 photos ship on that one flat backdrop; worth
remembering for Phase D if any dish photo ever needs to sit on a colour.

**The drinks collage must stay LAST, and Find Us must stay above it.** On the
original the charcoal section sits directly on the footer, and that is what the
arc rises out of. Anything inserted near the end belongs *above* the collage
(now section 9), not below it — a strip between them leaves the arc rising out
of the page ground instead of out of charcoal.

~~**Sections 7 and 11 are both charcoal and both about drinks, on purpose.**~~
**Moot since 2026-08-07:** the Signature Drinks feature row was removed (§2.4),
so charcoal now appears exactly once, at the drinks collage. Kept as a note
because the reasoning matters if a second drinks block is ever proposed: a
*product* block ($6, order CTA) and the original's *mood* piece are different
jobs, and the fix for them reading as repetition was never deletion.

#### 2.4 ⚠️ KEEP LIST — the sections that are OURS, and why they stay

**Read this before restructuring the homepage again.** Phase C first shipped as
a near-faithful copy of the original and the client's response (2026-08-07) was
that it had thrown away things our build did better; five sections were restored
by explicit direction. **Later the same day the client removed two of the five**
— the Lunch Special section and the Signature Drinks feature row. Both states
are client direction, and the difference between them is the whole point of this
section:

> ⚠️ **What this list protects is a REASON, not a roster.** Don't delete one of
> our sections *because the original lacks it*. Do delete one when the client
> asks. A future session finding a section here that isn't in the page should
> check the session log before "restoring" it.

| Section | Status | What it is | Notes for future phases |
| --- | --- | --- | --- |
| **Video hero** | ✅ in | Full-bleed `Nonla-Express-Hero` video, `.on-media`, tagline "phở, the new era", two CTAs, scroll arrow, and the curve divider into the page | The scrim is **0.55, measured** — see §2.1, don't retune by eye. The curve fills `var(--surface)` so it always matches the ground, and its hairline is **terracotta** since §1.2d, rhyming with the footer arc's ring. This also **re-opens §5 Q3**: the video is wired into the page again. |
| **Sliding dish cards** | ✅ in | rAF photo marquee, **5** dishes ×2, prev / next / play-pause | ⚠️ **Not the same thing as §1.5 M1.** M1 is the original's giant *type* band (now section 6) and gets pure-CSS tracks in C2. This one is ours, has real controls, and **C2 must not delete it.** The drinks-trio photo was removed 2026-08-07 (client) — it is **food only** now. One copy of the set must stay wider than the viewport or the wrap shows a gap; at 25vw+20px per card that holds down to 4. |
| **Feature row: phở** | ✅ in | One 24px-radius panel+photo row — `.on-green` panel, `--sand` media half | The surviving feature row. `.feature--reverse` was removed with the drinks row; re-add its two `order` rules if a second row ever returns (one row alone shouldn't alternate). See §2.3 for the multiply trick that gives the media half a real surface. |
| **Find Us** | ✅ in | Hours / address / transit / order strip | The original buries this in the footer. Must stay **above** the drinks collage (§2.3). |
| **Lunch Special** | ❌ removed from home 2026-08-07 | Promo panel, bilingual set steps, $25 price oval | **The component still exists and still ships on `/menu`** — only the homepage section went. Don't delete `LunchSpecial.svelte`. |
| **Three-column intro** | ❌ removed 2026-08-07 | Rooster/pig/buffalo bleeding off both edges, centred photo slideshow, SEO h1 + blurb | Not one of "ours" — this was the ORIGINAL's section (§1.3 item 2), and removing it is the one trim that moves away from the original rather than toward it. Its copy lives in the hero now. **The folk animals survive in the type marquee**; the three dish illustrations and the other art are untouched. Killed **§1.5 M4 and M6** (see Phase C2). |
| **Feature row: drinks** | ❌ removed 2026-08-07 | Charcoal panel + photo, reversed, $6 + order CTA | Charcoal now appears exactly once on the page (the drinks collage). `drinks-trio.jpg` is still used by the carousel and the collage. |

Everything else on the homepage is the original's structure and should keep
tracking it.

**The general rule this session established:** the brief is *the original's
layout, typography and motion, carrying the brand's own colour* — it is **not**
"reproduce the original". Where our scaffold has something the original lacks,
it stays *unless the client says otherwise*, and it gets the redesign's surfaces
and type rather than being deleted by default.

**The arc (§1.5 M2) is built, and Phase C's colour worry was justified.**
`--green-deep` did not read against the then-green ground on its own — one
ladder step is not a shape — so the circle got a **2px hairline**, the same
device the hero curve uses. ⚠️ **Since §1.2d that hairline is `--terracotta`,
not `--sand-3`, and its job changed:** on the cream page the dome separates on
its own, so the ring is no longer load-bearing for legibility and is instead the
third colour's biggest moment, echoing the original's red arc. The seam now
reads charcoal → cream wedges → green dome + red ring, which is three distinct
values where it used to be two. Mechanics worth knowing before touching it:

- The footer paints **no background of its own** — `background: transparent`
  deliberately overrides `.on-green-deep`, and the 255vw circle *is* the
  footer's surface, its top cap becoming the curved edge. `overflow: hidden` on
  the footer is what stops a 255vw box from becoming horizontal scroll. Neither
  is optional.
- `--arc-rise: 10.2vw` is geometry, not taste: for a circle 2.55 viewports wide
  the cap drops ≈0.102·w from centre to edge, which is exactly the clear space
  the content needs above it. The footer's `padding-top` reads the same var.
- ⚠️ **The wedges either side of the dome show the PAGE GROUND, not the section
  above** — they are cream since §1.2d. That reads well wherever the preceding
  band is the ground or charcoal (home, /company, /press, all three legal
  pages): charcoal → cream wedges → green dome is a clean three-value seam. But
  **/menu still ends on a `--green-deep` strip**, so there the same green meets
  itself across a band of cream wedges. Harmless, and Phase D fixes it for free
  by giving /menu the charcoal drinks strip the original has.
- C2 scrubs `width` 120vw→255vw and nothing else. At rest the circle is at full
  size, which is also the no-`view()`-support fallback.

**The newsletter is site-wide now.** It moved from a homepage section into
`Footer.svelte` as the original's cream panel (radius 16px, heading in **Maname
at `--fs-xl`/105px — the workhorse serif, not the display face**, per §1.1).
So: the `#newsletter` anchor exists on every route, the footer's own
"Newsletter" link was dropped as self-referential, and the subscribe `$state`
lives in the footer.

**One measured deviation from the type scale, and it is the stand-in font's
fault.** The drinks headline is `calc(var(--fs-hero) * 0.9)`, not `--fs-hero`.
Playfair 900 needs **1432px** to set "WARM MEMORIES" at 157.5px against a
1368px container, so the original's three-line break spills to four; TT Nooks is
condensed and fits. Shaving 10% restores the original's rhythm, which is the
more faithful reading of the design than the literal pixel size. **Revisit if
§5 Q2 lands.** The statement hero needs no shave — it breaks correctly at the
full 157.5px.

**The hero video is back in the page** (client direction, §2.4), so §5 Q3 is a
live design question again rather than a repo cleanup: 33MB of a 37MB deploy,
now genuinely load-bearing on the homepage. The `.on-media` scrim, the arc
divider and the reduced-motion `pause()` all came back with it unchanged.

**Motion is minimal but no longer zero.** Two moving parts ship in Phase C: the
rAF card marquee and the scroll-arrow bob. **Both already bail out under
`prefers-reduced-motion: reduce`** — the marquee never starts its rAF loop and
the video is paused; the bob has an explicit `animation: none`. Everything C2
adds must extend that pattern, and the page must stay correct with all of it
removed. Still deliberately **no scroll-entrance fades** — the original has zero
(§1.5 M5) and neither do we.

### Phase C2 — motion layer (needs Phase C sections to exist first)

Implement §1.5 in order of payoff. All of it goes inside
`@media (prefers-reduced-motion: no-preference)`; the page must be complete and
correct with every animation removed.

- [ ] **M1 marquee** — pure CSS, duplicated track, `linear infinite`; row 1 left/30.9s, row 2 right/36.5s, ~20px item gap. This is the **type band (section 6 since the 2026-08-07 trim, formerly 8)**; `.mq-row` / `.mq-track` exist and only need the keyframes. The tracks are rendered once with 4 repeats, so duplicate the track element before animating. ⚠️ **Do NOT touch the rAF photo carousel in section 2** — different section, client-kept, has its own controls (§2.4).
- [ ] **M2 footer arc** — the `.arc` div **already exists** in `Footer.svelte` at its full 255vw size (§2.3 has the geometry and the two rules that must not be removed). All C2 owes it is scrubbing `width` ~120vw→255vw across the footer's view progress via `animation-timeline: view()`; where unsupported it stays at full size, which is the current, correct-looking state. Re-check `hscroll=no` after — the footer's `overflow: hidden` is what holds that.
- [ ] **M3 drinks parallax** — cup/phin drift ≈±105px, polaroids ≈±60px in opposite directions, bean cluster static. Same `view()` timeline approach; keep rates small and unequal.
- [x] ~~**M4 intro parallax**~~ — ❌ **NOT BUILDABLE: the intro section was removed 2026-08-07** (§2.4). Kept for the record and because the mobile idle-loop numbers are reusable if the animals ever get a section again: rooster/buffalo/pig drift ≈+18/+35/+25px over the first ~700px. Mobile (≤750px) idle loops: swing 5.4s / 6.7s, bounce 2.9s, breathe 14.3s / 14.7s / 5.0s.
- [x] ~~**M6 intro slideshow**~~ — ❌ **NOT BUILDABLE: the intro section was removed 2026-08-07** (§2.4), and the slideshow markup went with it. Original spec kept for the record: 3 slides, auto-advance ≈4s, horizontal push transition, working Previous/Next arrows. Pause the auto-advance under reduced motion (arrows still work) and when the section is off-screen. **The markup, the 3 slides and the arrows already work** (Phase C); slides currently cut rather than push. Only the timer and the transition are left.
- [ ] **M5** — ORDER ONLINE pill transition `.4s` on background/border. Deliberately add **no** scroll-entrance fades (the original has none).
- [ ] Prefer CSS scroll-driven animations over scroll listeners; if a JS fallback is needed, rAF-throttle it and bail out under reduced-motion.
- Verify: capture at several scroll offsets (the arc is invisible in a full-page render — see §4), and once with reduced-motion forced.

### Phase D — menu page re-skin
- [ ] ⚠️ **Re-read for §1.2d:** the page is now CREAM, like the original's menu, and the dish cards are `--cream-lift` + `--rule` on it (they already paint that themselves, so they read correctly today). The original shows cut-out dish photos **directly on cream with no cards at all** — with the swap that is finally available to us, so decide deliberately whether to keep the cards or drop to the original's card-less treatment. Header = lime SVG + script "ăn nào!" + "NónLá Express Menu" + intro; noodle squiggle right.
- [ ] **Third-colour opportunities on this page** (§1.2d, "terracotta draws"): the numbered 1–10 badges are already terracotta; the section rules and the "ăn nào!" script heading are the original's red moments. Prices/accent text stay `--accent-ink` (green) — terracotta cannot be small text on cream.
- [ ] ⚠️ **Section mismatch — resolve before building (§5 Q6).** Our `content.js` MENU has five sections: Appetizer $9 · **Burger $12** · Noodle $17 · Main $17 · Signature Drink $6. The original web menu shows only four (Appetizers / Phở Noodle Soup / Main Dishes / Drinks) — **no burgers**. Either the Wix menu is out of date or burgers were dropped. Don't silently delete a real menu section; default is to keep Burger and give it the same treatment.
- [ ] Sections w/ thin rules + script headings; 3-col cut-out photo grid (18 harvested dish photos map to `content.js` items), numbered 1–10 items, protein sublists.
- [ ] Prices: original shows none on the web (§5 Q5). Default: keep our prices (useful) but restyle — small `--accent-ink` text, which resolves to `--green` on cream (5.13:1) and `--sand` on any green band (7.2:1); never hard-code either. Retire the price-oval on this page (it's a printed-menu signature, keep for LunchSpecial only).
- [ ] Keep bilingual EN/中文/Viet names from `content.js` — that's our value-add; set 中文 in Noto Serif SC. It sits on the cream cards, where it has the most headroom.
- [ ] Drinks band: charcoal strip w/ 3 branded cup photos — give it a full-bleed edge (charcoal-on-green is a subtle step).
- Verify vs `screenshots/orig-menu-full.png`.

### Phase E — company page + remaining pages
- [ ] /company: 50/50 split — left story column (label, script heading, «phở, the new era» pull-quote, story paragraphs from `content.js`, mural photo), right full-bleed media (hero video from Phase C, else `pho-near-me-…-dining-area.jpg`). Below-fold: illustrated-dish SVG row + values band on `.on-green-deep` (values cards are already `.on-cream` + `--cream-lift`). The red script pull-quote is a `--warm` candidate (§1.2d) — check the rendered size clears 18.66px at weight 700+.
- [ ] /press, legal pages, accessibility: already on the cream ground with `--cream-lift` cards / `.prose-panel`; check prose contrast and that nothing re-introduces a hard-coded color.
- [ ] Nav labels + footer links aligned with §5 Q4 outcome (BLOG vs PRESS).
- [ ] Remove dead CSS: `.price-oval` if unused, hero-video styles if dropped, `.on-green-lift` if nothing ends up using it. ⚠️ **Do NOT sweep `.on-terracotta`** — it is deliberately unused and kept AA-correct as the statement hero's option if the client wants more of the third colour (§1.2d). (The old dark-green-era vars are already gone — Phase A removed them outright.)
- Verify all 7 routes, both widths.

### Phase F — QA + launch prep
- [ ] Cross-page consistency pass at 1440 + 540 (memory: headless Chrome clamps <~540px; judge narrower via CSS).
- [ ] Reduced-motion: force it on and confirm every §1.5 effect is inert and the page still reads correctly (marquee static, arc at full size, no parallax drift).
- [ ] Contrast audit — **automated**: `scripts/verify.py` walks every route at both widths, composites each element's color over its real background, and reports anything under 4.5:1 (3.0 for large text). Re-run it after every phase. Phase A left it at 0 failures; the numbers behind the palette are in §2.1. Note it cannot see through `.on-media` (it walks past the video to the page background) — those are checked by sampling the video directly.
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

⚠️ **A leaked Chrome silently measures at the wrong width** (found and fixed
2026-08-07). `cdp.py` uses a **fixed** debug port, so if an instance is already
listening the new process exits and `Chrome(w, h)` attaches to the **old
browser at its `--window-size`**. Nothing errors; every number comes back
plausible and wrong. It turned a `verify.py` "desktop" pass into a second
mobile pass, and was only caught because a `clamp()` floor value showed up
where a much larger number was expected. **Fixed** by forcing
`Emulation.setDeviceMetricsOverride` right after connecting, so the requested
size wins regardless of who owns the browser — reproduced and confirmed. If a
measurement ever still looks subtly off, check `lsof -ti:9333` for a leaked
browser before doubting the CSS, and kill it **by port**, not with `pkill`.
Same failure shape as the stale `vite preview` on 4173.

## 5. Open questions for the client (batch before Phase C ships)

1. ~~**Palette direction**~~ — **ANSWERED four times; §1.2d is current.** 2026-08-06: terracotta as the theme color, **no** — use the **brand green** (§1.2a). 2026-08-06: green-dominant like the printed menu, **no** (§1.2b, rejected on sight). 2026-08-07 morning: green as the **page ground**, cream as the panel material (§1.2c). 2026-08-07: **swap them** — cream is the ground, green is the accent, and **terracotta is promoted to a real third brand colour** (§1.2d). ✅ The folk-art half is settled and got better with the swap — the SVGs need no recolor at all, and on cream their cream bodies vanish so they read as the original's red line-art (§2.2, §1.2d).
   - **The one sub-question left open, deliberately:** how much surface the third colour owns. Today it *draws* (logo, folk art, badges, the two arc hairlines, the intro heading) but owns no band. The original gives terracotta the **statement hero and the footer**; `.on-terracotta` is defined and AA-correct, so handing it the statement hero is a one-class change if the client wants more orange. Worth showing them both.
2. **TT Nooks license — now the biggest one.** §1.1 proved this face carries the hero, the drinks headline, the marquee and the intro text: it *is* the identity, and **no free font matches it** (see `screenshots/fonttest.png`). Buy TT Nooks Bold (+ Regular for the menu/company script headings), or ship Playfair Display 900 as a knowingly-approximate stand-in? Ask whether the client already licensed it for the Wix build — if so we may be able to reuse the license.
3. **Hero video — STILL A DESIGN QUESTION, and the answer moved twice on
   2026-08-07.** Phase C first took its own default and dropped it from the
   homepage; the client then asked for the video hero back, and it is now
   **section 1 of the homepage** and on the §2.4 keep list. So it is load-bearing
   again, at **33MB of a 37MB deploy**. The remaining question is only about
   weight, not about whether to use it: is a shorter / smaller-bitrate rendition
   acceptable? (The `.mov` + `.mp4` pair exists for Safari HEVC vs everything
   else, so both are needed.) Separately, Phase E's /company pane can use the
   harvested kitchen video (7.6MB, 720×1062) rather than this one.
4. **BLOG vs PRESS in nav:** original has an active (Chinese-SEO) Wix blog; our static site has /press instead. Blog content strategy + the parked `/blog`, `/post/*` redirect map are one decision.
5. **Menu prices on the website:** original shows none; we currently show prices. Keep or hide?
6. **Burger section:** our menu data has it, the live site's menu doesn't (Phase D). Still on the menu, or discontinued?
7. **Maname's Vietnamese diacritics (new, Phase A).** On ơ/ư the tone mark sits
   far too high — *phở*, *Cơm*, *Sườn*, *Nướng*, *Cuốn* all show a floating gap
   (§1.1). No CSS fixes it. The original site has the identical flaw, so the
   real question is *match the original, or do better than it?* Options: (a)
   keep Maname — authentic, visibly wrong on most menu items; (b) keep Maname
   for English and set Vietnamese names in a second face; (c) swap the body
   serif for one with proper Vietnamese. Worth pairing with Q2, since both are
   "how faithful vs how good" calls.
8. (Existing §6 items still open: hours confirmation, newsletter provider, press details.)

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
- **2026-08-06 — PHASE A SHIPPED.** Fonts swapped (Maname · Playfair Display
  900/900i · Overpass · Noto Serif SC, all with vietnamese subsets, one CDN
  URL), palette flipped from dark-green to cream/terracotta, type scale built
  from §1.1's measured px, and all 7 routes swept. Build clean; **0 WCAG
  failures across 7 routes × 2 widths, no horizontal scroll.** Four things
  future phases should know:
  1. **The flip became a color *contract*, not an alias table** (§2.1). Rather
     than aliasing the old dark-era names, sections now carry `.on-cream` /
     `.on-terracotta` / `.on-charcoal` / `.on-green` / `.on-media` classes that
     re-point a `--fg` ramp. No rule hard-codes a text color, so Phase C can
     move a section between surfaces without touching its CSS. Every green-era
     token is gone.
  2. **The original's palette cannot carry small text on terracotta.** Cream on
     `#D14124` measures 3.88:1 and *white* is only 4.67:1 — so there is no
     muted/dim ramp on that surface at all, and `--cream-bright` (#FFFDF8)
     exists specifically for text on it. Hierarchy on terracotta must come from
     size and weight. Small accents on cream use rust `#A94C23` (4.66:1), never
     terracotta (3.88:1). Full table in §2.1 — consult it before picking a color.
  3. **Two Maname defects surfaced** (§1.1). The broken `fi` ligature is fixed
     in CSS; the badly-stacked Vietnamese tone marks on ơ/ư cannot be, and are
     now §5 Q8 — a real client decision, since the original site has the same
     flaw and it hits most of the menu.
  4. **The verify loop is now a script**, `scripts/verify.py` — a real WCAG
     audit plus webfont and overflow checks over every route at both widths.
     Run it after every phase; it is what caught all of the above.
  Also dropped: the promo gradient (its orange end could never pass contrast,
  and the original uses flat color everywhere) and Chewy (a phase earlier than
  planned — the interim logo wordmark rides `--display` until Phase B).
  **Next: Phase B — brand assets** (real logo vectors are already harvested at
  `docs/assets/original-site/svg/`). §5 has 8 open client questions; Q1
  (cream-dominant direction) and Q2 (TT Nooks license) are the ones that could
  still move Phase A's output, so batch them before Phase C ships.
- **2026-08-06 — PHASE A AMENDED: brand green replaces terracotta (§5 Q1
  answered).** Client reviewed the shipped Phase A and asked to keep the cream
  layout and everything else, but restore the **brand green** as the theme
  colour in place of the original site's terracotta-orange. Done — new **§1.2a**
  records the resulting palette. What this meant in practice:
  - Because Phase A had built the color *contract* rather than hard-coded
    colors, this was a token-level change: retune `:root` + one new `.on-green`
    surface, swap six `.on-terracotta` class usages in markup, done. No
    component logic and no layout touched. That is exactly the payoff the
    contract was built for — worth remembering when Phase C is tempted to
    hard-code something.
  - **Green turns out to be the better-behaved brand color**, not just the
    preferred one. `--green #1B6E52` measures 5.13:1 on cream, which passes AA
    **in both directions** — one token serves as accent text on cream *and* as
    a fill carrying cream text. Terracotta is 3.88:1 either way and could do
    neither; it needed the `--cream-bright` near-white workaround and had no
    muted ramp at all. The green bands get a real `--fg-muted`/`--fg-dim` back.
  - **`--green` and `--green-surface` are split deliberately** (`#1B6E52` for
    buttons/accents, `#17543E` for large blocks). The first audit run failed 18
    checks because a single vivid green had too little headroom for a muted
    ramp; the deeper surface fixes it at 7.35:1. Don't collapse them.
  - The client's vivid `#47927A` is kept as `--green-bright` but is
    **decorative-fill only** — 3.08:1 means it can never carry or sit behind
    text.
  - `<meta name="theme-color">` is brand green again — that tag was what the
    client noticed first.
  Re-verified: build clean, **0 WCAG failures across 7 routes × 2 widths**.
  Phase C/C2/D/E wording updated (statement hero, footer, footer arc, menu
  prices all now green). Terracotta survives as the warm secondary for Phase B's
  folk art and the printed menu's numbered badges.
- **2026-08-06 — GREEN-DOMINANT pass: the printed menu becomes the colour
  source.** Client: *"use more green, like docs/Menu-1.png."* Sampled that file
  pixel-for-pixel rather than eyeballing it — flat `#407666` field, `#F1EAD6`
  type, one warm `#DD4307`→`#C31D04` strip — and rebuilt the palette around it
  (**§1.2a**, contrast table in §2.1). The structural insight mattered more than
  the hex values: the printed menu is **green-dominant with cream type and
  spends its single warm band on the Lunch Special**. Our previous pass had that
  exactly backwards. Now: 9 `.on-green` + 8 `.on-green-deep` + 5 `.on-red`
  sections vs 3 cream, with cream as breathing room.
  - **`#3B6E5F`, not the sampled `#407666`** — true cream on the sampled green
    is 4.36:1, just under AA; 3% deeper is 4.87:1 and passes **both ways**,
    which is what lets one token be a section field *and* accent text on cream.
    Visually indistinguishable.
  - **`--red` is the band's deep end `#C31D04`** (cream 4.99:1); its light end
    `#DD4307` is 3.57:1 and could not have carried the copy.
  - **`.on-green` and `.on-red` deliberately have no muted ramp** — full cream
    throughout, hierarchy from size and weight, exactly as the printed menu
    does it. `.on-green-deep` (7.16:1) exists for anything with fine print,
    which is why the footer moved there.
  - **`--cream-bright` is retired.** Every surface on the site now carries true
    `#F0EAD6` text — the near-white workaround existed only for terracotta.
  - Caught by the audit: `--sand-2` measures **4.21:1** on the green field and
    fails; the warm label accent is `--sand` `#FAE6C0` (4.79:1). Easy to get
    wrong by eye — the two look nearly identical.
  - **/menu reproduced Menu-1's treatment**: dishes as rounded photos directly
    on the green with cream captions beneath, no cards, thin cream hairlines,
    cream outline price ovals.
  Verified clean — and then **rejected by the client on sight** (see next entry).
- **2026-08-06 — REVERTED to the green-ACCENT design (§1.2a is current).**
  Client: *"doesn't look good, let's revert back to the previous green accent
  colour design."* Rolled the green-dominant pass back in full: cream is the
  dominant surface again, `--green #1B6E52` is the accent, `--green-surface
  #17543E` carries the green blocks (footer, newsletter, feature panels, promo),
  the drinks feature is charcoal again, and the menu page is back to cream cards
  on cream. `--red`/`.on-red`/`.on-green-deep` removed; `.on-terracotta` and
  `--cream-bright` restored. Surfaces now: 8 `.on-green`, 3 `.on-charcoal`,
  3 `.on-media`, cream everywhere else.
  - **Nothing had been committed**, so this was a hand-revert rather than a
    `git revert` — worth knowing if the two directions ever need diffing again.
    The green-dominant version exists only in this file's §1.2b and in
    `screenshots/phaseA/menu1-*.png` / `home-*.png`.
  - **One thing was deliberately NOT reverted:** the warm label accent stays
    `--sand` `#FAE6C0`, not `--sand-2` `#F4D7A0`. That was a genuine AA fix the
    audit caught during the green pass (4.21:1 vs 4.79:1), and it is correct in
    either direction. Don't "restore" `--sand-2`.
  - **The lesson, recorded in §1.2b so it is not re-learned:** print and screen
    want different proportions of the same palette. A saturated field on a
    single held page reads as confident; the same field scrolling under a
    viewport reads as oppressive. Menu-1 stays the reference for type, price
    ovals, bilingual captions and photo treatment — not for surface area.
  Re-verified after the revert: build clean, **0 WCAG failures across 7 routes ×
  2 widths**, no horizontal scroll.
- **2026-08-07 — GREEN GROUND (§1.2c). Cream is now the panel, not the page.**
  Triggered by "why is the website on GitHub this design but our local
  different?" — the answer was a **stale deploy** (see §7), and the comparison
  settled the direction: the pre-redesign scaffold's green page was preferred
  over Phase A's cream page. So the ground went green while everything else
  from the redesign stayed.
  - **Not a repeat of §1.2b.** That one failed as a *mid-tone flat field with
    content sitting straight on it*. This is a **deep** ground with **cream
    panels** under every dense text block. The distinction is written into
    §1.2b so the two are never conflated again.
  - **The green became a three-step ladder** — `--green-deep #143F32` (header,
    newsletter, footer, CTA) / `--green-surface #17543E` (page) / `--green
    #1B6E52` (accents, `.on-green-lift`). Split by contrast headroom, not by
    taste: only the first two have room for a muted ramp, so `.on-green-lift`
    is full cream with no fine print. Numbers in §2.1.
  - **The `:root` default flipped from cream to green**, which is the one thing
    that can bite a new section: a section with no `.on-*` class is now green,
    and **cream is what you have to ask for**. Everything holding small text got
    an explicit `.on-cream`: menu dish cards, Lunch Special, company value
    cards, press cards, the pho feature panel, and legal prose (new
    `.prose-panel`).
  - **Terracotta lost its last text role.** It is 1.89:1 on the green ground —
    the harvested folk art is drawn in that red, so Phase B now has to recolor
    the SVGs (`--sand`/`--cream`) or set them on cream panels. Flagged in Phase
    C sections 1 and 4, and in §5 Q1.
  - Scope: `src/app.css` tokens + surface classes, ~10 class swaps in markup,
    the hero curve's fill/stroke, `theme-color`. **No layout and no component
    logic changed** — the third time the color contract has paid for itself.
  - Re-verified: build clean, **0 contrast failures across 7 routes × 2 widths**,
    no horizontal scroll. (`verify.py` prints FAIL for `notoSC` on every route
    and `playfair900i` on home — both are the known false positives its own
    docstring describes: the CJK probe can't detect a width-identical swap, and
    an unused italic is correctly never fetched.)
  - ⚠️ `verify.py` writes into `screenshots/phaseA/` unconditionally, so its
    captures are now the **green-ground** state, not Phase A's cream. The cream
    originals are still in git at `a4bc657` (`git show a4bc657:docs/assets/…`).
    Rename the output dir per phase if that record ever matters.

- **2026-08-07 — PHASE B SHIPPED: brand assets.** 16 harvested SVGs optimized
  into themed art, the real logo lockups in place of the hand-drawn interim
  mark, and the photo question settled by measurement. Build clean, **0 contrast
  failures across 7 routes × 2 widths**, no horizontal scroll. Full detail in
  **§2.2**; the five things worth carrying forward:
  1. **The harvested SVGs' inline colors are lies.** Wix overrides them with a
     scoped stylesheet whose selector needs a page ancestor the harvested file
     doesn't have, so a raw file renders its *source-art* colors, not what the
     site showed. `svgclean.py` resolves those rules first. Anyone re-harvesting
     anything from `source-html.tar.gz` needs to know this.
  2. **Arc flags broke the dish illustrations, silently.** Rounding path data
     with a plain number regex ate the `0`/`1` flags in `a` commands and turned
     three illustrations into brown blobs that still *looked* like valid SVG.
     Now there is a structural fingerprint check that aborts the build of any
     asset whose path structure changes. The general lesson: **an SVG that
     parses is not an SVG that renders** — the A/B render against the originals
     is what caught it, not the optimizer's own output size.
  3. **The folk-art recolor problem didn't exist.** Phase C had a task to
     recolor the animals off terracotta because of its 1.89:1 on green. Reading
     the actual geometry showed path 0 of each is a big cream silhouette and the
     red only ever sits on *that* — so they work unmodified on every surface.
     Worth generalizing: check what the artwork *is* before designing around
     what a color table says.
  4. **The photo import was already done.** The plan expected to gain the 18
     cut-out dish shots; a perceptual-hash diff showed all 31 existing files
     already *are* the harvested photos (distance ≤4 on every one), and the
     32nd harvest file is a byte-identical rename. Nothing imported, no
     filenames touched, no `content.js` churn. The only real win available was
     two interiors that broke the plan's own 1600px rule (4.3MB → 3.6MB).
  5. **The hero video is deliberately still there** and is now the elephant:
     **33MB of a 38MB deploy**. It is §5 Q3, it is still wired into the
     homepage, and `/company` already has its own harvested kitchen video — so
     the pair may be redundant, not just heavy. Not deleting a tracked,
     in-use, client-supplied asset on our own authority; **batch this with Q2
     before Phase C ships.**
  Also: `verify.py` now writes to `screenshots/phaseB/` — the `OUT_TAG` bump the
  previous session flagged, so Phase A's captures stop being relabelled. And a
  reusable contact-sheet mode (`svgclean.py --sheet`) renders every asset on all
  four surfaces at once; that is how the recolor was judged rather than guessed.
  **Next: Phase C — homepage restructure.** §5 still has 8 open client
  questions; Q2 (TT Nooks) and Q3 (hero video) are the two that should be
  answered before Phase C ships.

- **2026-08-07 — PHASE C SHIPPED: homepage restructure.** The homepage is now
  the original's section order on the green ground — intro (three columns,
  animals bleeding off both edges, photo slideshow), statement hero + three phở
  cards on `--green-deep`, Lunch Special, type marquee, interior grid, Find Us,
  charcoal drinks collage, and a footer carrying the newsletter panel and the
  arc. Build clean, **0 contrast failures across 7 routes × 2 widths, no
  horizontal scroll** (`verify.py`, `OUT_TAG="phaseC"`). Full detail in **§2.3**;
  the six things worth carrying forward:
  1. **The arc's colour problem was real, and the plan's own fallback was the
     wrong fix.** `--green-deep` on `--green-surface` is one ladder step and
     reads as nothing; swapping in `--green` would have broken the "the circle
     IS the footer" reading. A **2px `--sand-3` hairline** solves it and echoes
     the hero curve. Generalisable: when two surfaces are deliberately close,
     define the shape with a line, not by pulling them apart.
  2. **A signature effect can need the section above it.** The arc only reads as
     *rising* because charcoal sits directly on the footer, so our Find Us strip
     went **above** the drinks band rather than below. Section order turned out
     to be a motion decision, not just an editorial one.
  3. **Playfair costs one line of the type scale.** "WARM MEMORIES" needs 1432px
     at the measured 157.5px against a 1368px container, so the drinks headline
     broke to four lines where the original breaks to three. Shaved to 90%.
     The measured scale is right; the *substitute* is 9% wide. Worth re-checking
     every 157.5px headline if TT Nooks ever lands (§5 Q2).
  4. **The homepage's animals needed exactly the zero work Phase B predicted.**
     Rooster, buffalo and pig went in as plain `<img>` at their harvested colours
     and read correctly on the green ground first try.
  5. **Q3 answered itself.** Dropping the hero video per Phase C's default left
     33MB tracked and referenced by nothing, so the question stopped being
     "does the design need it" and became "does the repo keep it".
  6. **/menu's closing band now fights the arc** — its wedges read inverted
     because that page ends on `--green-deep` rather than the ground. Phase D
     fixes it for free by giving /menu the charcoal drinks strip (§2.3).
  Also: the newsletter moved into `Footer.svelte`, so it (and `#newsletter`) is
  on every route; `PHO_FAVORITES` resolves against `MENU` instead of restating
  it; and the navbar is a three-zone grid so the logo is centred on the page.
  **Next: Phase C2 — the motion layer.** §5 still has 8 open client questions;
  **Q2 (TT Nooks) now has a measurable cost attached** (item 3 above) and Q4
  (BLOG vs PRESS) is the only thing still blocking the header.
- **2026-08-07 — PHASE C AMENDED: five sections are OURS and stay (new §2.4).**
  Client on the first Phase C build: *"you made the design almost entirely a
  100% copy from original site. We should keep some good design we have."*
  Specifically the **video hero**, the **sliding dish cards** under it, and the
  **feature rows** (phở + drinks). All three restored; the three-column intro
  stays underneath the hero rather than being replaced by it (client's choice
  of three offered options). The homepage is now 11 sections — §2.3 has the
  order, **§2.4 is the binding keep list**.
  - **The real correction is to the brief, not to the layout.** The goal was
    always "the original's layout, typography and motion carrying the brand's
    own colour" — Phase C drifted into "reproduce the original", which is a
    different and worse goal, because it silently deletes anything the original
    happens not to have. §2.4 now states the rule and lists what it protects.
  - **Two instructions elsewhere in this plan were actively dangerous** and are
    now cancelled in place: Phase C §4 said "retire the rAF photo marquee" and
    C2's M1 repeated it. They were written when the type band was assumed to
    *replace* the carousel. It doesn't — they are different sections (2 and 8)
    and both ship. Generalisable: a task phrased as "replace X with Y" should
    say what happens if the client wants both.
  - **The page reads better for it.** Video hero → dish carousel → folk-art
    intro gives an opening the original doesn't have, and the hero's sand
    hairline curve now rhymes with the footer arc, so the page opens and closes
    on the same shape. That was accidental and is worth keeping.
  - **Two drinks moments now coexist** — the charcoal feature row (product, $6,
    order CTA) at section 7 and the charcoal collage (mood) at section 11. Four
    sections apart and visually unalike. If it ever reads as repetition the fix
    is `.on-green-lift` on the row, not deletion (§2.3).
  - **`.on-media` and the 0.55 scrim are live again**, as is the hero video's
    reduced-motion `pause()`. Motion is no longer zero: the rAF carousel and the
    scroll-arrow bob both ship, both guarded.
  - One h1 on the page, confirmed: the hero's statement type is a `<p>` and the
    intro's SEO line is the h1 — which is exactly what the original does too.
  Re-verified after the restore: build clean, **0 contrast failures across 7
  routes × 2 widths, no horizontal scroll**, and the footer arc still rises out
  of the charcoal band.

- **2026-08-07 — THE SWAP (§1.2d): cream ground, green accent, terracotta
  third.** Client: *"swap colors… light beige as theme/background, green as
  accent… and add a third colour, their branding orange from the original site
  and logo."* Done as a token-and-surface-class change again — **no layout, no
  component logic**. Build clean, **0 contrast failures across 7 routes × 2
  widths, no horizontal scroll** (`verify.py`, `OUT_TAG="swap"`), every claim
  below re-checked at a real 1440×900 viewport with `cdp.py`. Full palette in
  **§1.2d**; six things worth carrying forward:
  1. **A third colour needs a *rule*, not a slot.** Terracotta measures 3.88:1
     on cream — enough for large text and fills, not for body copy — so it got
     the rule **"green speaks, terracotta draws"**: green takes everything that
     is text or interaction, terracotta takes everything that is a graphic
     (logo, folk art, badges, ovals, the two arc hairlines, display headings).
     One sentence, derived from one measurement, that a future session can apply
     without re-reading the contrast table.
  2. **Three tokens, not thirty placements.** `--warm` (display/fill),
     `--warm-ink` (small text → rust), `--mark` (the logo). `--mark` set once in
     `Logo.svelte` is why the navbar now matches the client's actual artwork —
     red on cream — while the footer lockup stays cream on green.
  3. **The artwork got better for free, again.** The animals are drawn as cream
     bodies with terracotta line-work; on cream the body disappears and they
     read as the original's pure red line-art. Same for the marquee (black type,
     red animals) and the dish cut-outs, whose `#F1EAD7` backdrop composites
     invisibly into `--cream`. This is the second time reading what the artwork
     *is* beat designing around what the colour table says (cf. §2.2 item 3).
  4. **The footer arc's hairline changed job, not just colour.** On green it
     existed so a one-ladder-step dome would read at all; on cream the dome
     separates by itself, so the ring is now purely a brand line — terracotta,
     echoing the original's red arc and rhyming with the hero curve. The seam
     is charcoal → cream wedges → green dome + red ring: three values where it
     used to be two.
  5. **`verify.py` had a blind spot that only cream exposed.** Its ancestor walk
     ran past the deliberately-transparent footer (the `.arc` sibling paints it)
     and reported **18 bogus 1:1 failures per route** the moment the ground went
     cream — it had been silently measuring the wrong box all along and only
     passing by luck. Fixed by trusting a declared `--surface` when an `.on-*`
     element paints nothing, with `.on-media` excluded because a video is behind
     it. Confirmed against the real paint stack first (9.76:1, not 1:1) rather
     than assumed. **A DOM-walking checker cannot see a sibling that paints.**
  6. **A cream panel on a cream page is not a panel.** Most cards already
     painted their own `--cream-lift` + `--rule`, so they survived untouched;
     the Lunch Special did not and needed the same treatment. Worth checking
     first whenever the ground moves.
  Also: `theme-color` is cream (the tag the client notices first), the phở
  feature row went `.on-green` so the accent owns a block in the upper half of
  the page, and the intro's red heading carries a **20px clamp floor** so
  terracotta stays inside WCAG large text at 540px. `.on-terracotta` is
  deliberately unused but kept — it is the statement hero's option if the client
  wants more orange (§5 Q1). **Next: still Phase C2 — the motion layer**, which
  the swap did not touch.

- **2026-08-07 — HOMEPAGE TRIM: the Lunch Special section and the Signature
  Drinks row removed.** Client, looking at the phở feature row: *"remove the
  Lunch Special box and Signature Drinks box, so just keep On the Menu · 河粉 —
  but the right side should have a bg color so it doesn't blend into the
  background."* Homepage is now **9 sections** (§2.3). Build clean, **0 contrast
  failures across 7 routes × 2 widths, no horizontal scroll**; the row checked at
  1440 and 540.
  1. **The media half's problem was not a missing background — it was a baked-in
     one.** The dish photos are JPGs carrying the studio's cream backdrop
     (~`#F1EAD7`, a hair off `--cream`), and the `<img>` is `object-fit: cover`,
     so *any* background the container painted was covered up. Setting a colour
     would have looked like it did nothing. **`mix-blend-mode: multiply` over a
     `--sand` fill** is what actually removes the backdrop, and it degrades to
     the previous appearance where unsupported. Available to all 31 harvested
     photos — worth remembering for Phase D.
  2. **Diagnose before styling.** The obvious fix (add `background`) was already
     in the CSS and had been for two phases; it read as correct and did nothing.
     Reading the actual JPG and the `object-fit` value took a minute and changed
     the whole approach.
  3. **§2.4 was rewritten from a roster into a reason.** It said "these five
     sections stay" and two of the five have now been removed *by the same
     client who asked for them*. The list protects against deleting our work to
     "match the original" — it was never a promise that any section is
     permanent. It now records removed sections with their status so a future
     session doesn't "restore" them.
  4. **`LunchSpecial.svelte` was NOT deleted** — it still ships on `/menu`, which
     is arguably where a menu offer belongs. Only the homepage section went.
  Also swept with it: the now-dead `.feature--reverse` rules (with a note on how
  to bring them back), the unused `LunchSpecial` import, and the section
  numbering in both the markup and the CSS comments.

- **2026-08-07 — INTRO SECTION REMOVED; its copy is now the hero.** Client:
  *"remove Authentic Vietnamese Restaurant in Flushing, Queens section… use its
  text to replace the current hero text."* Confirmed the scope first (the block
  also held the folk animals and the slideshow, so the two readings were very
  different pages) — the answer was the **whole** section. Homepage is **8
  sections**. Build clean, **0 contrast failures across 7 routes × 2 widths, no
  horizontal scroll**.
  1. **Deleting a section moved the `<h1>`.** The intro's SEO line was the page's
     only heading, and the hero headline was a `<p>` *precisely because* of it.
     With the intro gone the hero headline became the real `<h1>` carrying
     `INTRO_SEO.h1`. Verified exactly one h1. **Check heading structure whenever
     a section is deleted** — it is the least visible thing that breaks.
  2. **The headline changed job, so it needed a new size.** It went from a
     4-word brand line ("phở, the new era", `--fs-xl`/105px) to a 50-character
     SEO sentence. At 105px that sets three lines and swallows the hero, and the
     measured scale has no step between 36 and 105 — so `.hero-title` got its
     own clamp, **measured** to break at two lines (63.2px at 1440, 28px at 540).
     Second time a substitute-font/copy fit has forced an off-scale size; cf. the
     drinks headline's 0.9 shave (§2.3).
  3. **The eyebrow had to change too.** "Tangram Food Hall · Flushing, Queens"
     above an h1 and a blurb that both end "in Flushing, Queens" said it three
     times in three lines. Now "Tangram Food Hall · Stall FH17" — more useful,
     no repetition. Flagged to the client as an unrequested tidy.
  4. ⚠️ **§1.5 M4 and M6 are dead** — the animal parallax and the intro
     slideshow had no section left to live in. Phase C2 is now M1/M2/M3/M5.
     Marked in place rather than deleted, since the measurements stay valid if
     the animals ever get a section again.
  5. **A leaked headless Chrome invalidated an audit, silently** — see the
     warning in §4. `cdp.py`'s fixed debug port let a crashed run's 540px
     browser hijack the "desktop" pass. Now fixed with
     `Emulation.setDeviceMetricsOverride` and reproduced to confirm. **The
     lesson is about trust: a checker that reports confident numbers from the
     wrong viewport is worse than one that crashes.**
  Swept with it: the intro's markup, its entire CSS block (~165 lines: grid,
  animals, slideshow, arrows), the `slides`/`slide`/`move()` state, the now-unused
  `TAGLINE` / `AN_NAO` / `KITCHEN` imports (the exports stay — `AN_NAO` is still
  used on /menu), and section renumbering in markup and CSS.

## 7. Deploy state — the live Pages site is NOT the current build

Found 2026-08-07 while answering "why does GitHub look different from local?".
It is worth keeping until the first successful deploy of a post-Phase-A commit,
because it makes the live site misleading as a reference.

- `https://mikejin01.github.io/NonlaExpress/` serves commit **68ad303**, the
  **pre-Phase-A scaffold** — dark green `#2b584a`, Fraunces/Montserrat/Bitter/
  Chewy. Confirmed by fetching its CSS bundle, not by eye.
- The repo has had exactly **one** Actions run ever (`31127033830`, for 68ad303).
  `330c73d` (Phase A) and `a4bc657` were pushed and are on `origin/main`, but
  **never triggered a workflow run**, so they have never been built or deployed.
  The deploy of that one old run only landed on 2026-08-07T13:30 — the run sat
  from 2026-08-06T19:39 until then, which points at the `github-pages`
  environment / Pages enablement rather than at the workflow file.
- Practical consequence: **do not use the live site to judge our design.**
  Judge from `pnpm preview` + `scripts/cdp.py`. Re-check `gh run list` after the
  next push; if it is still empty, trigger `gh workflow run deploy.yml` (the PAT
  gained Actions write on 2026-08-07) and check whether push events start
  firing on their own.
