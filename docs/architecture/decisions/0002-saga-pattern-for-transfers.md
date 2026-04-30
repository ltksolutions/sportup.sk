# ADR-0002: Saga pattern pre prestupy a viacagregátové operácie

- **Status:** Accepted
- **Date:** 2026-04-15
- **Authors:** @janletko
- **Reviewers:** —
- **Súvisí s:** ADR-0001 (Event sourcing)

## Context

Niektoré biznis operácie sa dotýkajú viacerých agregátov naraz. Najtypickejší príklad je **prestup športovca z klubu A do klubu B**:

1. Existujúca afiliácia v klube A musí byť ukončená
2. Nová afiliácia v klube B musí byť vytvorená a aktivovaná
3. Eventuálne treba zaplatiť prestupový poplatok, vystaviť dokumenty zväzu, atď.

V event-sourced architektúre platí pravidlo, že **jeden event mení práve jeden agregát**. Nemôžeme napísať jeden event "PlayerTransferred", ktorý by zároveň menil obe afiliácie — to by porušilo agregátovú konzistenciu, znemožnilo paralelnosť a urobilo z agregátu klastrový systém.

Zároveň je prestup z biznis pohľadu **jedna operácia** — z pohľadu zväzu, hráča, štatistík je to jedna vec, nie tri.

Potrebujeme spôsob, ako:
- mať technicky viacero eventov v rôznych agregátoch
- ale logicky ich vnímať ako jeden proces
- a v prípade chyby v polceste vrátiť stav

## Decision

**Pre operácie cez viacero agregátov používame Saga pattern v orchestrated variante.**

### Definícia sagy

Saga je sekvencia menších eventov v rôznych agregátoch, ktoré:
- zdieľajú spoločný `correlation_id` (identifikuje biznis operáciu)
- môžu zdieľať `causation_id` (predchádzajúci event, ktorý ich vyvolal)
- sú orchestrované samostatným modulom (napr. **Transfer Coordinator** pre prestupy)

### Príklad: Prestup hráča

```
correlation_id: transfer-2026-07-01-abc123
caused by: TransferRequested (zo zväzového portálu)

Event 1: TransferRequested
  aggregate: TransferProcess (sám o sebe agregát)
  correlation_id: transfer-2026-07-01-abc123

Event 2: AffiliationTerminated
  aggregate: Affiliation (stará, klub A)
  correlation_id: transfer-2026-07-01-abc123
  data: { reason: "transfer", effective_date: "2026-06-30" }

Event 3: AffiliationRegistered
  aggregate: Affiliation (nová, klub B)
  correlation_id: transfer-2026-07-01-abc123
  data: { ... }

Event 4: AffiliationActivated
  aggregate: Affiliation (nová, klub B)
  correlation_id: transfer-2026-07-01-abc123

Event 5: TransferCompleted
  aggregate: TransferProcess
  correlation_id: transfer-2026-07-01-abc123
```

### Kompenzácia pri chybe

Ak v polceste niečo zlyhá (napr. zväz odmietne aktiváciu novej afiliácie kvôli neuhradenej platbe), Coordinator generuje **kompenzačné eventy**:

```
Event 4': TransferRejected (namiesto TransferCompleted)
  aggregate: TransferProcess
  reason: "fee_unpaid"

Event 5': AffiliationReactivated (kompenzácia za Event 2)
  aggregate: Affiliation (stará, klub A)
  data: { reason: "transfer_compensation", original_event: "..." }

Event 6': AffiliationCancelled (kompenzácia za Event 3)
  aggregate: Affiliation (nová, klub B)
```

Pôvodné eventy *ostávajú* v event store. Kompenzácia je nový event, ktorý obnoví stav. **História je úplná.**

### Orchestrated, nie choreographed

Vybrali sme orchestrated variant (centrálny coordinator) namiesto choreographed (služby si počúvajú medzi sebou) pre tieto dôvody:

- Prestupy majú **právne dôsledky** — auditovateľný workflow s jasnou zodpovednosťou
- **Single source of truth** pre stav procesu
- Jednoduchšie debugovanie a sledovanie

## Consequences

### Pozitívne

- Zachovanie agregátovej konzistencie (jeden event, jeden agregát)
- Auditovateľný proces — všetky eventy filtrovateľné cez jeden `correlation_id`
- Bezpečná kompenzácia pri chybe
- Možnosť ľudsky zasiahnuť do bežiaceho procesu (napr. manuálne schválenie)

### Negatívne

- Potreba samostatného coordinator modulu pre každý typ sagy
- Zložitejšie pre pochopenie nováčikom v projekte
- Eventually consistent — saga môže byť v polceste, niektoré reporty to musia rátať

### Rizikové

- **Zlyhaný coordinator je problém.** Treba health check a retry logiku.
- **Idempotencia eventov** — pri retry sa nesmie udalosť zapísať dvakrát. Pomôže `event_id` ako primárny kľúč.

## Alternatívy zvažované

- **Distribuované transakcie (2PC).** Klasické two-phase commit. Výrazne zložitejšie, neškálovateľné, nezhoda s event-sourced architektúrou.

- **Choreographed saga.** Bez coordinator-a, služby si počúvajú medzi sebou. Robustnejšie, ale ťažšie auditovateľné a debug-ovateľné. Pre menej kritické flow-y môžeme zvážiť, ale prestupy sú kritické.

- **Jeden veľký event** (napr. `PlayerTransferred`). Porušuje agregátovú konzistenciu, zamieta sa.

## Implementačné poznámky

- **Coordinator** ako samostatný service alebo pod-modul command side
- **State machine** pre saga state (Started, AwaitingPayment, Approved, Rejected, Compensating, Completed)
- **Retry s exponential backoff** pri zlyhaní jednotlivého kroku
- **Timeout pre celú sagu** (napr. 30 dní pre prestup, potom auto-compensation)
- **Idempotencia** cez `event_id` UUID a unique index v event store

## Referencie

- Hector Garcia-Molina, Kenneth Salem — *Sagas* (1987)
- Chris Richardson — *Microservices Patterns*
- ADR-0001 — Event sourcing
- [`../event-sourcing.md`](../event-sourcing.md)
