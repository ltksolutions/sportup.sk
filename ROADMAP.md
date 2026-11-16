# ROADMAP

> Plán postupnej implementácie SportUp.sk.

Tento dokument popisuje fázy implementácie. Každá fáza je samostatne uvoľniteľná a má jasný "Definition of Done". Časové odhady sú orientačné — predpokladajú malý plný tím (4–6 ľudí: tech lead, 2 backend, 1 frontend, devops, DPO).

## Stav: Fáza 0 — Koncepčný návrh ✓

**Dokončené (Q1–Q2 2026):**

- ✓ Architektúra a rozhodnutia (ADR-0001, ADR-0002, ADR-0003)
- ✓ Doménový model (Person, Affiliation, Organization, Activity, Facility, Qualification, Consent)
- ✓ **Športová vrstva doménového modelu** (Competition, Team, Match) + Activity typu `camp` (tábory)
- ✓ Číselníky (31 druhov činnosti, ~35 typov organizácií, 90+ športov, kvalifikácie)
- ✓ Purpose Catalogue (vrstvený, 11 kategórií)
- ✓ Statická prezentačná stránka sportup.sk (marketing, brand, Design Manual)
- ✓ Interaktívne vizualizácie scenárov a katalógu (widgety na Príklady a Účely)
- ✓ **Verejný portál** (`portal.html`) — prezentačná Discovery vrstva: reálna MapLibre mapa, tri vrstvy (Miesta / Zápasy / Tábory), reálne miesta Nová Baňa, „Naviguj ma", URL schéma a GDPR hranica verejnej vrstvy
- ✓ Tento repozitár s úplnou dokumentáciou

> **Kde sme skončili (2026-07-05):** hotová je celá **prezentačná a analýza vrstva** vrátane športovej domény (súťaže, zápasy, tábory) a verejného portálu s reálnou mapou. Čo nás čaká: prechod z prezentácie na **reálnu implementáciu** (Fáza 1+), kde vývojový tím postaví produkčné API, služby a produkčný portál. Detail ďalších krokov nižšie po fázach.

## Fáza 1 — Foundation (3 mesiace)

**Cieľ:** Funkčné jadro pre identitu, prepojenie na štátne registre.

| Úloha | Výstup |
|---|---|
| Vybudovať tím | Hiring, kontrakty |
| Infrastructure as Code | Terraform pre Kubernetes / cloud |
| CI/CD pipeline | GitHub Actions, lint, test, build, deploy |
| Person service + MongoDB | API pre `/v1/persons` |
| Identity Broker | Service medzi SportUp a ÚPVS |
| Certifikácia voči ÚPVS | Klientský certifikát, sandbox testy |
| Integrácia RFO match-or-create | Pre nové registrácie |
| OAuth2 Authorization Server | Keycloak alebo Authentik |
| Audit log infrastructure | Storage 10+ rokov |
| Základné OPA policies | Pre persons endpoint |

**DoD Fáza 1:**

- Aplikácia môže registrovať Person, dostať `person_id`
- Pri RFO matchi je verification_status `verified_by_rfo`
- Každé volanie je auditované
- Sandbox a staging prostredia funkčné
- Dokumentácia API kompletná

## Fáza 2 — Domain core (3 mesiace)

**Cieľ:** Plná evidencia afiliácií s event sourcingom.

| Úloha | Výstup |
|---|---|
| Event Store implementácia | MongoDB collection s indexami a versioning |
| Affiliation aggregate + commands | API pre `/v1/affiliations` |
| Projekcie (current, timeline, roster) | Materializované views |
| Saga pre prestupy | Transfer Coordinator |
| Organization service + RPO integrácia | API pre `/v1/organizations` |
| Activity service | API pre `/v1/activities` (oficiálne, neoficiálne, hobby) |
| Športový pas osoby | Projekcia časovej osi aktivít a rolí jednej osoby – od školského krúžku cez klub po trénera či funkcionára; pravidelnosť aktivít, export pre osobu (so súhlasom) |
| Digitálna športová žiacka knižka | Školská časť športového pasu pre žiakov MŠ–VŠ: školské krúžky, súťaže, telesná výchova; prístup pre školu a zákonného zástupcu |
| Webhooks infrastructure | Subscriber registrácia, doručovanie, retry |
| Bulk import nástroj | Pre migráciu zo starého ISŠ |

**DoD Fáza 2:**

- Plný lifecycle Affiliation funkčný (register, activate, suspend, terminate)
- Prestup ako saga end-to-end
- Webhooks notifikácie pre subscriberov
- Performance: p95 < 200ms na štandardné dotazy
- Load test do 1000 RPS

## Fáza 3 — Catalogs & Consent (2 mesiace)

**Cieľ:** Číselníky a GDPR-compliant consent management.

| Úloha | Výstup |
|---|---|
| Catalogs service | API pre `/v1/catalogs` |
| Generátor číselníkov z YAML | CI pipeline pre `data/catalogs/` |
| Purpose Catalogue v DB | Z YAML zdrojov |
| Consent service + events | API pre `/v1/consents` |
| Policy engine kompletný | OPA s plnou Rego policy z Purpose Catalogue |
| DPO dashboard | UI pre správu súhlasov, výmazy |
| Data subject portal | Pohľad osoby na vlastné dáta |

