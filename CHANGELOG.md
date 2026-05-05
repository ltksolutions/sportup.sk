# Changelog

Tento súbor sleduje významné zmeny v projekte. Formát je založený na [Keep a Changelog](https://keepachangelog.com/), pravidlá verzionovania na [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
