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

Two known blind spots, both deliberate:
  · `.on-media` subtrees (content over the hero video) report against the page
    background, not the video — they are listed separately as `on_media` and
    are verified instead by sampling the video itself (see plan §2.1).
  · The webfont check cannot detect a CJK swap, because CJK glyphs are
    full-width in every font. Noto Serif SC was confirmed once via
    CSS.getPlatformFontsForNode; a `notoSC: false` here is not a real failure.
    Likewise a face the page never renders is never fetched — `playfair900i`
    reads false on pages with no italic display type. That is correct lazy
    loading, not a bug.
"""
import json, sys, time, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from cdp import Chrome

OUT_TAG = "phaseA"  # bump per phase
REPO = pathlib.Path(__file__).resolve().parent.parent
OUT = REPO / "docs/assets/original-site/screenshots" / OUT_TAG
OUT.mkdir(parents=True, exist_ok=True)

ROUTES = ["/", "/menu/", "/company/", "/press/", "/privacy-policy/",
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
(() => {
  const cs = getComputedStyle(document.body);
  const root = getComputedStyle(document.documentElement);
  const pick = s => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null; };
  const nav = pick('.nav-link'), disp = pick('.display'), btn = pick('.btn-primary');
  return {
    fontsLoaded: (() => {
      const probe = (css, text, fallback) => {
        const mk = f => { const s = document.createElement('span');
          s.style.cssText = 'position:absolute;left:-9999px;white-space:nowrap;' + css
            .replace(/font-family:[^;]*;?/, '') + ';font-family:' + f;
          s.textContent = text; document.body.appendChild(s);
          const w = s.getBoundingClientRect().width; s.remove(); return w; };
        return mk(css.match(/font-family:([^;]*)/)[1] + ',' + fallback) !== mk(fallback);
      };
      return {
        maname: probe('font-weight:400;font-size:48px;font-family:Maname', 'Phở Express', 'monospace'),
        playfair900: probe('font-weight:900;font-size:96px;font-family:"Playfair Display"', 'NATURAL', 'monospace'),
        playfair900i: probe('font-style:italic;font-weight:900;font-size:96px;font-family:"Playfair Display"', 'nón lá', 'monospace'),
        overpass700: probe('font-weight:700;font-size:32px;font-family:Overpass', 'ORDER ONLINE', 'monospace'),
        notoSC: probe('font-weight:600;font-size:32px;font-family:"Noto Serif SC"', '越南河粉法拉盛', 'monospace')
      };
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

