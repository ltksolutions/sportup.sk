# SportUp — Brand Assets

Vizuálna identita projektu **SportUp — Good Idea Sport Slovakia** podľa
[SportUp Design Manual v2.0 (2026)](https://github.com/ltksolutions/sportup.sk).

> Otvorené riešenie pre slovenský šport a podporu cestovného ruchu.
> Národný informačný systém pre šport, prevádzkovaný v gescii Ministerstva cestovného ruchu a športu SR.

---

## Štruktúra repa

```
sportup.sk/
├── brand/                          ← TENTO ADRESÁR (master assety + dokumentácia)
│   ├── BRAND.md                          # Tento súbor
│   ├── logo/                             # 5 SVG variantov plného loga
│   │   ├── sportup-logo-primary.svg            # Plnofarebná, svetlé pozadie
│   │   ├── sportup-logo-on-dark.svg            # Plnofarebná, tmavé pozadie
│   │   ├── sportup-logo-white.svg              # Monochromatická biela
│   │   ├── sportup-logo-navy.svg               # Monochromatická navy
│   │   └── sportup-logo-with-slogan.svg        # Logo + "Good Idea Sport Slovakia"
│   ├── raster/                           # PNG exporty 256/512/1024/2048 px šírka
│   ├── css/sportup-brand.css             # Standalone CSS pre 3rd-party aplikácie
│   └── preview.html                      # Vizuálny náhľad všetkých assetov
│
├── favicon/                        ← favicon a app ikony (live web ich linkuje odtiaľto)
│   ├── su-icon.svg                       # Master SVG ikony
│   ├── su-icon-{16,32,48,180,192,512}.png
│   ├── favicon.ico                       # Multi-rozmerný (16/32/48)
│   ├── apple-touch-icon.png              # 180×180
│   └── android-chrome-{192x192,512x512}.png
│
├── logo-mark.svg                   ← SU ikona použitá v navigácii dokumentačného webu
├── site.webmanifest                ← PWA manifest
└── styles.css                      ← CSS dokumentačného webu (brand premenné inline)
```

---

## Farby

| Token | HEX | RGB | Použitie |
|---|---|---|---|
| **SportUp Navy** | `#1A2D47` | `26, 45, 71` | Hlavná farba, navy blok loga, hlavičky |
| **SportUp Blue** | `#388FC3` | `56, 143, 195` | Akcent, "UP" v logu, slogan, linky |
| **White** | `#FFFFFF` | `255, 255, 255` | Negatív, "Sport" v logu, pozadia |
| Subtitle Gray | `#8E8E92` | `142, 142, 146` | Sekundárny text |
| Light Background | `#F4F6F8` | `244, 246, 248` | Pozadia sekcií, kariet |
| Accent Blue Light | `#E8F4FD` | `232, 244, 253` | Zvýraznenia, badges |

**Pomer použitia:** Navy 55 % · Blue 30 % · ostatné 15 %.

---

## Typografia

| Použitie | Font | Rez |
|---|---|---|
| **Logotyp Sport / UP** | Helvetica Neue Black Italic | weight 900, italic — *iba pre logo* |
| Nadpisy, CTA | Poppins | Bold (700) |
| Bežný text | Poppins | Regular (400) |
| Slogan, zvýraznenia | Poppins | Bold Italic (700 italic) |
| Kód, technické polia | JetBrains Mono | Regular (400) |

Poppins je voľne dostupná cez [Google Fonts](https://fonts.google.com/specimen/Poppins).

---

## Použitie loga — 3 scenáre

### 1) Dokumentačný web SportUp.sk *(už nasadené)*

Web používa malú **SU ikonu** v navigácii (`/logo-mark.svg`) plus CSS-renderovaný wordmark `Sport`+`UP`. Brand farby a typografia sú v `/styles.css`. Žiadna ďalšia akcia nepotrebná.

### 2) Externá aplikácia (zväz, klub, mesto, certifikovaná appka)

Pre 3rd-party aplikácie konzumujúce SportUp API a vyžadujúce vizuálnu konzistenciu:

```html
<!-- Plné logo v hlavičke -->
<img src="https://raw.githubusercontent.com/ltksolutions/sportup.sk/main/brand/logo/sportup-logo-primary.svg"
     alt="SportUp — Good Idea Sport Slovakia" height="48">

<!-- Brand premenné -->
<link rel="stylesheet" href="https://raw.githubusercontent.com/ltksolutions/sportup.sk/main/brand/css/sportup-brand.css">
```

```css
.btn-primary {
  background: var(--sportup-blue);
  color: var(--sportup-white);
  font-family: var(--font-heading);
}
```

### 3) Tlač, prezentácie, marketing

PNG exporty v `brand/raster/` (256/512/1024/2048 px šírka). Pre tlač pri vyšších DPI použi SVG zo `brand/logo/` a v Inkscape/Illustratore preveď text na krivky.

---

## Pravidlá použitia

### ✅ Správne

- Logo používaj **vždy v plnom tvare** vrátane "UP" presahujúcej časti.
- Dodrž **ochrannú zónu** — voľný priestor okolo loga rovný výške písmena „U".
- Minimálna veľkosť: **40 mm** v tlači, **160 px** na obrazovke.
- Pomer strán **4.18 : 1** (1024 × 245 px).

### ❌ Zakázané

- Deformovať alebo otáčať logo.
- Meniť farby alebo pomer Sport/UP.
- Pridávať tieň, glow, gradient alebo iné efekty.
- Umiestňovať na pozadie s nízkym kontrastom alebo rušivé fotografie.
- Orezávať logo — vždy musí byť zobrazené celé.
- Používať logo ako vzorku, textúru alebo opakované pozadie.

---

## Slogan

> ***Good Idea Sport Slovakia***

Sub-slogan národnej značky Slovenskej republiky pre oblasť športu (MZV SR, 2016).
Používa sa **pod logom** alebo ako samostatný marketingový claim.
Font: Poppins Bold Italic, farba `#388FC3`.

---

## Pre vývojárov certifikovaných aplikácií

Ak buduješ aplikáciu, ktorá konzumuje SportUp API alebo MCP server a chceš zachovať vizuálnu konzistenciu so značkou SportUp:

1. **Importuj `brand/css/sportup-brand.css`** ako base layer pred vlastnými štýlmi.
2. **Použi plné logo** v hlavičke a footri (nie len SU ikonu — tá je vyhradená pre official SportUp.sk web).
3. **Pridaj atribúciu** "Powered by SportUp" alebo "Pripojené cez SportUp" v päte aplikácie, ak je to relevantné.
4. **Zachovaj brand farby** v navigácii a hlavných CTA — minimálne navy hlavičku a modré akcenty.

---

## Licencia a kontakt

| | |
|---|---|
| Web | [www.sportup.sk](https://www.sportup.sk) |
| E-mail | sportup@ltk.solutions |
| GitHub | [ltksolutions/sportup.sk](https://github.com/ltksolutions/sportup.sk) |

© 2026 SportUp — Good Idea Sport Slovakia. Brand identity je súčasťou open-source projektu.
Logo a označenie „SportUp" sú chránené v zmysle pravidiel uvedených v Design Manuáli v2.0.
