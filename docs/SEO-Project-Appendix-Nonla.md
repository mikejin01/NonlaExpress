# SEO Project Appendix — Nón Lá Express (www.nonlaexpress.com)

Project-specific companion to the shared `SEO-PAGE-OPTIMIZATION-PLAYBOOK.md` and
`SEO-SITE-PERFORMANCE-CHECK.md` (both symlinks — never write Nonla facts into them).
Property IDs are canonical in the repo's `CLAUDE.md`. This file records **how to
work on this site** and **the dated measurements**, so each check can be compared to
the last.

---

## 1. Project facts (playbook template)

| Item | Value |
|---|---|
| Platform / theme model | Custom WP theme `nonla-express` = a **client-only SvelteKit SPA** (`WP_BUILD=1`). Pages (`/`, `/menu/`, `/company/`, `/blog/`) serve an HTML **shell with no body text and no `<a href>` links** — everything renders in JS. **Single posts are the exception**: since 2026-09-25 `index.php` prints the article server-side (`[data-ssr-post]`) and the app removes it on mount. |
| Where page copy lives | `src/lib/content.js` defaults ← `content-overrides.json` ← **WP DB overrides (win)**. Blog posts: normal WP `post_content` (rendered via `xo/v1/posts`). |
| SEO plugin | Yoast (indexables table prefix `tns_`). Page `<title>`/meta come from Yoast — edit meta + delete the `tns_yoast_indexable` row (memory: wp-import-yoast-indexables). |
| Playbook Phase 6 (scoring copy) | Pages: theme never renders `post_content` → scoring copy is safe **for pages only**. **Posts render `the_content()`** — never put a scoring copy in a post. |
| Access method | SSH via the Makefile (`.live-sites/nonla.mk`, gitignored; SiteGround port 18765, key `~/.ssh/siteground`). `make test-connection`. |
| Deploy command + what it ships | `make build-and-push` = WP build of the **working tree** → rsync `wordpress-theme/` → purge. A git push deploys only GitHub Pages, not WordPress. |
| Content-edit gate | `make check-content-drift` before touching `content.js` (CLAUDE.md content sync rule). Clean on 2026-09-25 (9 keys). |
| Cache purge | `make purge-cache` (`wp cache flush` + `wp sg purge`). |
| HTML freshness headers | ✅ `Cache-Control: no-cache, must-revalidate, max-age=0` on `/`, `/menu/`, `/blog/<slug>/` — verified 2026-09-25 with curl. |
| Keyword research source | `us` (SE Ranking US DB). ⚠️ **No volume for any Chinese term** — judge Chinese keywords on GSC impressions. |
| Rank tracking project | SE Ranking `site_id` **12978512**, engine **1334596** (Google US, Flushing NY). Created 2026-09-25; first position check was still running (55%) at the first check. |
| GA4 | Property **527598938** — Viewer, verified 2026-09-25. |
| GSC | `https://www.nonlaexpress.com/` (URL-prefix, Restricted). `python3 scripts/gsc-pull.py query nonla …` (ported from the iDeal repo 2026-09-25). URL Inspection works via the same service account. |
| Online ordering (outbound CTA) | `https://order.snackpass.co/67be450e8c2c2460a8b96002` |

### Measurement traps specific to this site

- **Inspect Chinese URLs with UPPERCASE percent-encoding (or raw Unicode).** Yoast's
  sitemap emits lowercase `%e6…`; the URL Inspection API reports those as *"URL is
  unknown to Google"* while the same URL in `%E6…` form is *"Submitted and indexed."*
  Measured 2026-09-25 on all 11 Chinese posts. A lowercase inspection is not a finding.
- **Old `/post/…` URLs still draw impressions** in GSC after the 2026-09-04 cutover
  (they 301 to `/blog/…`). Sum `/post/X` + `/blog/X` when judging a post.
- `/menu` and `/menu/` are separate rows in both GA4 and GSC — sum them.
- **Brand-sitelink rows look like CTR leaks and aren't.** `/company` and
  `/post/best-pho-in-flushing-queens` show 0 clicks at position ~2 — those are
  sitelinks under brand queries ("nonla express"), not ranking pages.
- The live Flushing SERP (`DATA_getSerpResults`, location_id **61907**) takes ~4 min
  per query and returned only the first query of a 4-query batch. Send one query per call.
