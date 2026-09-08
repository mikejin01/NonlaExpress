# DNS cutover — pointing nonlaexpress.com at SiteGround

**Status 2026-09-04: EXECUTED. §A–§C are done; §D (retire Wix) is open.**
The live site is **https://www.nonlaexpress.com**. `make dns-status` re-checks
the picture in one command. What actually happened, and what it cost, is the
post-mortem at the bottom — read it before running this playbook on another
site, because the sequence was not followed and the failure was loud.

Verified after §C on 2026-09-04:

| Check | Result |
|---|---|
| NS | `nsb1..nsb4.squarespacedns.com` (off Wix) |
| A apex / `www` | 35.212.98.26 / CNAME → apex |
| MX + SPF | `1 smtp.google.com`, `v=spf1 include:_spf.google.com ~all` — unchanged |
| TLS | `CN=nonlaexpress.com`, SAN apex + `www`, Let's Encrypt, to 2026-12-03 |
| `home` / `siteurl` | `https://www.nonlaexpress.com` (132 rows replaced) |
| Routes | `/`, `/menu/`, `/company/`, `/blog/`, `/blog/<slug>/`, `/privacy-policy/`, `/terms-and-conditions/`, `/accessibility-statement/` → 200 |
| Apex + HTTP | 301 → `https://www.nonlaexpress.com/` |
| `/press/` | 301 → `/blog/` |
| `/post/…` | 3 sampled + the fallback → their own posts / `/blog/` |
| canonical · `og:url` · `/sitemap.xml` | www only; zero `sg-host` strings in homepage HTML |
| `make check-content-drift` | works (9 keys, no drift) |

⚠️ `/find-us/` and `/terms/` are **not routes** and 404 correctly — Find Us is
the homepage anchor `/#find-us`, and the legal page is
`/terms-and-conditions/`. Don't "fix" those 404s.

⚠️ `/wp-admin/` returns **403** to an unauthenticated request. Pre-existing
SiteGround WAF behaviour — identical on `jeffl248.sg-host.com` — not a
cutover regression. `wp-login.php` returns 200.

## The situation in four lines

- **Registrar:** Squarespace Domains (locked, expires 2027-09-05). Go-live is a
  DNS change there — never a registrar transfer.
- **DNS zone today:** hosted by **Wix** (`ns4.wixdns.net` / `ns5.wixdns.net`).
  Apex A → three Wix IPs, `www` CNAME → `cdn3.wixdns.net`, all TTL 3600.
- **Email:** Google Workspace, and its only DNS lives **in that Wix zone** —
  `MX 1 smtp.google.com` + `TXT "v=spf1 include:_spf.google.com ~all"`. No
  DKIM, DMARC, CAA or AAAA exist, so nothing else needs carrying over.
- **Target:** SiteGround server **35.212.98.26** (`jeffl248.sg-host.com`, host
  `c1114776.sgvps.net`). Confirmed two ways: the A record of the sg-host name
  and the server's own outbound IP over SSH.

⚠️ **SiteGround does not know the domain yet.** Sending the real hostname to
35.212.98.26 today returns `<title>This is the default server vhost</title>`
and a certificate for `c1114776.sgvps.net`. The domain must be added on the
hosting side (pre-flight §A) **before** the admin changes DNS, or visitors land
on a blank placeholder during propagation.

⚠️ **Squarespace DNS records only apply while the domain uses Squarespace's
own nameservers.** That is why the admin's job is two things, done together:
add the records *and* switch the nameservers off Wix. Doing the nameserver
switch alone would leave the zone with no MX, and mail to @nonlaexpress.com
would bounce until someone noticed.

## Sequence

| # | Who | What |
|---|-----|------|
| 1 | us | Pre-flight §A — add the domain on SiteGround, confirm with `make dns-status` |
| 2 | us | Send the admin the instructions (§B) with a "go" |
| 3 | admin | §B: records + nameserver switch, in one sitting |
| 4 | us | Watch `make dns-status` until public resolvers return 35.212.98.26 |
| 5 | us | Post-cutover §C — SSL, `wp search-replace`, redirects, verification |
| 6 | us | ≥ 1 week later, once §C verifies clean: retire Wix (§D) |

## A. Pre-flight (our side, before the admin's "go")

