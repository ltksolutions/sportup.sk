# SPDX-FileCopyrightText: 2026 LTK Solutions s.r.o.
# SPDX-License-Identifier: EUPL-1.2
"""
SportUp — generátor carousel slidov pre sociálne siete.

Vizuálna identita podľa website/brand/BRAND.md (Design Manual v2.0):
  Navy  #1A2D47 — pozadie
  Blue  #388FC3 — akcent, CTA, linky
  White #FFFFFF — hlavný text
  Poppins — Bold (nadpisy), Regular (telo), SemiBold (labely)

Formáty:
  square   1080×1080  — LinkedIn, Facebook
  portrait 1080×1350  — Instagram (4:5)

Závislosti: Pillow, Poppins TTF (systémové fonty alebo tools/fonts/).
Použitie:   python3 tools/render.py
"""
from PIL import Image, ImageChops, ImageDraw, ImageFont
from pathlib import Path

# ── Oficiálna paleta (BRAND.md) ────────────────────────────────────────────
NAVY   = (26, 45, 71)      # #1A2D47
NAVY_D = (19, 34, 54)      # tmavší navy — akcentové slidy
CARD   = (36, 58, 88)      # karta na navy podklade
BLUE   = (56, 143, 195)    # #388FC3
WHITE  = (255, 255, 255)
MUTED  = (154, 168, 184)   # sekundárny text na navy
RED    = (198, 90, 80)     # stav "dnes" v porovnaniach
GREEN  = (110, 178, 130)   # stav "so SportUp"

REPO = Path(__file__).resolve().parents[3]
LOGO_PATH = REPO / "website" / "brand" / "logo" / "SportUp-dark.png"

FONT_DIRS = [
    Path.home() / "Library" / "Fonts",
    Path("/Library/Fonts"),
    Path("/usr/share/fonts/truetype/poppins"),
    Path(__file__).resolve().parent / "fonts",
]

# ── Formát ─────────────────────────────────────────────────────────────────
W, H = 1080, 1080
M = 84
TOP, BOTTOM = 236, 924

FORMATS = {"square": (1080, 1080), "portrait": (1080, 1350)}


def set_format(name):
    global W, H, TOP, BOTTOM
    W, H = FORMATS[name]
    TOP = 236 + (H - 1080) // 3
    BOTTOM = H - 156


def _font_file(weight):
    for d in FONT_DIRS:
        p = d / f"Poppins-{weight}.ttf"
        if p.exists():
            return str(p)
    raise FileNotFoundError(
        f"Poppins-{weight}.ttf sa nenašiel. Nainštaluj Poppins alebo ulož TTF "
        f"do {FONT_DIRS[-1]}"
    )


_font_cache = {}


def f(size, weight="SemiBold"):
    key = (size, weight)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(_font_file(weight), size)
    return _font_cache[key]


_logo_cache = {}


def logo_for(bg):
    """Logo s podkladom zladeným na farbu pozadia slidu (bez numpy)."""
    if bg not in _logo_cache:
        lg = Image.open(LOGO_PATH).convert("RGB")
        lw = 300
        lg = lg.resize((lw, int(lg.height * lw / lg.width)))
        if bg != NAVY:
            # maska: pixely blízke NAVY = podklad loga → prefarbiť na bg
            diff = ImageChops.difference(lg, Image.new("RGB", lg.size, NAVY))
            mask = diff.convert("L").point(lambda v: 255 if v <= 12 else 0)
            lg.paste(Image.new("RGB", lg.size, bg), mask=mask)
        _logo_cache[bg] = lg
    return _logo_cache[bg]


def wrap(d, text, fnt, max_w):
    out, cur = [], ""
    for word in text.split():
        test = (cur + " " + word).strip()
        if d.textlength(test, font=fnt) <= max_w:
            cur = test
        else:
            if cur:
                out.append(cur)
            cur = word
    if cur:
        out.append(cur)
    return out


def canvas(accent=False):
    bg = NAVY_D if accent else NAVY
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 10], fill=BLUE)          # akcentová linka
    img.paste(logo_for(bg), (M - 10, 52))
    return img, d


def foot(d, txt="sportup.sk"):
    d.text((M, H - 104), txt, font=f(30, "Bold"), fill=BLUE)


def card_lines(d, text, size, max_w):
    """Odseky oddeľuje znak | ."""
    lines = []
    for para in text.split("|"):
        lines += wrap(d, para.strip(), f(size, "Regular"), max_w) + [""]
    return lines[:-1]


def draw_card(d, x, y, w, text, label=None, col=BLUE, size=30):
    lines = card_lines(d, text, size, w - 64)
    hgt = (50 if label else 0) + len(lines) * int(size * 1.5) + 52
    d.rounded_rectangle([x, y, x + w, y + hgt], radius=18, fill=CARD)
    d.rectangle([x, y, x + 7, y + hgt], fill=col)
    yy = y + 26
    if label:
        d.text((x + 30, yy), label.upper(), font=f(23, "Bold"), fill=col)
        yy += 50
    for ln in lines:
        d.text((x + 30, yy), ln, font=f(size, "Regular"), fill=WHITE)
        yy += int(size * 1.5)
    return y + hgt


def _measure(d, headline, hs, body, bb, example, ex_label, be, badge, kicker):
    h = 0
    if kicker:
        h += 58
    if badge:
        h += 92
    h += len(wrap(d, headline, f(hs, "Bold"), W - 2 * M)) * int(hs * 1.28)
    if body:
        h += 24 + len(wrap(d, body, f(bb, "Regular"), W - 2 * M)) * int(bb * 1.5)
    if example:
        h += (32 + (50 if ex_label else 0)
              + len(card_lines(d, example, be, W - 2 * M - 64)) * int(be * 1.5) + 52)
    return h


