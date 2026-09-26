#!/usr/bin/env python3
"""
Google Search Console puller for nonlaexpress.com (ported from the iDeal repo).

Uses the same service account as the GA4 MCP connection
(claude-ga4-reader@xo-seo-505117.iam.gserviceaccount.com, key at
~/.config/ga4-mcp/sa-key.json), so there is no interactive OAuth — it works
headless, unlike the SE Ranking MCP.

Prerequisites (one-time):
  1. Google Search Console API enabled on Cloud project xo-seo-505117.  [done 2026-08-13]
  2. The service account email added as a user on each GSC property
     (Search Console -> Settings -> Users and permissions -> Add user).
     "Restricted" permission is enough for performance data.
     Run `gsc-pull.py access` to see which stores are still missing.

Usage:
  python3 scripts/gsc-pull.py sites
  python3 scripts/gsc-pull.py access
  python3 scripts/gsc-pull.py query <store|domain> [--days 28] [--dims query,page]
                                    [--limit 200] [--page /blog/]
                                    [--start 2026-07-01] [--end 2026-07-28] [--json]
  python3 scripts/gsc-pull.py all [--days 28]
"""

import argparse
import datetime as dt
import json
import sys
import urllib.parse
import warnings

warnings.filterwarnings("ignore")

try:
    from google.oauth2 import service_account
    import google.auth.transport.requests as greq
except ImportError:
    sys.exit("Missing google-auth. Install with: python3 -m pip install --user google-auth requests")

KEY_PATH = "/Users/mikejin/.config/ga4-mcp/sa-key.json"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
API = "https://searchconsole.googleapis.com/webmasters/v3"

# store key -> live production domain (property table: CLAUDE.md)
STORES = {
    "nonla": "nonlaexpress.com",
}

# GSC reports lag ~2-3 days; default windows end there so rows aren't half-empty.
LAG_DAYS = 3


def session():
    creds = service_account.Credentials.from_service_account_file(KEY_PATH, scopes=SCOPES)
    return greq.AuthorizedSession(creds)


def fetch_sites(sess):
    r = sess.get(f"{API}/sites")
    r.raise_for_status()
    return r.json().get("siteEntry", [])


def resolve(sites, target):
    """Map a store key or domain to the siteUrl GSC actually knows it by."""
    domain = STORES.get(target, target).lower().strip("/")
    domain = domain.replace("https://", "").replace("http://", "")
    candidates = []
    for entry in sites:
        url = entry["siteUrl"]
        bare = url.replace("sc-domain:", "").replace("https://", "").replace("http://", "")
        bare = bare.strip("/").lower()
        if bare == domain or bare == f"www.{domain}":
            candidates.append(entry)
    # prefer domain properties (they cover www + http + subdomains)
    candidates.sort(key=lambda e: 0 if e["siteUrl"].startswith("sc-domain:") else 1)
    return candidates[0] if candidates else None


def date_window(args):
    if args.start and args.end:
        return args.start, args.end
    end = dt.date.today() - dt.timedelta(days=LAG_DAYS)
    start = end - dt.timedelta(days=args.days - 1)
    return start.isoformat(), end.isoformat()


def query(sess, site_url, start, end, dimensions, limit, page_filter=None):
    body = {
        "startDate": start,
        "endDate": end,
        "dimensions": dimensions,
        "rowLimit": limit,
        "type": "web",
    }
    if page_filter:
        body["dimensionFilterGroups"] = [{
            "filters": [{"dimension": "page", "operator": "contains", "expression": page_filter}]
        }]
    enc = urllib.parse.quote(site_url, safe="")
    r = sess.post(f"{API}/sites/{enc}/searchAnalytics/query", json=body)
    if r.status_code != 200:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:400]}")
    return r.json().get("rows", [])


def cmd_sites(sess, args):
    sites = fetch_sites(sess)
    if not sites:
        print("No properties shared with the service account yet.\n")
        print("Fix: in Search Console for each site ->")
        print("  Settings -> Users and permissions -> Add user")
        print("  claude-ga4-reader@xo-seo-505117.iam.gserviceaccount.com  (Restricted is enough)")
        return
    print(f"{len(sites)} propert{'y' if len(sites) == 1 else 'ies'} visible:\n")
    for e in sorted(sites, key=lambda x: x["siteUrl"]):
        print(f"  {e['permissionLevel']:<18} {e['siteUrl']}")


