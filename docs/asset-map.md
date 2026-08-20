# Asset map — docs/assets originals → static/assets/images

Identified 2026-08-06 while scaffolding Phase 6. Web renditions were resized
(long edge shown) and saved at JPEG q82 progressive. Re-export from the
originals here if larger sizes are ever needed.

| Original (docs/assets/ac2bd4_…) | Web file | Content | Edge |
|---|---|---|---|
| 061d8f… | menu-fresh-phoenix-chicken-pho.jpg | #1 Chicken pho, top-down | 800 |
| f45ae0… | pho-ga-tall.jpg | Chicken pho, portrait | 1000 |
| 5a3830… | menu-rare-eye-round-beef-pho.jpg | #2 Rare eye round pho | 800 |
| 12e20a… | menu-pho-special.jpg | #3 Phở special | 800 |
| 147a07… | menu-pho-and-grilled.jpg | #4 Pho & grilled | 800 |
| 5d27ad… | menu-spicy-pho.jpg | #5 Spicy pho | 800 |
| 6a3a39… | pho-bowl-tall.jpg | Rare beef pho, portrait | 1000 |
| 110f47… | spring-roll.jpg | Spring rolls + nuoc cham — **homepage carousel only** since 2026-08-20 | 800 |
| 5fe751… | summer-roll.jpg | Summer rolls + peanut dip — **unused** since 2026-08-20 | 800 |
| aabea5… | wings.jpg | Lemongrass wings — **homepage carousel only** since 2026-08-20 | 800 |
| 982ef9… | squid-game.jpg | Squid patties + ginger dip | 800 |
| e62e72… | viet-salad.jpg | Viet salad — **unused** since 2026-08-20 | 800 |
| b8fa86… | menu-shaking-beef-rice.jpg | #6 Shaking beef rice | 800 |
| 901aed… | menu-smoked-paprika-chicken-rice.jpg | #7 Paprika chicken rice | 800 |
| cc6127… | menu-pork-chop-rice.jpg | #8 Pork chop rice | 800 |
| fe065d… | menu-lemongrass-beef-rice.jpg | #9 Lemongrass beef rice | 800 |
| ecd2d9… | lemongrass-beef-bowl.jpg | Lemongrass beef bowl, portrait | 1000 |
| 9e4520… | menu-rice-vermicelli-bowl.jpg | #10 Rice vermicelli bowl | 800 |
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

## Client-shot photos (not from the Wix harvest)

In-situ plates on the stall's wood table, masters in `docs/assets/image-source/`
(gitignored). These do **not** sit on the `#F1EAD7` studio backdrop the harvested
cut-outs use, so they read as photographic rectangles rather than floating
cut-outs — see src/lib/content.js on the burger section.

| Web file | Content | Size |
|---|---|---|
| menu-smoked-paprika-chicken-burger.avif | Chicken burger + fries | 1200×900 |
| menu-lemongrass-pork-tenderloin-burger.avif | Pork burger + fries | 1200×900 |
| menu-spring-roll.avif | Spring rolls + nuoc cham | 1200×900 |
| menu-summer-roll.avif | Summer rolls + peanut dip | 1200×900 |
| menu-lemongrass-chicken-wings.avif | Lemongrass wings in yellow dish | 1200×900 |
| menu-viet-salad-with-ginger-sauce.avif | Viet salad + lime | 1200×900 |
| menu-sauce-ketchup.avif | Ketchup, top-down | 800×800 |
| menu-sauce-mayonnaise.avif | Mayonnaise, top-down | 800×800 |
| menu-sauce-spicy-mayo.avif | Spicy mayo, top-down | 800×800 |
| menu-sauce-cilantro-cream.avif | Cilantro cream, top-down | 800×800 |

The four sauces are **square and centred on the bowl** because /menu crops them
to circles in place of its hand-coded colour dots. `head-image-master.avif` (a
hero-style spread) was delivered in the same batch and is parked unused at
client direction — no menu item corresponds to it.

⚠️ `menu-sauce-cilantro-cream-master` is a **Photoshop document** that arrived
with an `.avif` extension (118MB); it is stored as `.psd` and ffmpeg cannot
decode it — route it through `sips -s format png` first if it is ever re-cropped.

## Naming convention

Anything used as a **menu item image** is `menu-<dish-name-kebab-cased>`, matching
the item's English name in `src/lib/content.js` (sauces get `menu-sauce-<name>`).
Images used elsewhere — interiors, homepage-only carousel cut-outs, portraits —
keep their descriptive names and take no prefix.

Unused: `summer-roll.jpg` and `viet-salad.jpg` (superseded 2026-08-20). `logo-original.png` (48px favicon) kept
as reference only; site favicon is the re-drawn SVG hat.

Note: the drink-station dispensers visibly include **Sugarcane Juice** —
supporting evidence that the web-only menu item is still current (§6 #7).
