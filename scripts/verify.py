"""Per-phase verification sweep (docs/redesign-plan.md §4).

Walks every route at 1440 and 540 wide, and for each one:
  · composites every text element's color over its REAL background (walking
    ancestors for the first opaque one) and flags anything under 4.5:1 —
    3.0:1 for large text — i.e. a genuine WCAG AA audit, not a spot check
  · confirms each webfont actually rendered, by measuring a real span against
    a fallback-only control
  · checks for horizontal overflow
  · captures screenshots to docs/assets/original-site/screenshots/<OUT_TAG>/

Run after every phase:  pnpm build && pnpm preview  then  python3 scripts/verify.py

One known blind spot, deliberate:
  · `.on-media` subtrees (content over the hero video) report against the page
    background, not the video — they are listed separately as `on_media` and
    are verified instead by sampling the video itself (see plan §2.1). Phase F
    re-sampled it across 8 timestamps and moved `.hero-sub` off `--fg-muted`
    (0.9 alpha) as a result; the numbers are in plan §2.8.

⚠️ The second "blind spot" documented here until Phase F was not one. It said a
`notoSC: false` was expected because a width probe cannot see a CJK face, and
that `playfair900i` reads false wherever no italic display type renders. The
first half was a real limitation of the probe's INPUT, fixed in Phase E by
probing every face on Latin text and awaiting the lazy per-subset loads; the
second was an artefact of the same synchronous-probe bug. Both faces have
reported true on all 7 routes since. The lesson is in plan §2.7: this file
carried a written excuse for a red check, which is what kept anyone from
reading it as a real failure for five phases.
"""
import json, sys, time, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from cdp import Chrome

OUT_TAG = "menu-photos"  # bump per phase — this dir is overwritten unconditionally,
# so leaving it stale silently relabels the previous phase's captures as this
# one's. (Phase A's cream captures survive only in git at a4bc657; the ones
# now in screenshots/phaseA/ are the 2026-08-07 green-ground re-skin.
# "swap" = the 2026-08-07 cream-ground / green-accent / terracotta-third
# re-skin, plan §1.2d — not a phase, a palette direction.)
REPO = pathlib.Path(__file__).resolve().parent.parent
OUT = REPO / "docs/assets/original-site/screenshots" / OUT_TAG
OUT.mkdir(parents=True, exist_ok=True)

# /press became /blog on 2026-08-12 (it now renders WordPress posts). /press
# still exists as a redirect stub and is deliberately NOT audited: it bounces to
# /blog/ on mount, so a run against it would just measure /blog twice.
ROUTES = ["/", "/menu/", "/company/", "/blog/", "/privacy-policy/",
          "/terms-and-conditions/", "/accessibility-statement/"]

