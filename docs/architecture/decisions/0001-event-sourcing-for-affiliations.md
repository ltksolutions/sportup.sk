# ADR-0001: Event sourcing pre entity Affiliation, Consent, Qualification

- **Status:** Accepted
- **Date:** 2026-04-15
- **Authors:** @janletko
- **Reviewers:** —

## Context

V SportUp.sk evidujeme vzťahy osôb k organizáciám (Affiliation), kvalifikácie (Qualification), súhlasy (Consent) a ďalšie entity, ktoré:

1. **Majú silnú audit požiadavku** — § 14 zákona o ochrane osobných údajov, čl. 30 GDPR, smernice o IS verejnej správy. Každá zmena musí byť trvale zaznamenaná s aktorom, časom a príčinou.

2. **Sú časovo platné** — Affiliation existuje od dátumu A do dátumu B, zmeny stavu (suspension, termination) sú časovo presné. Dotaz "aký bol stav k 1. 1. 2024" musí byť exaktne zodpovedateľný.

3. **Majú zložitý životný cyklus** — registrácia → aktivácia → pozastavenie → návrat → ukončenie. Bežné UPDATE-y by stratili informáciu o priebehu.

4. **Sú predmetom právnych disputácií** — prestupy, disciplinárne konania, kde je potrebné dokázať presný sled udalostí.

5. **Vyžadujú nové reporty bez migrácií** — výskum, štatistiky, ad-hoc analýzy ministerstva.

## Decision

**Pre entity Affiliation, Consent, Qualification (a ich subagregáty) implementujeme event sourcing.**

Stav týchto entít sa neukladá ako aktuálny snapshot s history tabuľkou. Ukladá sa **ako sekvencia nemenných eventov v dedikovanom event store**, z ktorých sa aktuálny stav odvodzuje (rebuild) alebo udržiava v projekciách (read models).

Zápisy idú cez **command side** (validácia → produkcia eventov). Čítania idú z **projekcií** (eventually consistent read models). Tým získavame **CQRS** pattern.

Pre zvyšné entity (Person, Organization, Sport, Discipline, Facility) zostáva klasický CRUD model s history tabuľkami, lebo nemajú rovnaké požiadavky.

## Consequences

### Pozitívne

- **Audit zadarmo** — eventy *sú* audit log; nepotrebujeme samostatnú tabuľku
- **Time travel** — dotaz nad ľubovoľným dátumom je jednoducho rebuild eventov do toho dátumu
- **Bezpečné opravy** — `AffiliationCorrected` event s odkazom na pôvodný; chybný stav nemiznie
- **Nové projekcie bez migrácie** — nový report = nová projekcia, prerebuilduje sa zo všetkých historických eventov
- **Integrácia cez stream** — downstream systémy (výskum, štatistika, MČRŠ) sa prihlásia na event stream
- **Saga pattern** — distribuované transakcie (prestupy) cez `correlation_id`

### Negatívne / kompromisy

- **Vyššia cognitive complexity** — vývojári musia pochopiť eventy, agregáty, projekcie
- **Eventually consistent reads** — projekcie zaostávajú za zápismi (typicky < 100 ms)
- **Schema evolution náročné** — eventy sú nemenné; zmena schémy vyžaduje versioning a upcasters
- **Diskové nároky rastú** — eventy sa nemažú, len pribúdajú; potrebujeme stratégiu archivácie po N rokoch
- **Debug náročnejší** — "prečo entita má tento stav" vyžaduje prejsť eventy

### Rizikové

- **Strata eventov by bola fatálna.** Event store musí mať backup, replikáciu, aspoň 2 fyzické kópie.
- **Zlý dizajn eventov sa nedá opraviť** — eventy sú kontrakt. Pred prvým produkčným nasadením treba dôkladný review.

## Alternatívy zvažované

- **Klasický CRUD + history tabuľky.** Jednoduchšie, ale zložité na audit, časové dotazy, prestupy. Rozhodlo to, že audit a time travel sú v doméne ťažiská.

- **Bi-temporal databáza** (napr. CockroachDB time travel). Funguje pre time travel, ale nemá natívnu podporu pre saga pattern a integráciu cez stream.

- **Event sourcing pre VŠETKO.** Aj Person, Organization. Príliš veľa cognitive overhead pre entity, ktoré ho nepotrebujú. Hybrid je lepší.

## Implementačné poznámky

- **Event store:** MongoDB collection `events` s indexami na `aggregate_id`, `correlation_id`, `occurred_at`. Pre vyššiu škálu: Apache Kafka.

- **Schema:** každý event má `event_id`, `aggregate_id`, `aggregate_type`, `event_type`, `event_version`, `occurred_at`, `recorded_at`, `actor`, `source_app_id`, `correlation_id`, `causation_id`, `data`.

- **Versioning:** schema upcasters v command handler-och. Pre breaking changes nový event type s migráciou.

- **Snapshots:** pre rýchly rebuild po N eventoch ukladáme snapshot agregátu. Rebuild = posledný snapshot + následné eventy.

- **Projekcie:** MongoDB collections, prebudované zo stream of events. Pri zmene logiky → drop + rebuild.

## Referencie

- Greg Young — *CQRS Documents* (2010)
- Vaughn Vernon — *Implementing Domain-Driven Design*
- ADR-0002 — Saga pattern pre prestupy
- ADR-0003 — Granulárny consent
- [`../event-sourcing.md`](../event-sourcing.md) — implementačný detail
