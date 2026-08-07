#!/usr/bin/env python3
"""
svgclean.py — turn the harvested Wix SVGs into brand art we can theme.

Phase B of docs/redesign-plan.md. Stdlib only, like verify.py and cdp.py
(svgo is not installed and this needs no dependency).

WHY THIS ISN'T JUST A MINIFIER
------------------------------
The files in docs/assets/original-site/svg/ are Wix runtime output, and their
inline `fill=` attributes are NOT the colors the live site showed. Wix ships a
palette override as a scoped stylesheet:

    <defs><style>#comp-m4n7mwb1 svg [data-color="1"] {fill:#D14124;}</style></defs>
    ...
    <path fill="#00b58d" data-color="1"/>      <-- source-art teal, never seen

The selector needs a `#comp-…` ancestor that only exists inside the Wix page, so
a harvested file renders its *source* colors (that's why docs/assets/original-
site/screenshots/svg-sheet.png shows a teal drink cup that is terracotta on the
real site). Step 1 below resolves those rules into the elements, so what we
optimize is what the original actually displayed. Step 2 then remaps that onto
our tokens.

THE OUTPUT SPLIT (and why it isn't all in static/)
--------------------------------------------------
  src/lib/art/        art that must recolor per surface. Emitted with
                      `currentColor` / `var(--art-*)` fills and INLINED by
                      src/lib/site/Art.svelte, because CSS custom properties and
                      currentColor are inert inside an <img src="…svg">.
  static/assets/art/  art that never recolors (the three pastel dish
                      illustrations, 24-28KB each). Served as files via <img>
                      so they stay out of the HTML and get cached separately.

The plan named only static/assets/art/; the split is the concession to the color
contract (plan §2.1) — see the Phase B session-log entry.

USAGE
    python3 scripts/svgclean.py            # write both output dirs
    python3 scripts/svgclean.py --sheet    # also write a contact sheet to
                                           # docs/assets/original-site/screenshots/
    python3 scripts/svgclean.py --dry-run  # report only
"""

import argparse
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "docs", "assets", "original-site", "svg")
INLINE_DIR = os.path.join(ROOT, "src", "lib", "art")
STATIC_DIR = os.path.join(ROOT, "static", "assets", "art")
SHEET = os.path.join(
    ROOT, "docs", "assets", "original-site", "screenshots", "art-sheet.html"
)

# Colors as the ORIGINAL SITE rendered them, after the data-color rules resolve.
LIVE = {
    "terracotta": "#D14124",
    "cream": "#F0EAD6",
    "green": "#53B28F",  # Wix's mid green for the herb / lime art
    "grey": "#A4A4A4",
    "black": "#010100",
    "white": "#FFFFFF",
}

