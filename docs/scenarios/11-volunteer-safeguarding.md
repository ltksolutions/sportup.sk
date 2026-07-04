# Scenár 11 — Prihlásenie dobrovoľníka na mestskú aktivitu (safeguarding)

## Východisko

**Mesto Trnava** organizuje letný športový tábor pre deti (6–14 rokov) a hľadá dobrovoľníkov. **Zuzana Malíková** (28, v čase deja rok 2024) sa chce prihlásiť ako dobrovoľníčka. Keďže bude v priamom kontakte s **maloletými**, systém vyžaduje platný **safeguarding certifikát** (ochrana detí v športe) ešte pred aktiváciou jej dobrovoľníckej afiliácie.

Scenár ukazuje, že dobrovoľník je plnohodnotná evidovaná osoba (nie športovec), že oficiálnym zdrojom je samospráva, a že systém vynucuje ochranu maloletých na úrovni policy engine — nie dôverou v aplikáciu.

> Poznámka o kontinuite: ide o tú istú osobu, ktorá v [scenári 10](10-data-erasure-request.md) neskôr žiada o výmaz údajov. Tu ju vidíme na začiatku jej dobrovoľníckej dráhy.

## Aktéri

- **Zuzana Malíková** (Person, `person_id: 8d2f4a91-...`) — uchádzačka o dobrovoľníctvo
- **Mesto Trnava** (Organization — typ `mesto`, RPO previazané, `organization_id: mesto-tt-uuid`) — organizátor
- **Letný športový tábor Trnava 2024** (Activity — mestom organizovaná aktivita, `activity_id: act-tt-tabor-uuid`)
- **Aplikácia Mesto-Trnava-portal** (certifikovaná aplikácia samosprávy, scope `write:volunteer_affiliations`)
- **Identity Broker** (overenie identity voči RFO cez eID)
- **Safeguarding autorita** (vydavateľ certifikátu ochrany detí)

## Cieľ

1. Overiť identitu dobrovoľníčky cez eID (slovensko.sk).
2. Skontrolovať platný safeguarding certifikát pred prístupom k maloletým.
3. Vytvoriť dobrovoľnícku afiliáciu k mestu, viazanú na konkrétnu aktivitu.
4. Zablokovať aktiváciu, ak safeguarding chýba — ochrana maloletých vynútená serverom.

## Kroky

### Krok 1: Overenie identity cez eID

Zuzana sa prihlási cez slovensko.sk (NASES). Identity Broker ju matchne voči RFO:

```http
POST /v1/persons/match-or-create HTTP/1.1
Authorization: Bearer <token Mesto-Trnava-portal>
Content-Type: application/json
X-Auth-Method: eid_slovensko_sk

{
  "eid_subject_ref": "SK-eID-...",
  "given_name": "Zuzana",
  "family_name": "Malíková",
  "national_id": "960214/XXXX"
}
```

```json
{
  "person_id": "8d2f4a91-...",
  "matched": true,
  "verification_status": "verified_by_rfo_eid"
}
```

### Krok 2: Kontrola safeguarding certifikátu

Pred vytvorením afiliácie s prístupom k maloletým policy engine overí kvalifikáciu `KVL-SAFEGUARDING-001`:

```http
GET /v1/persons/8d2f4a91-.../qualifications?type=KVL-SAFEGUARDING-001&status=valid HTTP/1.1
Authorization: Bearer <token Mesto-Trnava-portal>
```

**Prípad A — certifikát platný:**

```json
{
  "qualifications": [
    {
      "qualification_id": "qual-sg-uuid",
      "type": "KVL-SAFEGUARDING-001",
      "issued_by": "safeguarding-authority-uuid",
      "valid_from": "2023-05-01",
      "valid_to": "2026-05-01",
      "status": "valid"
    }
  ]
}
```

### Krok 3: Vytvorenie dobrovoľníckej afiliácie viazanej na aktivitu

```http
POST /v1/affiliations HTTP/1.1
Authorization: Bearer <token Mesto-Trnava-portal, scope write:volunteer_affiliations>
Content-Type: application/json
Idempotency-Key: vol-tt-tabor-2024-zm

{
  "person_id": "8d2f4a91-...",
  "organization_id": "mesto-tt-uuid",
  "role_code": "dobrovolnik",
  "activity_id": "act-tt-tabor-uuid",
  "works_with_minors": true,
  "safeguarding_qualification_id": "qual-sg-uuid",
  "valid_from": "2024-07-01",
  "valid_to": "2024-07-31",
  "legal_basis": "consent"
}
```

### Response 201 Created

