# Asset map — docs/assets originals → static/assets/images

Identified 2026-08-06 while scaffolding Phase 6. Web renditions were resized
(long edge shown) and saved at JPEG q82 progressive. Re-export from the
originals here if larger sizes are ever needed.

**2026-08-21: the Wix-harvest dish photos are RETIRED from /menu.** The owner
delivered in-situ re-shoots of every Noodle and Main dish (same wood-table
style as the 2026-08-20 batch), so the harvested cut-outs' last menu duties
ended. The harvest files below are the ones that still ship; the removed ones
are listed at the end of this section.

| Original (docs/assets/ac2bd4_…) | Web file | Content | Edge |
|---|---|---|---|
| 110f47… | spring-roll.jpg | Spring rolls + nuoc cham — **homepage carousel only** since 2026-08-20 | 800 |
| aabea5… | wings.jpg | Lemongrass wings — **homepage carousel only** since 2026-08-20 | 800 |
| 12e20a… | pho-special.jpg | #3 Phở special — **homepage carousel only** since 2026-08-21 (was menu-pho-special.jpg) | 800 |
| 9e4520… | rice-vermicelli-bowl.jpg | #10 Vermicelli bowl — **homepage carousel only** since 2026-08-21 (was menu-rice-vermicelli-bowl.jpg) | 800 |
| b8fa86… | shaking-beef-rice.jpg | #6 Shaking beef — **homepage carousel only** since 2026-08-21 (was menu-shaking-beef-rice.jpg) | 800 |
| 6a3a39… | pho-bowl-tall.jpg | Rare beef pho, portrait — homepage feature row | 1000 |
| 8fad58… | menu-vietnamese-iced-coffee.jpg | Vietnamese iced coffee (cup logo) | 800 |
| b098fd… | menu-salted-limeade.jpg | Salted limeade | 800 |
| ed6864… | menu-sugarcane-juice.jpg | Sugarcane juice | 800 |
| eb8c17… | drinks-trio.jpg | Drinks trio on marble | 1350 |
| cfd816… | interior-hat-wide.jpg | **Hero** — neon hat sign wall + lanterns | 2560 |
| 4799a7… | interior-murals-wide.jpg | Dining room, murals (lợn gà bò) | 2560 |
| 3d6417… | interior-entrance.jpg | Entrance + ORDER kiosk, wide | 1600 |
| 2e52a0… | interior-tables-tall.jpg | Tables + banquettes, portrait | 1600 |
| dce67a… | interior-dining-tall.jpg | Dining + hat pendant, portrait | 1600 |
| 7ef47b… | interior-kiosk-tall.jpg | ORDER kiosk, portrait | 1600 |
| c61db6… | interior-drink-station.jpg | Drink station (coffee/sugarcane/limeade dispensers) | 1600 |
| ba43e4… | lifestyle-bw.jpg | B&W people eating pho (company hero) | 1600 |
| 62fdc0… | merch-stickers.jpg | Zodiac stickers + coffee tin on orange | 1400 |

**Removed in the 2026-08-21 cleanup** (recoverable from git history; the
docs/assets originals still hold every harvest master): seven of the ten
`menu-*.jpg` noodle/main renditions (superseded by the owner re-shoot below —
the other three survive un-prefixed as homepage-carousel cut-outs, rows above),
plus `summer-roll.jpg`, `viet-salad.jpg` (unused since 2026-08-20),
`squid-game.jpg` (its dish left the menu 2026-08-11), `pho-ga-tall.jpg` and
`lemongrass-beef-bowl.jpg` (never referenced).

## Client-shot photos (not from the Wix harvest)

In-situ plates on the stall's wood table, masters in `docs/assets/image-source/`
(gitignored, named `<web-name>-master.avif`). These do **not** sit on the
`#F1EAD7` studio backdrop the harvested cut-outs used, so they read as
photographic rectangles rather than floating cut-outs. Since 2026-08-21 that
covers **Appetizer, Burger, Noodle AND Main** — on /menu only the Drinks
section still runs harvested cut-outs.

Two deliveries: 2026-08-20 (appetizers, burgers, sauces) and 2026-08-21
(all five noodles + all five mains; the same drop re-sent the 08-20 files
byte-identical, so only the ten dishes were actually new). New renditions are
1200×900 AVIF encoded with ffmpeg/SVT-AV1 crf 30 from ~5400×3600 masters,
center-cropped 3:2 → 4:3.