AUDIT = r"""
(() => {
  const lum = c => {
    const f = v => { v/=255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); };
    return .2126*f(c[0]) + .7152*f(c[1]) + .0722*f(c[2]);
  };
  const ratio = (a,b) => { const L1=lum(a), L2=lum(b); const [h,l]=L1>L2?[L1,L2]:[L2,L1];
    return (h+.05)/(l+.05); };
  const parse = s => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : null; };
  // custom properties come back as authored, so --surface is usually a hex
  const parseColor = s => {
    s = (s || '').trim();
    if (s.startsWith('#')) {
      const h = s.slice(1);
      const x = h.length === 3 ? [...h].map(d => d+d) : h.match(/../g);
      return x && x.length >= 3 ? x.slice(0,3).map(v => parseInt(v, 16)) : null;
    }
    return parse(s);
  };
  const over = (fg, bg) => { // composite fg (may have alpha) onto opaque bg
    const a = fg.length > 3 ? fg[3] : 1;
    return [0,1,2].map(i => fg[i]*a + bg[i]*(1-a));
  };
  const bgOf = el => {
    let n = el, onMedia = false;
    while (n && n !== document.documentElement) {
      if (n.classList && n.classList.contains('on-media')) onMedia = true;
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      if (c && (c.length < 4 || c[3] > 0)) return { bg: c.slice(0,3), onMedia };
      // A section may DECLARE its surface without PAINTING it. The site footer
      // is the live case: it is deliberately `background: transparent` because
      // its 255vw .arc sibling paints the ground, and a square slab would
      // destroy the dome (plan §2.3). Walking past it reads the page behind
      // the hole — which was harmless while that page was green and became 18
      // bogus 1:1 failures per route the moment the ground went cream.
      // The colour contract guarantees every .on-* class sets --surface, so
      // trust that declaration over the ancestor walk. Verified against the
      // real paint stack: .arc sits directly under .footer-body and cream on
      // it measures 9.76:1, not 1:1.
      // .on-media is excluded on purpose — it paints nothing because a VIDEO
      // is behind it, which no declared token can stand in for, so those stay
      // flagged separately for the manual frame-sampling check.
      if (n.classList && !n.classList.contains('on-media') &&
          [...n.classList].some(k => k.startsWith('on-'))) {
        const s = parseColor(cs.getPropertyValue('--surface'));
        if (s && s.length >= 3) return { bg: s.slice(0,3), onMedia };
      }
      n = n.parentElement;
    }
    return { bg: [255,255,255], onMedia };
  };
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const txt = [...el.childNodes].filter(n => n.nodeType === 3)
      .map(n => n.textContent.trim()).join(' ').trim();
    if (!txt) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
    if (el.closest('.sr-only') || cs.clip === 'rect(0px, 0px, 0px, 0px)') continue;
    const { bg, onMedia } = bgOf(el);
    const fg = parse(cs.color); if (!fg) continue;
    const eff = over(fg, bg);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3.0 : 4.5;
    const cr = ratio(eff, bg);
    if (cr < need) out.push({
      sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
            ? '.' + el.className.trim().split(/\s+/).join('.') : ''),
      text: txt.slice(0, 42), size: Math.round(size*10)/10, weight,
      ratio: Math.round(cr*100)/100, need, onMedia
    });
  }
  return out;
})()
"""

PROBE = r"""
(async () => {
  const cs = getComputedStyle(document.body);
  const root = getComputedStyle(document.documentElement);
  const pick = s => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null; };
  const nav = pick('.nav-link'), disp = pick('.display'), btn = pick('.btn-primary');
  return {
    fontsLoaded: await (async () => {
      /* Two things this got wrong before Phase E, both of which reported a
         perfectly healthy font as MISSING on all 7 routes:

         1. ⚠️ WIDTH PROBING CANNOT SEE A CJK FACE. Han glyphs are full-width in
            every font, so '越南河粉法拉盛' measures 7 × font-size in Noto Serif
            SC and in the monospace fallback alike — measured 224px vs 224px.
            The comparison is structurally incapable of discriminating, and it
            had been quietly failing notoSC since the probe was written. The
            same test on Latin text in that face separates cleanly (228.6 vs
            250.5), so the technique is fine — its INPUT was wrong.
         2. These faces load LAZILY, per unicode-range subset, and the width
            probe is synchronous: a subset the page hasn't painted yet hasn't
            been fetched, so the probe measures the fallback. Ask for each face
            over its own probe text first, then measure.

         So: every face is width-probed on LATIN text (all five carry Latin
         glyphs), after an explicit load. notoSC additionally reports whether
         the CJK subset itself resolved, via the purpose-built API. */
      const FACES = [
        ['maname',       'font-weight:400;font-size:48px;font-family:Maname', 'Phở Express'],
        ['playfair900',  'font-weight:900;font-size:96px;font-family:"Playfair Display"', 'NATURAL'],
        ['playfair900i', 'font-style:italic;font-weight:900;font-size:96px;font-family:"Playfair Display"', 'nón lá'],
        ['overpass700',  'font-weight:700;font-size:32px;font-family:Overpass', 'ORDER ONLINE'],
        ['notoSC',       'font-weight:600;font-size:32px;font-family:"Noto Serif SC"', 'Nonla Express']
      ];
      const CJK = '越南河粉法拉盛';
      const shorthand = css => {
        const g = k => (css.match(new RegExp(k + ':([^;]*)')) || [, ''])[1].trim();
        return [g('font-style'), g('font-weight'), g('font-size')].filter(Boolean).join(' ')
               + ' ' + g('font-family');
      };
      await Promise.all([
        ...FACES.map(([, css, text]) => document.fonts.load(shorthand(css), text).catch(() => {})),
        document.fonts.load(shorthand(FACES[4][1]), CJK).catch(() => {})
      ]);
      await document.fonts.ready;

      const probe = (css, text, fallback) => {
        const mk = f => { const s = document.createElement('span');
          s.style.cssText = 'position:absolute;left:-9999px;white-space:nowrap;' + css
            .replace(/font-family:[^;]*;?/, '') + ';font-family:' + f;
          s.textContent = text; document.body.appendChild(s);
          const w = s.getBoundingClientRect().width; s.remove(); return w; };
        return mk(css.match(/font-family:([^;]*)/)[1] + ',' + fallback) !== mk(fallback);
      };
      const out = Object.fromEntries(
        FACES.map(([name, css, text]) => [name, probe(css, text, 'monospace')]));
      out.notoSC = out.notoSC && document.fonts.check(shorthand(FACES[4][1]), CJK);
      return out;
    })(),
    body: { bg: cs.backgroundColor, color: cs.color, family: cs.fontFamily.split(',')[0], size: cs.fontSize },
    nav: nav && { family: nav.fontFamily.split(',')[0], size: nav.fontSize, color: nav.color },
    display: disp && { family: disp.fontFamily.split(',')[0], size: disp.fontSize,
                       weight: disp.fontWeight, transform: disp.textTransform },
    btn: btn && { bg: btn.backgroundColor, color: btn.color, radius: btn.borderRadius,
                  transition: btn.transitionProperty + ' / ' + btn.transitionDuration },
    tokens: ['--surface','--fg','--accent','--accent-ink','--display','--body-font']
      .reduce((a,k) => (a[k] = root.getPropertyValue(k).trim(), a), {}),
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth
  };
})()
"""