**DoD Fáza 3:**

- Vrstvený Purpose Catalogue funkčný
- Consent flow plynulý
- Withdrawal cascade funkčný
- Audit reports pre ÚOOÚ
- DPIA dokument finalizovaný

## Fáza 4 — Facility register + verejný portál (2–3 mesiace)

**Cieľ:** Verejný katalóg športovísk slúžiaci aj cestovnému ruchu + produkčný verejný portál (Discovery) so športovou vrstvou.

| Úloha | Výstup |
|---|---|
| Facility entity + API | `/v1/facilities`, `/v1/public/facilities` |
| Geoprostorové indexy | MongoDB 2dsphere |
| OpenStreetMap integrácia | Mapový rendering (MapLibre GL + OSM) |
| Tourism API | Pre OOCR, TIC, cestovné kancelárie |
| Open data export | JSON, CSV, GeoJSON, RDF |
| Bulk seed dát | Import z existujúcich evidencií |
| **Competition / Team / Match API** | `/v1/competitions`, `/v1/public/matches`, súpisky, tabuľky ako projekcie |
| **Activity `camp` (tábory)** | Verejný katalóg táborov + safeguarding pri maloletých |
| **Produkčný verejný portál** | Podľa `docs/discovery/` — URL schéma (`/portal/klub/`, `/portal/sutaz/`, `/portal/zapas/`), „Naviguj ma", tri vrstvy |
| **Import zo súčasných zdrojov** | Dočasný import súťaží/zápasov (`data_provenance: imported`), kým zväzy nezapíšu priamo |

**DoD Fáza 4:**

- 1000+ športovísk v katalógu
- Verejný API bez auth funkčný (miesta, zápasy, tábory — bez PII)
- Mapová vrstva a verejný portál v produkcii
- Rezervačné API pre kluby
- Verejná vrstva rešpektuje GDPR hranicu (prísnejší režim maloletých, `403` na PII)

> **Náväznosť na prezentačnú vrstvu:** prototyp tejto fázy už existuje ako `website/portal.html` (Fáza 0) — produkčná verzia z neho preberie UX, URL schému a GDPR pravidlá.

## Fáza 5 — Producer integrations (4 mesiace)

**Cieľ:** Reálne aplikácie zväzov, klubov, samosprávy začínajú používať SportUp.

| Úloha | Výstup |
|---|---|
| Pilotný národný zväz | Napr. SFZ alebo SZĽH ako pilot |
| Klubové aplikácie | 5+ klubov pripojených cez API |
| Mestská aplikácia | 1 mesto pilot (napr. Bratislava) |
| MCP servery v produkcii | persons, affiliations, statistics |
| Komerčný overovací endpoint | Pre hotely, dopravu |
| Štatistický endpoint pre výskum | Anonymizované agregáty |

**DoD Fáza 5:**

- Min. 3 zväzy + 10 klubov + 1 mesto v produkcii
- Komerčné overenia funkčné
- Mesačné štatistické reporty pre MCRŠ

## Fáza 6 — Decommissioning starého ISŠ (6–12 mesiacov)

**Cieľ:** Postupné vypnutie starého IS športu.

| Úloha | Výstup |
|---|---|
| Migračný plán | Detailný plán v gite |
| Postupný presun zväzov | 2-3 zväzy/mesiac |
| Read-only režim ISŠ | Pre historické dotazy |
| Final cutover | Vypnutie ISŠ |
| Archivácia historických dát | Long-term storage |
| Post-mortem a lessons learned | Verejný report |

**DoD Fáza 6:**

- Žiadny zväz nepoužíva ISŠ
- Historické dáta dostupné cez SportUp
- ISŠ vypnutý
- Náklady prevádzky znížené

## Riziká

| Riziko | Pravdepodobnosť | Mitigácia |
|---|---|---|
| Legislatívne zmeny zákona o športe | Vysoká | Spolupráca s MCRŠ od začiatku |
| Odmietanie zväzov migrovať | Stredná | Pilotné zväzy, postupný prechod |
| Náročnosť ÚPVS integrácie | Stredná | Včasná kontaktácia NASES, sandbox |
| Nedostatok zdrojov | Stredná | Otvorený zdrojový kód, komunita |
| Bezpečnostný incident | Nízka, vysoký dopad | Bug bounty, audity, red-team |

## Otvorené otázky

- Aké je legislatívne uznanie SportUp pre prístup k RFO/RPO?
- Kto bude prevádzkovateľ — MCRŠ priamo, NŠC po reorganizácii, nová agentúra?
- Ako sa financuje implementácia (rozpočet, štrukturálne fondy, Plán obnovy)?
- Aký je timeline politickej podpory?

## Aktualizácia roadmapy

Tento dokument sa aktualizuje minimálne **kvartálne**. Maintaineri:

- Označia hotové úlohy ✓
- Pridajú detail do tých, ktoré sa upresnili
- Posunú estimáty, ak je potrebné
- Zaznamenajú lessons learned

História verzií tohto dokumentu je v gite.