- `DATA_*` hits `429` after ~6 quick calls — space them out.
- **SiteGround's bot challenge answers curl from our office IP with `202` + a
  `/.well-known/sgcaptcha/` meta-refresh** (seen 2026-10-13, any UA — Googlebot UA too, since SG
  verifies Googlebot by reverse DNS). Not a site defect: URL Inspection fetches fine. Verify served
  HTML **from the server itself** (`curl` inside the SSH session gets a real 200) or in real Chrome.
- **The SE Ranking API key is shared agency-wide** and its 25,000 monthly credits ran out
  before 2026-10-13 (balance resets on the 17th). At 0 credits **every** call 402s — the PROJECT
  rank-tracker reads too, not only `DATA_*` research.

---

## 2. Check log

### 2026-09-25 — first full check (baseline)

**Windows.** GA4: **Sep 1–24 vs Aug 8–31** (24 complete days each — user's rule:
month-to-date vs the equal-length window immediately before the 1st). GSC lags, last
data 09-23: **Sep 1–23 vs Aug 9–31**. ⚠️ The prior window is almost entirely **Wix-era**
(cutover 2026-09-04), so this compares two different sites.

| Metric | Prior | Current | Δ | Verdict |
|---|---:|---:|---:|---|
| GA4 sessions (all) | 224 | 204 | −8.9% | flat |
| GA4 active users (all) | 179 | 161 | −10.1% | dropping (edge of band) |
| GA4 engaged sessions | 134 | 97 | −27.6% | dropping |
| GA4 engagement rate | 59.8% | 47.5% | −12.3 pt | dropping |
| GA4 **organic** sessions | 142 | 93 | −34.5% | dropping |
| GA4 organic sessions **ex-outlier*** | 98 | 80 | −18.4% | dropping |
| GA4 organic active users | 119 | 70 | −41.2% | dropping |
| GA4 direct sessions | 56 | 94 | +67.9% | growing (31 engaged — low quality) |
| GSC clicks | 132 | 96 | −27.3% | dropping |
| GSC clicks ex-outlier* (page-level) | 87 | 74 | −14.9% | dropping |
| GSC impressions | 3,812 | 2,818 | −26.1% | dropping |
| GSC impressions ex-outlier* (page-level) | 3,048 | 2,672 | −12.3% | dropping (mild) |
| GSC avg position | 10.3 | 10.1 | +0.2 | flat |
| SE Ranking tracked top-10 / visibility | — | 1 / 0.01% | — | baseline pending (first check running) |

\* Outlier = the Chinese Flushing food guide (法拉盛最佳美食地點…, `/post/` + `/blog/`):
44 → 13 organic sessions, 45 → 25 clicks, 1,523 → 773 impressions. It fell on
2026-09-14 (see CLAUDE.md); the SSR + `lang` fix shipped 2026-09-25.

Weekly GA4 sessions (ISO wk): 32: 78 · 33: 72 · 34: 77 · **35: 47** · 36: 57 · 37: 63 ·
38: 61. The dip began in the last week of August, before the cutover, and has been
recovering since.

**Index coverage 2026-09-25** (URL Inspection):

| URL | State | Last crawl |
|---|---|---|
| `/` | Submitted and indexed | 09-22 |
| `/menu/` | Submitted and indexed | 09-25 |
| `/company/` | **Discovered – not indexed** | never |
| `/blog/` | **Discovered – not indexed** | never |
| `/blog/best-pho-in-flushing-queens/` (post 18, the only English post) | **Discovered – not indexed** | never |
| 7 Chinese posts | Submitted and indexed | 09-14 → 09-25 |
| `/blog/正宗中國美食-你會愛上的美味中餐/` | Crawled – not indexed | 09-14 |
| `/blog/法拉盛non-la-越南河粉/`, `/blog/法拉盛的美味面条-最佳用餐地点/`, `/blog/法拉盛的美味米線/` | URL is unknown to Google | never |

**Root-cause finding.** The served HTML of `/`, `/menu/` and `/blog/` contains **zero
`<a href>` links** — Google can reach internal pages only from the sitemap or after a
JS render, which it queues at low priority on a domain with SE Ranking trust 3. That
fits exactly the pages stuck at "Discovered": the ones nothing links to in plain HTML.

**Head/schema defects found:**
- `/menu/` meta description still says **"pho ($17) … $6 signature drinks"** — prices were
  hidden on the page 2026-08-21 (§5 Q5), so the SERP snippet contradicts the page.
- Restaurant schema `openingHours` is `"Monday – Sunday\n11:00 AM – 10:00 PM"` (free
  text) — Google expects `Mo-Su 11:00-22:00` / `openingHoursSpecification`.
