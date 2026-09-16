# Pointing a Live Domain at SiteGround — Full Playbook

Take a client's existing domain — currently serving their old site (Wix,
Squarespace, GoDaddy builder, whatever) — and make it serve the new WordPress
site on **SiteGround**, without dropping their email and without a visible
outage.

Generalized from the **Nón Lá Express** cutover of 2026-09-04 (Squarespace
registrar · Wix-hosted DNS · Google Workspace mail → SiteGround). That one went
out of order and produced an hour of "the website is down"; every hard rule
below exists because of something that actually happened. The client-specific
record of it, with the post-mortem, is [dns-cutover.md](./dns-cutover.md).

**Companion doc:** [SPA-TO-WORDPRESS-THEME-PLAYBOOK.md](./SPA-TO-WORDPRESS-THEME-PLAYBOOK.md)
gets the site onto SiteGround in the first place. This playbook assumes that is
done and the site is reachable at its `*.sg-host.com` address.

---

## 🛑 Hard rules — read these before touching anything

1. **SiteGround FIRST, DNS SECOND. Always.** Add the domain on the hosting side
   *before* anyone changes a DNS record. Get this backwards and the domain
   resolves to a server that has never heard of it: visitors get a certificate
   warning in front of a blank placeholder, and you cannot fix it from the
   registrar. **This is the single most common way to break a cutover, and it
   is the one that happened.**
2. **Mail records move in the same sitting as the nameservers.** If the
   nameservers change while the MX/SPF records haven't been recreated in the
   new zone, mail to the domain **bounces** — silently, until someone notices.
   Never do one without the other.
3. **Never run `wp search-replace` before the new hostname actually serves the
   site.** Pointing WordPress at a hostname that returns a placeholder locks
   you out of wp-admin.
4. **Verify against public resolvers, never your own machine.** A local cache
   or a VPN will happily tell you the cutover worked when it hasn't. Use
   `@1.1.1.1` / `@8.8.8.8` explicitly.
5. **Don't cancel the old host until nothing depends on it.** "A week has
   passed" is not the bar — see §7, which is checkable.

---

## Decide first: transfer, delegate, or point?

These are three different things and they get conflated constantly. **In most
cutovers you want option B or C, and a registrar transfer is not involved at
all.**

| | What moves | When to use it | Risk |
|---|---|---|---|
| **A. Registrar transfer** | Who *bills* for the domain | Consolidating billing, or leaving a hostile registrar | Slow (5–7 day ICANN window), needs auth code + unlock, and **60-day lock after any transfer**. Never do it during a launch. |
| **B. Nameserver delegation** | Who *answers* DNS for the whole zone | The default. Registrar stays put; you choose who hosts the zone | Every record must exist in the new zone before you flip, mail included |
| **C. Records only** | Two records (A + CNAME) | The zone is already hosted where you want it | Lowest risk, fastest revert |

**Nón Lá was B** — registrar stayed at Squarespace, and the zone moved from
Wix's nameservers to Squarespace's own, with the records recreated there.

⚠️ **Registrar-hosted DNS panels often refuse to apply records while custom
nameservers are set.** Squarespace is one: its Custom Records only take effect
on Squarespace nameservers. That is why B is one operation, not two — add the
records *and* switch the nameservers together, or the records sit inert and
mail dies at the flip. If the panel won't let you add records first, switch
nameservers first and add records immediately after.

⚠️ **You do NOT want SiteGround's nameservers** in most cases
(`ns1/ns2.siteground.net`). It works, but it moves the client's *email* DNS
into SiteGround's Site Tools, which has no CLI or API — putting you, not the
domain owner, in the path of every future mail change. Keep the zone next to
whoever owns the domain.

---

## Part 0 — Gather the facts (before anything else)

Ask the client/admin for these. They cannot be guessed, and a missing one
stops the cutover mid-flight.

| Fact | How to check it yourself |
|---|---|
| Registrar + login | `whois <domain> \| grep -i registrar` |
| Who hosts DNS now | `dig +short NS <domain> @8.8.8.8` |
| Current records | `dig +short A <domain> @<their-ns>`, same for `www`, `MX`, `TXT` |
| **Mail provider** | `dig +short MX <domain> @8.8.8.8` — and ask **who bills it** (§7) |
| SiteGround server IP | `dig +short <account>.sg-host.com A` |
| Which host is canonical today | Whichever their indexed URLs use — see §4 |