def slide(path, headline, example=None, ex_label=None, body=None, badge=None,
          kicker=None, accent=False, cta=False, hsize=58, ex_col=BLUE):
    """Štandardný slide. Auto-fit zmenšuje písmo, kým sa obsah nezmestí."""
    img, d = canvas(accent)
    avail = BOTTOM - TOP
    hs, bb, be = hsize, 32, 30
    for _ in range(40):
        if _measure(d, headline, hs, body, bb, example, ex_label, be, badge, kicker) <= avail:
            break
        if be > 24:
            be -= 1
        elif bb > 24:
            bb -= 1
        elif hs > 40:
            hs -= 2
        else:
            break
    total = _measure(d, headline, hs, body, bb, example, ex_label, be, badge, kicker)
    y = TOP + (0 if example else max(0, (avail - total) // 3))

    if kicker:
        d.text((M, y), kicker.upper(), font=f(26, "Bold"), fill=BLUE)
        y += 58
    if badge:
        fb = f(26, "Bold")
        bw = d.textlength(badge, font=fb) + 42
        d.rounded_rectangle([M, y, M + bw, y + 54], radius=27, fill=BLUE)
        d.text((M + 21, y + 10), badge, font=fb, fill=WHITE)
        y += 92
    fh = f(hs, "Bold")
    for ln in wrap(d, headline, fh, W - 2 * M):
        d.text((M, y), ln, font=fh, fill=BLUE if cta else WHITE)
        y += int(hs * 1.28)
    if body:
        y += 24
        for ln in wrap(d, body, f(bb, "Regular"), W - 2 * M):
            d.text((M, y), ln, font=f(bb, "Regular"), fill=MUTED)
            y += int(bb * 1.5)
    if example:
        y += 32
        draw_card(d, M, y, W - 2 * M, example, ex_label, ex_col, be)
    foot(d)
    img.save(path)


def slide_vs(path, headline, before, after, hsize=52):
    """Porovnávací slide: stav dnes vs. stav so SportUp."""
    img, d = canvas(True)
    top = TOP - 36
    avail = BOTTOM - top
    hs, bs = hsize, 29

    def meas():
        h = len(wrap(d, headline, f(hs, "Bold"), W - 2 * M)) * int(hs * 1.28) + 36
        for t in (before, after):
            h += 50 + len(card_lines(d, t, bs, W - 2 * M - 64)) * int(bs * 1.5) + 78
        return h

    for _ in range(40):
        if meas() <= avail:
            break
        if bs > 23:
            bs -= 1
        elif hs > 40:
            hs -= 2
        else:
            break

    y = top
    for ln in wrap(d, headline, f(hs, "Bold"), W - 2 * M):
        d.text((M, y), ln, font=f(hs, "Bold"), fill=WHITE)
        y += int(hs * 1.28)
    y += 36
    for txt, lab, col in ((before, "Dnes", RED), (after, "So SportUp", GREEN)):
        y = draw_card(d, M, y, W - 2 * M, txt, lab, col, bs) + 26
    foot(d)
    img.save(path)


ASSETS = Path(__file__).resolve().parent / "assets"


def slide_image(path, headline, image, body=None, caption=None, accent=False,
                hsize=52):
    """Slide so snímkou obrazovky. Obrázok sa vloží pod nadpis, orámovaný.

    image — názov súboru v tools/assets/ alebo absolútna cesta.
    caption — krátky popisok pod obrázkom (napr. zdroj alebo vysvetlenie).
    """
    img, d = canvas(accent)
    src = Path(image)
    if not src.is_absolute():
        src = ASSETS / image
    shot = Image.open(src).convert("RGB")

    y = TOP - 30
    fh = f(hsize, "Bold")
    for ln in wrap(d, headline, fh, W - 2 * M):
        d.text((M, y), ln, font=fh, fill=WHITE)
        y += int(hsize * 1.28)
    if body:
        y += 18
        for ln in wrap(d, body, f(30, "Regular"), W - 2 * M):
            d.text((M, y), ln, font=f(30, "Regular"), fill=MUTED)
            y += 45
    y += 30

    max_w = W - 2 * M
    cap_lines = wrap(d, caption, f(25, "Regular"), max_w) if caption else []
    cap_h = (len(cap_lines) * 34 + 20) if cap_lines else 0
    max_h = BOTTOM - y - cap_h
    if max_h < 120:
        raise ValueError("Pre obrázok neostal priestor — skráť nadpis alebo body.")
    shot.thumbnail((max_w, max_h), Image.LANCZOS)

    sx = M + (max_w - shot.width) // 2
    # jemný rám okolo snímky
    d.rounded_rectangle([sx - 6, y - 6, sx + shot.width + 6, y + shot.height + 6],
                        radius=14, fill=BLUE)
    img.paste(shot, (sx, y))
    y += shot.height + 20

    for ln in cap_lines:
        d.text((M, y), ln, font=f(25, "Regular"), fill=MUTED)
        y += 34
    foot(d)
    img.save(path)


def build_pdf(png_dir, out_pdf):
    """Zlúči square slidy do PDF — formát dokumentového carouselu na LinkedIn."""
    files = sorted(Path(png_dir).glob("*.png"))
    if not files:
        return None
    ims = [Image.open(p).convert("RGB") for p in files]
    ims[0].save(out_pdf, save_all=True, append_images=ims[1:], resolution=72)
    return out_pdf