# ---------------------------------------------------------------------------
# The manifest: source file -> what we emit.
#
#   mode "inline"  -> src/lib/art/,       rendered by Art.svelte
#   mode "static"  -> static/assets/art/, rendered by <img>
#
# `colors` remaps resolved hex -> whatever we want in the output. Two idioms:
#
#   "currentColor"                  monochrome art; takes the surface's color,
#                                   so `color: var(--fg)` themes it for free.
#   "var(--art-fill, …)"            two-tone art, themed per .on-* surface by
#   "var(--art-detail, …)"          the --art-* tokens in app.css. `fill` is the
#                                   body/large shape, `detail` the line-work
#                                   or inner shape.
#
# The folk animals are two-tone BY CONSTRUCTION — path 0 of each is a single
# 5-7KB cream silhouette of the whole body, with 45-49 terracotta detail paths
# on top. On the original's cream page that base is invisible; on our green
# ground it turns each animal into a cream paper-cut with red line-work, which
# resolves "terracotta is 1.89:1 on green" (plan Phase C §1) without repainting
# the artwork — verified on all four surfaces in the contact sheet. That is why
# they need no tokens at all and ship as plain files.
# ---------------------------------------------------------------------------
MANIFEST = [
    # --- logo lockups (monochrome) ---
    # home-06 over home-02/menu-18/company-23: identical geometry, but home-06
    # is the one instance Wix shipped without a <style> override block.
    ("home-06.svg", "logo-horizontal", "inline", {LIVE["terracotta"]: "currentColor"}),
    # home-16 ships the cream override, so by the time we recolor it the source
    # #c64226 is already resolved away to LIVE cream — map that, not the source.
    ("home-16.svg", "logo-stacked", "inline", {LIVE["cream"]: "currentColor"}),
    # --- folk animals (two-tone: cream body + terracotta line-work) ---
    # These are the only art that needs NO theming: the cream base carries the
    # terracotta line-work with it onto any dark surface, so they are
    # self-contained and go out as files. That matters here because they are by
    # far the biggest assets (48-64KB of genuine geometry that does not
    # compress — inlining all three would put 165KB into the homepage HTML).
    ("home-07.svg", "pig", "static", None),
    ("home-08.svg", "rooster", "static", None),
    ("home-09.svg", "buffalo", "static", None),
    # --- monochrome decorative art ---
    # NB: the plan's inventory called home-03 a "red herb leaf". It is a SHRIMP
    # (see svg-sheet.png). home-04 is the herb/cilantro sprig.
    ("home-03.svg", "shrimp", "inline", {LIVE["terracotta"]: "currentColor"}),
    ("home-04.svg", "herb", "inline", {LIVE["green"]: "currentColor"}),
    ("home-05.svg", "noodles", "inline", {"#ffffff": "currentColor"}),
    ("home-14.svg", "bean", "inline", {"#ffffff": "currentColor"}),
    ("home-12.svg", "beans", "inline", {LIVE["terracotta"]: "currentColor"}),
    # --- two-tone drinks art (charcoal band) ---
    (
        "home-11.svg",
        "cup",
        "inline",
        {
            LIVE["terracotta"]: "var(--art-detail, #D14124)",
            LIVE["cream"]: "var(--art-fill, #F0EAD6)",
        },
    ),
    (
        "home-13.svg",
        "phin",
        "inline",
        {
            LIVE["cream"]: "var(--art-fill, #F0EAD6)",
            LIVE["grey"]: "var(--art-detail, #D14124)",
            LIVE["black"]: "var(--art-detail, #D14124)",
        },
    ),
    (
        "menu-21.svg",
        "lime",
        "inline",
        # The fruit BODIES are the 2 green paths and the cut-flesh flower is the
        # 5 cream ones — the reverse of how the source art is colored (yellow
        # bodies, green flesh), because Wix's override swaps them. Body = fill.
        {
            LIVE["green"]: "var(--art-fill, #F0EAD6)",
            LIVE["cream"]: "var(--art-detail, #D14124)",
        },
    ),
    # --- multicolor illustrated dishes (/company, Phase E) — no recolor ---
    ("company-29.svg", "dish-pho", "static", None),
    ("company-30.svg", "dish-plate", "static", None),
    ("company-31.svg", "dish-rolls", "static", None),
]

# Deliberately NOT emitted, so a later session doesn't wonder where they went:
#   home-01 hamburger · home-10 arrow · home-17 close · company-26 play button ·
#   company-27/28 music notes   -> Wix UI chrome, we have our own.
#   home-15 circle              -> the footer arc; plan §1.5 M2 says a
#                                  border-radius:50% div reproduces it exactly.
#   home-02/menu-18/company-23  -> dupes of home-06 (logo-horizontal)
#   menu-22                     -> dupe of home-16 (logo-stacked)
#   company-24/menu-19          -> dupes of home-03 (shrimp)
#   company-25/menu-20          -> dupes of home-04 (herb)
#   home-32/33/34               -> dupes of home-11/12/13 (cup/beans/phin)


NUM = re.compile(r"[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?")
CMD = "MmLlHhVvCcSsQqTtAaZz"
NARGS = {"M": 2, "L": 2, "T": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "A": 7, "Z": 0}


