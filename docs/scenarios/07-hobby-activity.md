# Scenár 07 — Voľnočasová (hobby) aktivita

## Východisko

Skupina ľudí sa pravidelne stretáva na **rekreačnom behu** v mestskom parku v Prešove. Nie sú registrovaní v žiadnom klube ani zväze, nejde o oficiálnu ani neoficiálnu organizovanú súťaž — je to čisto **hobby, neorganizovaná pohybová aktivita**. Mesto Prešov (cez aplikáciu Activity.SportUp.sk) chce takéto aktivity evidovať pre **štatistiku a plánovanie infraštruktúry**, ale **bez zberu osobných údajov účastníkov**.

Kľúčový princíp: pri hobby aktivite systém eviduje **len agregátne počty**, žiadne `person_id`, žiadne PII. Toto je hranica medzi tým, čo je a čo nie je osobný údaj.

## Aktéri

- **Activity** — hobby pohybová aktivita (`activity_id: act-po-park-run-uuid`)
- **Mesto Prešov** (Organization — typ `mesto`, `organization_id: mesto-po-uuid`) — eviduje aktivitu pre plánovanie
- **Aplikácia Activity.SportUp-portal** (certifikovaná aplikácia pre podujatia a aktivity)
- **Analytics-MCP** (certifikovaný MCP server, read-only nad agregátnymi projekciami)
- **Účastníci** — NEsú aktéri v zmysle dátových subjektov; nevytvára sa im žiadny záznam

## Cieľ

1. Zaevidovať hobby aktivitu bez akýchkoľvek osobných údajov.
2. Zaznamenať len agregátne počty (odhad účastníkov, frekvencia, lokalita).
3. Sprístupniť dáta pre štatistiku a plánovanie infraštruktúry cez MCP.
4. Ukázať hranicu: čo systém pri hobby aktivite zámerne NErobí.

## Kroky

### Krok 1: Registrácia hobby aktivity (bez osôb)

```http
POST /v1/activities HTTP/1.1
Authorization: Bearer <token Activity.SportUp-portal>
Content-Type: application/json
Idempotency-Key: act-po-park-run-2026-05

{
  "activity_type": "hobby",
  "organization_scope": "unorganized",
  "sport_code": "SK-ATH",
  "discipline_code": "SK-ATH-RECREATIONAL",
  "name_sk": "Rekreačný beh — Mestský park Prešov",
  "location": {
    "municipality_code": "SK-PO-524140",
    "region_code": "SK-PO",
    "gps": { "lat": 48.9986, "lng": 21.2339 }
  },
  "recurrence": "weekly",
  "reported_by_organization_id": "mesto-po-uuid",
  "participant_data": "aggregate_only"
}
```

### Response 201 Created

```json
{
  "activity_id": "act-po-park-run-uuid",
  "activity_type": "hobby",
  "participant_data": "aggregate_only",
  "personal_data_stored": false
}
```

```
Event: HobbyActivityRegistered
  aggregate: Activity
  aggregate_id: act-po-park-run-uuid
  data: {
    activity_type: "hobby",
    sport_code: "SK-ATH",
    location: { ... },
    participant_data: "aggregate_only"
  }
```

### Krok 2: Nahlásenie agregátneho počtu (bez identít)

Po každom stretnutí sa nahlási len počet — žiadne mená, žiadne `person_id`:

```http
POST /v1/activities/act-po-park-run-uuid/aggregate-counts HTTP/1.1
Authorization: Bearer <token Activity.SportUp-portal>
Content-Type: application/json

{
  "occurred_on": "2026-05-17",
  "estimated_participants": 34,
  "age_bands": { "under_18": 4, "18_39": 18, "40_59": 9, "60_plus": 3 },
  "gender_split": { "male": 19, "female": 15 }
}
```

```
Event: AggregateCountReported
  aggregate: Activity
  aggregate_id: act-po-park-run-uuid
  data: {
    occurred_on: "2026-05-17",
    estimated_participants: 34,
    age_bands: { ... },
    data_form: "aggregate_only_no_pii"
  }
```