def cmd_access(sess, args):
    sites = fetch_sites(sess)
    print(f"{'store':<16} {'domain':<34} status")
    print("-" * 80)
    missing = []
    for key, domain in STORES.items():
        hit = resolve(sites, key)
        if hit:
            print(f"{key:<16} {domain:<34} OK  ({hit['permissionLevel']}) {hit['siteUrl']}")
        else:
            print(f"{key:<16} {domain:<34} -- not shared")
            missing.append(domain)
    if missing:
        print(f"\n{len(missing)} propert{'y' if len(missing) == 1 else 'ies'} still need the grant:")
        print("  claude-ga4-reader@xo-seo-505117.iam.gserviceaccount.com")
        for d in missing:
            print(f"    https://search.google.com/search-console/users?resource_id=sc-domain:{d}")


def cmd_query(sess, args):
    sites = fetch_sites(sess)
    hit = resolve(sites, args.target)
    if not hit:
        sys.exit(f"'{args.target}' is not shared with the service account. Run: gsc-pull.py access")
    start, end = date_window(args)
    dims = [d.strip() for d in args.dims.split(",") if d.strip()]
    rows = query(sess, hit["siteUrl"], start, end, dims, args.limit, args.page)

    if args.json:
        print(json.dumps({"site": hit["siteUrl"], "start": start, "end": end,
                          "dimensions": dims, "rows": rows}, indent=2))
        return

    print(f"{hit['siteUrl']}   {start} -> {end}   ({len(rows)} rows)")
    if args.page:
        print(f"filtered to pages containing: {args.page}")
    print()
    header = "  ".join(f"{d:<44}" for d in dims)
    print(f"{header} {'clicks':>7} {'impr':>8} {'ctr':>7} {'pos':>7}")
    print("-" * (46 * len(dims) + 34))
    for row in rows:
        keys = "  ".join(f"{k[:43]:<44}" for k in row.get("keys", []))
        print(f"{keys} {row['clicks']:>7.0f} {row['impressions']:>8.0f} "
              f"{row['ctr'] * 100:>6.1f}% {row['position']:>7.2f}")
    if rows:
        tc = sum(r["clicks"] for r in rows)
        ti = sum(r["impressions"] for r in rows)
        print("-" * (46 * len(dims) + 34))
        print(f"{'TOTAL':<{46 * len(dims)}} {tc:>7.0f} {ti:>8.0f} "
              f"{(tc / ti * 100 if ti else 0):>6.1f}%")


def cmd_all(sess, args):
    sites = fetch_sites(sess)
    start, end = date_window(args)
    print(f"Network GSC summary  {start} -> {end}\n")
    print(f"{'store':<16} {'clicks':>8} {'impr':>10} {'ctr':>8} {'avg pos':>9}")
    print("-" * 56)
    totals = [0.0, 0.0]
    for key in STORES:
        hit = resolve(sites, key)
        if not hit:
            print(f"{key:<16} {'—':>8} {'—':>10} {'—':>8} {'—':>9}   (no access)")
            continue
        try:
            rows = query(sess, hit["siteUrl"], start, end, [], 1)
        except RuntimeError as e:
            print(f"{key:<16} error: {e}")
            continue
        if not rows:
            print(f"{key:<16} {0:>8} {0:>10} {'—':>8} {'—':>9}")
            continue
        r = rows[0]
        totals[0] += r["clicks"]
        totals[1] += r["impressions"]
        print(f"{key:<16} {r['clicks']:>8.0f} {r['impressions']:>10.0f} "
              f"{r['ctr'] * 100:>7.1f}% {r['position']:>9.2f}")
    print("-" * 56)
    ctr = totals[0] / totals[1] * 100 if totals[1] else 0
    print(f"{'NETWORK':<16} {totals[0]:>8.0f} {totals[1]:>10.0f} {ctr:>7.1f}%")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("sites", help="list properties the service account can see")
    sub.add_parser("access", help="per-store access matrix + grant links")

    q = sub.add_parser("query", help="search analytics for one store")
    q.add_argument("target", help="store key (e.g. lic) or domain")
    q.add_argument("--days", type=int, default=28)
    q.add_argument("--start")
    q.add_argument("--end")
    q.add_argument("--dims", default="query", help="comma list: query,page,date,country,device")
    q.add_argument("--limit", type=int, default=200)
    q.add_argument("--page", help="only rows whose page URL contains this")
    q.add_argument("--json", action="store_true")

    a = sub.add_parser("all", help="one summary row per store")
    a.add_argument("--days", type=int, default=28)
    a.add_argument("--start")
    a.add_argument("--end")

    args = p.parse_args()
    sess = session()
    {"sites": cmd_sites, "access": cmd_access, "query": cmd_query, "all": cmd_all}[args.cmd](sess, args)


if __name__ == "__main__":
    main()