```json
{
  "affiliation_id": "aff-vol-tt-uuid",
  "status": "active",
  "works_with_minors": true,
  "safeguarding_verified": true
}
```

```
Event: AffiliationRegistered
  aggregate: Affiliation
  aggregate_id: aff-vol-tt-uuid
  data: {
    role_code: "dobrovolnik",
    works_with_minors: true,
    safeguarding_qualification_id: "qual-sg-uuid",
    activity_id: "act-tt-tabor-uuid"
  }

Event: AffiliationActivated
  aggregate: Affiliation
  aggregate_id: aff-vol-tt-uuid
  data: { status: "active" }
```

### Krok 4: Agenda pre koordináciu dobrovoľníkov cez MCP

Mesto si cez certifikovaný MCP server zobrazí obsadenosť dobrovoľníkov na tábore — agregát, bez PII detí:

```jsonc
// MCP tool call — volunteer-mcp (scope: read:activity_staffing)
{
  "tool": "get_activity_staffing",
  "arguments": { "activity_id": "act-tt-tabor-uuid" }
}
```

```json
{
  "result": {
    "volunteers_active": 12,
    "volunteers_safeguarding_valid": 12,
    "coverage_ratio_per_child": 0.15,
    "data_form": "aggregate_no_pii"
  }
}
```

## Side effects

### Projekcie

| Projekcia | Zmena |
|---|---|
| `current_affiliations` | +1 riadok — dobrovoľnícka afiliácia Zuzany |
| `organization_roster` (Mesto Trnava) | Zuzana pridaná ako dobrovoľník |
| `activity_staffing` (tábor) | +1 dobrovoľník s platným safeguardingom |
| `safeguarding_register` | Väzba osoba × certifikát × aktivita s prístupom k maloletým |

### Webhooks

Ak má mesto registrovaný webhook na `AffiliationActivated`, dostane notifikáciu o novom dobrovoľníkovi.

## Edge cases

### Prípad B — chýbajúci alebo expirovaný safeguarding

Ak certifikát chýba alebo je po platnosti, policy engine odmietne aktiváciu:

```json
{
  "error_code": "safeguarding_required_for_minors",
  "message": "Dobrovoľník s prístupom k maloletým musí mať platný certifikát KVL-SAFEGUARDING-001.",
  "affiliation_status": "pending_safeguarding"
}
```

Afiliácia sa vytvorí v stave `pending_safeguarding`, ale **neaktivuje sa** — Zuzana nesmie k deťom, kým certifikát nedoloží. Ochrana maloletých je vynútená serverom, nie aplikáciou.

### Certifikát expiruje počas aktivity

Ak safeguarding vyprší v priebehu tábora, scheduler vydá `AffiliationSuspended` s `reason: safeguarding_expired` — dobrovoľník je pozastavený do obnovenia certifikátu.

### Dobrovoľník bez prístupu k maloletým

Ak by aktivita nemala kontakt s deťmi (`works_with_minors: false`), safeguarding sa nevyžaduje — afiliácia sa aktivuje priamo. Systém pýta certifikát len tam, kde je to nevyhnutné (minimalizácia požiadaviek).

### Tá istá osoba, viac rolí

Zuzana môže byť súčasne dobrovoľníčka (mesto) aj rozhodkyňa (zväz) — dve afiliácie, jedno `person_id` (princíp zo [scenára 03](03-multi-role-person.md)). Safeguarding sa viaže na tú afiliáciu, kde je prístup k maloletým.

## Test data

`data/scenarios/11-volunteer-safeguarding/`:

```
fixtures.json    ← Person s platným safeguarding certifikátom + mesto + tábor (aktivita)
expected.json    ← aktívna dobrovoľnícka afiliácia + safeguarding_register (Prípad A)
                    + variant Prípad B: pending_safeguarding pri chýbajúcom certifikáte
events.json      ← AffiliationRegistered + AffiliationActivated
```

## Status

- [x] Obsah doplnený
- [ ] Review
- [ ] Schválené

## Referencie

- [`../catalogs/qualifications.md`](../catalogs/qualifications.md) — KVL-SAFEGUARDING-001
- [`../domain/entities/qualification.md`](../domain/entities/qualification.md)
- [`../domain/entities/affiliation.md`](../domain/entities/affiliation.md) — role vrátane dobrovoľníka
- [`../integration/state-registers.md`](../integration/state-registers.md) — eID slovensko.sk (NASES)
- [`../architecture/policy-engine.md`](../architecture/policy-engine.md) — vynútenie safeguardingu
- [`03` multi-role](03-multi-role-person.md), [`10` výmaz](10-data-erasure-request.md) — tá istá osoba v čase
