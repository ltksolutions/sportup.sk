<!-- Zdroj pravdy: SportUp.sk Design System (claude.ai artefakt). Tento súbor je jeho kópia v repozitári, stav 16. 11. 2026. -->

> **Kde je čo**
> - `tokens.json` – farby, typografia, rozostupy, zaoblenia, tiene (formát Design System artefaktu).
> - `components.css` – triedy komponentov `su-*`; predpokladá CSS premenné pomenované podľa tokenov (`--navy`, `--space-4` …).
> - Logo a ikona ostávajú v `../logo/` a `../icon/` bez zmeny.
> - `../BRAND.md` a `../../styles.css` zatiaľ opisujú Design Manual v2.0 (Poppins, Paper). Ich zosúladenie s týmto dokumentom je samostatný krok.

# SportUp.sk

Otvorený register pre šport, pohyb a športovú infraštruktúru. Vizuál je čistý a inštitucionálny: biela plocha, tenké linky, výrazná typografia a jedna akcentová farba.

**Verzia 2 (16. 11. 2026).** Spája SportUp Design Manual v2.0 a štýly webu z repozitára (`website/brand/BRAND.md`, `website/styles.css`) so smerom „A · Čistý inštitucionálny“ schváleným 15. 11. 2026. Platí pre prezentácie, web, aplikácie a dokumenty.

