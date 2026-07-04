# Scenár 08 — Akadémia nahrávajúca dáta (bulk import)

## Východisko

Futbalová akadémia **FA Žilina** prechádza zo svojho starého interného systému do SportUp a potrebuje **hromadne nahrať** celú svoju databázu: mladých hráčov (vrátane maloletých), trénerov, kondičného trénera, fyzioterapeuta a technického vedúceho. Ide o stovky osôb naraz. Import musí byť **idempotentný** (bezpečné opakovanie pri zlyhaní), **validovaný** (chybné riadky neprejdú) a osoby sa musia **matchovať voči RFO**, aby nevznikli duplicity.

Scenár ukazuje, že cez štandardizované API vie oficiálny zdroj (akadémia ako klub) naraz zapísať **všetky typy osôb v športe** — nielen hráčov, ale aj športových odborníkov a podporný personál.

## Aktéri

- **FA Žilina** (Organization — akadémia/klub, `organization_id: fa-za-uuid`)
- **Aplikácia FA-Žilina-import** (certifikovaná aplikácia, scope `bulk:affiliations`)
- **Identity Broker** (match voči RFO cez ÚPVS)
- **Importované osoby** (rôzne typy):
  - mladí hráči (maloletí — vyžadujú súhlas zákonného zástupcu)
  - tréneri, kondičný tréner
  - fyzioterapeut (zdravotnícky personál)
  - technický vedúci

## Cieľ

1. Hromadne založiť/matchovať osoby a ich afiliácie jedným requestom.
2. Zabezpečiť idempotenciu — opakovaný import nevytvorí duplicity.
3. Validovať každý riadok; chybné odmietnuť bez zablokovania celej dávky.
4. Správne ošetriť maloletých (guardian consent) a rôzne role.

## Kroky

### Krok 1: Odoslanie dávky

```http
POST /v1/affiliations/bulk HTTP/1.1
Authorization: Bearer <token FA-Žilina-import, scope bulk:affiliations>
Content-Type: application/json
Idempotency-Key: fa-za-import-2026-07-batch-01

{
  "organization_id": "fa-za-uuid",
  "default_sport_code": "SK-FBL",
  "records": [
    {
      "row_ref": "1",
      "given_name": "Adam", "family_name": "Horváth",
      "date_of_birth": "2011-03-14", "national_id": "110314/XXXX",
      "role_code": "amatersky_sportovec",
      "discipline_code": "SK-FBL-FUTBAL", "category_code": "SK-FBL-U15",
      "guardian": { "given_name": "Peter", "family_name": "Horváth", "national_id": "800101/XXXX" }
    },
    {
      "row_ref": "2",
      "given_name": "Marek", "family_name": "Kováč",
      "date_of_birth": "1985-06-20", "national_id": "850620/XXXX",
      "role_code": "trener",
      "discipline_code": "SK-FBL-FUTBAL"
    },
    {
      "row_ref": "3",
      "given_name": "Jana", "family_name": "Šimková",
      "date_of_birth": "1990-11-02", "national_id": "905102/XXXX",
      "role_code": "fyzioterapeut"
    },
    {
      "row_ref": "4",
      "given_name": "Ivan", "family_name": "Baláž",
      "date_of_birth": "1978-01-30",
      "role_code": "technicky_veduci"
    }
  ]
}
```

### Response 202 Accepted

Bulk import je asynchrónny — vráti sa `correlation_id` a odkaz na stav:

```json
{
  "correlation_id": "bulk-fa-za-2026-07-abc",
  "status": "processing",
  "total_records": 4,
  "_links": { "status": "/v1/affiliations/bulk/bulk-fa-za-2026-07-abc" }
}
```

### Krok 2: Spracovanie po riadkoch (interne)

Pre každý riadok Identity Broker matchne osobu voči RFO a vytvorí afiliáciu. Maloletý (row 1) vyžaduje guardian consent — vytvorí sa aj vzťah zákonného zástupcu:

```
Event: PersonMatched / PersonRegistered (per row)
Event: GuardianRelationshipEstablished  (len row 1 — maloletý)
Event: ConsentGranted                   (guardian consent pre row 1)
Event: AffiliationRegistered            (per row)
Event: AffiliationActivated             (per row, po validácii)
  — všetky s correlation_id: bulk-fa-za-2026-07-abc
```