1. **Site Tools → Domain → Parked Domains → Domain: `nonlaexpress.com` → Add.**
   A parked domain serves the same document root as the primary site and can
   be added before DNS points here. (SiteGround's "Change Primary Domain" is
   the tidier end state but its KB says the domain must already point at
   SiteGround — do that later, §C.7.)
2. `make dns-status` — the line *SiteGround answers Host www.nonlaexpress.com
   with:* must now show the site's own `<title>`, not "This is the default
   server vhost". Until it does, don't send the "go".
3. Snapshot: `make pull-content` and commit, so the content baseline is fresh
   before URLs change in the DB.

## B. Instructions for the Squarespace admin

Shareable version: the artifact published 2026-09-04 (link in the session
that created this file). Plain-text version to paste into an email:

---

**Pointing nonlaexpress.com at the new website — about 15 minutes**

Please wait for Mike's "go" before starting: the domain has to be registered
on the hosting side first, otherwise visitors see a blank page while the
change spreads. Do all five steps in one sitting — the email records in step 3
must be in place the same hour the nameservers change (step 4), or mail to
@nonlaexpress.com bounces. Have the Squarespace password and 2FA ready;
Squarespace re-asks for them before DNS edits.

**Step 1 — Open the domain's DNS panel.**
Go to account.squarespace.com/domains → click **nonlaexpress.com** → click
**DNS** in the side panel → **DNS Settings**.

**Step 2 — Remove Squarespace's placeholder records, if shown.**
If there is a **Squarespace Defaults** section, click the red trash can next
to it → **Delete**. Those records point the domain at a Squarespace parking
page. If the section isn't there, skip this step.

**Step 3 — Add these four records under Custom Records → Add record.**
Leave TTL at its default. Type each value exactly (no trailing dot, no quotes).

| Type  | Name | Data / IP address                     | Priority |
|-------|------|---------------------------------------|----------|
| A     | @    | 35.212.98.26                          | —        |
| CNAME | www  | nonlaexpress.com                      | —        |
| MX    | @    | smtp.google.com                       | 1        |
| TXT   | @    | v=spf1 include:_spf.google.com ~all   | —        |

The A and CNAME records are the new website. The MX and TXT records are the
company email (Google Workspace) — they copy exactly what Wix serves today,
so email keeps working.

If Squarespace refuses the CNAME, add an **A** record with Name **www** and
IP **35.212.98.26** instead.

**Step 4 — Switch the nameservers to Squarespace.**
Still under **DNS**, click **Domain Nameservers**. It currently shows custom
nameservers `ns4.wixdns.net` and `ns5.wixdns.net`. Click **Use Squarespace
nameservers** → enter your password / 2FA → **Continue** → **Save**. If
Squarespace offers to turn on DNSSEC, leave it off for now.

*If Squarespace would not let you add records in step 3 while custom
nameservers were active:* do step 4 first, then immediately come back and do
steps 2 and 3.

**Step 5 — Check and send a screenshot.**
Reopen **DNS → DNS Settings**. You should see the four records under Custom
Records and **no** Squarespace Defaults section (if one reappeared after the
nameserver switch, delete it again as in step 2). Screenshot the page and
send it to Mike.

**What happens next.** The new site appears at nonlaexpress.com within a few
minutes for most people and within 48 hours for everyone. Email is unaffected
as long as steps 3 and 4 were done together. Please don't cancel anything at
Wix yet — Mike will confirm when that is safe.

**If we need to undo it.** DNS → Domain Nameservers → **Use Custom
Nameservers** → enter `ns4.wixdns.net` and `ns5.wixdns.net` → Save. The old
Wix setup is untouched until Wix is cancelled.

---

## C. Post-cutover (our side, once `make dns-status` shows 35.212.98.26 from 1.1.1.1 and 8.8.8.8)

