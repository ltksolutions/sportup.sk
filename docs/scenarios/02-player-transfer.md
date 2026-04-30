# Scenár 02 — Prestup hráča (saga)

## Východisko

Profesionálny hokejista **Juraj Kováč** prestupuje z klubu **HC 05 Banská Bystrica** do klubu **HK Nitra**. Prestup je oficiálny, riadi ho SZĽH, prestupový poplatok je uhradený, zmluva podpísaná.

## Aktéri

- **Juraj Kováč** (Person, `person_id: 550e8400-...`)
- **HC 05 Banská Bystrica** (Organization, `organization_id: bb-uuid`)
- **HK Nitra** (Organization, `organization_id: nitra-uuid`)
- **SZĽH** (Slovenský zväz ľadového hokeja, schvaľuje prestup)
- **Aplikácia SZĽH-portal** (certifikovaná aplikácia, iniciuje request)

## Cieľ

1. Ukončiť afiliáciu Juraja v HC 05 BB k 30. 6. 2026
2. Vytvoriť afiliáciu v HK Nitra od 1. 7. 2026
3. Všetko ako jedna logická operácia — saga
4. Audit trail pre právne účely

## Kroky

### Krok 1: SZĽH portal iniciuje prestup

```http
POST /v1/transfers HTTP/1.1
Authorization: Bearer eyJhbGc...
Content-Type: application/json
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440099

{
  "person_id": "550e8400-...",
  "from_organization_id": "bb-uuid",
  "to_organization_id": "nitra-uuid",
  "sport_code": "SK-HKJ",
  "discipline_code": "SK-HKJ-MEN",
  "effective_date": "2026-07-01",
  "reason": "career_move",
  "approved_by": "szlh-uuid",
  "transfer_fee_paid": true,
  "contract_reference": "HKN-2026-12345"
}
```

### Response 202 Accepted

```json
{
  "correlation_id": "transfer-2026-07-01-abc123",
  "status": "pending",
  "_links": {
    "status": "/v1/transfers/transfer-2026-07-01-abc123"
  }
}
```

### Krok 2: Saga workflow (interne)

Transfer Coordinator postupne emituje eventy:

```
Event 1: TransferRequested
  aggregate: TransferProcess
  aggregate_id: transfer-process-xyz
  correlation_id: transfer-2026-07-01-abc123
  data: { ...request payload... }

Event 2: TransferApproved
  aggregate: TransferProcess
  data: { approved_by: "szlh-uuid", approval_date: "2026-04-30T10:30:00Z" }

Event 3: AffiliationTerminated
  aggregate: Affiliation
  aggregate_id: old-affiliation-uuid (BB)
  correlation_id: transfer-2026-07-01-abc123
  causation_id: <event 2>
  data: {
    reason: "transfer",
    effective_date: "2026-06-30",
    destination_organization_id: "nitra-uuid"
  }

Event 4: AffiliationRegistered
  aggregate: Affiliation
  aggregate_id: new-affiliation-uuid (Nitra)
  correlation_id: transfer-2026-07-01-abc123
  causation_id: <event 3>
  data: {
    person_id: "550e8400-...",
    organization_id: "nitra-uuid",
    role_code: "profesionalny_sportovec",
    sport_code: "SK-HKJ",
    discipline_code: "SK-HKJ-MEN",
    valid_from: "2026-07-01",
    legal_title_code: "zmluva_o_profesionalnom_vykonavani_sportu",
    registration_number: "SZLH-2026-..."
  }

Event 5: AffiliationActivated
  aggregate: Affiliation
  aggregate_id: new-affiliation-uuid (Nitra)
  correlation_id: transfer-2026-07-01-abc123
  data: { ...activation metadata... }

Event 6: TransferCompleted
  aggregate: TransferProcess
  correlation_id: transfer-2026-07-01-abc123
  data: {
    old_affiliation_id: "...",
    new_affiliation_id: "...",
    completed_at: "2026-04-30T10:32:14Z"
  }
```