Zmeny oproti Design Manualu v2.0:
- **Písmo Inter** namiesto Poppins (nadpisy aj text). Pre kód ostáva JetBrains Mono, pre logotyp Helvetica Neue.
- **Pozadie Paper (#F8F6F1) je vyradené.** Základná plocha je biela, jemne odlíšená plocha `surface-2`.
- **Sekundárny text tmavší** (`muted` #4A5A70 namiesto #6B7A8D), aby mal dostatočný kontrast.
- **Stavové farby upravené pre kontrast** (`warning` #8A6508 namiesto #B8860B, `danger` #B3362E, `success` #276C4E).
- Pribudla **mozaika** ako grafický jazyk a **komponenty** pre web a aplikáciu.

Logo, farby Navy a Blue, slogan *Good Idea Sport Slovakia* a pravidlá loga ostávajú bez zmeny.

## Motív hôr

Silueta hôr v logu nie je dekorácia. Nesie tri významy:

- **Vysoké Tatry.** Riešenie vzniklo na Slovensku.
- **Kopec športu.** Zo širokej základne na špičku: z veľkej masy ľudí, ktorí sa hýbu, vyrastá úzky vrchol. Je to cesta športovca z ničoho na vrchol, k medaile a úspechu.
- **Kopcov je viac.** Čo šport, to kopec. Preto silueta nikdy neukazuje jediný vrchol.

Pravidlá: silueta má vždy viac vrcholov a nenahrádza sa iným obrázkom ani vzorom. Hory patria do loga. Nepoužívajú sa ako pozadie za obsahom slajdu, stránky ani dokumentu, pretože rušia čítanie.

## Motív mozaiky

Mozaika je grafický jazyk SportUp.sk: plocha z malých rovnakých jednotiek, kde každá jednotka je človek alebo kombinácia športu, veku a výkonnosti. Plná mriežka hovorí, že SportUp.sk spája všetky športy, všetky vekové kategórie a všetky výkonnostné úrovne.

Tri farby jednotiek majú vždy rovnaký význam: `navy` vrcholový a reprezentačný šport, `mosaic-grey` súťažný šport (amatéri aj profesionáli v pravidelných súťažiach zväzov), `blue` šport pre všetkých (cz. „Sport pro všechny“; zákonný pojem v SR aj ČR: pravidelne cvičiaci – joga, fitness, kalanetika – aj príležitostne športujúci, vrátane akcií mimo súťaží zväzov). Deliaca čiara je účasť v pravidelných súťažiach, nie to, či je šport organizovaný.

Tvar jednotky sa volí podľa výstupu (podrobne v komponente Mosaic):
- **štvorec s jemným zaoblením** (`radius-xs`, najviac 25 % strany) – základný, prezentácie, analýzy, štátne výstupy,
- **výrazne zaoblený štvorec** (30 % strany) – aplikácia, dashboardy klubov a obcí,
- **kruh** – web, sociálne siete, komunita,
- **šesťuholník** – len ilustrácie o prepojení a ekosystéme.

V jednom výstupe sa tvary nemiešajú. Štvorec nemá ostré rohy: titulná mozaika 32 px má zaoblenie 3 px, jemný raster 10 px má 2,5 px, aby bolo zaoblenie vidieť aj v malej jednotke. Do 25 % strany ide o štvorec pre manažérske výstupy, okolo 30 % o zaoblený štvorec aplikácie. Mozaika nikdy neleží pod textom.

Na titulnom a záverečnom slajde (a na úvodnej ploche webu) stojí vpravo od textu: raster 12 × 16 jednotiek vo vodorovných pásoch v pomere druhov športu, zhora 1 rad `navy` (zväčšený, aby bol vidieť), 4 rady `mosaic-grey`, 11 radov `blue`. V grafoch (napr. pohľad na šport z boku) sa používa jemnejší raster: jednotka 10 px, medzera 2 px.

## Princípy

1. **Obsah pred ozdobou.** Biela plocha (`surface`), text farbou `navy`. Žiadne prechody ani dekoratívne obrázky.
2. **Jedna akcentová farba.** Modrá značí „toto pridáva SportUp.sk“ alebo hlavnú akciu. Nepoužíva sa na všetko.
3. **Linky namiesto rámčekov.** Obsah sa člení tenkou linkou (`line`) a rozostupom, nie kartou s tieňom. Tieň (`shadow-float`) len pre prvky, ktoré plávajú nad obsahom.
4. **Čísla sú veľké, slová krátke.** Kľúčový údaj štýlom `display` alebo `h1`, pod ním jedna veta `body` vo farbe `muted`, vždy so zdrojom.
5. **Mobile first.** Každé rozhranie sa navrhuje najprv pre šírku telefónu (360–390 px), potom pre tablet a desktop.

## Farby

- Text a nadpisy: `navy` na `surface` alebo `surface-2`.
- Sekundárny text, popisky a zdroje: `muted`.
- Akcentový text a odkazy: `blue-ink`. Farba `blue` je len na výplne, grafy a veľké prvky; pre malý text na bielej má nízky kontrast.
- Zvýraznená plocha: `blue-tint` s textom `navy`.
- Tmavá plocha (hlavička webu a slajdu): `navy`, text `on-navy`, akcent `blue-on-navy`.
- Stavy: `success`, `warning`, `danger` s jemnými pozadiami `*-soft`; text stavu je čitateľný na oboch.
- Kód: `code-bg`, `code-text` a farby syntaxe.
- Význam nikdy nenesie len farba: popri nej je vždy text, ikona alebo vzor.

## Typografia

Písmo **Inter** (Google Fonts), rezy 400, 600 a 700. Kód **JetBrains Mono**.

- `display` pre titulné nadpisy a kľúčové čísla, `h1` až `h3` pre nadpisy, `lead` pre úvodný odsek, `body` pre text, `small` pre poznámky a zdroje, `code` pre kód.
- `label` (verzálky, rozpal 1,5 px, farba `blue-ink`) ako krátky nadtitul.
- Na mobile sa `display` zmenšuje na 40 px, `h1` na 32 px, `h2` na 24 px.
- Nadpis má najviac dva riadky. Odsek najviac 70 znakov na riadok.

## Rozostupy a tvary

- Rozostupy len zo stupnice `space-1` až `space-16`.
- Jednotky mozaiky `radius-xs`, tlačidlá a polia `radius-sm`, karty `radius-md`, modálne okná a spodný panel `radius-lg`, štítky `radius-pill`.
- Dotykové ciele najmenej 44 px (`touch-target`).

## Logo

Oficiálne súbory sú v skupine **Logo** a **Ikona** (zdroj: `website/brand/` v repozitári). Primárna verzia s pohorím od 120 px šírky, wordmark od 80 px, ikona SU od 24 px. Variant podľa pozadia: `primary` na svetlom, `dark` na `navy`, `white` na farebnom alebo fotografii, `navy` pre jednofarebnú tlač. Logo sa nedeformuje, neotáča, nemení farby ani pomer Sport/UP a nedostáva tieň ani prechod.

Aplikácie konzumujúce SportUp API môžu uviesť „Powered by SportUp“.

## Komponenty

Štýly komponentov sú v `components/bundle.css` (triedy `su-*`, len premenné z tokenov):

- **Button** – primárne, sekundárne, akcentové, textové tlačidlo.
- **Field** – pole formulára s popiskom, nápovedou a chybou; zaškrtávacie pole.
- **Badge** – roly osoby a stavy.
- **StatCard** – kľúčové číslo s popisom a zdrojom.
- **Table** – tabuľka s hlavičkou a číselnými stĺpcami.
- **Alert** – informácia, úspech, upozornenie, chyba.
- **SiteHeader** – hlavička webu (mobil a desktop).
- **TabBar** – spodná navigácia aplikácie.
- **SlideFrame** – hlavička a pätka slajdu.
- **Mosaic** – mozaika v štyroch tvaroch.

## Použitie podľa média

- **Prezentácie:** plátno 1920 × 1080, biela plocha, text najmenej 24 px, jedna myšlienka na slajd.
  - Hlavička: pruh `navy` vysoký 72 px cez celú šírku. Vľavo biele logo, vpravo ukazovateľ časti (tri štvorce 16 px: prebehnuté a aktuálna časť `blue`, budúce tlmené), názov časti verzálkami farbou `blue-on-navy` a téma slajdu tučne farbou `on-navy`. Hlavička hovorí, o čo na slajde ide.
  - Pätka: pruh `surface-2` vysoký 102 px. Vľavo autor a mesiac (napr. „Ján Letko · listopad 2026“), vpravo číslo slajdu. Názov značky sa v pätke neopakuje, je v logu.
  - Telo slajdu je zvislo vycentrované medzi hlavičkou a pätkou. Nadpis bez nadtitulu, tému nesie hlavička.
  - Titulný a záverečný slajd: biela plocha bez hlavičky a pätky, farebné logo vľavo hore, veľký nadpis, vpravo mozaika.
- **Web:** hlavička `navy` (56 px na mobile, 64 px na desktope), kontajner najviac 1200 px, sekcie oddelené linkou `line` a rozostupom `space-16` (na mobile `space-12`). Mozaika v tvare kruhu.
- **Aplikácie:** mobile first, okraj obrazovky `space-4`, spodná navigácia so štyrmi položkami, formuláre s viditeľnými popiskami, primárna akcia `navy`. Mozaika v tvare zaobleného štvorca.
- **Dokumenty:** biela plocha, `body` 11–12 pt pri tlači, tabuľky s linkami `line` bez zvislých čiar.

## Tón textu

Vecne a zdvorilo. Krátke vety, konkrétne čísla so zdrojom, žiadne superlatívy. Voči štátnym inštitúciám vždy v duchu „dopĺňame“, nie „nahrádzame“.
