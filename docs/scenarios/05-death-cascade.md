# Scenár 05 — Úmrtie a kaskáda

## Východisko

Dlhoročný funkcionár a rozhodca **Pavol Zámečník** (68) zomiera. Informácia prichádza automaticky zo štátneho registra fyzických osôb (RFO) cez notifikáciu **CSRÚ** (Centrálna správa referenčných údajov, ÚPVS). Systém sám a bez ručného zásahu klubov či zväzov ukončí všetky jeho aktívne afiliácie naprieč rôznymi oficiálnymi zdrojmi.

Pavol nebol športovec — bol **športový odborník a podporná osoba**: rozhodca, funkcionár a delegát. Scenár ukazuje, že centrálny systém spravuje všetky typy osôb v športe.

## Aktéri

- **Pavol Zámečník** (Person, `person_id: 3f8a1c22-...`)
- **SFZ** (Slovenský futbalový zväz, `organization_id: sfz-uuid`) — rozhodcovská afiliácia
- **FK Slovan Levice** (Organization — klub, `organization_id: fk-levice-uuid`) — funkcionárska afiliácia
- **ObFZ Levice** (Oblastný futbalový zväz, `organization_id: obfz-levice-uuid`) — delegátska afiliácia
- **Identity Broker** (interná služba, integrácia s RFO/CSRÚ cez ÚPVS)
- **CSRÚ notifikačná služba** (štátny zdroj pravdy o životných udalostiach)

## Cieľ

1. Prijať notifikáciu o úmrtí z CSRÚ do Identity Brokera.
2. Zaznamenať `PersonDeathRecorded` na Person aggregate.
3. Kaskádovo ukončiť všetky aktívne afiliácie (`reason: death`).
4. Obmedziť prístup k citlivým údajom, no zachovať základné údaje pre historickú a štatistickú hodnotu.

## Kroky

### Krok 1: CSRÚ notifikuje Identity Broker

Notifikácia je asynchrónna správa zo štátneho registra (nie klientske API volanie). Identity Broker ju spracuje a overí voči RFO:

```jsonc
// Prijatá CSRÚ notifikácia (ÚPVS → Identity Broker)
{
  "notification_type": "person_death",
  "rfo_reference": "SK-RFO-...",
  "matched_person_id": "3f8a1c22-...",
  "date_of_death": "2026-03-18",
  "source": "csru_notification",
  "received_at": "2026-03-20T06:15:00Z"
}
```

### Krok 2: Interný event PersonDeathRecorded

Broker aktualizuje lokálny cache a vyprodukuje event na Person aggregate:

```
Event: PersonDeathRecorded
  aggregate: Person
  aggregate_id: 3f8a1c22-...
  correlation_id: death-cascade-2026-03-20-def456
  data: {
    date_of_death: "2026-03-18",
    source: "csru_notification",
    rfo_reference: "SK-RFO-..."
  }
```

### Krok 3: Kaskádová terminácia afiliácií

Death Coordinator vyhľadá všetky aktívne afiliácie osoby a pre každú vyprodukuje `AffiliationTerminated` s tým istým `correlation_id`:

```
Event: AffiliationTerminated
  aggregate: Affiliation
  aggregate_id: aff-sfz-rozhodca-uuid
  correlation_id: death-cascade-2026-03-20-def456
  causation_id: <PersonDeathRecorded>
  data: { reason: "death", effective_date: "2026-03-18" }

Event: AffiliationTerminated
  aggregate: Affiliation
  aggregate_id: aff-fk-funkcionar-uuid
  correlation_id: death-cascade-2026-03-20-def456
  data: { reason: "death", effective_date: "2026-03-18" }

Event: AffiliationTerminated
  aggregate: Affiliation
  aggregate_id: aff-obfz-delegat-uuid
  correlation_id: death-cascade-2026-03-20-def456
  data: { reason: "death", effective_date: "2026-03-18" }
```