```bash
# One-shot survey of an existing domain
D=example.com
for t in NS A MX TXT; do printf "%-4s %s\n" "$t" "$(dig +short @8.8.8.8 $D $t | tr '\n' ' ')"; done
printf "www  %s\n" "$(dig +short @8.8.8.8 www.$D | tr '\n' ' ')"
printf "TTL  %s\n" "$(dig @8.8.8.8 $D A | awk '/^'$D'/{print $2; exit}')"
```

⚠️ **Record everything the old zone serves, not just A and MX.** DKIM
(`*._domainkey`), DMARC (`_dmarc`), domain-verification TXTs, and subdomains
for third-party tools all live there and all die with the zone. Enumerate:

```bash
D=example.com; OLD=ns1.oldhost.com
for n in @ www mail blog shop m ftp cdn autodiscover _dmarc \
         google._domainkey selector1._domainkey selector2._domainkey k1._domainkey; do
  fq=$([ "$n" = "@" ] && echo $D || echo $n.$D)
  for t in A CNAME TXT MX; do
    v=$(dig +short @$OLD $fq $t 2>/dev/null | tr '\n' ' ')
    [ -n "$v" ] && printf "%-28s %-6s %s\n" "$fq" "$t" "$v"
  done
done
```

### 0.1 Lower the TTL — 24–48h ahead (optional, high value)

If you have lead time, drop the TTL on the records you're about to change
(A, CNAME, MX) to **300 seconds** in the *old* zone, at least one old-TTL
period before the cutover. Propagation then collapses from hours to minutes,
and a rollback lands just as fast. Raise it back to 3600 a day after.

This does not help with a **nameserver** change — the registry NS TTL is
typically 172800s (48h) and you don't control it. Plan for stale resolvers
reading the old zone for two days regardless, which is why §7 exists.

---

## Part 1 — SiteGround side (do this FIRST)

### 1.1 Add the domain to the hosting account

**Site Tools → Domain → Parked Domains → Domain: `<domain>` → Add.**

A parked domain serves the **same document root** as the primary site, which
is what you want — one WordPress install answering both the `sg-host.com` name
and the real domain. It can be added **before** DNS points anywhere.

- Do **not** use "Add a new website" — that creates a second, empty docroot,
  and you'd get a blank WordPress instead of the site.
- "Change Primary Domain" is the tidier end state but SiteGround requires DNS
  to already point there. That's §5.4, not now.

Confirm over SSH — a parked domain shows up as a symlink:

```bash
ls -la ~/www
# nonlaexpress.com -> jeffl248.sg-host.com
```

### 1.2 Verify the vhost answers — *before* touching DNS

This is the step that turns a risky cutover into a boring one. You can send
the real hostname to the SiteGround IP without any DNS change:

```bash
IP=$(dig +short <account>.sg-host.com A | head -1)
curl -sI --resolve www.<domain>:443:$IP https://www.<domain>/ | head -5
```

**Read the headers, not the page:**

| Response | Meaning |
|---|---|
| `X-Default-Vhost: 1` + "This is the default server vhost" | ❌ Not parked yet. Go back to §1.1. |
| Normal WordPress headers, no `X-Default-Vhost` | ✅ Parked. Safe to proceed. |

⚠️ **The certificate will still be wrong at this stage** (SiteGround presents
`c######.sgvps.net` or a self-signed `CN=example.com` stub) because Let's
Encrypt cannot issue for a domain that doesn't resolve here yet. That is
expected — use `curl -k` and judge by the headers. SSL comes in §3.

**Do not send the admin the "go" until this check passes.**

---

## Part 2 — DNS side (the admin's job)

Give the admin an exact, copy-pasteable list. Vagueness here is what causes
mail outages. Template:

