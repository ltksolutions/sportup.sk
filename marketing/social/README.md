<!--
SPDX-FileCopyrightText: 2026 LTK Solutions s.r.o.
SPDX-License-Identifier: CC-BY-4.0
-->

# SportUp — materiály pre sociálne siete

Carousely, texty príspevkov a generátor vizuálov pre komunikáciu projektu
SportUp.sk na LinkedIn, Facebooku a Instagrame.

> Materiály sú vo verziovaní, ale **nie sú súčasťou webu** — `vercel.json` deployuje
> len adresár `website/`, takže obsah `marketing/` sa nedostane na produkciu.

**Kampaňový kalendár a poradie nasadenia:** [`texty/KALENDAR.md`](texty/KALENDAR.md)

---

## Štruktúra komunikácie

Kampaň otvára samostatný príspevok `G1`, po ňom nasledujú **dve časti**,
ktoré na seba nadväzujú v poradí „prečo → ako".

### Otvárací príspevok
Podklad: zákon č. 440/2015 Z. z. o športe, stanoviská NKÚ SR

Pomenúva problém: rozsah dnešného informačného systému športu je daný
definíciou pojmu „športová organizácia". Mestá, obce, VÚC, školy, komerčné
prevádzky a dobrovoľníci do nej nespadajú — nie omylom, ale z podstaty vymedzenia.

| ID | Priečinok | Názov | Slidov |
|---|---|---|---|
| `G1` | `G1-nielen-organizacie` | Šport nerobia len športové organizácie | 13 |

### Časť 1 — Čo to prinesie celej spoločnosti
Podklad: [`website/portal.html`](../../website/portal.html)

Hodnota dobrého informačného systému pre šport a cestovný ruch. Ide o **spoluprácu
všetkých typov organizácií**, ktoré zapisujú a aktualizujú dáta v centrálnom
systéme — zväzy, kluby, mestá, obce, VÚC aj komerčné subjekty. Výsledok:
*jedno miesto, všetky informácie.*

| ID | Priečinok | Názov | Slidov |
|---|---|---|---|
| `P1` | `P1-portal` | Čo prinesie dobrý informačný systém pre šport a cestovný ruch | 10 |
| `P2` | `P2-pyramida` | Pohľad na šport zhora (fikcia) a zboku (realita) | 13 |

### Časť 2 — Reálne použitia v praxi
Podklad: [`website/priklady.html`](../../website/priklady.html)

Konkrétne scenáre pre všetky typy osôb a organizácií v športe.

| ID | Priečinok | Názov | Slidov |
|---|---|---|---|
| `R1` | `R1-rodic-klub` | Rodič registruje dieťa do klubu | 9 |
| `R2` | `R2-viac-roli` | Jedna osoba, štyri role | 9 |
| `R3` | `R3-hotel-overenie` | Hotel overí športovca bez osobných údajov | 9 |
| `R4` | `R4-prevadzkovatel` | Prevádzkovatelia športovísk a hál | 9 |
| `R5` | `R5-samosprava` | Mesto, obec a VÚC | 9 |

---

## Formáty a kanály

| Kanál | Formát | Rozmer | Zdroj |
|---|---|---|---|
| **LinkedIn** | dokumentový carousel (najvyšší dosah) | 1080×1080 | `<folder>-linkedin.pdf` |
| **LinkedIn** | obrázkový carousel (alternatíva) | 1080×1080 | `square/` |
| **Facebook** | obrázkový carousel, max 10 | 1080×1080 | `square/` |
| **Instagram** | carousel 4:5 (najlepší dosah vo feede) | 1080×1350 | `portrait/` |

**Hashtagy podľa siete:** LinkedIn 3–5 · Facebook 0–2 · Instagram 8–12.
**CTA:** na Instagrame odkaz nie je klikateľný → uvádzať „link v bio".

---

## Vizuálna identita

Podľa [`website/brand/BRAND.md`](../../website/brand/BRAND.md) a Design Manual v2.0:

| Prvok | Hodnota |
|---|---|
| Pozadie | Navy `#1A2D47` (akcentové slidy `#132236`) |
| Akcent, CTA, labely | Blue `#388FC3` |
| Hlavný text | White `#FFFFFF` |
| Sekundárny text | `#9AA8B8` |
| Nadpisy | Poppins Bold |
| Telo textu | Poppins Regular |
| Labely, badge | Poppins SemiBold / Bold |
| Logo | `website/brand/logo/SportUp-dark.png` (wordmark, dark variant) |

Farebné akcenty v porovnávacích slidoch: stav *dnes* `#C65A50`, stav *so SportUp* `#6EB282`.

Vrstvy športu v diagramoch (`P2`): voľnočasový `#7AB778`, organizovaný `#6DAFE0`,
elitný `#D65E4E`. Pri zvýraznení jednej vrstvy sa ostatné stlmia.

---

## Generovanie vizuálov

```bash
cd marketing/social
python3 tools/render.py          # všetky carousely, oba formáty + PDF
python3 tools/render.py P1       # len konkrétny carousel
```