Tri afiliácie naprieč tromi rôznymi oficiálnymi zdrojmi (zväz, klub, oblastný zväz) ukončené jednou kaskádou.

### Krok 4: Obmedzenie prístupu k citlivým údajom

Po úmrtí GDPR neplatí v plnom rozsahu, no systém automaticky preklopí Person do režimu `deceased` a policy engine obmedzí prístup k citlivým údajom (kontakt, zdravotné údaje). Základné údaje sa zachovávajú:

```
Event: PersonDataAccessRestricted
  aggregate: Person
  aggregate_id: 3f8a1c22-...
  correlation_id: death-cascade-2026-03-20-def456
  data: {
    restricted_scopes: ["contact", "health", "special_category"],
    retained_scopes: ["core_identity", "historical_records"],
    reason: "deceased"
  }
```

## Side effects

### Spätný dotaz cez correlation_id

Celú kaskádu možno spätne zrekonštruovať jedným dotazom — všetky eventy zdieľajú `correlation_id: death-cascade-2026-03-20-def456`:

```http
GET /v1/events?correlation_id=death-cascade-2026-03-20-def456 HTTP/1.1
Authorization: Bearer <token s auditným oprávnením>
```

### Projekcie

| Projekcia | Zmena |
|---|---|
| `current_affiliations` | Všetky 3 riadky Pavla odstránené |
| `person_timeline` | Pridané `PersonDeathRecorded` + 3× `AffiliationTerminated` |
| `organization_roster` (×3) | Pavol zmizol z aktívnych vo všetkých 3 organizáciách |
| `historical_records` | Zachované — napr. „rozhodca finále 2019" ostáva v histórii |

### Webhooks

Tri organizácie (SFZ, FK Slovan Levice, ObFZ Levice) dostanú `AffiliationTerminated` webhook s `reason: death` (ak ho majú zaregistrovaný).

## Edge cases

### Historické časové rady sa nesmú rozbiť

Základné údaje (meno, roky pôsobenia, dosiahnuté výsledky) sa zachovávajú — inak by sa rozbili dlhé časové rady, napr. zoznam držiteľov rozhodcovskej licencie za 30 rokov alebo majstrov SR. Zmaže sa len to, čo je citlivé a už nepotrebné.

### Chybná notifikácia (mismatch)

Ak CSRÚ notifikácia nezmatchuje žiadne `person_id` (osoba nikdy nebola v športe), Identity Broker ju ignoruje a zaloguje `death_notification_unmatched` — nevytvorí prázdny záznam.

### Osoba s aktívnym disciplinárnym konaním

Ak mal zosnulý otvorené disciplinárne konanie, `AffiliationTerminated` ho ukončí, no konanie sa uzavrie stavom `closed_deceased` — nevymaže sa kvôli právnej stopovateľnosti.

### Duplicitná notifikácia

Ak CSRÚ pošle notifikáciu o úmrtí druhýkrát (retry), Death Coordinator ju deduplikuje podľa `rfo_reference` — kaskáda sa nespustí znova, afiliácie ostanú ukončené len raz.

## Test data

`data/scenarios/05-death-cascade/`:

```
fixtures.json    ← Person (rozhodca/funkcionár/delegát) + 3 afiliácie + 3 organizácie
expected.json    ← projekcie po kaskáde + zachované historical_records
events.json      ← PersonDeathRecorded + 3× AffiliationTerminated + PersonDataAccessRestricted
```

## Status

- [x] Obsah doplnený
- [ ] Review
- [ ] Schválené

## Referencie

- [`../integration/state-registers.md`](../integration/state-registers.md) — RFO/CSRÚ cez ÚPVS
- [`../architecture/identity-broker.md`](../architecture/identity-broker.md)
- [`../domain/events/affiliation-events.md`](../domain/events/affiliation-events.md)
- [`../gdpr/data-subject-rights.md`](../gdpr/data-subject-rights.md) — GDPR po úmrtí
- [`03` multi-role](03-multi-role-person.md) — čo sa stane s viacerými rolami naraz