| Web file | Content |
|---|---|
| menu-appetizer-spring-roll.avif | Spring rolls + nuoc cham |
| menu-appetizer-summer-roll.avif | Summer rolls + peanut dip |
| menu-appetizer-lemongrass-chicken-wings.avif | Lemongrass wings in yellow dish |
| menu-appetizer-viet-salad-with-ginger-sauce.avif | Viet salad + lime |
| menu-burger-smoked-paprika-chicken-burger.avif | Chicken burger + fries |
| menu-burger-lemongrass-pork-tenderloin-burger.avif | Pork burger + fries |
| menu-noodle-fresh-phoenix-chicken-pho.avif | #1 Chicken pho |
| menu-noodle-rare-eye-round-beef-pho.avif | #2 Rare eye round pho |
| menu-noodle-pho-special.avif | #3 Phở special |
| menu-noodle-pho-and-grilled.avif | #4 Pho & grilled |
| menu-noodle-spicy-pho.avif | #5 Spicy pho |
| menu-main-shaking-beef-rice.avif | #6 Shaking beef rice |
| menu-main-smoked-paprika-chicken-rice.avif | #7 Paprika chicken rice |
| menu-main-pork-chop-rice.avif | #8 Pork chop rice |
| menu-main-lemongrass-beef-rice.avif | #9 Lemongrass beef rice |
| menu-main-rice-vermicelli-bowl.avif | #10 Rice vermicelli bowl |
| menu-sauce-ketchup.avif | Ketchup, top-down, 800×800 |
| menu-sauce-mayonnaise.avif | Mayonnaise, top-down, 800×800 |
| menu-sauce-spicy-mayo.avif | Spicy mayo, top-down, 800×800 |
| menu-sauce-cilantro-cream.avif | Cilantro cream, top-down, 800×800 |

The four sauces are **square and centred on the bowl** because /menu crops them
to circles in place of its hand-coded colour dots. `head-image-master.avif` (a
hero-style spread) remains parked unused at client direction — no menu item
corresponds to it.

⚠️ `menu-sauce-cilantro-cream-master` is a **Photoshop document** that arrived
with an `.avif` extension (118MB); it is stored as `.psd` and ffmpeg cannot
decode it — route it through `sips -s format png` first if it is ever
re-cropped. (The 2026-08-21 drop re-sent the same PSD under the same disguise;
it was discarded as a byte-identical duplicate.)

## Platform photos (2026-08-21 menu sync)