def resolve_wix_colors(svg):
    """Fold the scoped `[data-color="N"] {fill:…}` rules into the elements.

    Returns (svg, applied) where `applied` maps data-color -> hex, for logging.
    """
    rules = {}
    for block in re.findall(r"<style[^>]*>(.*?)</style>", svg, re.S):
        for key, hexval in re.findall(
            r'\[data-color=(?:"|&quot;)(\d+)(?:"|&quot;)\]\s*\{\s*fill:\s*([^;}]+)',
            html.unescape(block),
        ):
            rules[key] = hexval.strip()
    if not rules:
        return svg, {}

    def paint(m):
        tag = m.group(0)
        key = re.search(r'data-color="(\d+)"', tag)
        if not key or key.group(1) not in rules:
            return tag
        want = rules[key.group(1)]
        if 'fill="' in tag:
            return re.sub(r'fill="[^"]*"', 'fill="%s"' % want, tag, count=1)
        return tag[:-1].rstrip() + ' fill="%s">' % want

    svg = re.sub(r"<(?:path|circle|rect|polygon|ellipse|g)\b[^>]*>", paint, svg)
    return svg, rules


def strip_wix(svg):
    """Remove the Wix scaffolding an inlined asset must not carry."""
    svg = re.sub(r"<\?xml[^>]*\?>", "", svg)
    svg = re.sub(r"<!--.*?-->", "", svg, flags=re.S)
    # the override stylesheet is resolved by now; drop it and any <defs> it emptied
    svg = re.sub(r"<style[^>]*>.*?</style>", "", svg, flags=re.S)
    svg = re.sub(r"<defs>\s*</defs>", "", svg)
    for attr in (
        "data-bbox",
        "data-type",
        "data-color",
        "data-name",
        "preserveAspectRatio",
        "role",
        "aria-label",
        "aria-hidden",
        "xml:space",
    ):
        svg = re.sub(r'\s%s="[^"]*"' % attr, "", svg)
    # width/height would fight the CSS sizing; viewBox is what we keep
    svg = re.sub(r'(<svg\b[^>]*?)\s(?:width|height)="[^"]*"', r"\1", svg)
    svg = re.sub(r'(<svg\b[^>]*?)\s(?:width|height)="[^"]*"', r"\1", svg)
    return svg


def recolor(svg, mapping):
    if not mapping:
        return svg
    out = svg
    for src, dst in mapping.items():
        out = re.sub(
            r'(fill|stroke)="%s"' % re.escape(src),
            lambda m, d=dst: '%s="%s"' % (m.group(1), d),
            out,
            flags=re.I,
        )
    return out


def fmt_num(text, prec):
    """Round one numeric token and drop what SVG lets us drop."""
    try:
        v = round(float(text), prec)
    except ValueError:
        return text
    s = ("%.*f" % (prec, v)).rstrip("0").rstrip(".")
    if s in ("", "-", "-0"):
        return "0"
    if s.startswith("0."):  # ".5" is valid path data and one byte shorter
        return s[1:]
    if s.startswith("-0."):
        return "-" + s[2:]
    return s


def tokenize_path(d):
    """Walk path data command by command, yielding ('cmd'|'num'|'flag', text).

    Command-aware on purpose. An elliptical arc is
    `A rx ry x-rotation large-arc-flag sweep-flag x y`, and its two flags are
    SINGLE characters that are legally written with no separator — `a5 5 0 015 5`
    means flags 0 and 1 followed by `5 5`. A plain number regex reads that as
    the number `015`, silently eats both flags, and shifts every following
    argument by two. That is what turned the /company dish illustrations into
    solid brown blobs: their outlines are evenodd paths whose holes disappeared.
    Flags are therefore emitted verbatim and never rounded.
    """
    i, n = 0, len(d)
    cmd, argi, nargs = None, 0, 0
    while i < n:
        ch = d[i]
        if ch in CMD:
            cmd, nargs, argi = ch, NARGS[ch.upper()], 0
            yield "cmd", ch
            i += 1
            continue
        if ch in " ,\t\r\n":
            i += 1
            continue
        if cmd in "Aa" and argi % 7 in (3, 4):
            yield "flag", ch
            i += 1
            argi += 1
            continue
        m = NUM.match(d, i)
        if not m or not m.group(0):
            yield "num", ch  # unparseable byte — pass through untouched
            i += 1
            continue
        yield "num", m.group(0)
        i = m.end()
        argi += 1


