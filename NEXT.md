# NEXT – otvorené úlohy

Krátky zoznam toho, čo je rozrobené alebo čaká na rozhodnutie. Pravdou je `git log`; pred tvrdením „toto je otvorené“ over, či sa to medzitým nevyriešilo. Hotové položky sa odtiaľto mažú a zapisujú do `CHANGELOG.md` a devlogu (`docs/devlog/`).

Posledná revízia: 16. 11. 2026

## Rozhodnúť

- [ ] **Web podľa design systému v2** – zosúladiť `website/styles.css` a `website/brand/BRAND.md` s `website/brand/design-system/` (Inter namiesto Poppins, bez pozadia Paper, nové farby `muted` a stavové farby, mozaika v tvare kruhu). Väčšia zmena: najprv plán na schválenie.
- [ ] **Marketingové carousely podľa DS v2** – `marketing/social/` používa Poppins a staré názvy vrstiev (voľnočasový / organizovaný / elitný). Rozhodnúť, či nové a pregenerované carousely prejdú na Inter a kategórie vrcholový a reprezentačný · súťažný · šport pre všetkých.

## Rozpracované

- [ ] **ČR – nadstavba Národního registru sportu** – podklady pre stretnutie (rozdielová analýza, prezentácia) sú mimo verejného repozitára v `interne/cesko/`. Pred stretnutím: vizuálna kontrola prezentácie vrátane exportu do PDF (jemná mozaika na slide 3, rámček na slide s aktivitami, titulný a záverečný slide).
- [ ] **Športový pas osoby a digitálna športová žiacka knižka** – zaradené do ROADMAP, Fáza 2. Ďalší krok: doménový popis (časová os aktivít a rolí, pravidelnosť, súhlasy a prístup školy a zákonného zástupcu) v `docs/domain/` a návrh obrazovky „Môj športový pas“ v aplikácii.
- [ ] **Aktivita – definícia pravidelnosti** – na webe a v číselníku uvedená ako príklad (aspoň 1 pohybová aktivita týždenne v 4 zo 6 týždňov); presnú definíciu určí štát so zväzmi (Q-028 v `ltksolutions/activity`).

## Fáza 1 – prázdne miesta v dokumentácii

- [ ] `docs/api/endpoints/README.md` – Organizations, Activities, Qualifications, Consents, Catalogs, Public.
- [ ] `docs/domain/events/README.md` – udalosti Consent a Person.
- [ ] `docs/operations/` – prevádzka, monitoring, deployment.
