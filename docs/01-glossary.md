# Slovník pojmov

> Konzistentný slovník naprieč celou dokumentáciou. Ak v texte narazíte na pojem, ktorý si nie ste istí, hľadajte tu. Pojmy sú zoradené abecedne.

## A

**Affiliation** — Vzťah osoby k organizácii v určitej role, určitom športe a disciplíne, platný v určitom časovom intervale. Najdôležitejšia entita systému. Eventovaná, immutable.

**Aggregate** — Pojem z DDD (Domain-Driven Design). Agregát je konzistentnostná hranica — sa zaisťuje, že všetky invarianty agregátu sú dodržané v každej transakcii. V SportUp sú agregáty napr. Person, Affiliation, Consent. Jeden event mení práve jeden agregát.

**API-first** — Princíp, že systém sa najprv navrhne ako rozhranie, až potom sa implementuje vnútro. SportUp je extrémny prípad — nemá vlastné UI, len API a MCP.

**Audit log** — Záznam každého prístupu k systému. Vyžadovaný GDPR čl. 30 a slovenským zákonom o IS verejnej správy. V SportUp sa audit nestará o samostatnú tabuľku — eventy v event store *sú* audit log.

## B

**Base registry** — V terminológii eGovernmentu register, ktorý je autoritatívnym zdrojom pre konkrétny typ údaja. RFO je base registry pre fyzické osoby, RPO pre právnické osoby. SportUp je base registry pre športové dáta.

**Broker** — Pozri **Identity Broker**.

## C

**CQRS** — Command Query Responsibility Segregation. Vzor, kde sa zápisy (commands) oddeľujú od čítaní (queries). Zápisy idú do event store, čítania do projekcií.

**Compensation** — Kompenzačná akcia. Pri chybe v sage sa nerobí rollback, ale produkujú sa nové eventy, ktoré pôvodný stav obnovia. História ostáva úplná.

**Consent** — Súhlas dotknutej osoby s konkrétnym účelom spracovania. Granulárny — jeden záznam = osoba × účel × prijímateľ × verzia.

**Correlation ID** — Identifikátor, ktorý sa nesie naprieč viacerými eventmi tej istej biznis operácie (napr. prestup). Umožňuje spätnú rekonštrukciu sagy.

**CSRÚ** — Centrálny systém referenčných údajov. Komponent ÚPVS, ktorý posiela notifikácie o zmenách v referenčných registroch (RFO, RPO, RA…).

## D

**Discipline (disciplína / odvetvie)** — Pododdiel športu. Napr. šport "Futbal" má disciplíny "Futbal", "Futsal", "Plážový futbal".

**DPO** — Data Protection Officer / Zodpovedná osoba pre ochranu osobných údajov.

## E

**eID** — Elektronický občiansky preukaz. Slúži na autentifikáciu fyzickej osoby voči štátnym službám a na overenie identity v SportUp.

**Event** — Nemenná správa o tom, že niečo nastalo. V SportUp napr. `AffiliationRegistered`, `ConsentWithdrawn`. Eventy sú zdroj pravdy.

**Event Sourcing** — Vzor, kde sa stav neukladá ako aktuálny snapshot, ale ako sekvencia eventov, z ktorých sa stav odvodzuje.

**Event Store** — Databáza pre eventy. Append-only, nemenná, versionovaná. V SportUp postavená nad MongoDB alebo Kafka.

## F

**Facility (športovisko)** — Fyzické miesto na vykonávanie športu. Štadión, telocvičňa, ihrisko, bazén, lyžiarsky areál. Verejne katalogizované, slúži športu aj cestovnému ruchu.

**Fine-grained** — Granulárny, jemný. Používame pri opise consent — jeden súhlas = jedna kombinácia, nie hromadný blanket.

## G

**GDPR** — Všeobecné nariadenie o ochrane údajov (EÚ 2016/679).

## I

**Identity Broker** — Samostatná služba medzi jadrom SportUp a štátnymi registrami. Abstraktuje komunikáciu s RFO/RPO, drží mapovanie internal UUID ↔ IFO.

**IFO** — Identifikátor fyzickej osoby v RFO. SportUp ho drží šifrovaný a používa ho len pri komunikácii s RFO.

**Issue** — Záznam v GitHub Issues. Slúži na diskusiu, hlásenie problémov, návrhy.

## J

**Joint controller** — Spoločný prevádzkovateľ podľa GDPR čl. 26. Často sa SportUp a národný zväz delia o úlohy prevádzkovateľa.