### Krok 3: Klient pollne stav dávky

```http
GET /v1/affiliations/bulk/bulk-fa-za-2026-07-abc HTTP/1.1
Authorization: Bearer <token FA-Žilina-import>
```

```json
{
  "correlation_id": "bulk-fa-za-2026-07-abc",
  "status": "completed_with_errors",
  "summary": { "total": 4, "succeeded": 3, "failed": 1 },
  "results": [
    { "row_ref": "1", "status": "created", "person_id": "...", "affiliation_id": "..." },
    { "row_ref": "2", "status": "matched_existing", "person_id": "...", "affiliation_id": "..." },
    { "row_ref": "3", "status": "created", "person_id": "...", "affiliation_id": "..." },
    { "row_ref": "4", "status": "rejected", "error_code": "missing_national_id",
      "message": "Bez rodného čísla nie je možné overiť identitu voči RFO." }
  ]
}
```

Riadok 4 (technický vedúci bez rodného čísla) neprešiel validáciou — ale zvyšné 3 riadky sa spracovali. Dávka nezlyhala ako celok.

## Side effects

### Idempotencia

Opakované volanie s tým istým `Idempotency-Key` (`fa-za-import-2026-07-batch-01`) vráti **ten istý výsledok** bez vytvorenia nových osôb/afiliácií. Umožňuje bezpečný retry pri výpadku siete.

### Projekcie

| Projekcia | Zmena |
|---|---|
| `current_affiliations` | +3 riadky (hráč, tréner, fyzioterapeut) |
| `organization_roster` (FA Žilina) | +3 osoby rôznych rolí |
| `guardian_relationships` | +1 (maloletý Adam ↔ otec Peter) |
| `bulk_import_log` | Záznam dávky s výsledkami a chybami |

### Webhooks

Ak má FA Žilina registrovaný webhook na dokončenie dávky, dostane `BulkImportCompleted` so súhrnom.

## Edge cases

### Čiastočné zlyhanie (partial success)

Ako v Kroku 3 — chybné riadky sa odmietnu s konkrétnym `error_code` a `row_ref`, ostatné prejdú. Akadémia opraví len chybné riadky a nahrá ich znova (idempotencia zabráni duplicite tých úspešných).

### Duplicita v rámci dávky

Ak tá istá osoba figuruje v dávke dvakrát (napr. tréner aj rodič hráča), Identity Broker ju matchne na jedno `person_id` a vytvorí dve rôzne afiliácie/vzťahy — nie dve osoby.

### Osoba už existuje v inom klube

Ak je tréner Marek už registrovaný v inom klube, `match_existing` ho nájde a pridá **ďalšiu** afiliáciu k FA Žilina — v súlade so scenárom 03 (multi-role). Identita ostáva jedna.

### Rôzne role vyžadujú rôzne dátové rozsahy

Fyzioterapeut (`fyzioterapeut`) môže neskôr potrebovať zdravotnícku kvalifikáciu (KVL-*), technický vedúci nie. Bulk import založí základnú afiliáciu; špecifické kvalifikácie/licencie sa doplnia samostatne.

### Maloletý bez guardian údajov

Ak riadok s maloletým nemá `guardian`, validácia ho odmietne s `error_code: guardian_required_for_minor` — maloletého nemožno registrovať bez zákonného zástupcu.

## Test data

`data/scenarios/08-academy-bulk-import/`:

```
fixtures.json    ← FA Žilina + prázdny roster; 1 už existujúca osoba (tréner v inom klube)
expected.json    ← 3 úspešné afiliácie + 1 guardian vzťah + 1 odmietnutý riadok
events.json      ← sekvencia per-row eventov s correlation_id
```

## Status

- [x] Obsah doplnený
- [ ] Review
- [ ] Schválené

## Referencie

- [`../api/conventions.md`](../api/conventions.md) — idempotencia, bulk operácie
- [`../architecture/identity-broker.md`](../architecture/identity-broker.md) — match voči RFO
- [`../catalogs/activities.md`](../catalogs/activities.md) — role: hráč, tréner, fyzioterapeut, technický vedúci
- [`../gdpr/purposes/REG-identity.md`](../gdpr/purposes/REG-identity.md)
- [`03` multi-role](03-multi-role-person.md) — osoba v dávke už existuje inde
