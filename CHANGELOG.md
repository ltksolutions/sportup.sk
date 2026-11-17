# Changelog

Tento súbor sleduje významné zmeny v projekte. Formát je založený na [Keep a Changelog](https://keepachangelog.com/), pravidlá verzionovania na [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

**Marketingová kampaň pre sociálne siete (`marketing/social/`)**

- **Dvojdielna štruktúra komunikácie** — Časť 1 „čo prinesie dobrý informačný systém pre šport a cestovný ruch celej spoločnosti" (podklad `website/portal.html`), Časť 2 „reálne použitia v praxi pre všetky typy osôb a organizácií" (podklad `website/priklady.html`). Formát: obrázkové carousely.
- **Otvárací príspevok `G1` „Šport nerobia len športové organizácie"** (11 slidov) — samostatný post pred konferenciou Titáni biznisu (3. 9. 2026). Pomenúva kľúčový argument projektu: rozsah dnešného informačného systému športu je daný definíciou pojmu „športová organizácia" podľa zákona č. 440/2015 Z. z. Zväzy sú plnohodnotným aktérom, kluby len sprostredkovane (údaje zapisuje materská organizácia), mestá, obce, VÚC, školy, komerčné prevádzky a dobrovoľníci sú **mimo definície** — nie omylom, ale z podstaty vymedzenia. Podporené stanoviskom NKÚ SR o chýbajúcom centrálnom registri športovej infraštruktúry. Pozicionovanie „dve rôzne otázky" — nie náhrada ISŠ, ale doplnenie; nekonfrontačné voči ministerstvu ako potenciálnemu partnerovi. Slide 10 používa snímku funkčného portálu ako dôkaz, že nejde len o koncept.
- **Sedem ďalších carouselov, 68 slidov** — kompletná sada pre obe časti kampane:
  - **Časť 1** — `P1` „Čo prinesie dobrý informačný systém pre šport a cestovný ruch" (10 slidov): kto dáta zapisuje (zväzy, kluby, mestá, obce, VÚC, komerčné subjekty — každý cez svoju certifikovanú aplikáciu), kto z nich čerpá (turista, rodič, športovec, organizátor, hotel, samospráva), víkendový balíček, komunitný rozmer lokálnych podujatí, GDPR hranica. `P2` „Pohľad na šport zhora (fikcia) a zboku (realita)" (13 slidov): pyramída športu s vrstvami voľnočasový / organizovaný / elitný, veková os U23–U15–U4-5, a pointa pre samosprávu — voľnočasoví športovci využívajú infraštruktúru miest a obcí, nie štátnu.
  - **Časť 2** — `R1` rodič registruje dieťa do klubu, `R2` jedna osoba a štyri role (register nie je len o športovcoch, ale aj o trénerov, rozhodcoch, delegátoch, lekároch a dobrovoľníkoch), `R3` hotel overí športovca bez osobných údajov, `R4` prevádzkovatelia športovísk a hál, `R5` mesto, obec a VÚC. Po 9 slidoch každý.
- **Diagramy pyramídy športu** (`marketing/social/tools/diagrams.py`) — sústredné kruhy (pohľad zhora) a pyramída v páse (pohľad zboku) s možnosťou zvýraznenia jednej vrstvy a vekovými čiarami.
- **Kampaňový kalendár** (`marketing/social/texty/KALENDAR.md`) — dve fázy oddelené konferenciou Titáni biznisu (3. 9. 2026): Fáza 0 = otvárací `G1`, Fáza 1 = sedem carouselov po konferencii. Dramaturgia „prečo → čo → ako", formáty a hashtagy podľa siete, samostatné posty na doplnenie medzier, odporúčania k meraniu.
- **Snímky obrazovky v slidoch** (`marketing/social/tools/assets/`) — funkcia `slide_image()` vkladá výrez živého webu do slidu s rámom a popiskom. Výrezy `portal-mapa-zoznam.png` a `portal-mapa.png` z `website/portal.html`.
- **Generátor vizuálov** (`marketing/social/tools/`) — `brand_slides.py` (šablóna a brand konštanty) + `render.py` (definície carouselov). Vizuálna identita podľa `website/brand/BRAND.md`: Navy `#1A2D47`, Blue `#388FC3`, Poppins, logo `SportUp-dark.png`. Auto-fit layout — veľkosť písma sa prispôsobuje objemu textu, kontrolované proti kolízii s pätičkou.
- **Dva výstupné formáty** — `square/` 1080×1080 (LinkedIn, Facebook) a `portrait/` 1080×1350 (Instagram 4:5), plus PDF pre dokumentový carousel na LinkedIn.
- **Texty príspevkov** (`marketing/social/texty/`) — samostatné znenie pre LinkedIn (odborné, dlhšie), Facebook (prístupnejšie) a Instagram (krátke, s hashtagmi), vrátane odporúčaní pre počty hashtagov a CTA podľa siete.
- **Export textov do čistého TXT** (`marketing/social/tools/export_txt.py`) — z `.md` zdrojov vytiahne bloky pod nadpismi LinkedIn / Facebook / Instagram, odstráni markdown značky a uloží do `texty/txt/<ID>-<sieť>.txt` na priame kopírovanie do príspevku. MD zostáva zdrojom pravdy, TXT je generovaný výstup. Kontrolované voči limitom dĺžky (LinkedIn 3 000 znakov, Instagram 2 200).
- **Aktivita ako merná jednotka** — nová podstránka `website/aktivita.html` (položka „Aktivita“ v menu všetkých stránok, `sitemap.xml`) a na úvodnej strane nová hlavná veta v hlavnom bloku a sekcia „Od počtu registrácií k skutočnému pohybu“. Hlavná zmena oproti dnešným evidenciám: neráta sa len počet registrácií a štartov (zákon o športe: aktívny športovec = najmenej 3 súťaže za rok), ale pravidelnosť pohybu a skutočná vyťaženosť športovísk.
- **Číselník typov aktivít** (`docs/catalogs/activities.md`, doteraz prázdny) — 15 typov v 8 skupinách (doplnené `camp`, `doping_control`, `organizer`; ADR-016) s príznakom pohybovej aktivity, zhodný s activity.sportup.sk (ADR-015 v `ltksolutions/activity`): `training`, `match`, `exercise`, `referee`, `delegate`, `volunteering`, `education`, `mentoring`, `medical`, `donation`, `sponsorship`, `fans`. Aktivita nesie aj miesto (`facility_id`).
- **Design system v2** (`website/brand/design-system/`) — README, `tokens.json`, `components.css`. Smer „Čistý inštitucionálny“: písmo Inter namiesto Poppins, biela plocha namiesto Paper, tmavší sekundárny text a stavové farby upravené pre kontrast. Nový grafický motív **mozaiky** s tromi druhmi športu (vrcholový a reprezentačný · súťažný · šport pre všetkých) a tvarmi podľa média: štvorec s jemným zaoblením pre manažérske a štátne výstupy, výrazne zaoblený štvorec pre aplikáciu, kruh pre web, šesťuholník len pre ilustrácie. Hory ostávajú len v logu.
- **ROADMAP Fáza 2** — nové položky **Športový pas osoby** (časová os aktivít a rolí od školského krúžku po funkcionára, pravidelnosť aktivít) a **Digitálna športová žiacka knižka** (školská časť športového pasu).

### Changed

- **Open Graph obrázky** — všetkých 8 (`website/og-*.png`, nový `og-aktivita.png`) má správne logo s horami (`SportUp-dark-mountain.svg`, ako v hlavičke webu) namiesto samotného nápisu; hory v pozadí odstránené (podľa DS v2 len v logu). Úvodná strana má v OG nový popis o meraní aktivity. Generuje ich skript `marketing/social/tools/og_images.py` zo šablóny `website/brand/og-source.html`; URL obrázkov majú `?v=20261117`, aby siete načítali nové verzie.
- **Číselník rolí premenovaný** — `docs/catalogs/activity-types.md` → `docs/catalogs/sport-roles.md` (obsahuje druhy športovej činnosti osôb, nie typy aktivít); odkazy upravené.
- **Odhad nákladov v2.0** (`interne/odhad-nakladov/`, mimo verejného repozitára) — kompletne prepracovaný podľa aktuálnej 6-fázovej štruktúry z `ROADMAP.md` (F1–F6) namiesto pôvodného modelu F1–F7. Explicitne zahŕňa produkčnú realizáciu Verejného portálu vo fáze F4 (prototyp `portal.html` ostáva sunk cost v rámci Fázy 0). Nová prácnosť 2 289 MD / 20 mesiacov, CAPEX a TCO prepočítané pre varianty A/B/C. Vytvorené vo formátoch xlsx (plne prepočítateľný model), docx a pptx (prezentácia pre MCRŠ).
- **REUSE.toml** — doplnené anotácie pre `marketing/**` (CC-BY-4.0) a `marketing/social/tools/**` (EUPL-1.2, override). Lint validovaný.

### Notes

- Marketingové materiály sú vo verziovaní, ale **nie sú deployované** — `vercel.json` publikuje len adresár `website/`.
- Vizuály sa negenerujú do repozitára odinakiaľ — `python3 tools/render.py` ich vytvára lokálne z brand assetov v `website/brand/`. Závislosti: Pillow + rodina fontov Poppins.


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
