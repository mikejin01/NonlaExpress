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
- **GSC `siteUnverifiedUser` = the PROPERTY lost owner verification, not our grant.** Seen
  2026-10-23: every query 403'd, `gsc-pull.py access` showed `siteUnverifiedUser` (it had been
  `siteRestrictedUser`). Nothing on the live site or in DNS verified the property any more — the
  Wix-era token died with the cutover and Google's periodic recheck finally caught it. Fix that
  worked: owner re-verifies by HTML file → **`google552908826747e015.html` now lives in
  `public_html/`** (outside the theme, so `make push` never touches it — **don't delete it**) →
  re-verification alone did NOT restore our access ~10 min later; the owner had to **remove and
  re-add the service account** (Restricted). The DNS-TXT domain property (`dns-cutover.md` §E.3)
  would make this sturdier.
- **Posts' rendered `<title>` was NOT Yoast's until 2026-10-23.** `blog/[slug]/+page.svelte` set
  `"<post title> — Nón Lá Express"` plus a second, excerpt-based meta description, so the rendered
  DOM Google indexes ignored every Yoast post title (post 18's 10-13 rewrite included). Now
  `xo/v1/posts?slug=` returns `seoTitle`/`seoDescription` from `YoastSEO()->meta` and the route uses
  them. Pages were never affected — their SPA heads are hand-kept in step with Yoast (check both
  when retitling a page).
- **The SE Ranking tracker's first complete check was 2026-10-02** (09-26 → 10-01 are partial runs
  showing 1–4 keywords). There is no tracker "prior window" before October.

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

### 2026-10-23 — month-to-date check (FULL: GA4 + GSC + SE Ranking)

**Sources.** GA4 ✅ · SE Ranking access ✅ (19,342 credits at start) · SE Ranking project 12978512 ✅
· **GSC ❌ at preflight → ✅ same session.** The property had lost owner verification (trap in §1);
re-verified by HTML file and the service account re-added, then back to `siteRestrictedUser`.

**Windows.** GA4: **Oct 1–22 vs Sep 9–30** (22 complete days each; the 23rd is partial). GSC (last
data 10-21): **Oct 1–21 vs Sep 10–30**. Tracker: no prior window (first complete check 10-02), so
its rows compare **Oct 2–8 vs Oct 16–22**.

| Metric | Prior | Current | Δ | Verdict |
|---|---:|---:|---:|---|
| GA4 sessions (all) | 224 | 259 | +15.6% | **growing** |
| GA4 active users (all) | 184 | 207 | +12.5% | **growing** |
| GA4 new users | 178 | 202 | +13.5% | growing |
| GA4 engaged sessions | 112 | 121 | +8.0% | flat |
| GA4 engagement rate | 50.0% | 46.7% | −3.3 pt | flat |
| GA4 avg session duration | 79 s | 95 s | +20% | growing |
| GA4 **organic** sessions | 99 | 129 | +30.3% | **growing** |
| GA4 organic active users | 72 | 95 | +31.9% | **growing** |
| GA4 organic engaged sessions | 59 | 77 | +30.5% | growing |
| GA4 organic sessions ex-outlier* | 87 | 98 | +12.6% | growing |
| GA4 direct sessions | 112 | 109 | −2.7% | flat (engaged 44 → 29) |
| GA4 referral / AI-assistant sessions | 12 / 1 | 15 / 5 | — | small numbers |
| GSC clicks | 65 | 89 | +36.9% | **growing** |
| GSC clicks ex-outlier* (page-level) | 54 | 67 | +24.1% | growing |
| GSC impressions | 2,326 | 4,184 | +79.9% | **growing** |
| GSC impressions ex-outlier* (page-level) | 1,872 | 3,193 | +70.6% | growing |
| GSC CTR | 2.79% | 2.13% | −0.66 pt | dropping (impressions outran rank) |
| GSC avg position | 10.05 | 10.20 | −0.15 | flat |
| Tracker keywords in top 10 (7-day avg) | 14.3 | 13.1 | −8% | flat |
| Tracker visibility % (7-day avg) | 0.20% | 0.17% | −17% | dropping — see `nonla` below |

\* Outlier = the Chinese Flushing guide (post 32): GA4 organic 12 → 31, GSC 11 → 22 clicks,
454 → 991 impressions — still recovering from the 09-14 slide.

**Weekly GA4 sessions (ISO wk, all channels):** 36: 57 · 37: 63 · 38: 61 · 39: 75 · 40: 78 · 41: 73
· **42: 95** · 43 (Mon–Thu): 39. Week 42 is the best week since tracking began in August (Wix-era
weeks 32–34 ran 72–78). Organic alone: 21 · 33 · 28 · 26 · 45 · 36 · 44 · 17.

**What's growing and why.** Organic landing sessions: post 32 12 → 31 (09-25 SSR + `lang` fix),
`/menu/` 15 → 21, post 55 0 → 3 (new 10-13), post 18 0 → 2, `/company/` 0 → 2. GSC impressions per
page: `/` 1,475 → 2,179, post 18 243 → 658, `/menu/` 407 → 586, `/company/` 166 → 377 (brand
sitelinks), **post 55 0 → 341** (14 Tangram queries at pos 8–10), `/blog/` 27 → 194. The 09-26
crawlable-nav fix is still paying out: every page it unblocked now draws impressions.

**What's dropping / watched.**
1. **Homepage organic sessions 67 → 58** while its impressions rose 48% and clicks held (47 → 47).
   The new impressions are non-brand at depth — `pho near me` 88 @11.7, `food near me` 70 @14.9,
   `vietnamese food near me` 63 @14.3 — which don't click at positions 11–15. A rank problem, not a
   snippet problem.
2. **Tracker `nonla` 5 → 37 from 10-17** (landing page flipped `/` → `/menu/`). **Not confirmed in
   GSC** — the homepage sat at position 1 for `nonla` on 10-16/18/19/20. Tracker artifact; no action.
3. **Tracker `vietnamese rice plates` (post 46) out of the top 100 since 10-12** (was 15–20). GSC:
   11 impressions @19.7 in the window — too thin to confirm either way. Post 46 is indexed but last
   crawled **09-26**, and 138 of its 149 impressions are brand sitelinks. → internal links from post
   61 (done) + request a recrawl.
4. **Tracker `best pho in flushing` 5 → 9 after 10-16; `best pho in queens` out since 10-20.** Post 18
   was retitled 10-13 — but see finding 1 below: Google's rendered title never showed that rewrite.
   GSC impressions for the cluster are up (`best pho in flushing` 25 → 52 @8.2, `pho flushing` 16 →
   60 @10.4, `pho best flushing` 12 → 37, `pho in flushing` 5 → 30), clicks still ~0.
5. **Direct engaged sessions 44 → 29** (engagement 39% → 27%) — second check running. Not SEO; watch.

**Findings → actions (done today, §6).**
1. **Rendered post titles ignored Yoast** (trap in §1) → fixed in the theme. **Restart post 18's
   measurement clock at 10-23**: its 10-13 title only reaches Google's rendered DOM from today.
2. **`/menu/` CTR leak** (cadence guard lifted today): `non la menu` 45 @8.8, `nón lá vietnamese
   kitchen menu` 43 @12.9, `nónlá express menu` 31 @2.0 — **0 clicks on all three**; the old title was
   72 chars and truncated. → Yoast + SPA title/meta rewrite. **Before-number: page 586 impr / 10
   clicks (1.7%), Oct 1–21.**
3. **New post 61** for the rising, low-KD "most popular Vietnamese food" cluster (§4, §5).
4. Tracker sync: 4 added, 4 retargeted (§6).
5. **Tangram split**: `tangram mall restaurants` 72 impr — `/` 46 @10.6 vs post 55 26 @9.3. Ten days
   in; let post 55 settle (now tracked with `target_url`, which flags the split).

---

## 3. Competitors (SE Ranking `DATA_*`, US DB)

### Refresh log (budget: one `DATA_*` competitor pull per calendar month)

| Date | What ran | Cost |
|---|---|---|
| 2026-09-25 | `getDomainCompetitors` + overviews + keywords for Pho Hoang / Pho Metro | — |
| 2026-10-13 | **skipped** — SE Ranking credits exhausted | 0 |
| 2026-10-23 | `getDomainCompetitors` (same 9 domains as 09-25) · 7× `getDomainOverviewByCountry` · 2× `getDomainKeywords` · 1× keyword gap · plus the free `PROJECT_getAllCompetitorsMetrics` (who holds the Flushing top 10), which is what found the real competitors | part of the run's −1,600 credits |

> ⚠️ **`DATA_getDomainCompetitors` misses the real local competitors.** It matches on shared
> keywords in the national DB, so it returns name-alikes ("Non La Cafe", "Pho Express") and only 2
> Flushing restaurants. **Use `PROJECT_getAllCompetitorsMetrics`** (free, per keyword group, Flushing
> engine) to see who actually ranks in our local top 10 — that is how phohoangnyc.com and
> phograndmainst.com surfaced on 10-23.

`DATA_getDomainCompetitors` returned 9 domains (09-25; identical on 10-23). Name-overlap matches were discarded
(`banhmiphoexpress.com` = Jacksonville FL, `nomnyc.com` = University Place deli,
`nonlacafeokc.com`, `ordernonlacafe.com`, `eatvietnamexpress.com`, `imperialpho.com`,
`photopnewyork.com`). The two real local competitors both **outrank us**:

### Tracking table (append a row per check)

| Date | Domain | Keywords | Est. traffic/mo† | Top 1–5 | Top 6–10 | Top 11–20 | Top 21–50 |
|---|---|---:|---:|---:|---:|---:|---:|
| 2026-09-25 | **nonlaexpress.com** (us) | 57 | 100 | 11 | 11 | 14 | 26 |
| 2026-09-25 | flushingphohoang.com (Pho Hoang) | 99 | 180 | 26 | 14 | 13 | 34 |
| 2026-09-25 | phometroflushing.com (Pho Metro) | 98 | 186 | 2 | 0 | 23 | 72 |
| 2026-10-23 | **nonlaexpress.com** (us) | 55 | 78 | 10 | 11 | 14 | 25 |
| 2026-10-23 | **phohoangnyc.com** (Pho Hoang's 2nd site) | 1,404 | 18,659 | 210 | 270 | 493 | 505 |
| 2026-10-23 | phograndmainst.com (Pho Grand Main St) | 117 | 226 | 25 | 16 | 30 | 40 |
| 2026-10-23 | flushingphohoang.com (Pho Hoang) | 99 | 209 | 26 | 14 | 13 | 34 |
| 2026-10-23 | phometroflushing.com (Pho Metro) | 98 | 170 | 2 | 0 | 23 | 72 |
| 2026-10-23 | phograndflushing.com (Pho Grand) | 4 | 41 | 0 | 0 | 2 | 2 |
| 2026-10-23 | chefpapaflushing.com (Chef Papa) | 7 | 16 | 1 | 0 | 0 | 5 |

† SE Ranking's modeled estimate — use for relative comparison only, never as real visits.

### Flushing local SERP share (`PROJECT_getAllCompetitorsMetrics`, engine 1334596)

Visibility share across each tracked keyword group's top 10 on the check date (100 = the group
leader). Free to pull — re-run it each check, a row per domain per date.

**Group "Local Vietnamese" (1388056)**

| Date | Domain | Visibility | Note |
|---|---|---:|---|
| 2026-10-23 | www.reddit.com | 100 | directory / UGC |
| 2026-10-23 | www.phohoangnyc.com | **94.98** | restaurant — the leader |
| 2026-10-23 | www.yelp.com | 94.96 | directory |
| 2026-10-23 | www.tripadvisor.com | 70.66 | directory |
| 2026-10-23 | www.phograndmainst.com | **49.70** | restaurant |
| 2026-10-23 | ny.eater.com | 26.59 | editorial |
| 2026-10-23 | www.facebook.com | 24.15 | social |
| 2026-10-23 | www.instagram.com | 16.02 | social |
| 2026-10-23 | www.phograndflushing.com | 13.94 | restaurant |
| 2026-10-23 | chefpapaflushing.com | 12.69 | restaurant |
| 2026-10-23 | **www.nonlaexpress.com** | **11.25** | us |
| 2026-10-23 | www.grubhub.com | 11.17 | ordering |
| 2026-10-23 | www.phothainow.com | 10.98 | restaurant |
| 2026-10-23 | flhsnews.com | 9.28 | local news |
| 2026-10-23 | toast.app | 9.20 | ordering |
| 2026-10-23 | www.photanflushing.com | 6.70 | restaurant |
| 2026-10-23 | www.phograndbayside.com | 4.92 | restaurant |
| 2026-10-23 | cheflushing.com | 4.55 | restaurant |
| 2026-10-23 | phometroflushing.com | 2.65 | restaurant |

**Group "Tangram / Flushing" (1388059)** — we are **not** in its top-10 list on 10-23. Leaders:
reddit.com 100 · ny.eater.com 50.57 · maxskitchenandgarden.com 47.13 · tripadvisor.com 44.65 ·
facebook.com 42.42 · instagram.com 39.17 · mlb.com 30.57 (Citi Field) · blog.resy.com 25.99 ·
seriouseats.com 23.57 · retail.tangramnyc.com 21.43 · opentable.com 15.29.

### What they rank for

#### 2026-10-23 pull

**Pho Hoang — phohoangnyc.com** (the search-built second site; non-brand terms only — it also
ranks for dozens of "pho &lt;name&gt;" lookalikes such as *pho hong*, *pho hung*, *pho huong*, which
is brand confusion and not replicable)

| Keyword | Pos | Vol | KD | URL |
|---|---:|---:|---:|---|
| pho near me | 3 | 1,500,000 | 61 | `/` |
| pho restaurants near me | 5 | 27,100 | 69 | `/` |
| vietnamese near me | 13 | 49,500 | 47 | `/` |
| pho soup near me | 6 | 14,800 | 63 | `/` |
| pho vietnamese restaurant | 9 | 4,400 | 47 | `/` |
| **pho delivery** | **1** | 1,100 | 47 | **`/order`** |
| **vietnamese restaurant menu** | 11 | 590 | 16 | **`/menu-online`** |
| vietnamese cuisine menu | 1 | 190 | 18 | `/menu-online` |
| pho place open near me | 4 | 590 | 7 | `/` |
| vietnamese food open now | 13 | 480 | 18 | `/` |
| vietnamese takeout near me | 13 | 480 | 20 | `/` |
| bun cha near me | 16 | 720 | 17 | `/` |
| vietnamese grill | 21 | 590 | 16 | `/` |
| pho queens | 2 | 320 | 5 | `/` |

**Pho Grand Main St — phograndmainst.com** (wins by naming its street)

| Keyword | Pos | Vol | KD |
|---|---:|---:|---:|
| main st pho / pho on main street | 1 | 210 / 140 | 5 / 7 |
| pho main st / pho main street | 2 | 260 / 260 | 5 / 6 |
| vietnamese restaurant in flushing ny | 6 | 140 | 9 |
| vietnamese flushing | 6 | 140 | 4 |
| vietnamese food flushing | 7 | 140 | 4 |
| vietnamese restaurant flushing ny | 7 | 140 | 4 |
| main street flushing restaurants | 7 | 90 | 12 |
| pho best flushing | 12 | 170 | 6 |

**Keyword gap — Pho Hoang ranks, we don't** (KD ≤ 35, Vietnamese/Flushing/Queens terms): the
"takeout / take out / takeaway near me" family (390–480 each, KD 19–21), `vietnamese restaurant
menu(s)` 590 KD 16, `vietnamese noodle soup restaurant` 590 KD 10, `vietnamese food places near me`
590 KD 15, `vegetarian vietnamese near me` 590 KD 17, `best vietnamese restaurant in nyc` 480 KD 22.

#### Lessons (2026-10-23)

1. **Pho Hoang's lead is a second domain built for search** — 1,404 keywords against its own
   original site's 99 — with **dedicated `/order` and `/menu-online` pages**: `pho delivery` #1,
   `vietnamese restaurant menu` #11. Our `/menu/` serves **no menu items in its HTML** (SPA) — the
   one structural gap a competitor is visibly exploiting. A server-printed menu block, like the
   `[data-ssr-post]` fix for posts, is the matching move.
2. **A location in the name wins exact local terms** — Pho Grand Main St holds #1–2 for "pho main
   st" just by naming its street. Our equivalent is *Tangram*; post 55 already holds 14 Tangram
   queries at positions 8–10.
3. **Every restaurant that outranks us locally says "Vietnamese restaurant in Flushing" in
   crawlable homepage text.** Ours serves nav + NAP only; `SEO_BLURB` already exists in content.js.
4. **Directories still own the top** (Reddit, Yelp, TripAdvisor at 70–100). Listings and reviews
   are still worth as much as on-site work — unchanged since 09-25.
5. **Pho Hoang's non-brand traffic is "near me / open now / takeout"** (480–590/mo, KD 16–21) —
   answered by hours and an order link in crawlable text, not by blog posts.

#### 2026-09-25 pull

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

#### Lessons (2026-09-25)

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

### 2026-10-23 additions (SE Ranking US; ↑ = rising 12-month trend)

| Keyword | Vol | KD | Trend | Target |
|---|---:|---:|---|---|
| most popular vietnamese food | 390 | 7 | stable | **post 61** ✅ (tracked 67533154) |
| vietnamese food names | 590 | 22 | stable | post 61 |
| vietnamese food dishes | 480 | 24 | ↑↑ 30 → 480 since Jul | post 61 (tracked 67533157) |
| best vietnamese dishes | 140 | 9 | ↑↑ 10 → 140 | post 61 |
| popular vietnamese dishes | 100 | 8 | ↑ | post 61 |
| what is the most popular vietnamese food | 140 | 16 | — | post 61 FAQ |
| **pho toppings** | 920 | 25 | ↑↑ 80 → 920 | **November post candidate** (+ `how to eat pho` 120 ↑ KD 6, `pho dac biet` 6,600 KD 46) |
| bun bowl / rice vermicelli bowl | 480 / 320 | 13 / 13 | stable | vermicelli-bowl post candidate |
| vietnamese restaurant menu | 590 | 16 | ↓ from 1,000 | `/menu/` (tracked 67533163) — Pho Hoang #11 |
| vietnamese noodle soup restaurant | 590 | 10 | — | homepage |
| vietnamese grill | 590 | 16 | ↓ | homepage / post 46 |
| pho nyc | 440 | 7 | volatile | homepage / post 18 |
| best vietnamese restaurant in nyc | 480 | 22 | stable | — |
| vietnamese food open now | 480 | 18 | stable | hours in crawlable text |
| vietnamese takeout | 390 | 19 | stable | order page |
| cheap eats flushing | 110 | 7 | stable | lunch special |
| nuoc cham | 14,800 | 76 | ↑ | stretch (post 61 has a section) |
| pho delivery | 1,100 | 47 | ↓ | order page — Pho Hoang #1 |

---

## 5. Content log

| Date | Post / page | Focus keyphrase | Status |
|---|---|---|---|
| 2026-07-29 | Post 18 `/blog/best-pho-in-flushing-queens/` | best pho in flushing | live — **not indexed as of 09-25** |
| 2026-09-25 | Post **46** `/blog/vietnamese-rice-plates-flushing/` (source: `docs/blog-drafts/vietnamese-rice-plates-flushing.html`) — featured img att. 44 (1200×630 shaking beef), inline att. 45 (lemongrass beef); category copied from post 18 | vietnamese rice plates | **live** — verified 200, Yoast head, SSR article, one `<h1>` after mount, in post-sitemap. Tracked: `vietnamese rice plates` / `lemongrass beef` / `shaking beef` (ids 65896576/79/82, target_url set, first check queued). Post 18 now links to it. |
| 2026-09-26 | Post **50** `/blog/ca-phe-sua-da-vietnamese-drinks-flushing/` (source: `docs/blog-drafts/ca-phe-sua-da-vietnamese-drinks-flushing.html`) — featured att. 48 (drink-station dispensers, 1200×630), inline att. 49 (drinks trio) | ca phe sua da | **live** — verified 200, Yoast head (needed the indexable delete — built at insert, before meta), SSR article, one `<h1>`, in sitemap + /blog/ list. Tracked in SE Ranking since 2026-09-27: `ca phe sua da` (65927974), `nuoc mia` (65927977), `vietnamese iced coffee near me` (65896408), `sugarcane juice near me` (65896411), `vietnamese coffee near me` (65896429) — all targeted at this URL. |
| 2026-10-13 | Post **55** `/blog/tangram-mall-restaurants-flushing/` (source: `docs/blog-drafts/tangram-mall-restaurants-flushing.html`) — featured att. **53** (interior-hat-wide → 1200×630), inline att. **54** (interior-entrance, 1200×800); author 1, category 1 (as post 18) | tangram mall restaurants | **live** — verified from the server: 200, `no-cache`, Yoast title/desc/canonical/og:image, SSR article, `lang=en-US`, in post-sitemap + /blog/ list; in Chrome: one `<h1>`, both images load, SSR block removed. Topic chosen from **GSC** (SE Ranking down). ⏳ Not yet tracked in SE Ranking. |
| 2026-10-13 | Post **18** refresh (source now in `docs/blog-drafts/best-pho-in-flushing-queens.html`) | best pho in flushing (was unset) | **live** — Yoast title → `Best Pho in Flushing: 5 Bowls Inside Tangram \| Nón Lá Express`, new metadesc with phone, focus kw set; bowl names/contents aligned with the menu; links to posts 50 + 55; att. 19 alt/title and the post excerpt de-"Ribeye"d. Verified: 0 "Ribeye Phở" in served HTML or rendered DOM. **Before-number: 246 impr / 0 clicks / pos ~9 (Oct 1–10).** ⚠️ The new title only reached the *rendered* DOM on **2026-10-23** (§1 trap) — measure from then. |
| 2026-10-23 | Post **61** `/blog/most-popular-vietnamese-food/` (source: `docs/blog-drafts/most-popular-vietnamese-food.html`) — featured att. **58** (Phở Special → 1200×630), inline att. **59** (vermicelli bowl, 1200×800) + **60** (summer rolls, 1200×800); author 1, category 1; links to 18, 46, 50, 55, `/menu/` | most popular vietnamese food | **live** — topic from SE Ranking (rising low-KD cluster, §4). 1,526 words, 8 H2 / 15 H3, keyphrase in first sentence + 2 H2s. Verified from the server: 200, `no-cache`, Yoast title/desc/canonical/og:image, SSR article, `lang=en-US`, in post-sitemap + `/blog/` list, no draft-comment leak; in Chrome: one `<h1>`, 3 images load, SSR block removed, rendered `<title>` = Yoast. Tracked: `most popular vietnamese food` 67533154, `vietnamese food dishes` 67533157 (target set, check queued). Truth check caught 2 hidden items (Frozen Spring Rolls, Bún Bò Huế) before publish. |

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
| 2026-10-23 | SE Ranking after the credit reset: add `tangram mall restaurants` (target post 55); `food in tangram mall`, `best pho in flushing`, `pho flushing`, `best pho in queens` already existed with **no target** → targets set; redo the §3 competitor pull | ✅ done 10-23 — see the 10-23 tracker row below and §3 |
| — | Request indexing for `/blog/tangram-mall-restaurants-flushing/` in the Search Console UI | ✅ indexed — crawled 10-13 16:39 UTC, "Submitted and indexed" (URL Inspection 10-23) |
| 2026-10-23 | GSC access restored: property re-verified by HTML file `google552908826747e015.html` (uploaded to `public_html/`, 200 verified); service account removed + re-added (Restricted) | ✅ back to `siteRestrictedUser` |
| 2026-10-23 | Theme: post `<title>`/description now come from Yoast (`seoTitle`/`seoDescription` in `xo/v1/posts`, used by `blog/[slug]/+page.svelte`) — `make build` + `make push`, PHP linted on the server first, live diff = only this change | ✅ deployed — rendered `<title>` = Yoast on posts 18, 46, 61 (headless Chrome) |
| 2026-10-23 | `/menu/` (page 7): Yoast title → `Nón Lá Vietnamese Kitchen Menu: Pho & Rice Plates in Flushing`, metadesc rewritten (no prices, no burgers, phone added), focus kw `non la menu`; SPA head in `src/routes/menu/+page.svelte` matched; indexable rebuilt | ✅ live — served + rendered title/desc verified. Before-number in §2 |
| 2026-10-23 | Post 61 published (§5) | ✅ live, verified |
| 2026-10-23 | SE Ranking: +4 keywords — `most popular vietnamese food` 67533154 + `vietnamese food dishes` 67533157 (post 61, group 1388062), `tangram mall restaurants` 67533160 (post 55, group 1388059), `vietnamese restaurant menu` 67533163 (`/menu/`, group 1388056); targets set on 65896387 / 65896390 / 65896378 (post 18) and 65896396 (post 55); position check queued (`total: 4`) | ✅ verified via `listKeywords` |
| — | Request indexing in the Search Console UI: `/blog/most-popular-vietnamese-food/` (new), `/blog/vietnamese-rice-plates-flushing/` (last crawl 09-26), `/menu/` (new title) | ⏳ manual (service account is Restricted) |
| — | Homepage pho cards (`PHO_FAVORITES` in content.js): "RIB EYE PHỞ" labels the eye-round bowl (#2), "PHỞ & SPICE" the Spicy Pho, and the caption says "rib eye pho" — the same menu-truth fix post 18 got on 10-13 | ⏳ proposed (content gate: `make check-content-drift` first) |
| — | Server-print the menu items in `/menu/`'s HTML (like `[data-ssr-post]`) — the gap Pho Hoang's `/menu-online` exploits (§3 lessons) | ⏳ proposed — bigger change |
| — | Server-print a short homepage intro (`SEO_BLURB`) so "Vietnamese restaurant in Flushing" is in crawlable text | ⏳ proposed |
| — | GSC domain property `nonlaexpress.com` by DNS TXT (`dns-cutover.md` §E.3) — so verification can't lapse again | ⏳ client/admin |

**Monthly ledger — October 2026**

| Item | This month |
|---|---|
| Competitor research (`DATA_*`) | ran 2026-10-23 (10-13 skipped — credits) |
| New posts published | **2 of 2 — budget used**: post 55 (10-13), post 61 (10-23) |
| Credits | 19,342 → 17,742 this run (−1,600; shared agency key, so not all of it is ours) |
| Exceptions | none — GSC was fixed in-session, not skipped |

**Re-check due ~2026-11-10**: post 18 CTR (**clock restarted 10-23**, see §5), `/menu/` CTR vs its
586 / 10 before-number, post 55 Tangram cluster + the `/` vs post 55 split, post 61 first
impressions, post 46 recrawl, post 32 recovery, direct-traffic engagement. **November:** new-post
budget resets 11-01 — queued topic `pho toppings` (§4); competitor pull allowed again.