Pulled from the ordering platforms for the items added in the menu sync —
UberEats first, Snackpass where UberEats had none or only a text-heavy poster.
**Not client deliveries**: several are crops out of the client's own marketing
posters (baked-in titles/prices removed), so treat them as placeholders the
client may re-shoot. Shots that came on pure white were multiplied by `--cream`
(#F0EAD6) offline — the same trick the homepage feature row does in CSS — so
they sit on the cream page without a white box.

| Web file | Source | Note |
|---|---|---|
| menu-fries.jpg | Snackpass poster | food region cropped out; cream-multiplied |
| menu-frozen-spring-rolls.jpg | Snackpass poster | food band cropped out |
| menu-bun-bo-hue.jpg | UberEats | top-down bowl on wood, matches client in-situ style |
| menu-lemongrass-chicken-rice.jpg | UberEats | tray on near-cream ground |
| menu-thai-green-milk-tea.jpg | UberEats | cup on white; cream-multiplied |
| menu-combo-for-1.jpg | UberEats | studio shot on near-cream ground |
| menu-all-day-combo-for-2.jpg | Snackpass poster | food region cropped out (UberEats copy had a baked "$49") |
| menu-vietnamese-burger-fries-combo.jpg | UberEats card | food region cropped off the terracotta promo card |
| menu-nonla-tote-bag.jpg | UberEats | supplier shot; measurement arrow cropped off; cream-multiplied |
| menu-cafe-du-monde-coffee.jpg | UberEats | tin on white; cream-multiplied |
| menu-digital-gift-card.png | Snackpass | ⚠️ Snackpass's stock blue card art, not Nón Lá art — off-palette, swap when the client supplies one |

⚠️ The Phở Special Combo (火车头套餐) has **no photo on either platform**, so at
client direction it **reuses `menu-all-day-combo-for-2.jpg`** — the only image
on the site used by two items, which means that photo appears twice in the All
Day Combo section. Swap it as soon as a real shot exists; don't read the repeat
as a design choice.

## Client-added extras photos (2026-08-21)

Dropped into `static/assets/images/` by the client under display names
(`menu-Soda 汽水.avif` etc.) and renamed here to the flat `menu-<item>` scheme —
flat, not `menu-<category>-<item>`, because these are product/platform shots
rather than owner-shot dish photography. All five arrived **opaque on pure
white** with no alpha, so each was multiplied to `--cream` (#F0EAD6) offline;
corner pixels now measure `#efead6`, i.e. they composite invisibly on the page.

| Web file | Was | Content |
|---|---|---|
| menu-soda.avif | `menu-Soda 汽水.avif` | Diet Coke can, 228×220 → 472×456 |
| menu-bottled-water.avif | `menu-Bottled Water 瓶装水 .avif` | Poland Spring bottle, 220×220 → 456×456 |
| menu-sparkling-water.avif | `menu-Sparkling Water 苏打水.avif` | Perrier bottle, 198×220 → 412×456 |
| menu-extra-protein-lemongrass-chicken.avif | `…Chicken 香茅鸡扒.webp` | Grilled chicken plate, 719×440 |
| menu-extra-protein-lemongrass-pork-chop.avif | `…pork chop 香茅猪扒.webp` | Grilled pork chop plate, 719×440 |

The two `.webp` files became `.avif` because this machine's ffmpeg has no
`libwebp` encoder; AVIF also matches the rest of the owner-shot set.

These five render as **ordinary grid cards**, same as every other menu item
(client direction 2026-08-21, after an 80px-thumbnail treatment was tried and
rejected as looking like an afterthought). That retired the `extras` concept
entirely: `content.js` no longer has an `extras` array and /menu no longer has
any `.extras-*` markup or CSS — the five are just items, placed last in their
sections so the dishes still lead.

⚠️ **The three beverages are the softest images on the site and there is no
fixing that here.** They were ~220px originals against ~1200px dish
photography. They are pre-upscaled 2× with lanczos + a light unsharp so the
browser *downscales* into the ~430px cell instead of upscaling, but the detail
ceiling is still the 220px original. **Ask the client for larger files.**

⚠️ Two encoding traps hit while preparing them, both worth knowing before
touching these files again:
1. **`unsharp` leaves a dark halo on the image border** — it sampled past the
   edge and produced a ~6px `#e8e4cf` fringe that rendered as a visible dark
   line down each card on the cream page. Fixed by cropping 8px off every edge
   after sharpening and padding back with exact `0xF0EAD6`.
2. **Don't trust `ffmpeg`'s own decode when checking a flat background colour.**
   Sampling these AVIFs with ffmpeg reported `#eee9d4` (2 levels off) and, with
   `-color_range pc`, `#dfdac8` (17 off) — yet the *browser* renders them at
   `#f0ebd6`, one level off `--cream` in green alone and invisible. Measure the
   seam in the rendered page (screenshot + pixel sample), not in the file.

## Naming convention

Menu item images are `menu-…`, in two generations:

- **Owner-shot dishes (2026-08-20/21 batches): `menu-<category>-<item>.avif`**,
  where category is the menu section (`appetizer`, `burger`, `noodle`, `main`)
  and item is the English name in `src/lib/content.js` kebab-cased. Sauces were
  already `menu-sauce-<name>` — the scheme generalizes that precedent.
- **Everything else (drinks, platform pulls): `menu-<item>.<ext>`**, the
  pre-2026-08-21 flat scheme, kept because the owner batch didn't touch them.

Images used elsewhere — interiors, homepage-only carousel cut-outs, portraits —
keep their descriptive names and take no prefix.

`logo-original.png` (48px favicon) kept as reference only; site favicon is the
re-drawn SVG hat.

Note: the drink-station dispensers visibly include **Sugarcane Juice** —
supporting evidence that the web-only menu item is still current (§6 #7).