def round_path_data(d, prec=2):
    """Re-emit path data at `prec` decimals, dropping every separator SVG lets
    us drop — but no more than that.

    Only two things are self-delimiting after a number: a leading `-`, and a
    leading `.` when the PREVIOUS token already spent its decimal point (`1.5.5`
    is unambiguously 1.5 then 0.5, but `12` + `.5` glued is the single number
    12.5). Getting that second case wrong is what path_signature() caught here.
    """
    out, prev = [], None
    for kind, text in tokenize_path(d):
        if kind == "cmd":
            out.append(text)
            prev = None  # a command letter already delimits what follows
            continue
        val = text if kind == "flag" else fmt_num(text, prec)
        if prev is not None and not val.startswith("-"):
            if not (val.startswith(".") and "." in prev):
                out.append(" ")
        out.append(val)
        prev = val
    return "".join(out)


def path_signature(d):
    """Structural fingerprint: the command letters plus how many arguments each
    got. Rounding must never change this — if it does, the geometry was
    corrupted rather than compressed, so clean() aborts."""
    sig, count = [], 0
    for kind, text in tokenize_path(d):
        if kind == "cmd":
            sig.append((text, count))
            count = 0
        else:
            count += 1
    sig.append(("$", count))
    return sig


def round_paths(svg, prec=2):
    """Round coordinates in path data. Wix ships 1-3dp; 2 is visually lossless
    at the sizes this art is used (the largest viewBox is ~600 units)."""

    def do(m):
        attr, val = m.group(1), m.group(2)
        if attr == "d":
            return 'd="%s"' % round_path_data(val, prec)
        return '%s="%s"' % (attr, NUM.sub(lambda x: fmt_num(x.group(0), prec), val))

    return re.sub(r'\b(d|viewBox|points)="([^"]*)"', do, svg)


def collapse(svg):
    svg = re.sub(r">\s+<", "><", svg)
    svg = re.sub(r"\s{2,}", " ", svg)
    return svg.strip()


