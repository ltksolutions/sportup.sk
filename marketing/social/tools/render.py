# SPDX-FileCopyrightText: 2026 LTK Solutions s.r.o.
# SPDX-License-Identifier: EUPL-1.2
"""
SportUp — render carouselov pre sociálne siete.

Spustenie z adresára marketing/social/:
    python3 tools/render.py            # všetky carousely, oba formáty + PDF
    python3 tools/render.py P1          # len konkrétny carousel

Výstup:
    carousels/<ID>/square/    1080×1080  — LinkedIn, Facebook
    carousels/<ID>/portrait/  1080×1350  — Instagram (4:5)
    carousels/<ID>/<ID>-linkedin.pdf     — dokumentový carousel na LinkedIn
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import brand_slides as B

OUT = Path(__file__).resolve().parents[1] / "carousels"


# ══════════════════════════════════════════════════════════════════════════
# ČASŤ 1 — Čo prinesie dobrý informačný systém pre šport a cestovný ruch
# Podklad: website/portal.html
# ══════════════════════════════════════════════════════════════════════════
def P1(o):
    B.slide(f"{o}/01.png",
            "Čo prinesie dobrý informačný systém pre šport a cestovný ruch?",
            kicker="SportUp · časť 1",
            body="Nie zväzom. Nie úradom. Celej spoločnosti.", hsize=54)

    B.slide_vs(f"{o}/02.png",
               "Prídeš na víkend do Novej Bane. Čo tu môžeš robiť?",
               before="Googliš športoviská. Iný web na ubytovanie.|"
                      "Tretí na trasy. Štvrtý na podujatia.|"
                      "Polovica informácií je zastaraná.",
               after="Jedna mapa: športoviská, ubytovanie, trasy aj podujatia.|"
                     "Dáta priamo od tých, ktorí ich vlastnia.|"
                     "Aktuálne, lebo ich aktualizuje zdroj.")

    B.slide(f"{o}/03.png",
            "Jedno miesto. Všetky informácie.",
            body="Verejný portál číta centrálny register — jediný zdroj pravdy, "
                 "do ktorého zapisujú všetci, ktorí šport organizujú a podporujú.",
            hsize=60)

    B.slide(f"{o}/04.png",
            "Kto dáta zapisuje?", badge="Oficiálne zdroje",
            ex_label="Každý cez svoju certifikovanú aplikáciu",
            example="Národné zväzy — ligy, majstrovstvá, súťaže.|"
                    "Kluby — turnaje, nábory, tréningy.|"
                    "Mestá a obce — behy, hody, športoviská.|"
                    "VÚC — krajské hry a infraštruktúra.|"
                    "Komerčné subjekty — hotely, haly, požičovne, kempy.",
            hsize=56)

    B.slide(f"{o}/05.png",
            "A všetci z toho čerpajú.",
            ex_label="Tie isté dáta, rôzne použitia",
            example="Turista: čo robiť v destinácii tento víkend.|"
                    "Rodič: bazén a krúžky v okolí.|"
                    "Športovec: e-bike okruh, náročnosť, požičovňa.|"
                    "Organizátor: voľné dejisko pre turnaj.|"
                    "Hotel: napojenie ponuky na podujatia v okolí.|"
                    "Samospráva: podklad pre investície do infraštruktúry.",
            hsize=58)

    B.slide(f"{o}/06.png",
            "Víkendový balíček namiesto desiatich webov.",
            body="Hlavný rozdiel oproti bežnej mape: ubytovanie + aktivita + "
                 "podujatie zložené do jednej ponuky pre región a čas.",
            ex_label="Príklad z portálu",
            example="E-bike okruh pri jazere Tajch + penzión s požičovňou + "
                    "víkendový beh v Novej Bani. Jedna ponuka, jeden región, jeden čas.",
            hsize=52)

    B.slide(f"{o}/07.png",
            "Dedinský zápas je aj kultúrna udalosť.",
            body="Seniorský turnaj, mestský beh, hodový futbal — na tie sa chodí "
                 "aj „len tak“. Kalendár preto vie zobraziť komunitné podujatia v okolí.",
            ex_label="Prečo na tom záleží",
            example="Otázka „čo sa deje tento víkend v okolí?“ má zmysel naprieč "
                    "športom aj kultúrou — pre občana aj turistu.",
            hsize=54)

    B.slide(f"{o}/08.png",
            "Bez jediného osobného údaja.", badge="GDPR",
            ex_label="Vynútené serverom, nie sľubom",
            example="Von idú len miesta, podujatia a agregáty.|"
                    "Žiadne mená, kontakty ani zoznamy účastníkov.|"
                    "Žiadosť o osobné dáta → prístup zamietnutý.",
            hsize=58)

    B.slide(f"{o}/09.png",
            "Šport a cestovný ruch — jedna evidencia.", accent=True,
            body="Rovnaké dáta o mieste slúžia zväzu pri výbere dejiska, klubu pri "
                 "rezervácii, samospráve pri investíciách a turistovi v destinácii. "
                 "To je jadro hodnoty SportUp.",
            hsize=56)

    B.slide(f"{o}/10.png",
            "Vyskúšaj si funkčnú ukážku.", cta=True,
            body="sportup.sk/portal.html — interaktívna mapa s reálnymi miestami.",
            hsize=58)


CAROUSELS = {
    "P1": ("P1-portal", P1),
}


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for cid, (folder, builder) in CAROUSELS.items():
        if only and cid != only:
            continue
        base = OUT / folder
        for fmt in ("square", "portrait"):
            d = base / fmt
            d.mkdir(parents=True, exist_ok=True)
            for old in d.glob("*.png"):
                old.unlink()
            B.set_format(fmt)
            builder(str(d))
            print(f"  {folder}/{fmt}: {len(list(d.glob('*.png')))} slidov")
        pdf = base / f"{folder}-linkedin.pdf"
        B.build_pdf(base / "square", pdf)
        print(f"  {folder}: PDF pre LinkedIn")


if __name__ == "__main__":
    main()
