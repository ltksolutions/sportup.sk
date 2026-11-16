# SPDX-FileCopyrightText: 2026 LTK Solutions s.r.o.
# SPDX-License-Identifier: EUPL-1.2
"""
SportUp — export textov príspevkov do čistého TXT.

Z každého súboru v texty/*.md vytiahne bloky pod nadpismi
## LinkedIn, ## Facebook a ## Instagram, odstráni markdown značky
a uloží ich ako čistý text na priame kopírovanie do siete.

Spustenie z adresára marketing/social/:
    python3 tools/export_txt.py

Výstup:
    texty/txt/<ID>-linkedin.txt
    texty/txt/<ID>-facebook.txt
    texty/txt/<ID>-instagram.txt

TXT súbory sú generované — needituj ich ručne, uprav zdrojový .md
a spusti export znova.
"""
import re
import sys
from pathlib import Path

TEXTY = Path(__file__).resolve().parents[1] / "texty"
OUT = TEXTY / "txt"

SIETE = {"LinkedIn": "linkedin", "Facebook": "facebook", "Instagram": "instagram"}

# Maximálna dĺžka príspevku v znakoch (nie bajtoch).
LIMITY = {"linkedin": 3000, "facebook": 63206, "instagram": 2200}


def strip_markdown(text):
    """Odstráni markdown značky, ktoré by sa nemali dostať do príspevku."""
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)          # **tučné**
    text = re.sub(r"(?<!\w)\*(?!\s)(.+?)(?<!\s)\*(?!\w)", r"\1", text)  # *kurzíva*
    text = re.sub(r"`(.+?)`", r"\1", text)                 # `kód`
    text = re.sub(r"\[(.+?)\]\((.+?)\)", r"\1 (\2)", text)  # [text](url)
    return text


def extract_quote(md, heading):
    """Vytiahne blockquote pod daným nadpisom ## <heading>."""
    pattern = rf"^## {re.escape(heading)}\s*$"
    lines = md.splitlines()
    start = None
    for i, ln in enumerate(lines):
        if re.match(pattern, ln):
            start = i + 1
            break
    if start is None:
        return None

    out, in_quote = [], False
    for ln in lines[start:]:
        if ln.startswith("## ") or ln.startswith("---") and in_quote:
            break
        if ln.startswith(">"):
            in_quote = True
            out.append(ln[1:].lstrip() if ln[1:2] == " " else ln[1:])
        elif in_quote and not ln.strip():
            out.append("")
        elif in_quote:
            break
    # zahoď prázdne riadky na okrajoch
    while out and not out[0].strip():
        out.pop(0)
    while out and not out[-1].strip():
        out.pop()
    if not out:
        return None
    return strip_markdown("\n".join(out))


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    OUT.mkdir(parents=True, exist_ok=True)
    total, warnings = 0, []

    for md_path in sorted(TEXTY.glob("*.md")):
        cid = md_path.stem
        if cid == "KALENDAR":
            continue
        if only and not cid.upper().startswith(only.upper()):
            continue
        md = md_path.read_text(encoding="utf-8")
        for heading, suffix in SIETE.items():
            text = extract_quote(md, heading)
            if not text:
                print(f"  ! {cid}: chýba sekcia {heading}")
                continue
            dst = OUT / f"{cid}-{suffix}.txt"
            dst.write_text(text + "\n", encoding="utf-8")

            # POZOR: dĺžku počítame v znakoch. `wc -m` bez UTF-8 locale
            # vracia bajty a pri slovenskej diakritike výrazne nadhodnocuje.
            n = len(text)
            limit = LIMITY[suffix]
            flag = ""
            if n > limit:
                flag = f"  ← PREKROČENÝ LIMIT {limit}"
                warnings.append(f"{dst.name}: {n}/{limit}")
            elif n > limit * 0.9:
                flag = f"  ← blízko limitu {limit}"
            print(f"  {dst.relative_to(TEXTY.parent)}  ({n} znakov){flag}")
            total += 1

    print(f"\nHotovo: {total} súborov")
    if warnings:
        print("\nPríspevky nad limit — treba skrátiť:")
        for w in warnings:
            print(f"  {w}")


if __name__ == "__main__":
    main()
