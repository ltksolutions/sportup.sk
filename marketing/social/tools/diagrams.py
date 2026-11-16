# SPDX-FileCopyrightText: 2026 LTK Solutions s.r.o.
# SPDX-License-Identifier: EUPL-1.2
"""
SportUp — diagramy pre carousely (pohľad na šport zhora vs. zboku).

Farby diagramov zodpovedajú vrstvám športu:
  zelená  — voľnočasový šport (neregistrovaní)
  modrá   — organizovaný šport (kluby, zväzy, školy)
  červená — elitný a reprezentačný šport
"""
import brand_slides as B

# Vrstvy športu
GREEN = (122, 183, 120)
BLUE_L = (109, 175, 224)
RED = (214, 94, 78)

# Stlmené varianty (keď sa zvýrazňuje iná vrstva)
DIM_GREEN = (54, 74, 68)
DIM_BLUE = (44, 62, 82)
DIM_RED = (72, 52, 52)


def concentric(d, cx, cy, r=200):
    """Pohľad zhora — sústredné kruhy (fikcia)."""
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GREEN)
    r2 = r * 0.86
    d.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=BLUE_L)
    r3 = r * 0.19
    d.ellipse([cx - r3, cy - r3, cx + r3, cy + r3], fill=RED)


def pyramid(d, x, y, w, h, highlight=None):
    """Pohľad zboku — pyramída v páse (realita).

    highlight: None | 'base' (voľnočasový) | 'mid' (organizovaný) | 'tip' (elitný)
    """
    g = GREEN if highlight in (None, "base") else DIM_GREEN
    b = BLUE_L if highlight in (None, "mid") else DIM_BLUE
    r = RED if highlight in (None, "tip") else DIM_RED
    d.rectangle([x, y, x + w, y + h], fill=g)
    d.polygon([(x + 20, y + h - 4), (x + w / 2, y + 30), (x + w - 60, y + h - 4)], fill=b)
    d.polygon([(x + w / 2 - 58, y + h - 4), (x + w / 2, y + h - 78),
               (x + w / 2 + 58, y + h - 4)], fill=r)


def legend_row(d, x, y, col, label, note=None):
    """Riadok legendy: farebný štvorec + popis."""
    d.rounded_rectangle([x, y, x + 26, y + 26], radius=6, fill=col)
    d.text((x + 44, y - 3), label, font=B.f(31, "SemiBold"), fill=B.WHITE)
    if note:
        d.text((x + 44, y + 36), note, font=B.f(27, "Regular"), fill=B.MUTED)
    return y + (80 if note else 48)


def diagram_slide(path, title, subtitle=None, kind="pyramid", highlight=None,
                  caption=None, lines=None, label_col=None, accent=False,
                  age_marks=False):
    """Slide s diagramom, nadpisom a voliteľným popisom pod ním."""
    img, d = B.canvas(accent)
    y = B.TOP - 40

    if title:
        for ln in B.wrap(d, title, B.f(56, "Bold"), B.W - 2 * B.M):
            d.text((B.M, y), ln, font=B.f(56, "Bold"), fill=B.WHITE)
            y += 72
    if subtitle:
        d.text((B.M, y + 4), subtitle, font=B.f(32, "Regular"), fill=B.MUTED)
        y += 56
    y += 34

    if kind == "concentric":
        concentric(d, B.W // 2, y + 210, 195)
        y += 450
    else:
        ph = 250
        pyramid(d, B.M, y, B.W - 2 * B.M, ph, highlight)
        if age_marks:
            for off, lab in ((ph * 0.36, "U23"), (ph * 0.62, "U15"), (ph * 0.90, "U4–5")):
                yy = y + off
                d.line([B.M + 350, yy, B.W - B.M - 20, yy], fill=B.WHITE, width=3)
                d.text((B.W - B.M - 132, yy - 40), lab, font=B.f(27, "Bold"), fill=B.WHITE)
        y += ph + 46

    if caption:
        d.text((B.M, y), caption, font=B.f(48, "Bold"), fill=label_col or B.BLUE)
        y += 76
    for ln in (lines or []):
        d.text((B.M, y), ln, font=B.f(32, "Regular"), fill=B.WHITE)
        y += 50

    B.foot(d)
    img.save(path)


def legend_slide(path, title, rows, accent=False):
    """Slide s diagramom zhora a legendou vrstiev."""
    img, d = B.canvas(accent)
    y = B.TOP - 60
    concentric(d, B.W // 2, y + 160, 150)
    y += 360
    d.text((B.M, y), title, font=B.f(44, "Bold"), fill=B.WHITE)
    y += 78
    for col, label in rows:
        y = legend_row(d, B.M, y, col, label) + 10
    B.foot(d)
    img.save(path)