> **Pointing `<domain>` at the new website — about 15 minutes**
>
> Please do all of this **in one sitting** — the email records in step 2 must
> be in place the same hour the nameservers change in step 3, or mail to
> @`<domain>` will bounce. Have your password and 2FA ready.
>
> **Step 1 — Open the domain's DNS panel.** `<registrar> → Domains →
> <domain> → DNS`.
>
> **Step 2 — Add these records.** Delete any "Defaults"/parking section first.
>
> | Type | Name | Value | Priority |
> |------|------|-------|----------|
> | A | @ | `<SiteGround IP>` | — |
> | CNAME | www | `<domain>` | — |
> | MX | @ | *(copy from the old zone)* | *(copy)* |
> | TXT | @ | *(SPF, copy from the old zone)* | — |
> | *(+ any DKIM / DMARC / verification TXTs found in Part 0)* | | | |
>
> If the panel refuses a CNAME at `www`, use an **A** record at `www` pointing
> to the same IP.
>
> **Step 3 — Switch the nameservers** to the registrar's own, if the zone is
> currently hosted elsewhere.
>
> **Step 4 — Screenshot the finished DNS page and send it back.**

### 2.1 Watch it land

```bash
for r in 1.1.1.1 8.8.8.8 9.9.9.9 208.67.222.222; do
  printf "%-16s NS=%s A=%s MX=%s\n" "$r" \
    "$(dig +short @$r <domain> NS | tr '\n' ' ')" \
    "$(dig +short @$r <domain> A  | tr '\n' ' ')" \
    "$(dig +short @$r <domain> MX | tr '\n' ' ')"
done
```

This repo ships `make dns-status`, which does the above plus the vhost and
certificate checks in one command. It is generic — set `LIVE_DOMAIN` in the
Makefile and it works for any project.

⚠️ **Check MX every time you check A.** The whole risk of a nameserver change
is mail, and mail is the thing nobody looks at until it's been broken for a day.

---

## Part 3 — SSL

Once the domain resolves to SiteGround:

1. **Site Tools → Security → SSL Manager** → select the domain → **Let's
   Encrypt** → **Get**. (SiteGround often auto-issues within minutes; do it by
   hand if it hasn't.)
2. **Security → HTTPS Enforce** → on.

Verify — note the **absence** of `-k`, which is the actual test:

```bash
curl -sI https://www.<domain>/ | head -3          # no TLS error = cert is valid
echo | openssl s_client -connect <IP>:443 -servername www.<domain> 2>/dev/null \
  | openssl x509 -noout -subject -dates -ext subjectAltName
```

Confirm the SAN list covers **both** the apex and `www`.

⚠️ **If issuance fails**, the usual cause is the old site's redirect swallowing
Let's Encrypt's `/.well-known/acme-challenge/` check. Do Part 4 first, then
retry.

---

## Part 4 — WordPress side

### 4.1 Pick the canonical host — and let the old site decide

**Match whatever the client's currently-indexed URLs use.** If their existing
pages are on `www`, stay on `www`; every inbound link and every migrated
redirect then lands in one hop instead of two. Aesthetic preference is worth
less than an extra redirect on every indexed URL.

### 4.2 Rewrite the URLs in the database

Until you do this, **WordPress 301s the new domain back to the old hostname** —
it compares each request's Host against the `home` option and bounces
mismatches. That redirect is expected after parking, is not a second bug, and
has exactly one fix:

```bash
cd ~/www/<sg-host-docroot>/public_html
wp option get home && wp option get siteurl          # confirm the "from" value

wp search-replace 'https://<old-host>' 'https://www.<domain>' \
  --all-tables --dry-run --report-changed-only       # READ THIS OUTPUT
wp search-replace 'https://<old-host>' 'https://www.<domain>' \
  --all-tables --report-changed-only

wp option get home && wp option get siteurl          # confirm the "to" value
wp cache flush && wp sg purge
```

⚠️ **The row count is not a constant.** It changes as content changes — Nón Lá's
runbook predicted 145 and the dry run reported 132. Read the dry run; never
assert against a number written down earlier.

⚠️ **`--all-tables` matters.** Plugin tables hold URLs too — Yoast alone had
`permalink`, `open_graph_image` and `twitter_image` columns to rewrite.

### 4.3 Apex → www 301 (or the reverse)

Add **above** the `# BEGIN WordPress` block in `.htaccess` (back it up first):

```apache
# BEGIN apex-to-www
<IfModule mod_rewrite.c>
 RewriteEngine On
 RewriteCond %{HTTP_HOST} ^<domain>$ [NC]
 RewriteRule ^(.*)$ https://www.<domain>/$1 [R=301,L]
</IfModule>
# END apex-to-www
```

WordPress would redirect anyway, but this is faster (no PHP boot) and also
covers static files.

### 4.4 SEO plugin caches

