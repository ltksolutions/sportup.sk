# Scenár 03 — Multi-role osoba

## Východisko

**Martina Kučerová** (34) je v systéme jediný záznam — jedno `person_id`. Naprieč slovenským športom však vystupuje v **štyroch aktívnych rolách súčasne**, v troch rôznych športoch a pod štyrmi rôznymi organizáciami:

- **profesionálna športovkyňa** — atletika (trailový beh) v AC Košice,
- **trénerka mládeže** — atletika v ŠK Detva,
- **dobrovoľníčka** — na podujatí OV Tatry Ultra 2026,
- **športová rozhodkyňa** — šach v ŠK Rapid.

Systém nie je len o športovcoch: tá istá osoba je športový odborník (tréner, rozhodca) aj podporná osoba (dobrovoľník). Kľúčový princíp — **identita je oddelená od roly**: štyri afiliácie zdieľajú jedno `person_id`.

## Aktéri

- **Martina Kučerová** (Person, `person_id: 7c9e6a1f-...`)
- **AC Košice** (Organization — atletický klub, `organization_id: ac-ke-uuid`)
- **ŠK Detva** (Organization — bežecký klub, `organization_id: sk-detva-uuid`)
- **OV Tatry Ultra 2026** (Organization — organizátor podujatia, `organization_id: ov-tatry-uuid`)
- **ŠK Rapid** (Organization — šachový klub, `organization_id: sk-rapid-uuid`)
- **Aplikácia SATL-portal** (certifikovaná aplikácia Slovenského atletického zväzu)
- **Aplikácia SŠZ-portal** (certifikovaná aplikácia Slovenského šachového zväzu)
- **Analytics-MCP** (certifikovaný MCP server pre štatistiku/demografiu, len read-only nad projekciami)

## Cieľ

1. Ukázať, že štyri role = štyri afiliácie nad jedným `person_id`.
2. Načítať všetky aktívne afiliácie osoby cez REST API.
3. Ukázať, že zmena identity (meno, úmrtie) sa premietne raz a „vidia" ju všetky role.
4. Detekovať konflikt záujmov (rozhodca vs. tréner voči tomu istému klubu).
5. Demonštrovať agendu pre štatistiku cez MCP — „koľko osôb má viac než jednu aktívnu rolu".

## Kroky

### Krok 1: Načítanie všetkých aktívnych afiliácií osoby

Ktorákoľvek certifikovaná aplikácia s oprávnením na dané `person_id` si vyžiada aktívne afiliácie:

```http
GET /v1/persons/7c9e6a1f-.../affiliations?status=active HTTP/1.1
Authorization: Bearer eyJhbGc...
```

### Response 200 OK

```json
{
  "person_id": "7c9e6a1f-...",
  "affiliations": [
    {
      "affiliation_id": "aff-1-uuid",
      "organization_id": "ac-ke-uuid",
      "organization_name": "AC Košice",
      "role_code": "profesionalny_sportovec",
      "sport_code": "SK-ATH",
      "discipline_code": "SK-ATH-TRAIL",
      "valid_from": "2018-01-01"
    },
    {
      "affiliation_id": "aff-2-uuid",
      "organization_id": "sk-detva-uuid",
      "organization_name": "ŠK Detva",
      "role_code": "trener",
      "sport_code": "SK-ATH",
      "discipline_code": "SK-ATH-YOUTH",
      "valid_from": "2022-09-01"
    },
    {
      "affiliation_id": "aff-3-uuid",
      "organization_id": "ov-tatry-uuid",
      "organization_name": "OV Tatry Ultra 2026",
      "role_code": "dobrovolnik",
      "sport_code": "SK-ATH",
      "valid_from": "2026-08-15",
      "valid_to": "2026-09-05"
    },
    {
      "affiliation_id": "aff-4-uuid",
      "organization_id": "sk-rapid-uuid",
      "organization_name": "ŠK Rapid",
      "role_code": "sportovy_rozhodca",
      "sport_code": "SK-SCH",
      "discipline_code": "SK-SCH-RAPID",
      "valid_from": "2020-03-10"
    }
  ]
}
```

### Krok 2: Zmena identity sa premietne raz

Martina sa vydá a zmení priezvisko. Zmena ide na **Person aggregate**, nie na jednotlivé afiliácie:

```http
PATCH /v1/persons/7c9e6a1f-... HTTP/1.1
Authorization: Bearer eyJhbGc...
Content-Type: application/json
Idempotency-Key: 9f1c2b3a-...

{
  "family_name": "Nováková",
  "reason": "marriage",
  "effective_date": "2026-05-20"
}
```

```
Event: PersonNameChanged
  aggregate: Person
  aggregate_id: 7c9e6a1f-...
  data: { old_family_name: "Kučerová", new_family_name: "Nováková", reason: "marriage" }
```