Vekové pásma a rozdelenie podľa pohlavia sú **agregáty** (počty v pásmach), nie údaje o konkrétnych osobách.

### Krok 3: Štatistika a plánovanie infraštruktúry cez MCP

```jsonc
// MCP tool call — analytics-mcp
{
  "tool": "query_hobby_activity_demand",
  "arguments": {
    "region_code": "SK-PO",
    "sport_code": "SK-ATH",
    "period": "2026-Q2"
  }
}
```

```json
{
  "result": {
    "total_hobby_sessions": 156,
    "avg_participants_per_session": 29,
    "peak_locations": [
      { "municipality_code": "SK-PO-524140", "sessions": 52 }
    ],
    "infrastructure_recommendation": "high_demand_running_paths",
    "data_form": "aggregate_only_no_pii"
  }
}
```

Mesto z toho vie plánovať údržbu bežeckých trás — bez toho, aby vedelo o čo i len jednom konkrétnom bežcovi.

## Side effects

### Projekcie

| Projekcia | Zmena |
|---|---|
| `hobby_activity_catalog` | Nový záznam aktivity (bez osôb) |
| `aggregate_participation_stats` | Pridané agregátne počty za dátum |
| `infrastructure_demand_index` | Aktualizovaný dopyt pre región/šport |

Žiadna projekcia typu `current_affiliations` ani `person_timeline` sa nedotkne — pretože žiadna osoba nie je evidovaná.

### Žiadne webhooks o osobách

Keďže nevznikajú afiliácie ani osobné eventy, nespúšťajú sa žiadne person-related webhooks.

## Edge cases

### Hobby aktivita sa zmení na organizovanú

Ak sa z rekreačného behu stane oficiálne podujatie s registráciou účastníkov (napr. mestský beh s časomierou), už to nie je hobby — vytvorí sa nová Activity typu `officially_organized` alebo `unofficially_organized`, a tam sa už evidujú osoby (s afiliáciami/súhlasmi). Pôvodná hobby aktivita ostáva ako samostatný záznam.

### Pokus o zápis osobných údajov k hobby aktivite

Ak certifikovaná aplikácia pošle k hobby aktivite `person_id` alebo mená, policy engine to odmietne s `422 Unprocessable Entity` a `error_code: pii_not_allowed_for_hobby`. Hranica je vynútená serverom.

### Rôzne typy osôb aj v hobby kontexte

Aj keď hobby aktivita neeviduje účastníkov, môže mať **organizátora-dobrovoľníka**, ktorý je evidovaná osoba (má afiliáciu k mestu ako dobrovoľník). Rozlišuje sa: dobrovoľník = evidovaná osoba s rolou; bežci = anonymné agregáty. Systém pokrýva všetky typy osôb tam, kde rola existuje — a nič neeviduje tam, kde nie je dôvod.

### Duplicitné hlásenie počtu

Ak sa agregátny počet za ten istý `occurred_on` nahlási dvakrát, druhé hlásenie prepíše prvé (upsert podľa dátumu) — nezdvojnásobí štatistiku.

## Test data

`data/scenarios/07-hobby-activity/`:

```
fixtures.json    ← prázdny hobby catalog + mesto Prešov
expected.json    ← hobby_activity_catalog + aggregate_participation_stats (bez PII)
events.json      ← HobbyActivityRegistered + AggregateCountReported
```

## Status

- [x] Obsah doplnený
- [ ] Review
- [ ] Schválené

## Referencie

- [`../domain/entities/activity.md`](../domain/entities/activity.md) — oficiálna / neoficiálna / hobby
- [`../catalogs/activity-types.md`](../catalogs/activity-types.md)
- [`../gdpr/data-classification.md`](../gdpr/data-classification.md) — čo je a nie je osobný údaj
- [`../gdpr/purposes/VYS-research.md`](../gdpr/purposes/VYS-research.md) — demografia a štatistika
- [`../mcp/README.md`](../mcp/README.md) — analytics-mcp nad agregátmi
