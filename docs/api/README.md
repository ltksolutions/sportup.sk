# REST API

> Hlavné rozhranie pre certifikované aplikácie. OpenAPI 3.1, OAuth2, versioned, idempotent.

## Štruktúra

```
api/
├── README.md                    ← ste tu
├── openapi.yaml                 ← strojovo čitateľná špecifikácia
├── conventions.md               ← URL, metódy, statusy, error format
├── authentication.md            ← OAuth2, scopes, mTLS
├── pagination.md                ← cursor-based pagination
├── filtering.md                 ← OData-style filter queries
├── projections.md               ← read models a ich endpoints
├── webhooks.md                  ← event notifikácie pre klientov
├── bulk-export.md               ← hromadné dáta pre integrátorov
└── endpoints/
    ├── persons.md
    ├── affiliations.md
    ├── organizations.md
    ├── activities.md
    ├── facilities.md
    ├── qualifications.md
    ├── consents.md
    ├── catalogs.md
    └── public.md                ← bez autentifikácie (open data)
```

## Verzionovanie

URL prefix `/v1/`, `/v2/`. Breaking changes znamenajú nový major. Minor zmeny aditívne, deprecation trvá 12 mesiacov.

```
https://api.sportup.sk/v1/persons/{id}
```

## Štruktúra URL

```
/{version}/{resource}                # collection
/{version}/{resource}/{id}           # single
/{version}/{resource}/{id}/{sub}     # sub-resource
/{version}/public/{resource}         # bez autentifikácie
```

Príklady:

```
GET    /v1/persons                            ← list (paginovaný, vyžaduje scope)
POST   /v1/persons                            ← create
GET    /v1/persons/{id}                       ← detail
PATCH  /v1/persons/{id}                       ← update (partial)
GET    /v1/persons/{id}/affiliations          ← afiliácie osoby
GET    /v1/persons/{id}/timeline              ← všetky eventy osoby
POST   /v1/transfers                          ← spustí saga
GET    /v1/public/facilities                  ← verejný katalóg športovísk
GET    /v1/public/sports                      ← verejný katalóg športov
```

## HTTP metódy

| Metóda | Použitie |
|---|---|
| `GET` | Čítanie. Idempotent. |
| `POST` | Vytvorenie alebo akcia. Nie je idempotent (okrem akcií s `Idempotency-Key`). |
| `PATCH` | Čiastočný update. Body je JSON Merge Patch alebo JSON Patch. |
| `PUT` | **Nepoužívame.** Replace celého resource je v event-sourced systéme nezmyselný. |
| `DELETE` | Soft delete (typicky `terminate`). Plný hard delete len pre admin scope. |

## Status kódy

| Kód | Použitie |
|---|---|
| 200 OK | Úspešný GET/PATCH |
| 201 Created | Úspešné vytvorenie (POST) |
| 202 Accepted | Akceptované, ale spracovanie asynchrónne (saga) |
| 204 No Content | Úspešné, bez tela odpovede (napr. DELETE) |
| 400 Bad Request | Validačná chyba |
| 401 Unauthorized | Chýba alebo neplatný token |
| 403 Forbidden | Token platný, ale chýba scope/consent (s `error_code` v body) |
| 404 Not Found | Resource neexistuje (alebo nemáte právo ho vidieť) |
| 409 Conflict | Stav nie je kompatibilný s operáciou (napr. Affiliation už terminated) |
| 410 Gone | Resource bol natrvalo odstránený (GDPR výmaz) |
| 422 Unprocessable Entity | Sémantická chyba v dátach |
| 429 Too Many Requests | Rate limit prekročený |
| 500 Internal Server Error | Náš problém |
| 503 Service Unavailable | Plánovaný výpadok / preťaženie |

## Error format

Všetky 4xx/5xx odpovede majú jednotnú štruktúru (RFC 7807 Problem Details):

```json
{
  "type": "https://docs.sportup.sk/errors/consent-missing",
  "title": "Consent missing for purpose",
  "status": 403,
  "detail": "Aplikácia má scope 'affiliations:read', ale chýba aktívny Consent pre účel REG-SPORTOVEC-001 a osobu 550e8400-...",
  "instance": "req-2026-04-30-abc123",
  "error_code": "consent_missing",
  "consent_required": {
    "purpose_code": "REG-SPORTOVEC-001",
    "purpose_version": "1.0",
    "person_id": "550e8400-..."
  }
}
```

## Autentifikácia

OAuth2 Authorization Code flow + Client Credentials pre servery. Detail v [`authentication.md`](authentication.md).

## Idempotencia pre POST

Pre kritické zápisy (registrácia, prestup) klient pošle hlavičku `Idempotency-Key: <uuid>`. Server cachuje odpoveď 24h — opakovaný request s tým istým kľúčom vráti rovnaký výsledok.

## Pagination

Cursor-based pre stabilné výsledky:

```
GET /v1/persons?limit=50&cursor=eyJpZCI6Ii4uLiJ9

{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6Ii4uLi4uIn0=",
    "has_more": true
  }
}
```

## Webhooks

Klienti sa registrujú na konkrétne event types (`AffiliationActivated`, `QualificationExpired`...). Detail v [`webhooks.md`](webhooks.md).

## OpenAPI špecifikácia

Strojovo čitateľná verzia: [`openapi.yaml`](openapi.yaml). Renderuje sa cez Swagger UI alebo ReDoc.

## Referencie

- [`conventions.md`](conventions.md)
- [`authentication.md`](authentication.md)
- [`endpoints/`](endpoints/) — detail jednotlivých zdrojov
- [`../mcp/README.md`](../mcp/README.md) — MCP servery (alternatíva pre agentov)