Yoast keeps its own URL cache in `wp_yoast_indexable`. `wp yoast index
--reindex` refreshes it — but ⚠️ **it prompts for confirmation and cannot be
automated over SSH**: it rejects `--yes` as an unknown parameter and ignores a
piped `y`. Use an interactive shell, or skip it and **verify the output
instead** — `--all-tables` usually rewrites those rows directly:

```bash
curl -s https://www.<domain>/ | grep -oE '<link rel="canonical"[^>]*>|<meta property="og:url"[^>]*>'
curl -sL https://www.<domain>/sitemap.xml | grep -oE 'https://[a-z0-9.-]+' | sort -u
```

⚠️ **Use `-L` on the sitemap.** SEO plugins commonly 301 `/sitemap.xml` to
their own index (`/sitemap_index.xml`); without `-L` you grep an empty redirect
body and conclude, wrongly, that the sitemap is broken.

Canonical, `og:url` and every sitemap URL must show the new host only.

---

## Part 5 — Verify

Run all of it from a clean shell. **An unverified cutover is an unfinished
cutover.**

```bash
D=<domain>

# Routes — expect 200 with 0 redirects
for p in / /menu/ /about/ /blog/ /contact/; do
  printf "%-16s %s\n" "$p" "$(curl -sS -o /dev/null -w '%{http_code} %{num_redirects} %{url_effective}' -L https://www.$D$p)"
done

# Apex and plain HTTP funnel to canonical
for u in http://$D/ https://$D/ http://www.$D/; do
  printf "%-26s %s\n" "$u" "$(curl -sS -o /dev/null -w '%{http_code} -> %{url_effective}' -L $u)"
done

# No trace of the old hostname anywhere in the page
curl -sS -L https://www.$D/ | grep -c '<old-host>'          # expect 0

# Legacy URL redirects, if the old site's paths were mapped
curl -sS -o /dev/null -w '%{http_code} -> %{url_effective}\n' -L --path-as-is https://www.$D/<old-path>
```

⚠️ **Check the route list against the app's real routes before calling a 404 a
failure.** Guessed paths produce false alarms — `/find-us/` 404s correctly when
"Find Us" is a homepage anchor, and `/terms/` 404s when the page is
`/terms-and-conditions/`.

⚠️ **`/wp-admin/` returning 403 to an unauthenticated request is normal**
SiteGround WAF behaviour, not a regression. Compare against the `sg-host` URL
before chasing it. `wp-login.php` should return 200.

### 5.4 Optional: make it the primary domain

Client Area → Websites → ⋮ → **Change Primary Domain**. Then check whether the
docroot folder was renamed (`ls ~/www`) and update any deploy config that
hard-codes the old path — otherwise `make push` deploys into a folder nothing
serves.

⚠️ Keep the `sg-host.com` name working for SSH and tooling; it keeps resolving
regardless of the domain change.

---

## Part 6 — Troubleshooting, by symptom

| Symptom | Cause | Fix |
|---|---|---|
| Cert warning (`ERR_CERT_COMMON_NAME_INVALID`) + "This is the default server vhost" | Domain not parked on SiteGround | §1.1. Confirm via `X-Default-Vhost: 1`. **Go forward — don't revert DNS** |
| Cert warning, but the real site renders | Parked, SSL not issued yet | §3 |
| New domain 301s to the old `sg-host` URL | WP `home`/`siteurl` unchanged | §4.2 — the *only* fix |
| Site loads, **email stopped** | MX/SPF not recreated in the new zone | Re-add them immediately; §2 |
| Records added but nothing changed | Registrar panel's records are inert under custom nameservers | Switch nameservers to that registrar's own |
| Redirect loop | Both `.htaccess` and WP forcing opposite hosts | Pick one canonical; §4.1 |
| Let's Encrypt won't issue | Old redirect eating `/.well-known/` | Do §4.2, retry |
| Locked out of wp-admin | `search-replace` ran before the vhost existed | Reverse it: same command, URLs swapped |
| `dig` says it worked, browser disagrees | Local/VPN DNS cache | Re-check with `@1.1.1.1`; flush local cache |

### Rollback

Available **only until the old host is cancelled**:

- **Nameserver change:** set custom nameservers back to the old host's. Costs
  up to the 48h registry NS TTL — slow, which is why §1.2's pre-verification
  matters more than the rollback does.
