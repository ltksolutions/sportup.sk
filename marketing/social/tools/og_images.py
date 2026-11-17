#!/usr/bin/env python3
"""Generovanie Open Graph obrázkov webu SportUp.sk (1200×630).

Šablóna: website/brand/og-source.html (logo SportUp-dark-mountain.svg).
Výstup:  website/og-<stránka>.png

Použitie (z koreňa repozitára):
    python3 marketing/social/tools/og_images.py            # všetky obrázky
    python3 marketing/social/tools/og_images.py index      # len vybrané

Závislosti: Playwright pre Python a Chrome/Chromium
(pip install playwright; playwright install chromium).
Písma Poppins a JetBrains Mono sa načítajú z Google Fonts. Bez prístupu
na internet nastav OG_FONT_DIR na priečinok s Poppins-*.ttf
a JetBrainsMono.ttf.
"""
from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
WEB = ROOT / "website"
TEMPLATE = WEB / "brand" / "og-source.html"

# Texty obrázkov. Kurzíva (<em>) je zvýraznená modrou.
PAGES = {
    "index": dict(
        eyebrow="SportUp.sk · Národný register",
        title="Otvorené riešenie pre<br><em>slovenský šport</em><br>a podporu cestovného ruchu",
        lead="Meriame, ako často sa ľudia skutočne hýbu a ako sa využívajú športoviská. "
             "Jednotný register osôb, organizácií, aktivít a športovísk.",
    ),
    "image": dict(
        eyebrow="SportUp.sk · Národný register",
        title="Otvorené riešenie pre<br><em>slovenský šport</em><br>a podporu cestovného ruchu",
        lead="Jednotný národný register osôb, organizácií, aktivít a športovísk "
             "na otvorenej architektúre s otvorenými zdrojovými kódmi.",
    ),
    "aktivita": dict(
        eyebrow="SportUp.sk · Hlavná zmena",
        title="Aktivita je <em>merná jednotka</em> športu",
        lead="Nie počet registrácií, ale ako pravidelne sa ľudia hýbu "
             "a ako sa skutočne využívajú športoviská.",
    ),
    "dokumentacia": dict(
        eyebrow="SportUp.sk · Dokumentácia",
        title="Architektúra, dátový model a <em>technológie</em> otvorene",
        lead="Vrstvová architektúra, doménový model, číselníky, integrácie "
             "a technologický stack — dokumentácia pre vývojárov.",
    ),
    "ekosystem": dict(
        eyebrow="SportUp.sk · Ekosystém",
        title="Tri platformy, <em>jeden otvorený</em> ekosystém",
        lead="SportUp.sk, Activity.SportUp.sk a ClubUp.sk — prepojené cez "
             "štandardizované API, MCP a certifikované aplikácie.",
    ),
    "portal": dict(
        eyebrow="SportUp.sk · Verejný portál",
        title="Šport a cestovný ruch na <em>jednej mape</em>",
        lead="Nájdi športoviská, ubytovanie, trasy a lokálne podujatia v okolí — "
             "verejný portál s mapovým podkladom pre každého.",
    ),
    "priklady": dict(
        eyebrow="SportUp.sk · Príklady použitia",
        title="Ako to funguje v <em>praxi</em>",
        lead="Konkrétne scenáre a dáta: registrácia, prestup hráča, viac rolí jednej osoby, "
             "komerčné overenie aj správa športovísk.",
    ),
    "ucely": dict(
        eyebrow="SportUp.sk · Účely spracovania",
        title="GDPR ako súčasť <em>architektúry</em>, nie dodatok",
        lead="Vrstvený katalóg účelov pre transparentné a zákonné spracovanie "
             "osobných údajov v športe a cestovnom ruchu.",
    ),
}


def local_fonts_css(font_dir: Path) -> str:
    faces = [
        ("Poppins", "Poppins-Regular.ttf", 400, "normal"),
        ("Poppins", "Poppins-SemiBold.ttf", 600, "normal"),
        ("Poppins", "Poppins-Bold.ttf", 700, "normal"),
        ("Poppins", "Poppins-SemiBoldItalic.ttf", 600, "italic"),
        ("Poppins", "Poppins-BoldItalic.ttf", 700, "italic"),
        ("JetBrains Mono", "JetBrainsMono.ttf", 500, "normal"),
    ]
    return "\n".join(
        f"@font-face {{ font-family: '{fam}'; src: url('{(font_dir / f).as_uri()}'); "
        f"font-weight: {w}; font-style: {s}; }}"
        for fam, f, w, s in faces
        if (font_dir / f).exists()
    )


def main(names: list[str]) -> None:
    template = TEMPLATE.read_text(encoding="utf-8")
    font_dir = os.environ.get("OG_FONT_DIR")
    if font_dir:
        template = template.replace("/*LOCAL_FONTS*/", local_fonts_css(Path(font_dir)))
    base = f'<base href="{(WEB / "brand").as_uri()}/">'
    template = template.replace("<head>", "<head>\n" + base, 1)

    todo = names or list(PAGES)
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get("OG_CHROME") or None)
        page = browser.new_page(viewport={"width": 1200, "height": 630})
        for name in todo:
            html = template
            for key, value in PAGES[name].items():
                html = html.replace("{" + key + "}", value)
            # Dočasný súbor mimo repozitára: z file:// sa načíta logo aj lokálne písma.
            with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
                tmp.write(html)
            try:
                page.goto(Path(tmp.name).as_uri(), wait_until="networkidle")
                page.evaluate("document.fonts.ready")
                page.wait_for_timeout(300)
                out = WEB / f"og-{name}.png"
                page.screenshot(path=str(out))
            finally:
                os.unlink(tmp.name)
            print(f"✓ {out.relative_to(ROOT)}")
        browser.close()


if __name__ == "__main__":
    main(sys.argv[1:])