## L

**Legal basis** — Právny základ podľa GDPR čl. 6. Šesť možností: súhlas, zmluva, právna povinnosť, životne dôležité záujmy, verejný úloha, oprávnený záujem.

## M

**Master register** — Pozri **Base registry**.

**MCP** — Model Context Protocol. Otvorený štandard pre integráciu LLM agentov so systémami. SportUp poskytuje MCP servery pre agentický prístup.

**MCRŠ SR** — Ministerstvo cestovného ruchu a športu Slovenskej republiky.

## N

**NŠC** — Národné športové centrum. Príspevková organizácia pod MCRŠ. Aktuálne prevádzkuje existujúci IS športu (ISŠ), ktorý SportUp nahradí.

## O

**OAuth2** — Štandard pre autorizáciu prístupu. SportUp ho používa pre autentifikáciu certifikovaných aplikácií.

**OIDC** — OpenID Connect. Vrstva nad OAuth2 pre autentifikáciu identity (kto som).

**OPA** — Open Policy Agent. Engine pre evaluáciu prístupových pravidiel. SportUp ho používa ako Policy engine.

**OOCR** — Oblastná organizácia cestovného ruchu.

## P

**Person** — Fyzická osoba v systéme. Stabilná entita s identitou oddelenou od role.

**PII** — Personally Identifiable Information. Osobne identifikovateľné údaje.

**Policy engine** — Vrstva, ktorá rozhoduje o prístupe k dátam. V SportUp implementovaná cez OPA.

**Projection (projekcia)** — Materializovaný pohľad nad event storom. Optimalizovaný pre konkrétny typ dotazu. Eventually consistent voči eventom.

**Purpose** — Účel spracovania osobných údajov. Centrálne katalogizované v Purpose Catalogue.

**Purpose Catalogue** — Centrálny verzionovaný register všetkých účelov spracovania v slovenskom športe. Vrstvený: univerzálne / kategóriové / športovo-špecifické / disciplinárne.

## R

**RFO** — Register fyzických osôb. Prevádzkuje MV SR. Master pre identitu fyzickej osoby v SR.

**RPO** — Register právnických osôb. Prevádzkuje ŠÚ SR. Master pre identitu právnickej osoby v SR.

**Role (rola)** — Typ zapojenia osoby v športe. Napr. amatérsky športovec, tréner, rozhodca, dobrovoľník. Pozri [`catalogs/activity-types.md`](catalogs/activity-types.md).

## S

**SADA** — Slovenská anti-dopingová agentúra.

**Saga** — Vzor pre dlhotrvajúcu transakciu cez viaceré agregáty. V SportUp napr. prestup hráča (3 eventy spojené `correlation_id`).

**Scope** — Rozsah oprávnenia. Pri OAuth2 napr. `affiliations:write:own_club`.

**SOŠV** — Slovenský olympijský a športový výbor. Zastrešuje olympijské športy.

**Sport** — Druh športu (napr. Futbal, Atletika, Šach). Pozri [`catalogs/sports.md`](catalogs/sports.md).

## T

**TIC** — Turistické informačné centrum.

## U

**ÚOOÚ** — Úrad na ochranu osobných údajov SR.

**ÚPVS** — Ústredný portál verejnej správy. Slovensko.sk. Vstupný bod pre integráciu so štátnymi registrami.

**UUID** — Universally Unique Identifier. 128-bitové identifikátor používaný ako primárny kľúč entít v SportUp.

## V

**Verification status** — Úroveň overenia identity. Hodnoty: `unverified`, `self_declared`, `verified_by_organization`, `verified_by_eid`, `verified_by_rfo`. Niektoré operácie vyžadujú minimálnu úroveň.

**Voľnočasový športovec** — Osoba, ktorá vykonáva šport rekreačne, mimo formálnej súťažnej štruktúry. Eviduje sa, ak sa zúčastňuje organizovaných (aj neoficiálne organizovaných) podujatí.

**VÚC** — Vyšší územný celok. Samosprávny kraj.

## W

**WADA** — World Anti-Doping Agency.

**Webhook** — HTTP callback. SportUp ich používa na notifikácie tretím stranám (napr. zmena licencie, ukončenie afiliácie).

## Z

**Zero-trust** — Bezpečnostný model, kde sa nedôveruje ničomu — každé volanie je autentifikované, autorizované a auditované, aj keď prichádza z dôveryhodnej siete.
