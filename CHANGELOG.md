# Changelog

Tento súbor sleduje významné zmeny v projekte. Formát je založený na [Keep a Changelog](https://keepachangelog.com/), pravidlá verzionovania na [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- **Odhad nákladov v2.0** (`interne/odhad-nakladov/`, mimo verejného repozitára) — kompletne prepracovaný podľa aktuálnej 6-fázovej štruktúry z `ROADMAP.md` (F1–F6) namiesto pôvodného modelu F1–F7. Explicitne zahŕňa produkčnú realizáciu Verejného portálu vo fáze F4 (prototyp `portal.html` ostáva sunk cost v rámci Fázy 0). Nová prácnosť 2 289 MD / 20 mesiacov, CAPEX a TCO prepočítané pre varianty A/B/C. Vytvorené vo formátoch xlsx (plne prepočítateľný model), docx a pptx (prezentácia pre MCRŠ).


## [0.3.0] — 2026-07-05

### Added

**Verejný portál (Discovery vrstva) — prezentačná a analýza**

- **Verejný portál** (`website/portal.html`, pôvodne `objavuj.html`) — interaktívna verejná vrstva nad centrálnym registrom ako **certifikovaná read-aplikácia** (konzument, nie zdroj dát, nie štvrtá platforma). Zobrazuje športoviská, ubytovanie, trasy a lokálne podujatia pre občana a turistu — bez jediného osobného údaja. Premenované z „Objavuj" na „Verejný portál" (jasnejšie komunikuje vizualizáciu dát), s 301 redirectom `/objavuj.html` → `/portal.html`.
- **Reálna interaktívna mapa** MapLibre GL + OpenStreetMap na celú šírku bloku, centrovaná na Novú Baňu, s automatickým `fitBounds` na všetky body. Fallback na schematické pozadie, ak sa knižnica/dlaždice nenačítajú (offline). Tooltip pri hoveri (názov + typ) a väčší popup pri kliku (názov + typ + vzdialenosť + odkaz na web).
- **Reálne miesta v Novej Bani** (overené z webov, s GPS): Via ferrata Zvonička, Tekovský EDEN (hotel & aquapark, rodinný park), jazero Tajch, TK Tajch — tenisové kurty, Tri Duby Golf Resort. Každé s odkazom na vlastný web.
- **Vrstva podujatí** — verejný kalendár zjednocujúci podujatia z viacerých oficiálnych zdrojov (zväz, klub, mesto, obec, VÚC, komerčný subjekt) s prepínačom „všetky / komunitné".
- **Prepínač vrstiev mapy: Miesta / Zápasy / Tábory** — tri dátové vrstvy nad rovnakým mapovým podkladom.
  - **Zápasy a súťaže** — športové podujatia zo súťaží a klubov s markermi na štadiónoch, popup so súťažou/súpermi/výsledkom a tlačidlom **„Naviguj ma"** (`geo:` schéma). Reálny MFK Nová Baňa (V. liga SsFZ) + ukážkové hokej, basketbal, tenis, atletika, golf.
  - **Tábory a kempy** — letné kempy pre deti aj dospelých s cieľovou skupinou, termínom, **safeguarding odznakom** pri maloletých a odkazom na prihlásenie. Reálny Letný futbalový kemp MFK a Junior Golf Camp Tri Duby + ukážkové.

**Doménový model — športová vrstva (Futbalnet-štýl)**

- **Competition** (`docs/domain/entities/competition.md`) — súťaž/liga ako špecializácia Activity (ročník, kolá, tabuľka ako projekcia zo zápasov, účastnícke tímy). Športovo-neutrálna — fáza pre všetkých 90 športov.
- **Team** (`docs/domain/entities/team.md`) — družstvo (klub → viac tímov), súpiska = afiliácie **všetkých osôb** (nielen hráči, ale aj tréneri, fyzioterapeuti, vedúci družstva, lekári).
- **Match** (`docs/domain/entities/match.md`) — zápas ako event s GPS miestom (most na mapu + „Naviguj ma"). Rozhodcovia a delegáti cez event-participation.
- **Activity rozšírené o typ `camp`** — tábor/kemp ako organizovaná vzdelávacia/rekreačná aktivita (nie súťaž), s cieľovou skupinou, `involves_minors` a povinným safeguarding režimom pri deťoch. Turnaje ostávajú Competition (`format: tournament`).
- **URL schéma portálu** (`docs/discovery/url-schema.md`) — každá entita má vlastnú adresu (`/portal/klub/`, `/portal/sutaz/`, `/portal/zapas/`…), strojový náprotivok cez API, `geo:` navigácia, **GDPR hranica verejnej vrstvy** (prísnejší režim maloletých, rozhodnutie o verejnosti na strane zdroja, `403` na PII).
- **Discovery dokumentácia** (`docs/discovery/`) — README konceptu portálu, ukážkové vzory dát, GDPR hranica; komunitný/kultúrny rozmer podujatia ako **atribút** (`community_dimension`), nie samostatná doména.

### Changed

- **Responzivita widgetov na `priklady.html`** — dvojstĺpcové layouty piatich scenárov (05 RFO, 06 športoviská, 09 cestovný ruch, 10 GDPR výmaz, 11 safeguarding) sa na mobile správne zlomia do jedného stĺpca (predtým sa text prekrýval).
- Navigácia (menu „Verejný portál"), `sitemap.xml`, `vercel.json` (301 redirecty) aktualizované naprieč všetkými stránkami.
- Info bloky o verejnom portáli doplnené na `index.html` (sekcia 02b) a `ekosystem.html` (portál ako ukážka, nie štvrtá platforma).

### Notes

- Celá športová vrstva stojí na princípe **SportUp = zdroj pravdy** (cieľový stav A); dočasný import externých dát (stav B) je označený `data_provenance: imported`, kým zväzy nezačnú zapisovať priamo cez certifikované aplikácie.
- Portál ostáva **prezentačná/analýza vrstva** — produkčný portál a API si preberie vývojový tím (úroveň architekt+marketing).

## [0.2.0] — 2026-07-04

### Added

**Marketing, brand a prezentácia — Fáza 0**

- **Marketingový web a prezentácia projektu** — HTML stránky (`website/`): úvod, príklady dát, účely spracovania (Purpose Catalogue), architektúra, doménový model, číselníky, integrácie, technológie, brand, ekosystém a kontakt. Nasadené na Vercel (`sportup.sk`), REUSE-compliant, s OG images, canonical URL, JSON-LD, sitemap, robots.txt a security.txt.
- **Brand identita a Design Manual** — dvojúrovňový logo systém (ilustrácia + wordmark) v štyroch farebných variantoch, favicon sada, Design Manual v2.1 (PDF) pre developerov aj marketing. Poppins typografia s plnou slovenskou diakritikou.
- **Interaktívne vizualizácie scenárov a katalógu** — 6 widgetov na stránke Príklady (registrácia mládežníka, prestup ako reťaz udalostí, multi-role osoba, komerčné overenie s minimalizáciou dát, kaskáda pri úmrtí, dvojhodnota športoviska — šport aj cestovný ruch) a 2 widgety na stránke Účely (interaktívna štruktúra záznamu účelu naprieč typmi osôb, vrstvený katalóg). Vanilla JS + inline SVG bez závislostí, spoločné `website/assets/widgets.{js,css}`. Zdôrazňujú, že komunikácia ide výhradne cez API·MCP bránu a čítať/zapisovať môžu len aplikácie certifikované prevádzkovateľom.

**Compliance a infraštruktúra**

- **[REUSE Specification 3.3](https://reuse.software/spec/) compliance** — každý súbor v repozitári (164/164) má jednoznačnú copyright a license metadata. Centrálne licenčné mapovanie cez `REUSE.toml`, plné texty licencií v `LICENSES/` (EUPL-1.2, CC-BY-4.0). Compliance je automaticky validovaná pri každom PR cez GitHub Actions workflow `.github/workflows/reuse.yml` (FSFE reuse-action). REUSE je odporúčaný prístup EÚ Joinup pre softvér verejného sektora.
- Adresár `src/` rezervovaný pre budúcu implementáciu (Next.js + MongoDB) s plánovanou štruktúrou monorepa (`apps/`, `packages/`).

### Changed

- **Licencia zdrojových kódov zmenená z MIT na [EUPL-1.2](https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12)** — European Union Public Licence v1.2.
  Dôvodom je lepšie zladenie s charakterom národného informačného systému pre verejný sektor: EUPL je open-source licencia vytvorená Európskou komisiou, právne ekvivalentná v 23 jazykoch EÚ, OSI-certifikovaná a odporučená EÚ Joinup pre public sector software. Weak copyleft chráni IP štátu pri zachovaní komerčnej použiteľnosti. Licencia dokumentácie (CC-BY-4.0) zostala bez zmeny.

## [0.1.0] — 2026-04-30

### Added

**Koncepčný návrh — Fáza 0**

- Repozitárna štruktúra a kontribučná dokumentácia (README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY)
- Licencie — MIT pre kód, CC-BY-4.0 pre dokumentáciu
- ROADMAP s 6 fázami implementácie

**Architektúra:**

- ADR-0000 — Šablóna pre architektonické rozhodnutia
- ADR-0001 — Event sourcing pre Affiliation, Consent, Qualification
- ADR-0002 — Saga pattern pre prestupy
- ADR-0003 — Granulárny consent (osoba × účel × prijímateľ)
- Bezpečnostný model — zero-trust, šifrovanie, audit log

**Doménový model:**

- Person — fyzická osoba s identitou oddelenou od role
- Affiliation — vzťah osoby k organizácii (eventovaná)
- Organization — zväz, klub, mesto, škola, komerčný subjekt
- Activity — športová aktivita (oficiálna / neoficiálna / hobby)
- Facility — športovisko (slúži športu aj cestovnému ruchu)
- Qualification — licencie a certifikáty (eventovaná)
- Affiliation eventy — kompletný katalóg

**Číselníky:**

- Druhy športovej činnosti — 31 druhov v 6 kategóriách (vrátane voľnočasového športovca)
- Druhy organizácií — ~35 typov v 5 kategóriách (vrátane samosprávy a cestovného ruchu)
- Športy — 90+ uznaných + neuznané, dve nezávislé osi (uznanie × olympijskosť)

**GDPR:**

- Purpose Catalogue — vrstvený model, 11 kategórií, ~110-130 účelov
- TUR-* kategória pre cestovný ruch a športoviská

**API:**

- REST API špecifikácia (princípy, konvencie)
- Detail endpointu Affiliations
- Webhooks dizajn

**MCP:**

- 8 plánovaných MCP serverov pre agentický prístup
- Princípy autentifikácie a policy enforcement

**Integrácie:**

- Identity Broker dizajn pre RFO/RPO cez ÚPVS
- CSRÚ notifikácie a kaskádová reakcia

**Scenáre:**

- 01 — Mládežnícka registrácia
- 02 — Prestup hráča (saga)

### Stav

Toto je **koncepčný návrh**, nie funkčný systém. Implementácia začína vo Fáze 1.

## Versioning policy

Pre samotný systém SportUp:

- **Patch (0.x.Y)** — bugfixy, malé úpravy dokumentácie
- **Minor (0.X.0)** — nová funkcionalita spätne kompatibilná
- **Major (X.0.0)** — breaking changes (po 1.0.0)

Pre API:

- URL prefix `/v1/` je stabilný
- Breaking changes znamenajú `/v2/`
- Deprecation 12 mesiacov pred odstránením

Pre Purpose Catalogue:

- Verzia účelu `1.0` → `1.1` — minor (rewording, bez re-consent)
- `1.x` → `2.0` — major (re-consent vyžadovaný)

Pre číselníky:

- Pridanie položky → minor
- Zmena sémantiky → major s migračným plánom
