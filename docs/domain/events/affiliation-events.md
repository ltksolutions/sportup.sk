# Eventy: Affiliation

> Kompletný katalóg eventov pre agregát Affiliation. Toto je **kontrakt** — zmena schémy eventu vyžaduje versioning a migráciu.

## Spoločná schéma eventu

Všetky Affiliation eventy zdieľajú túto envelope:

```typescript
{
  event_id:        UUID,
  event_type:      "AffiliationXxx",
  event_version:   1,                    // pre schema evolution
  aggregate_id:    UUID (= affiliation_id),
  aggregate_type:  "Affiliation",
  occurred_at:     Timestamp,            // kedy sa to skutočne stalo
  recorded_at:     Timestamp,            // kedy systém zapísal
  actor_person_id: UUID | null,          // kto to spôsobil
  source_app_id:   UUID,                 // ktorá certifikovaná aplikácia
  correlation_id:  UUID | null,          // pre saga
  causation_id:    UUID | null,          // predchádzajúci event
  data:            object                // event-specific payload
}
```

## Eventy

### `AffiliationRegistered`

Vznik novej afiliácie. Stav po: `pending`.

```json
{
  "event_type": "AffiliationRegistered",
  "data": {
    "person_id": "...",
    "organization_id": "...",
    "role_code": "amatersky_sportovec",
    "sport_code": "SK-FTB",
    "discipline_code": "SK-FTB-FUTSAL",
    "category_code": "SK-FTB-WOMEN",
    "valid_from": "2026-08-01",
    "legal_title_code": "registracia_clen",
    "registration_number": "SFZ-2026-12345"
  }
}
```

### `AffiliationActivated`

Overenie prešlo, vzťah je platný. Stav po: `active`.

```json
{
  "event_type": "AffiliationActivated",
  "data": {
    "verified_by": "admin-uuid",
    "verification_method": "automatic" | "manual",
    "notes": "..."
  }
}
```

### `AffiliationSuspended`

Pozastavenie (zranenie, disciplinárka, administratívne). Stav po: `suspended`.

```json
{
  "event_type": "AffiliationSuspended",
  "data": {
    "reason": "injury" | "disciplinary" | "administrative" | "missing_documents" | "other",
    "reason_text": "...",
    "suspended_until": "2026-12-31",  // optional
    "decision_reference": "DIS-2026-0042"  // odkaz na disciplinárne konanie
  }
}
```

### `AffiliationResumed`

Návrat z pozastavenia. Stav po: `active`.

```json
{
  "event_type": "AffiliationResumed",
  "data": {
    "resumed_by": "admin-uuid",
    "notes": "..."
  }
}
```

### `AffiliationRoleChanged`

Zmena role v rámci tej istej afiliácie (napr. hráč → asistent trénera v tom istom klube). Pre úplnú kariérnu zmenu sa odporúča Terminate + nová.

```json
{
  "event_type": "AffiliationRoleChanged",
  "data": {
    "previous_role_code": "athlete_amateur",
    "new_role_code": "coach_assistant",
    "effective_date": "2026-08-01",
    "reason": "..."
  }
}
```

### `AffiliationTerminated`

Koniec vzťahu. Stav po: `terminated`.

```json
{
  "event_type": "AffiliationTerminated",
  "data": {
    "reason": "voluntary" | "transfer" | "expiration" | "expulsion" | "death" | "other",
    "reason_text": "...",
    "effective_date": "2026-06-30",
    "destination_organization_id": "..."  // ak transfer
  }
}
```

### `AffiliationCorrected`

Oprava chybného záznamu (typo, zle zadaný dátum, zlá rola). **Nie je to zmena stavu** — pôvodný event ostáva, nový event obsahuje opravu.

```json
{
  "event_type": "AffiliationCorrected",
  "data": {
    "corrected_event_id": "uuid-pôvodného-eventu",
    "corrections": {
      "valid_from": "2026-08-01"  // bola tam chyba 2026-09-01
    },
    "reason": "Typo pri vstupe údajov",
    "corrected_by": "admin-uuid"
  }
}
```

## Saga eventy (transfer)

Pre detail saga pattern pozri ADR-0002. Eventy:

### `TransferRequested`

Iniciuje transfer sagu. Vzniká na samostatnom **TransferProcess** agregáte.

```json
{
  "event_type": "TransferRequested",
  "aggregate_type": "TransferProcess",
  "data": {
    "person_id": "...",
    "from_organization_id": "club-A",
    "to_organization_id": "club-B",
    "sport_code": "SK-FTB",
    "effective_date": "2026-07-01",
    "requested_by": "...",
    "reason": "career_move"
  }
}
```

### `TransferApproved` / `TransferRejected`

```json
{
  "event_type": "TransferApproved",
  "aggregate_type": "TransferProcess",
  "data": {
    "approved_by": "...",
    "approval_date": "..."
  }
}
```

### `TransferCompleted`

Po úspešnom dokončení sagy.

### `TransferCompensated`

Pri zlyhaní v polceste — generuje kompenzačné Affiliation eventy.

## Versioning

Pri zmene schémy eventu:

- **Backward compatible** — pridanie nového voliteľného poľa: minor version (`event_version` ostáva, len schema sa rozšíri)
- **Breaking change** — pridanie povinného poľa, zmena typu, premenovanie: major version (`event_version: 2`)
  - Zachováva sa stará verzia v event store
  - Command handler píše novú verziu
  - Read model upcaster transformuje staré eventy pri rebuild

## Idempotencia

`event_id` je primárny kľúč v event store. Opätovné spracovanie tej istej operácie nesmie produkovať duplicitný event — command handler kontroluje `causation_id` a `correlation_id` proti existujúcim eventom.

## Referencie

- ADR-0001 — Event sourcing
- ADR-0002 — Saga pattern
- [`../entities/affiliation.md`](../entities/affiliation.md)
- [`../../scenarios/02-player-transfer.md`](../../scenarios/02-player-transfer.md)