### Krok 3: Klient pollne stav

```http
GET /v1/transfers/transfer-2026-07-01-abc123 HTTP/1.1
Authorization: Bearer eyJhbGc...
```

```json
{
  "correlation_id": "transfer-2026-07-01-abc123",
  "status": "completed",
  "steps": [
    {"event": "TransferRequested", "occurred_at": "...", "status": "completed"},
    {"event": "TransferApproved", "occurred_at": "...", "status": "completed"},
    {"event": "AffiliationTerminated", "occurred_at": "...", "status": "completed"},
    {"event": "AffiliationRegistered", "occurred_at": "...", "status": "completed"},
    {"event": "AffiliationActivated", "occurred_at": "...", "status": "completed"},
    {"event": "TransferCompleted", "occurred_at": "...", "status": "completed"}
  ],
  "old_affiliation_id": "...",
  "new_affiliation_id": "..."
}
```

## Side effects

### Webhooks

Ak HC 05 BB má zaregistrovaný webhook na `AffiliationTerminated`:

```http
POST https://hc05bb.example.sk/sportup/webhook HTTP/1.1
Content-Type: application/json
X-SportUp-Signature: hmac-sha256=abc...
X-SportUp-Event: AffiliationTerminated

{
  "event_id": "...",
  "event_type": "AffiliationTerminated",
  "aggregate_id": "old-affiliation-uuid",
  "occurred_at": "...",
  "data": {
    "reason": "transfer",
    "destination_organization_id": "nitra-uuid"
  }
}
```

HK Nitra dostane analogicky `AffiliationActivated`.

### Projekcie

| Projekcia | Zmena |
|---|---|
| `current_affiliations` | Riadok pre BB odstránený, riadok pre Nitra pridaný |
| `person_timeline` | Pridané obe eventy do timeline Juraja |
| `organization_roster` (BB) | Juraj zmizol z aktívnych |
| `organization_roster` (Nitra) | Juraj pridaný do aktívnych |
| `transfer_log` | Nový záznam s `correlation_id` |

## Edge cases

### Zlyhanie v polceste

Príklad: Krok 5 (`AffiliationActivated`) zlyhá kvôli neuhradenej platbe. Saga musí vrátiť späť:

```
Event 5': TransferRejected
  aggregate: TransferProcess
  data: { reason: "fee_unpaid" }

Event 6': AffiliationCancelled
  aggregate: Affiliation
  aggregate_id: new-affiliation-uuid (Nitra)
  data: { reason: "compensation_for_failed_transfer" }

Event 7': AffiliationReactivated
  aggregate: Affiliation
  aggregate_id: old-affiliation-uuid (BB)
  data: { reason: "compensation_for_failed_transfer" }
```

Pôvodné eventy 3, 4 ostávajú v event store. **História ostáva úplná.**

### Duplicitná požiadavka

Ak SZĽH portal volá `POST /v1/transfers` druhýkrát s tým istým `Idempotency-Key`, server vráti tú istú odpoveď bez vytvorenia novej sagy.

### Prestup počas pozastavenia

Ak je Juraj v BB v stave `suspended` (napr. disciplinárka), policy engine prestup odmietne s `409 Conflict` a `error_code: source_affiliation_not_active`.

### Prestup do iného športu

Toto nie je prestup, ale nová afiliácia. Nepoužije sa `/v1/transfers`, ale `POST /v1/affiliations` priamo. Stará v inom športe ostane platná.

## Test data

`data/scenarios/02-player-transfer/`:

```
fixtures.json    ← stav pred prestupom
expected.json    ← stav po prestupe
events.json      ← očakávaná sekvencia eventov
```

## Referencie

- ADR-0002 — Saga pattern
- [`../domain/entities/affiliation.md`](../domain/entities/affiliation.md)
- [`../domain/events/affiliation-events.md`](../domain/events/affiliation-events.md)
- [`../api/endpoints/affiliations.md`](../api/endpoints/affiliations.md)