1. **SSL.** Site Tools → Security → SSL Manager → `nonlaexpress.com` → Let's
   Encrypt → Get (SiteGround usually issues it on its own within minutes of
   DNS landing; do it by hand if it hasn't). Then Security → HTTPS Enforce →
   on for the domain. Until then browsers show a cert warning for the domain
   because the server presents its `c1114776.sgvps.net` certificate.
2. **Canonical host = `https://www.nonlaexpress.com`** — matches the old Wix
   site (its `www` was canonical; every indexed `/post/` URL is on www).
   ```
   make ssh
   cd ~/www/jeffl248.sg-host.com/public_html
   wp search-replace 'https://jeffl248.sg-host.com' 'https://www.nonlaexpress.com' --all-tables --dry-run   # 145 rows on 2026-09-04
   wp search-replace 'https://jeffl248.sg-host.com' 'https://www.nonlaexpress.com' --all-tables
   wp option get home && wp option get siteurl
   wp yoast index --reindex     # Yoast keeps its own URL cache — see memory note on indexables
   wp cache flush && wp sg purge
   ```
3. **Apex → www 301.** Add above the `# BEGIN WordPress` block in `.htaccess`:
   ```
   RewriteEngine On
   RewriteCond %{HTTP_HOST} ^nonlaexpress\.com$ [NC]
   RewriteRule ^(.*)$ https://www.nonlaexpress.com/$1 [R=301,L]
   ```
4. **Verify** (all four from a clean shell, follow redirects with `-L` once):
   `/`, `/menu/`, `/company/`, `/blog/` and one `/blog/<slug>/` return 200 on
   www; `http://nonlaexpress.com/` → 301 → `https://www.nonlaexpress.com/`;
   `/press/` → 301 `/blog/`; three of the twelve `/post/…` URLs from
   `scripts/redirects.js` → 301 to their own post; `/sitemap.xml` lists
   www.nonlaexpress.com URLs only.
5. `make check-content-drift` still works — SSH stays on
   `ssh.jeffl248.sg-host.com`, the sg-host name keeps resolving.
6. Search Console: add the `nonlaexpress.com` domain property (DNS TXT — the
   admin adds it the same way as step 3) and submit `/sitemap.xml`.
7. **Optional, tidier:** Client Area → Websites → ⋮ → **Change Primary
   Domain** → `nonlaexpress.com` → Confirm. Then `ls ~/www` over SSH and, only
   if the docroot folder was renamed, update `SITEGROUND_DOMAIN` in
   `.live-sites/nonla.mk` — the fragment's own note explains why
   (`make push` into a folder nothing serves).

## D. Retiring Wix — CLEARED TO CANCEL 2026-09-08 (verified, not yet done)

The Wix zone is what stale resolvers still read during propagation; the
registry's NS TTL is 172800s (48h). After that it is dead weight. Cancelling
the Wix Premium plan takes the DNS zone with it — so the bar is not "a week has
passed" but **"nothing depends on Wix any more"**. All four checks below were
run on 2026-09-08 (96h after cutover, 2× the TTL) and all four passed.

1. **Delegation has moved everywhere.** `dig +trace` shows Squarespace NS at
   the registry, and 1.1.1.1 / 8.8.8.8 / 9.9.9.9 / 208.67.222.222 all agree.
   No resolver is still reading the Wix zone.
2. **Nothing lives only in the Wix zone.** Diffed record by record against the
   live zone (A/CNAME/TXT/MX across apex, `www`, `mail`, `blog`, `shop`,
   `store`, `m`, `ftp`, `cdn`, `autodiscover`, `_dmarc`, three `_domainkey`
   selectors, `_acme-challenge`). Wix holds nothing the new zone lacks; the
   only asymmetry runs the other way — `google._domainkey` (DKIM) exists
   **only** in the Squarespace zone.
3. **Nothing on the live site is served by Wix.** Zero `wixstatic`/`wix.com`
   references in the HTML of `/`, `/menu/`, `/company/`, `/blog/`. Every
   attachment `guid` is on `www.nonlaexpress.com`, images return 200, and
   `og:image` is local.
4. **The migrated content is ours.** All 12 posts `publish`, 1.5k–7.7k chars,
   original 2025 dates intact.

⚠️ **`static.wixstatic.com` URLs DO still exist in the database** — 14 rows
each of `_source_url` and `_source_wix_url` in `tns_postmeta`. They are
provenance stamps written by the 2026-08-12 import script and are **never
rendered**. Don't mistake them for a live dependency, and don't bother
scrubbing them; they document where each image came from.

⚠️ **The one risk no DNS check can see: Google Workspace billing.** Wix Premium
plans often bundle a Workspace mailbox (free year one, then billed through
Wix), and cancelling Wix can terminate a mailbox provisioned that way. The MX
gives no signal either way — `smtp.google.com` is Google's standard simplified
record. **Confirm in Google Admin → Billing that the subscription is direct
with Google, not resold through Wix, before cancelling.** The domain itself is
safe regardless: it is registered at Squarespace (expires 2027-09-05), never
at Wix.

### Backups taken before cancellation (2026-09-08)

Both live in `~/backups/` on the server **and** in `.backups/` locally (which
`.gitignore` now excludes — a DB dump carries user emails and password hashes,
so it must never be committed). Neither has anything to do with Wix; both come
off SiteGround over the usual SSH key.

| File | Size | Verified |
|---|---|---|
| `nonla-db-precancel-20260908.sql.gz` | 93K | gzip OK, 21 tables, ends `Dump completed`, posts present |
| `nonla-uploads-precancel-20260908.tar.gz` | 32M | gzip OK, 71 files, all 12 featured images (4–5 variants each) |

⚠️ **A DB dump is not a full backup.** `wp db export` captures no media, and
the 12 posts' featured images were imported *from Wix* — so once Wix is gone,
`wp-content/uploads` is their only copy. That is why the uploads tarball
exists; take both or neither.

⚠️ The `source-html.tar.gz` harvest holds only **4 top-level pages, no post
pages**. That is fine — the posts live in WordPress now, with their Yoast
metadata — but it means the WordPress DB is the sole home of that content, and
is the reason the dump above was taken.

## Rollback

- Admin: custom nameservers back to `ns4.wixdns.net` / `ns5.wixdns.net`.
- Us, only if §C.2 already ran: the same `wp search-replace` with the two URLs
  swapped, then `wp cache flush && wp sg purge`.

## Alternative not taken

Pointing the nameservers at `ns1.siteground.net` / `ns2.siteground.net`
instead would shrink the admin's job to two fields, but moves the client's
email DNS into SiteGround's Site Tools (no CLI/API — UI only) and puts us,
not the domain owner, in the path of every future mail-record change. Keeping
the zone at Squarespace leaves the records next to whoever owns the domain.

## Post-mortem — how this actually went (2026-09-04)

**The sequence above was not followed.** The admin executed §B (records +
nameserver switch) before we executed §A (park the domain on SiteGround). They
did their half correctly — all four records landed, and mail never broke — but
for roughly an hour `nonlaexpress.com` resolved to a server that had never
heard of it.

**What that looks like, so it is recognised in one step next time:** a browser
cert warning (`ERR_CERT_COMMON_NAME_INVALID`) in front of SiteGround's "This is
the default server vhost" placeholder. The certificate is the tell — the server
presents `c1114776.sgvps.net`, whose only SAN is itself, because a host with no
vhost has no certificate to present. Diagnose it with the response header
`X-Default-Vhost: 1`, not by looking at the page.

**Recovery was §A, unchanged, and took minutes:** Site Tools → Domain → Parked
Domains → Add, which creates `~/www/nonlaexpress.com -> jeffl248.sg-host.com`;
then SSL Manager → Let's Encrypt → Get. Rolling the nameservers back to Wix
would have been the *wrong* move — the registry NS TTL is 172800s, so undoing
costs two days where parking costs five minutes. **If this happens again, go
forward, not back.**

**Then it 301s to the old host, and that is not a second bug.** Once parked,
every request bounced to `https://jeffl248.sg-host.com/` because WordPress
compares each request's Host against `home` and redirects mismatches to its
canonical. §C.2 is the only fix. Note the ordering trap this creates: running
`search-replace` *before* the vhost exists would point WordPress at a hostname
serving the placeholder and lock wp-admin away.

**§C.2's row count is not a constant.** The runbook said 145; the dry run on
the day reported **132**, because content changed in between. Read the dry run,
don't assert against the number written here.

**§C.2's Yoast step could not be run.** `wp yoast index --reindex` prompts for
confirmation, rejects `--yes` as an unknown parameter, and ignores a piped `y`
over a non-interactive SSH session. It turned out to be unnecessary:
`search-replace` rewrote `tns_yoast_indexable.permalink` (25 rows),
`twitter_image` and `open_graph_image` (12 each) directly, and canonical,
`og:url` and `/sitemap.xml` all verified on the www URL. **Verify the output
instead of chasing the command** — and note this contradicts the usual advice
in the `wp-import-yoast-indexables` memory, which is about *scripted post
imports*, where the indexable rows are stale in ways a URL rewrite cannot fix.

**Still open:** §C.6 (Search Console domain property — needs the admin to add a
DNS TXT) and §D (cancel Wix — verified clear 2026-09-08, pending only the
Google Workspace billing confirmation).