**Závislosti:** Python 3, [Pillow](https://pypi.org/project/Pillow/), rodina fontov Poppins.
Fonty sa hľadajú v `~/Library/Fonts`, `/Library/Fonts`, `/usr/share/fonts/truetype/poppins`
a `tools/fonts/`. Ak nie sú nainštalované, stiahni TTF z
[Google Fonts](https://fonts.google.com/specimen/Poppins) do `tools/fonts/`.

### Export textov do TXT

MD súbory sú zdrojom pravdy, ale na kopírovanie do sociálnych sietí sú nevhodné
(značky `>`, `**`, tabuľky). Preto:

```bash
cd marketing/social
python3 tools/export_txt.py          # všetky texty
python3 tools/export_txt.py G1       # len jeden carousel
```

Z každého `texty/*.md` vytiahne bloky pod nadpismi `## LinkedIn`, `## Facebook`
a `## Instagram`, odstráni markdown značky a uloží čistý text do
`texty/txt/<ID>-<sieť>.txt` — pripravený na priame vloženie do príspevku.

> **TXT súbory sú generované.** Needituj ich ručne — uprav zdrojový `.md`
> a spusti export znova.

**Limity dĺžky príspevku:** LinkedIn 3 000 znakov · Instagram 2 200 · Facebook 63 206.
Skript dĺžku kontroluje sám a upozorní pri prekročení aj pri priblížení sa k limitu.

> **Nepoužívaj `wc -m` na kontrolu dĺžky.** Bez UTF-8 locale vracia počet bajtov,
> nie znakov — pri slovenskej diakritike a emotikonoch nadhodnotí dĺžku aj o 10 %.
> Spoľahlivé číslo vypíše `export_txt.py`.

### Pridanie nového carouselu

1. V [`tools/render.py`](tools/render.py) doplň funkciu, ktorá skladá slidy cez
   `B.slide(...)` a `B.slide_vs(...)`.
2. Zaregistruj ju v slovníku `CAROUSELS` (ID → priečinok, funkcia).
3. Texty príspevkov ulož do `texty/<ID>-<názov>.md`.
4. Spusti `python3 tools/render.py <ID>`.

Layout je **auto-fit** — ak sa obsah nezmestí, skript sám zmenšuje veľkosť písma.
Ak je text priveľmi dlhý aj po zmenšení, treba ho skrátiť (karta by nemala
obsahovať viac než ~5 odsekov).

### API generátora

**`brand_slides.py`** — základné slidy:

| Funkcia | Použitie |
|---|---|
| `slide(path, headline, ...)` | štandardný slide |
| `slide(..., example=, ex_label=)` | slide s kartou konkrétneho príkladu (odseky oddeľuje `\|`) |
| `slide(..., badge=)` | modrý badge nad nadpisom |
| `slide(..., kicker=)` | malý modrý nadpis nad hlavným |
| `slide(..., accent=True)` | tmavší podklad pre zvýraznené slidy |
| `slide(..., cta=True)` | modrý nadpis pre záverečnú výzvu |
| `slide_vs(path, headline, before, after)` | porovnanie *dnes* vs. *so SportUp* |
| `slide_image(path, headline, image, caption=)` | slide so snímkou obrazovky z `tools/assets/` |
| `set_format("square"\|"portrait")` | prepnutie výstupného rozmeru |
| `build_pdf(png_dir, out_pdf)` | zlúčenie slidov do PDF pre LinkedIn |

**`diagrams.py`** — diagramy pyramídy športu:

| Funkcia | Použitie |
|---|---|
| `diagram_slide(..., kind="concentric")` | pohľad zhora — sústredné kruhy |
| `diagram_slide(..., kind="pyramid", highlight=)` | pohľad zboku; `highlight`: `base` / `mid` / `tip` |
| `diagram_slide(..., age_marks=True)` | pyramída s vekovými čiarami U23 / U15 / U4–5 |
| `legend_slide(path, title, rows)` | diagram zhora s legendou vrstiev |

---

## Obsah adresára

```
marketing/social/
├── README.md                       tento súbor
├── texty/
│   ├── KALENDAR.md                 poradie nasadenia, formáty, meranie
│   ├── G1-nielen-organizacie.md    texty + podklady k tvrdeniam
│   ├── P1-portal.md                texty pre LinkedIn / Facebook / Instagram
│   ├── P2-pyramida.md
│   ├── R1-rodic-klub.md
│   ├── R2-viac-roli.md
│   ├── R3-hotel-overenie.md
│   ├── R4-prevadzkovatel.md
│   ├── R5-samosprava.md
│   └── txt/                        generované čisté texty na kopírovanie
│       └── <ID>-{linkedin,facebook,instagram}.txt
├── carousels/                      vygenerované vizuály (PNG + PDF)
│   └── <folder>/
│       ├── square/                 1080×1080 — LinkedIn, Facebook
│       ├── portrait/               1080×1350 — Instagram
│       └── <folder>-linkedin.pdf
└── tools/
    ├── brand_slides.py             šablóna a brand konštanty
    ├── diagrams.py                 diagramy pyramídy športu
    ├── render.py                   definície carouselov + spustenie
    ├── export_txt.py               export textov z .md do čistého .txt
    └── assets/                     snímky obrazovky použité v slidoch
        ├── portal-mapa-zoznam.png  výrez portálu: mapa + výsledky (`G1/12`)
        └── portal-mapa.png         výrez portálu: len mapa (alternatíva)
```

**Snímky obrazovky** v `tools/assets/` sú výrezy zo živého webu. Pri zmene
portálu ich treba obnoviť a dotknuté carousely pregenerovať.

---

© 2026 SportUp — Good Idea Sport Slovakia · [sportup@ltk.solutions](mailto:sportup@ltk.solutions)
