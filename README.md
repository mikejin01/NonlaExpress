# Nón Lá Express — nonlaexpress.com rebuild

Client site for **Nón Lá Express**, the fast-casual Vietnamese Kitchen at stall FH17
inside Tangram food hall, Flushing NY. Replaces the existing Wix site.

Built from **Sora-Sushi-Web-Design-Template** (Editorial style), re-skinned to the
brand system sampled from the printed menus — green `#407666` · cream `#F2EBD9` ·
orange-red accent `#CC2B04→#E4A356`; Fraunces Black / Montserrat / Bitter /
Noto Serif SC. Full brief: [docs/website-brief.md](docs/website-brief.md).

## Stack

SvelteKit (Svelte 5) · fully static (`adapter-static`, prerendered) · GitHub Pages
via `.github/workflows/deploy.yml` (sets `BASE_PATH` for project pages; at DNS
cutover to nonlaexpress.com the base becomes `''`).

```sh
pnpm install
pnpm dev      # local dev
pnpm build    # static build → build/
pnpm preview
```

## Structure

| Path | Purpose |
| --- | --- |
| `src/lib/content.js` | **All copy + menu data** (bilingual EN/中文/Viet) — edit menu changes here |
| `src/lib/site/` | Logo (interim SVG lockup), Navbar, Footer, LunchSpecial panel |
| `src/routes/` | `/` · `/menu` · `/company` · `/press` · `/privacy-policy` · `/terms-and-conditions` · `/accessibility-statement` (mirrors old Wix URLs for 301 parity) |
| `static/assets/images/` | Web-ready renditions of the client photography (originals: `docs/assets/`) |

## Outstanding before launch (from brief §6)

- **Logo:** the lockup in `src/lib/site/Logo.svelte` + `static/favicon.svg` is an
  interim re-draw (hat mark traced from cup photography; wordmark set in
  Chewy/Montserrat). Swap in the client's vector when it arrives.
- Verify hours (currently Mon–Sun 11–10), menu discrepancy items, press entry
  details, newsletter provider (form is display-only), and the `/blog` +
  `/post/*` redirect map at DNS cutover.
# Nonla-Express
