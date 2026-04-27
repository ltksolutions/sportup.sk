# SportUp — Brand Assets

Vizuálna identita projektu **SportUp — Good Idea Sport Slovakia** podľa
[SportUp Design Manual v2.0 (2026)](./SportUp_Design_Manual.pdf).

> Otvorené riešenie pre slovenský šport a podporu cestovného ruchu.
> Národný informačný systém pre šport, prevádzkovaný v gescii Ministerstva cestovného ruchu a športu SR.

---

## Štruktúra

```
sportup.sk/
├── brand/                          ← MASTER assety od dizajnéra (oficiálne SVG + PNG)
│   ├── BRAND.md                          # Tento súbor
│   ├── SportUp_Design_Manual.pdf         # Plná dokumentácia (10 strán)
│   ├── SportUP_logo.af                   # Affinity Designer zdroj
│   ├── logo/                             # Wordmark — 4 oficiálne varianty
│   │   ├── SportUp-primary.svg/.png            # Navy blok + biele "Sport" + modré "UP"
│   │   ├── SportUp-dark.svg/.png               # Biely blok + navy "Sport" + modré "UP" (pre tmavé pozadia)
│   │   ├── SportUp-white.svg/.png              # Monochromatická biela
│   │   └── SportUp-navy.svg/.png               # Monochromatická navy
│   └── icon/                             # SU ikona — 4 oficiálne varianty (favicon, app)
│       ├── SportUp-icon-light.svg/.png         # Navy zaoblený štvorec + biele "S" + modré "U"
│       ├── SportUp-icon-dark.svg/.png          # Biely zaoblený štvorec + navy "S" + modré "U"
│       ├── SportUp-icon-white.svg/.png         # Monochromatická biela
│       └── SportUp-icon-navy.svg/.png          # Monochromatická navy
│
├── favicon/                        ← Vyrenderované favicony pre web (z brand/icon/SportUp-icon-light)
│   ├── su-icon.svg                       # Master SVG (kópia oficiálneho)
│   ├── su-icon-{16,32,48,64,96,128,180,192,256,512}.png
│   ├── favicon.ico                       # Multi-rozmerný (16/32/48/64)
│   ├── apple-touch-icon.png              # 180×180
│   └── android-chrome-{192x192,512x512}.png
│
├── sportup-logo.svg                ← Logo používané v hlavičke webu (= SportUp-dark.svg)
├── site.webmanifest                ← PWA manifest
└── styles.css                      ← CSS dokumentačného webu (brand premenné inline)
```

---

## Farby

| Token | HEX | RGB | CMYK | Použitie |
|---|---|---|---|---|
| **SportUp Navy** | `#1A2D47` | `26, 45, 71` | `82, 60, 40, 42` | Hlavná farba, navy blok loga, hlavičky |
| **SportUp Blue** | `#388FC3` | `56, 143, 195` | `65, 27, 0, 10` | Akcent, "UP" v logu, slogan, linky |
| **White** | `#FFFFFF` | `255, 255, 255` | `0, 0, 0, 0` | Negatív, "Sport" v logu, pozadia |
| Subtitle Gray | `#8E8E92` | `142, 142, 146` | — | Sekundárny text |
| Light Background | `#F4F6F8` | `244, 246, 248` | — | Pozadia sekcií, kariet |
| Accent Blue Light | `#E8F4FD` | `232, 244, 253` | — | Zvýraznenia, badges |

**Pomer použitia:** Navy 55 % · Blue 30 % · ostatné 15 %.

### Väzba na národnú značku Slovenska

SportUp komunikuje pod sloganom **„Good Idea Sport Slovakia"** — oficiálnym sub-sloganom národnej značky Slovenskej republiky pre oblasť športu (Ministerstvo zahraničných vecí SR, 2016). Modrá farebnosť SportUp identity korešponduje s vizuálnym jazykom značky Good Idea Slovakia.

---

## Typografia

| Použitie | Font | Rez |
|---|---|---|
| **Logotyp Sport / UP** | Helvetica Neue Black Italic | weight 900, italic — *iba pre logo, prevedené na krivky* |
| Nadpisy, CTA | Poppins | Bold (700) |
| Bežný text | Poppins | Regular (400) |
| Slogan, zvýraznenia | Poppins | Bold Italic (700 italic) |
| Kód, technické polia | JetBrains Mono | Regular (400) |

Poppins je voľne dostupná cez [Google Fonts](https://fonts.google.com/specimen/Poppins).

---

## Použitie loga — 3 scenáre

### 1) Dokumentačný web SportUp.sk *(už nasadené)*

Web používa **`SportUp-dark.svg`** (biely blok variant) v hlavičke s navy pozadím — referuje na `/sportup-logo.svg` v koreni repa. Brand farby a typografia sú definované v `/styles.css`.

### 2) Externá aplikácia (zväz, klub, mesto, certifikovaná appka)

Pre 3rd-party aplikácie konzumujúce SportUp API a vyžadujúce vizuálnu konzistenciu:

```html
<!-- Plné logo v hlavičke (vyber správny variant podľa pozadia) -->
<img src="https://raw.githubusercontent.com/ltksolutions/sportup.sk/main/brand/logo/SportUp-primary.svg"
     alt="SportUp — Good Idea Sport Slovakia" height="48">
```

| Pozadie aplikácie | Použi variant |
|---|---|
| Biele / svetlé | `SportUp-primary.svg` |
| Navy / tmavé | `SportUp-dark.svg` |
| Fotografia / farebné | `SportUp-white.svg` |
| Jednofarebná tlač | `SportUp-navy.svg` |

### 3) Tlač, prezentácie, marketing

Originálne SVG od dizajnéra majú **paths prevedené na krivky** — žiadne fonty nie sú potrebné. PNG exporty sú v rozlíšení 1024 × 245 px (wordmark) a 512 × 512 px (ikona) — pre vyššie DPI tlač (CMYK ofset) použi SVG. Affinity Designer zdroj `SportUP_logo.af` je tiež v repe pre dizajnérov.

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

1. **Použi oficiálne SVG** z `brand/logo/` — sú vector-perfect bez závislosti na fontoch.
2. **Vyber správny variant** podľa farby pozadia (tabuľka vyššie).
3. **Pridaj atribúciu** „Powered by SportUp" alebo „Pripojené cez SportUp" v päte aplikácie.
4. **Zachovaj brand farby** — minimálne navy hlavičku a modré akcenty.

---

## Licencia a kontakt

| | |
|---|---|
| Web | [www.sportup.sk](https://www.sportup.sk) |
| E-mail | sportup@ltk.solutions |
| GitHub | [ltksolutions/sportup.sk](https://github.com/ltksolutions/sportup.sk) |

© 2026 SportUp — Good Idea Sport Slovakia. Brand identity je súčasťou open-source projektu.
Logo a označenie „SportUp" sú chránené v zmysle pravidiel uvedených v Design Manuáli v2.0.
