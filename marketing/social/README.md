<!--
SPDX-FileCopyrightText: 2026 LTK Solutions s.r.o.
SPDX-License-Identifier: CC-BY-4.0
-->

# SportUp — materiály pre sociálne siete

Carousely, texty príspevkov a generátor vizuálov pre komunikáciu projektu
SportUp.sk na LinkedIn, Facebooku a Instagrame.

> Materiály sú vo verziovaní, ale **nie sú súčasťou webu** — `vercel.json` deployuje
> len adresár `website/`, takže obsah `marketing/` sa nedostane na produkciu.

---

## Štruktúra komunikácie

Kampaň má **dve časti**, ktoré na seba nadväzujú v poradí „prečo → ako".

### Časť 1 — Čo to prinesie celej spoločnosti
Podklad: [`website/portal.html`](../../website/portal.html)

Hodnota dobrého informačného systému pre šport a cestovný ruch. Ide o **spoluprácu
všetkých typov organizácií**, ktoré zapisujú a aktualizujú dáta v centrálnom
systéme — zväzy, kluby, mestá, obce, VÚC aj komerčné subjekty. Výsledok:
*jedno miesto, všetky informácie.*

| ID | Názov | Stav |
|---|---|---|
| `P1` | Čo prinesie dobrý informačný systém pre šport a cestovný ruch | ✅ hotové |
| `P2` | Pohľad na šport zhora (fikcia) a zboku (realita) | 🔲 pripravené texty |

### Časť 2 — Reálne použitia v praxi
Podklad: [`website/priklady.html`](../../website/priklady.html)

Konkrétne scenáre pre všetky typy osôb a organizácií.

| ID | Názov | Stav |
|---|---|---|
| `R1` | Rodič registruje dieťa do klubu | 🔲 pripravené texty |
| `R2` | Jedna osoba, štyri role | 🔲 pripravené texty |
| `R3` | Hotel overí športovca bez osobných údajov | 🔲 pripravené texty |
| `R4` | Mesto zapisuje športovisko | 🔲 pripravené texty |
| `R5` | Prevádzkovateľ haly a jeho podujatia | 🔲 pripravené texty |

---

## Formáty a kanály

| Kanál | Formát | Rozmer | Zdroj |
|---|---|---|---|
| **LinkedIn** | dokumentový carousel (najvyšší dosah) | 1080×1080 | `<ID>-linkedin.pdf` |
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

### Pridanie nového carouselu

1. V [`tools/render.py`](tools/render.py) doplň funkciu, ktorá skladá slidy cez
   `B.slide(...)` a `B.slide_vs(...)`.
2. Zaregistruj ju v slovníku `CAROUSELS`.
3. Texty príspevkov ulož do `texty/<ID>-<názov>.md`.
4. Spusti `python3 tools/render.py <ID>`.

Layout je **auto-fit** — ak sa obsah nezmestí, skript sám zmenšuje veľkosť písma.
Ak je text priveľmi dlhý aj po zmenšení, treba ho skrátiť (slide by nemal
obsahovať viac než ~5 odsekov v karte).

### API generátora

| Funkcia | Použitie |
|---|---|
| `slide(path, headline, ...)` | štandardný slide |
| `slide(..., example=, ex_label=)` | slide s kartou konkrétneho príkladu (odseky oddeľuje `\|`) |
| `slide(..., badge=)` | modrý badge nad nadpisom |
| `slide(..., kicker=)` | malý modrý nadpis nad hlavným |
| `slide(..., accent=True)` | tmavší podklad pre zvýraznené slidy |
| `slide(..., cta=True)` | modrý nadpis pre záverečnú výzvu |
| `slide_vs(path, headline, before, after)` | porovnanie *dnes* vs. *so SportUp* |

---

## Obsah adresára

```
marketing/social/
├── README.md                   tento súbor
├── texty/                      texty príspevkov pre LinkedIn / Facebook / Instagram
│   └── P1-portal.md
├── carousels/                  vygenerované vizuály (PNG + PDF)
│   └── P1-portal/
│       ├── square/             1080×1080 — LinkedIn, Facebook
│       ├── portrait/           1080×1350 — Instagram
│       └── P1-portal-linkedin.pdf
└── tools/
    ├── brand_slides.py         šablóna a brand konštanty
    └── render.py               definície carouselov + spustenie
```

---

© 2026 SportUp — Good Idea Sport Slovakia · [sportup@ltk.solutions](mailto:sportup@ltk.solutions)
