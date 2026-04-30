# API: Affiliations

> Endpointy pre správu vzťahov osôb k organizáciám.

## Endpointy

| Metóda | URL | Účel |
|---|---|---|
| `GET` | `/v1/affiliations/{id}` | Detail afiliácie |
| `GET` | `/v1/affiliations` | List s filtrami |
| `POST` | `/v1/affiliations` | Registrácia novej afiliácie |
| `PATCH` | `/v1/affiliations/{id}` | Update povolených polí |
| `POST` | `/v1/affiliations/{id}/activate` | Aktivácia (overenie prešlo) |
| `POST` | `/v1/affiliations/{id}/suspend` | Pozastavenie |
| `POST` | `/v1/affiliations/{id}/resume` | Návrat z pozastavenia |
| `POST` | `/v1/affiliations/{id}/terminate` | Ukončenie |
| `POST` | `/v1/affiliations/{id}/correct` | Oprava chyby (audit-trail) |
| `POST` | `/v1/transfers` | Spustenie saga pre prestup |
| `GET` | `/v1/transfers/{correlation_id}` | Stav saga |

## GET /v1/affiliations/{id}

```http
GET /v1/affiliations/a3f8b9d0-... HTTP/1.1
Authorization: Bearer eyJhbGc...
Accept: application/json
```

**Required scope:** `affiliations:read` + (vlastnenie afiliácie alebo územná príslušnosť)

**Response 200:**

```json
{
  "affiliation_id": "a3f8b9d0-...",
  "person_id": "550e8400-...",
  "organization_id": "7c3a9f1e-...",
  "role_code": "amatersky_sportovec",
  "sport_code": "SK-FTB",
  "discipline_code": "SK-FTB-FUTSAL",
  "category_code": "SK-FTB-WOMEN",
  "valid_from": "2024-08-01",
  "valid_to": null,
  "status": "active",
  "legal_title_code": "registracia_clen",
  "registration_number": "SFZ-2024-12345",
  "_links": {
    "self": "/v1/affiliations/a3f8b9d0-...",
    "person": "/v1/persons/550e8400-...",
    "organization": "/v1/organizations/7c3a9f1e-...",
    "events": "/v1/affiliations/a3f8b9d0-.../events"
  },
  "_metadata": {
    "created_at": "2024-08-01T09:30:00Z",
    "updated_at": "2024-08-01T09:30:00Z",
    "version": 3
  }
}
```

## POST /v1/affiliations

Registrácia novej afiliácie.

```http
POST /v1/affiliations HTTP/1.1
Authorization: Bearer eyJhbGc...
Content-Type: application/json
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440099
Accept: application/json
```

```json
{
  "person_id": "550e8400-...",
  "organization_id": "7c3a9f1e-...",
  "role_code": "amatersky_sportovec",
  "sport_code": "SK-FTB",
  "discipline_code": "SK-FTB-FUTSAL",
  "valid_from": "2026-08-01",
  "legal_title_code": "registracia_clen",
  "registration_number": "SFZ-2026-12345"
}
```

**Required scope:** `affiliations:write` + organizácia v scope aplikácie

**Required Consent:** `REG-SPORTOVEC-001` (alebo iný relevantný REG-* podľa role)

**Response 201:**

```json
{
  "affiliation_id": "a3f8b9d0-...",
  "status": "pending",
  ...
}
```

Vytvorí sa event `AffiliationRegistered`. Aplikácia potom ešte musí volať `/activate` pre prechod do `active` (po overení dokumentov, platby, lekárskej prehliadky atď.).

**Response 409 — duplicita:**

```json
{
  "type": "https://docs.sportup.sk/errors/duplicate-affiliation",
  "title": "Active affiliation already exists",
  "status": 409,
  "error_code": "duplicate_affiliation",
  "existing_affiliation_id": "..."
}
```

## POST /v1/transfers (saga)

Spustí prestupovú sagu.

```json
{
  "person_id": "550e8400-...",
  "from_organization_id": "club-A-uuid",
  "to_organization_id": "club-B-uuid",
  "sport_code": "SK-HKJ",
  "effective_date": "2026-07-01",
  "reason": "career_move"
}
```

**Response 202:**

```json
{
  "correlation_id": "transfer-2026-07-01-abc123",
  "status": "pending",
  "_links": {
    "status": "/v1/transfers/transfer-2026-07-01-abc123"
  },
  "expected_completion_at": "2026-06-15T12:00:00Z"
}
```

## GET /v1/transfers/{correlation_id}

```json
{
  "correlation_id": "transfer-2026-07-01-abc123",
  "status": "approved",
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

## Filter query

```
GET /v1/affiliations?
    organization_id=7c3a9f1e-...
    &role_code=trener
    &sport_code=SK-FTB
    &status=active
    &as_of=2026-04-30
    &limit=50
    &cursor=...
```

## Webhooks

Klient sa môže prihlásiť na eventy:

```
POST /v1/webhooks
{
  "url": "https://klient.example.sk/sportup/webhook",
  "events": ["AffiliationActivated", "AffiliationTerminated"],
  "filter": {
    "organization_id": "7c3a9f1e-..."
  }
}
```

Pri každom matchujúcom evente klient dostane HTTPS POST s HMAC podpisom.

## Referencie

- [`../../domain/entities/affiliation.md`](../../domain/entities/affiliation.md)
- [`../../domain/events/affiliation-events.md`](../../domain/events/affiliation-events.md)
- [`../../scenarios/02-player-transfer.md`](../../scenarios/02-player-transfer.md)