- Homepage title leads with the brand ("Nón Lá Express — Pho & Vietnamese Kitchen in
  Flushing, NY"); "Vietnamese restaurant" isn't in it, although it's the top local
  commercial term (`vietnamese restaurant flushing ny`, 390/mo, KD 4).

**Live local SERP** (`vietnamese restaurant flushing ny`, Google desktop, Flushing
geo, 2026-09-26 02:04 UTC): **nonlaexpress.com is not in the top 99 organic results.**
Our Seamless listing is #4; the top 3 are TripAdvisor, atly.com and DexKnows. (SE
Ranking's national DB puts us at #5–6 for the same term — so the local SERP is where
we're weakest.)

### 2026-10-13 — month-to-date check (PARTIAL: GA4 + GSC only)

**Sources.** GA4 ✅ · GSC ✅ · **SE Ranking ❌ — API credits exhausted** (`402 Insufficient
funds`, resets 2026-10-17). Run without it on the user's explicit instruction, so there is **no
tracker row and no competitor row** this cycle; keyword demand came from GSC queries instead.

**Windows.** GA4: **Oct 1–12 vs Sep 19–30** (12 complete days each — MTD vs the equal window
immediately before the 1st). GSC (last data 10-10): **Oct 1–10 vs Sep 21–30**. Both windows are
post-cutover, so unlike 09-25 this compares like with like.

| Metric | Prior | Current | Δ | Verdict |
|---|---:|---:|---:|---|
| GA4 sessions (all) | 116 | 138 | +19.0% | **growing** |
| GA4 active users (all) | 99 | 115 | +16.2% | **growing** |
| GA4 engaged sessions | 64 | 68 | +6.3% | flat |
| GA4 **organic** sessions | 44 | 78 | +77.3% | **growing** |
| GA4 organic active users | 33 | 59 | +78.8% | **growing** |
| GA4 organic engaged sessions | 29 | 47 | +62.1% | growing |
| GA4 organic sessions ex-outlier* | 42 | 60 | +42.9% | growing |
| GA4 direct sessions | 66 | 53 | −19.7% | dropping (engaged 32 → 17) |
| GSC clicks | 28 | 46 | +64.3% | growing |
| GSC clicks ex-outlier* | 26 | 33 | +26.9% | growing |
| GSC impressions | 1,127 | 1,863 | +65.3% | growing |
| GSC impressions ex-outlier* | 904 | 1,372 | +51.8% | growing |
| GSC avg position | 9.85 | 10.10 | −0.25 | flat |
| GSC CTR | 2.48% | 2.47% | 0 | flat |

\* Outlier = the Chinese Flushing food guide (post 32). It is **recovering**: 223 → 491
impressions, 2 → 13 clicks, GA4 organic 2 → 18 — the 09-25 SSR + `lang` fix is the likeliest
credit. Small-site rule applies: under 50 sessions in the prior window, so read direction, not %.

**What's growing and why.** Organic landing sessions on `/` were flat (34 → 35); the growth is
the Chinese guide (+16) and `/menu` (5 → 16, GA4 organic). Per-page GSC impressions: post 18
`/blog/best-pho-in-flushing-queens/` 50 → 246, `/company/` 50 → 193, `/blog/` 20 → 83, post 46
(rice) 10 → 74, post 50 (drinks) 4 → 14 — i.e. the pages that were "Discovered – not indexed" on
09-25 are now earning impressions.

**Index coverage 2026-10-13** (URL Inspection): `/company/`, `/blog/`, post 18, post 46, post 50
are all **Submitted and indexed** (crawled 09-26, the day after the crawlable-nav deploy;
`/company/` again 10-11). The 09-25 root-cause fix worked.

**Findings → actions.**
1. **CTR leak — post 18** (pho guide): 246 impressions at avg position ~9, **0 clicks**; queries
   `pho flushing` 23 @10.0, `best pho in queens` 11 @10.6, `pho in flushing` 9 @7.3, `vietnamese
   food flushing` 7 @12.6. Never optimized (no focus keyphrase). → Phase 3 + light Phase 4, done
   today (§6). It also still described "Ribeye Phở" / "Phở & Spice" with rare steak — the menu is
   Rare Eye Round Beef Pho and Spicy Pho (chicken / eye round). Fixed for truth.
2. **Coverage gap — Tangram**: `tangram mall restaurants` 22 @11.4, `food in tangram mall` 5,
   `tangram restaurants` 4, `restaurants in tangram mall` 3, `tangram mall food` 2 … ≈52
   impressions (vs ≈16 prior), **all landing on `/`**. → new post 55, done today (§5).
3. **Chinese demand is the biggest pool**: `法拉盛美食` 160 @12.2, `法拉盛餐厅推荐` 37 @15.8,
   `法拉盛美食攻略` 30 @7.0, `法拉盛美食推荐` 26 @7.9 — almost all on post 32. Left untouched while it
   recovers (a second Chinese guide would cannibalize it). Revisit after ~11-08.
4. `/menu/` draws `nón lá vietnamese kitchen menu` 22 @15.3 and `non la menu` 15 @7.5 with 0
   clicks — but its metadesc changed 09-25, inside the 4-week cadence guard. Revisit ≥ 10-23.
5. Direct sessions fell and their engagement halved (32 → 17 engaged). Not SEO; watch it.

---

## 3. Competitors (SE Ranking `DATA_*`, US DB)

> **2026-10-13: no competitor update** — SE Ranking credits exhausted (see §2). Re-pull the
> table below for Pho Hoang / Pho Metro after the 10-17 reset, plus `DATA_getDomainCompetitors`
> for anyone new; also check who holds `tangram mall restaurants` (post 55's target).

`DATA_getDomainCompetitors` returned 9 domains. Name-overlap matches were discarded
(`banhmiphoexpress.com` = Jacksonville FL, `nomnyc.com` = University Place deli,
`nonlacafeokc.com`, `ordernonlacafe.com`, `eatvietnamexpress.com`, `imperialpho.com`,
`photopnewyork.com`). The two real local competitors both **outrank us**:

### Tracking table (append a row per check)

| Date | Domain | Keywords | Est. traffic/mo† | Top 1–5 | Top 6–10 | Top 11–20 | Top 21–50 |
|---|---|---:|---:|---:|---:|---:|---:|
| 2026-09-25 | **nonlaexpress.com** (us) | 57 | 100 | 11 | 11 | 14 | 26 |
| 2026-09-25 | flushingphohoang.com (Pho Hoang) | 99 | 180 | 26 | 14 | 13 | 34 |
| 2026-09-25 | phometroflushing.com (Pho Metro) | 98 | 186 | 2 | 0 | 23 | 72 |

† SE Ranking's modeled estimate — use for relative comparison only, never as real visits.

### What they rank for

**Pho Hoang — flushingphohoang.com** (brand-heavy, strong local fundamentals)
| Keyword | Pos | Vol | KD |
|---|---:|---:|---:|
| pho hoang | 4 | 14,800 | 65 |
| pho hoang menu | 3 | 210 | 6 |
| vietnamese restaurant flushing ny | **10** | 390 | 4 |
| vietnamese restaurant in flushing ny | 13 | 390 | 9 |
| pho hoang near me | 3 | 110 | 6 |
| pho hoang hours | 1 | 20 | 4 |
| pho best flushing | 22 | 140 | 6 |
| vietnamese food flushing | 24 | 140 | 4 |

**Pho Metro — phometroflushing.com** (wins "near me / open now / hours" modifiers
with dedicated pages)
| Keyword | Pos | Vol | KD | URL |
|---|---:|---:|---:|---|
| pho near me open now | 18 | 14,800 | 62 | `/` |
| pho delivery | 16 | 1,000 | 47 | `/takeout-and-delivery/` |
| pho hours | 15 | 590 | 6 | `/` |
| the best pho near me | 27 | 590 | 13 | `/` |
| pho restaurants near me now | 24 | 390 | 16 | `/` |
| vietnamese restaurant flushing ny | 13 | 390 | 4 | `/` |
| pho metro menu | 3 | 210 | 6 | `/` + `/popular-dishes/` |
| pho late night near me | 28 | 140 | 9 | `/` |

**Who wins the head local SERP** (not in the DATA competitor list because they have
little site of their own): TripAdvisor, atly.com, DexKnows, Yelp, Seamless, Reddit,
Apple Maps; restaurant sites Pho Best II (`pho-best-ii.hey-restaurants.com`) and
Phở Bằng (`pho-bang.zoyaf.com`) — both thin ordering-platform microsites.

### Lessons

1. **Hours and "open now" are ranking content.** Pho Metro ranks for a cluster of
   `pho hours / open now / late night / near me now` terms with nothing more than hours
   in crawlable text. Our hours exist only in JS and in malformed schema.
2. **Dedicated intent pages win.** Pho Metro's `/takeout-and-delivery/` ranks #16 for
   `pho delivery` (1,000/mo). We have no crawlable ordering/delivery page.
3. **Directory citations carry the local SERP.** TripAdvisor/atly/DexKnows/Yelp hold
   the top of `vietnamese restaurant flushing ny`; getting listed and reviewed there is
   worth as much as on-site work.
4. Pho Hoang's `vietnamese restaurant flushing ny` #10 comes from a plain homepage that
   says "Vietnamese restaurant in Flushing" in crawlable text — which ours doesn't.

---

## 4. Keyword opportunities (SE Ranking US, 2026-09-25)

Low-difficulty terms we don't rank for, all matching real menu items (coverage gaps):

| Keyword | Vol | KD | Intent | Target |
|---|---:|---:|---|---|
| vietnamese rice plates | 590 | 12 | L/C | **new post** (drafted) |
| vietnamese rice plate / viet rice plate | 590 | 12 / 19 | I · L/C | new post |
| vietnamese rice dishes / vietnamese rice dish | 590 | 23 / 19 | I | new post |
| vietnamese rice bowl | 390 | 14 | L/C | new post |
| lemongrass beef | 760 | 9 | I | new post (Lemongrass Beef Rice) |
| vietnamese pork chop rice | 90 | 9 | L/C | new post |
| shaking beef / bo luc lac | 6,600 / 8,000 | 48 / 52 | I | new post (stretch) |
| most popular vietnamese food | 390 | 16 | I | future post |
| nuoc mia (sugarcane juice) | 920 | 12 | I | future drinks post |
| ca phe sua da | 810 | 28 | I | future drinks post |
| vietnamese iced coffee near me | 220 ↑ | 8 | L/C | future drinks post |
| sugarcane juice near me | 150 | 12 | L/C | future drinks post |
| lemongrass chicken wings | 170 | 10 | I | /menu or drinks+apps post |
| tangram flushing | 260 ↑ | 13 | L/N | homepage / Find Us copy |
| where to eat in flushing | 480 | 18 | L/C | future English Flushing guide |
| flushing restaurants | 660 | 19 | I | future English Flushing guide |
| pho queens | 320 | 8 | L/C | pho post 18 (once indexed) |
| vietnamese restaurant queens | 260 | 12 | L/C | homepage |
| vietnamese food queens | 170 | 12 | L/C | homepage |

Already ranking (SE Ranking DB): `vietnamese express` #1 (250), `vietnamese restaurant
in flushing ny` #5 (390), `vietnamese food flushing` #6 (140), `nonla` #4 (1,800),
`non la` #9 (3,200 — mostly the hat, ambiguous intent).

---

## 5. Content log

| Date | Post / page | Focus keyphrase | Status |
|---|---|---|---|
| 2026-07-29 | Post 18 `/blog/best-pho-in-flushing-queens/` | best pho in flushing | live — **not indexed as of 09-25** |
| 2026-09-25 | Post **46** `/blog/vietnamese-rice-plates-flushing/` (source: `docs/blog-drafts/vietnamese-rice-plates-flushing.html`) — featured img att. 44 (1200×630 shaking beef), inline att. 45 (lemongrass beef); category copied from post 18 | vietnamese rice plates | **live** — verified 200, Yoast head, SSR article, one `<h1>` after mount, in post-sitemap. Tracked: `vietnamese rice plates` / `lemongrass beef` / `shaking beef` (ids 65896576/79/82, target_url set, first check queued). Post 18 now links to it. |
| 2026-09-26 | Post **50** `/blog/ca-phe-sua-da-vietnamese-drinks-flushing/` (source: `docs/blog-drafts/ca-phe-sua-da-vietnamese-drinks-flushing.html`) — featured att. 48 (drink-station dispensers, 1200×630), inline att. 49 (drinks trio) | ca phe sua da | **live** — verified 200, Yoast head (needed the indexable delete — built at insert, before meta), SSR article, one `<h1>`, in sitemap + /blog/ list. Tracked in SE Ranking since 2026-09-27: `ca phe sua da` (65927974), `nuoc mia` (65927977), `vietnamese iced coffee near me` (65896408), `sugarcane juice near me` (65896411), `vietnamese coffee near me` (65896429) — all targeted at this URL. |
| 2026-10-13 | Post **55** `/blog/tangram-mall-restaurants-flushing/` (source: `docs/blog-drafts/tangram-mall-restaurants-flushing.html`) — featured att. **53** (interior-hat-wide → 1200×630), inline att. **54** (interior-entrance, 1200×800); author 1, category 1 (as post 18) | tangram mall restaurants | **live** — verified from the server: 200, `no-cache`, Yoast title/desc/canonical/og:image, SSR article, `lang=en-US`, in post-sitemap + /blog/ list; in Chrome: one `<h1>`, both images load, SSR block removed. Topic chosen from **GSC** (SE Ranking down). ⏳ Not yet tracked in SE Ranking. |
| 2026-10-13 | Post **18** refresh (source now in `docs/blog-drafts/best-pho-in-flushing-queens.html`) | best pho in flushing (was unset) | **live** — Yoast title → `Best Pho in Flushing: 5 Bowls Inside Tangram \| Nón Lá Express`, new metadesc with phone, focus kw set; bowl names/contents aligned with the menu; links to posts 50 + 55; att. 19 alt/title and the post excerpt de-"Ribeye"d. Verified: 0 "Ribeye Phở" in served HTML or rendered DOM. **Before-number: 246 impr / 0 clicks / pos ~9 (Oct 1–10).** |

---

## 6. Action log

| Date | Action | Status |
|---|---|---|
| 2026-09-25 | Homepage (page 6) Yoast title → `Pho & Vietnamese Restaurant in Flushing, NY \| Nón Lá Express` (+ `title-home-wpseo`); SPA `<title>` in `src/routes/+page.svelte` matched | ✅ live, verified |
| 2026-09-25 | `/menu/` (page 7) Yoast metadesc — prices removed, now matches the SPA's description | ✅ live, verified |
| 2026-09-26 | `[data-ssr-nav]` crawlable nav + /blog/ post list + NAP/hours in `index.php`/`404.php`; removed on mount by `src/routes/+layout.svelte` | ✅ deployed 09-26 — served `<a href>` count 0 → 7 on `/`, `/menu/`, `/company/`; `/blog/` lists all posts in plain HTML; rendered DOM: block gone, one `<h1>` on all 5 routes checked |
| 2026-09-26 | Restaurant schema: raw `openingHours` → parsed `openingHoursSpecification` (`xo_opening_hours_spec()`, tested on the server against the live option + 3 variants) | ✅ live — Mo–Su 11:00–22:00 on `/` |
| — | Request indexing in GSC for `/blog/`, `/company/`, `/blog/best-pho-in-flushing-queens/`, `/blog/vietnamese-rice-plates-flushing/`, `/blog/ca-phe-sua-da-vietnamese-drinks-flushing/` | ⏳ **manual in the Search Console UI** — the service account is Restricted, and the API has no request-indexing call for ordinary pages anyway |
| — | TripAdvisor / atly.com listing + reviews | ⏳ off-site, client/agency |
| 2026-09-26 | Drinks post (post 50) published; rice post 46 links to it | ✅ live, verified |
| 2026-09-27 | SE Ranking: add `ca phe sua da` + `nuoc mia` and retarget `vietnamese iced coffee near me` / `sugarcane juice near me` / `vietnamese coffee near me` (65896408/411/429) to post 50 | ✅ done 2026-09-27 — `ca phe sua da` = **65927974**, `nuoc mia` = **65927977** (both group 1388062 "Menu dishes", engine 1334596); 65896408/411 retargeted `/menu/` → post 50 (group 1388062 kept), 65896429 retargeted (it had **no** target URL, not `/menu/`; group 1388065 "Near me" kept); all five verified via `listKeywords`; position check queued for the five (`total: 5`) |
| 2026-10-13 | Post 55 (Tangram) published; post 18 Phase 3 + menu-truth refresh; posts 18 → 55 linked | ✅ live, verified (§5) |
| — | SE Ranking after the 10-17 credit reset: add `tangram mall restaurants` + `food in tangram mall` (target post 55) and `best pho in flushing` + `pho flushing` (target post 18) to engine 1334596, run a position check; redo the §3 competitor pull | ⏳ blocked on credits |
| — | Request indexing for `/blog/tangram-mall-restaurants-flushing/` in the Search Console UI | ⏳ manual (service account is Restricted) |

**Re-check due ~2026-10-23**: first tracker positions (if credits are back), GA4 organic
sessions vs the 10-13 row, `/menu/` CTR (cadence guard lifts). **~2026-11-10**: post 18 CTR vs its
246 / 0 before-number, post 55 impressions for the Tangram cluster, post 32 recovery.