def clean(path, mapping):
    raw = open(path, encoding="utf-8").read()
    svg, rules = resolve_wix_colors(raw)
    svg = strip_wix(svg)
    svg = recolor(svg, mapping)

    before = [path_signature(d) for d in re.findall(r'\sd="([^"]*)"', svg)]
    svg = round_paths(svg)
    after = [path_signature(d) for d in re.findall(r'\sd="([^"]*)"', svg)]
    if before != after:
        bad = next(i for i, (b, a) in enumerate(zip(before, after)) if b != a)
        raise SystemExit(
            "%s: rounding changed the structure of path %d — geometry corrupted, "
            "not compressed. Compare tokenize_path() against that path's "
            "commands before shipping this." % (os.path.basename(path), bad)
        )

    svg = collapse(svg)
    # inlined art is decorative; Art.svelte owns the accessible name
    svg = svg.replace("<svg ", '<svg aria-hidden="true" focusable="false" ', 1)
    leftover = sorted(set(re.findall(r'(?:fill|stroke)="(#[0-9A-Fa-f]{3,8})"', svg)))
    return svg, rules, leftover, len(raw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheet", action="store_true", help="write an HTML contact sheet")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not args.dry_run:
        os.makedirs(INLINE_DIR, exist_ok=True)
        os.makedirs(STATIC_DIR, exist_ok=True)

    before = after = 0
    rows = []
    for src, name, mode, mapping in MANIFEST:
        path = os.path.join(SRC_DIR, src)
        if not os.path.exists(path):
            print("MISSING %s" % src, file=sys.stderr)
            return 1
        svg, rules, leftover, raw_len = clean(path, mapping)
        out_dir = INLINE_DIR if mode == "inline" else STATIC_DIR
        out = os.path.join(out_dir, name + ".svg")
        before += raw_len
        after += len(svg)
        if not args.dry_run:
            with open(out, "w", encoding="utf-8") as fh:
                fh.write(svg + "\n")
        rel = os.path.relpath(out, ROOT)
        flag = ""
        if mode == "inline" and leftover:
            # a hard-coded hex surviving into inline art means the manifest
            # missed a color and it will not theme
            flag = "  ⚠ un-themed: %s" % ",".join(leftover)
        print(
            "%-18s %6d -> %6d  (%3d%%)  %s%s"
            % (name, raw_len, len(svg), 100 * len(svg) // raw_len, rel, flag)
        )
        rows.append((name, mode, svg))

    print(
        "\n%d files  %.1fKB -> %.1fKB  (%d%% of original)"
        % (len(MANIFEST), before / 1024, after / 1024, 100 * after // before)
    )

    if args.sheet and not args.dry_run:
        write_sheet(rows)
        print("contact sheet: %s" % os.path.relpath(SHEET, ROOT))
    return 0


def write_sheet(rows):
    """Render every emitted asset on the real surfaces it has to work on, so
    the recolor can be eyeballed rather than assumed."""
    cells = []
    for name, mode, svg in rows:
        cells.append(
            '<figure><div class="a">%s</div><figcaption>%s<small>%s</small>'
            "</figcaption></figure>" % (svg, name, mode)
        )
    css = (
        "body{margin:0;font:13px/1.4 ui-monospace,monospace}"
        "section{padding:24px}"
        "h2{font:600 12px/1 ui-monospace,monospace;letter-spacing:.1em;"
        "opacity:.7;margin:0 0 16px}"
        ".grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));"
        "gap:20px}"
        "figure{margin:0;text-align:center}"
        ".a{height:110px;display:flex;align-items:center;justify-content:center}"
        ".a svg{max-width:100%;max-height:110px;width:auto;height:auto}"
        "figcaption{margin-top:8px;font-size:11px;opacity:.85}"
        "small{display:block;opacity:.55}"
        # These MUST mirror the --art-* pairs each .on-* class sets in
        # src/app.css, or this sheet stops being evidence about the real site.
        ".ground{background:#17543E;color:#F0EAD6;--art-fill:#F0EAD6;--art-detail:#D14124}"
        ".deep{background:#143F32;color:#FAE6C0;--art-fill:#F0EAD6;--art-detail:#D14124}"
        ".cream{background:#F0EAD6;color:#D14124;--art-fill:#D14124;--art-detail:#F0EAD6}"
        ".char{background:#2D2926;color:#F0EAD6;--art-fill:#F0EAD6;--art-detail:#D14124}"
    )
    surfaces = (
        ("ground", ".on-green — the page ground #17543E, color = cream --fg"),
        ("deep", ".on-green-deep #143F32, color = --sand"),
        ("cream", ".on-cream panel #F0EAD6, color = --terracotta"),
        ("char", ".on-charcoal #2D2926 — the drinks band"),
    )
    body = "".join(
        '<section class="' + cls + '"><h2>' + label + '</h2><div class="grid">'
        + "".join(cells)
        + "</div></section>"
        for cls, label in surfaces
    )
    doc = (
        '<!doctype html><meta charset="utf-8"><title>Nón Lá art sheet</title>'
        "<style>" + css + "</style>" + body
    )
    with open(SHEET, "w", encoding="utf-8") as fh:
        fh.write(doc)


if __name__ == "__main__":
    sys.exit(main())