Všetky štyri afiliácie odkazujú na to isté `person_id` — po zmene „vidia" nové priezvisko bez akéhokoľvek zásahu do afiliácií.

### Krok 3: Detekcia konfliktu záujmov

Delegačná aplikácia chce Martinu delegovať ako rozhodkyňu na zápas, kde hrá klub, ku ktorému má aktívnu trénerskú afiliáciu. Policy engine to skontroluje:

```http
POST /v1/conflict-checks HTTP/1.1
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "person_id": "7c9e6a1f-...",
  "proposed_role": "sportovy_rozhodca",
  "event_organization_ids": ["sk-detva-uuid"],
  "sport_code": "SK-ATH"
}
```

```json
{
  "conflict": true,
  "conflict_type": "referee_with_active_affiliation_to_participant",
  "details": [
    {
      "affiliation_id": "aff-2-uuid",
      "role_code": "trener",
      "organization_id": "sk-detva-uuid"
    }
  ],
  "recommendation": "reject_delegation"
}
```

### Krok 4: Agenda pre štatistiku cez MCP

Analytický MCP server (certifikovaný, read-only nad projekciou `current_affiliations`) odpovie na demografickú otázku bez prístupu k PII:

```jsonc
// MCP tool call — analytics-mcp
{
  "tool": "query_multi_role_persons",
  "arguments": {
    "min_active_roles": 2,
    "group_by": "sport_code"
  }
}
```

```json
{
  "result": {
    "total_persons_with_multiple_roles": 4218,
    "by_sport": {
      "SK-ATH": 1120,
      "SK-FBL": 2340,
      "SK-SCH": 210,
      "...": "..."
    },
    "data_form": "aggregated_no_pii"
  }
}
```

MCP server nikdy nevracia mená ani `person_id` — len agregáty pre výskum a demografiu.

## Side effects

### Projekcie

| Projekcia | Obsah pre Martinu |
|---|---|
| `current_affiliations` | 4 riadky, všetky s tým istým `person_id` |
| `person_timeline` | Chronológia všetkých 4 afiliácií + `PersonNameChanged` |
| `organization_roster` (×4) | Martina figuruje v roster-i každej zo 4 organizácií |
| `multi_role_index` | Martina označená ako osoba s ≥2 aktívnymi rolami (pre štatistiku) |
| `conflict_of_interest_index` | Pár (rozhodca SK-SCH) × (tréner ŠK Detva) evidovaný pre kontrolu |

### Webhooks

Pri `PersonNameChanged` dostanú webhook všetky organizácie s aktívnou afiliáciou (ak ho majú zaregistrovaný) — každá si aktualizuje lokálny cache mena.

## Edge cases

### Rovnaká rola v tom istom športe, iný klub

Martina by mohla byť trénerkou v dvoch atletických kluboch súčasne — to je platné (dve samostatné afiliácie, rovnaký `role_code`, rôzne `organization_id`). Systém to nepovažuje za duplicitu.

### Rola vs. odvetvie

Rozhodkyňa v šachu (`SK-SCH-RAPID`) a bežkyňa v atletike sú v rôznych športoch — žiadny konflikt. Pozor: pri športe s viacerými odvetviami (napr. Futbal → Futbal, Futsal, Plážový futbal) sa afiliácie rozlišujú aj podľa `discipline_code`, takže tréner futsalu a rozhodca plážového futbalu sú dve nezávislé role v tom istom športe.

### Časovo ohraničená rola

Dobrovoľnícka afiliácia (`aff-3`) má `valid_to: 2026-09-05`. Po tomto dátume ju scheduler automaticky preklopí do `status: expired` a Martina klesne z 4 na 3 aktívne role — `multi_role_index` sa aktualizuje.

### Úmrtie osoby

Ak nastane `PersonDeathRecorded` (z CSRÚ), kaskádovo sa ukončia všetky 4 afiliácie naraz — detail v [scenári 05](05-death-cascade.md).

## Test data

`data/scenarios/03-multi-role-person/`:

```
fixtures.json    ← Person + 4 organizácie + 4 afiliácie (vstupný stav)
expected.json    ← projekcie current_affiliations, multi_role_index po načítaní
events.json      ← očakávaná sekvencia eventov (vrátane PersonNameChanged)
```

## Status

- [x] Obsah doplnený
- [ ] Review
- [ ] Schválené

## Referencie

- [`../domain/entities/person.md`](../domain/entities/person.md) — identita oddelená od roly
- [`../domain/entities/affiliation.md`](../domain/entities/affiliation.md)
- [`../catalogs/activities.md`](../catalogs/activities.md) — role: športovec, tréner, rozhodca, dobrovoľník
- [`../mcp/README.md`](../mcp/README.md) — analytické MCP servery, read-only nad projekciami
- [`../gdpr/purposes/VYS-research.md`](../gdpr/purposes/VYS-research.md) — štatistika a demografia