report = {}
for width, tag in ((1440, "desktop"), (540, "mobile")):
    c = Chrome(width, 900)
    for route in ROUTES:
        name = (route.strip("/") or "home").replace("/", "-")
        c.goto(f"http://localhost:4173{route}", wait=6)
        c.js("document.fonts.ready")
        time.sleep(1.5)
        probe = c.js(PROBE)
        fails = c.js(AUDIT)
        report[f"{tag}:{route}"] = {"probe": probe, "contrast_failures": fails}
        c.shot(str(OUT / f"{tag}-{name}.png"))
    c.close()
    time.sleep(1)


ok = True
for key, v in report.items():
    pr = v["probe"]
    fails = [f for f in v["contrast_failures"] if not f["onMedia"]]
    media = [f for f in v["contrast_failures"] if f["onMedia"]]
    bad_fonts = [k for k, ld in pr["fontsLoaded"].items() if not ld]
    overflow = pr["scrollW"] > pr["clientW"] + 1
    flag = "FAIL" if (fails or bad_fonts or overflow) else "ok  "
    if fails or bad_fonts or overflow: ok = False
    print(f'{flag} {key:34} fonts={"ALL" if not bad_fonts else "MISSING:"+",".join(bad_fonts)}'
          f' contrast_fails={len(fails)} on_media={len(media)}'
          f' hscroll={"YES " + str(pr["scrollW"]) + ">" + str(pr["clientW"]) if overflow else "no"}')
    for f in fails[:8]:
        print(f'       - {f["ratio"]}:1 (need {f["need"]}) {f["size"]}px/{f["weight"]} {f["sel"][:46]} :: {f["text"][:34]!r}')
    for f in media[:4]:
        print(f'       ~ over-media {f["ratio"]}:1 {f["size"]}px {f["sel"][:40]} :: {f["text"][:30]!r}')

h = report["desktop:/"]["probe"]
print("\n--- resolved on home/desktop ---")
print(" body    ", h["body"])
print(" nav     ", h["nav"])
print(" display ", h["display"])
print(" btn     ", h["btn"])
print(" tokens  ", h["tokens"])
print("\nRESULT:", "PASS" if ok else "ISSUES ABOVE")