- **Records-only change:** revert the A/CNAME. Fast if the TTL was lowered.
- **Database:** the same `wp search-replace` with the two URLs swapped, then
  `wp cache flush && wp sg purge`.

---

## Part 7 — Retiring the old host

The bar is **not** "a week has passed." It is **"nothing still depends on
it"** — and that is checkable. All four must pass:

1. **Delegation has moved everywhere.** `dig +trace <domain> NS` shows the new
   nameservers at the registry, and four independent public resolvers agree.
2. **Nothing lives only in the old zone.** Re-run the Part 0 enumeration
   against the old nameservers and diff it against the live zone. Anything
   present only in the old one is about to be deleted forever.
3. **No old-host assets are served.** Grep the live pages for the old host's
   CDN domain; confirm media URLs and `og:image` are local and return 200.
4. **Migrated content is genuinely yours.** Posts present, published, with
   original dates.

⚠️ **Provenance metadata is not a dependency.** Import scripts often stamp rows
like `_source_url` with the old CDN's URL. They never render. Check *where the
page actually loads images from* before concluding you're still coupled.

### ⚠️ The trap no DNS check can see: who bills the mailboxes

Site builders frequently **resell Google Workspace or Microsoft 365** — free
the first year, billed through them after. **Cancelling the hosting plan
terminates a mailbox provisioned that way.** The MX record gives no signal
either way (`smtp.google.com` is Google's standard record for direct and
resold accounts alike).

**Before cancelling anything, check the mail provider's own billing page**
(Google Admin → Billing → Subscriptions). If it names a reseller, move the
subscription to direct billing *first*.

### Back up before you cancel — and take **two** things

⚠️ **A database dump is not a backup of a WordPress site.** `wp db export`
captures **no media**, and if the old site's images were imported during
migration, `wp-content/uploads` is their only surviving copy once the old host
is gone.

```bash
ssh <host> 'set -e
  mkdir -p ~/backups && cd ~/www/<docroot>/public_html
  f=~/backups/db-precancel-$(date +%Y%m%d).sql
  wp db export "$f" --add-drop-table && gzip -f "$f"
  tar czf ~/backups/uploads-precancel-$(date +%Y%m%d).tar.gz wp-content/uploads
  ls -lh ~/backups/'
scp <host>:'~/backups/*precancel*' ./.backups/
```

Then **verify by opening them**, not by exit status:

```bash
gzip -t .backups/db-*.gz && gzip -dc .backups/db-*.gz | grep -c '^CREATE TABLE'
gzip -dc .backups/db-*.gz | tail -2 | grep -c 'Dump completed'
gzip -t .backups/uploads-*.tar.gz && tar tzf .backups/uploads-*.tar.gz | grep -cv '/$'
```

⚠️ **Never commit a database dump.** It carries user emails and password
hashes. Add `.backups/`, `*.sql`, `*.sql.gz` to `.gitignore` **before** pulling
the files down, so there is never a window in which they're stageable.

⚠️ **Cancelling deletes the old zone, and with it the rollback.** That's the
right trade once the site has been live and verified for a while — but it's
why this is genuinely the last step.

---

## Sequence summary

| # | Who | What | Gate |
|---|-----|------|------|
| 1 | us | Gather facts, enumerate the old zone (§0) | Every record written down |
| 2 | us | Lower TTLs if there's lead time (§0.1) | — |
| 3 | us | **Park the domain on SiteGround** (§1.1) | — |
| 4 | us | **Verify the vhost with `--resolve`** (§1.2) | No `X-Default-Vhost` ⟵ **go/no-go** |
| 5 | us | Send the admin the record list + "go" (§2) | — |
| 6 | admin | Records **and** nameservers, one sitting (§2) | Screenshot back |
| 7 | us | Watch public resolvers; **check MX too** (§2.1) | All resolvers agree |
| 8 | us | Issue SSL, enforce HTTPS (§3) | `curl` with no `-k` succeeds |
| 9 | us | `search-replace`, `.htaccess`, caches (§4) | `home`/`siteurl` correct |
| 10 | us | Verify routes, redirects, canonicals (§5) | All green |
| 11 | client | Confirm mailbox billing is direct (§7) | ⟵ **blocks 13** |
| 12 | us | Back up DB **and** uploads, verified (§7) | Both open cleanly |
| 13 | client | Cancel the old host (§7) | Rollback gone after this |
