# Scenár 04 — Komerčné overenie pre hotel

## Východisko

Hotel **Grand Jasná** ponúka zľavu 20 % pre registrovaných športovcov. Pri rezervácii chce overiť, či hosť má platnú športovú registráciu — ale **nepotrebuje vedieť kto to je, v akom športe ani v akom klube**. Stačí mu odpoveď áno/nie. Toto je ukážka **minimalizácie údajov** (GDPR čl. 5 ods. 1 písm. c) a účelu `KOM-BENEFIT-001`.

## Aktéri

- **Martina Nováková** (Person, `person_id: 7c9e6a1f-...`) — registrovaná športovkyňa
- **Hotel Grand Jasná** (Organization — komerčný subjekt v cestovnom ruchu, `organization_id: hotel-jasna-uuid`)
- **Aplikácia GrandJasna-recepcia** (certifikovaná aplikácia, scope obmedzený len na `verification:athlete_discount`)
- **Aplikácia SportUp-mobil** (mobilná aplikácia dotknutej osoby, generuje verifikačný token)

## Cieľ

1. Osoba si vygeneruje krátkodobý verifikačný token bez PII.
2. Hotel overí token cez certifikovanú aplikáciu s minimálnym scope.
3. Hotel dostane **iba** `true/false` + kategóriu zľavy — žiadne osobné údaje.
4. Overenie sa zapíše do auditu prístupnému dotknutej osobe.

## Kroky

### Krok 1: Osoba vygeneruje verifikačný token vo svojej aplikácii

```http
GET /v1/my/verification-token?purpose=KOM-BENEFIT-001 HTTP/1.1
Authorization: Bearer <token osoby, eID/slovensko.sk session>
```

### Response 200 OK

```json
{
  "token": "vft_2bc4e7f8a9...",
  "valid_until": "2026-04-20T10:30:00Z",
  "purpose": "KOM-BENEFIT-001",
  "qr_url": "https://verify.sportup.sk/vft_2bc4e7f8a9..."
}
```

Token je krátkodobý (minúty), obsahuje len referenciu na osobu a platnosť — žiadne meno, dátum narodenia ani klub.

### Krok 2: Hotel overí token cez certifikovanú aplikáciu

Recepcia naskenuje QR kód. Komerčný subjekt je certifikovaný **len** pre scope `verification:athlete_discount`:

```http
POST /v1/verify/athlete-status HTTP/1.1
Authorization: Bearer <token certifikovanej aplikácie hotela>
Content-Type: application/json

{
  "token": "vft_2bc4e7f8a9...",
  "purpose": "KOM-BENEFIT-001",
  "requested_attributes": ["has_active_athlete_affiliation"]
}
```

### Response 200 OK

```json
{
  "valid": true,
  "has_active_athlete_affiliation": true,
  "category_tier": "registered",
  "data_form": "boolean_only_no_pii"
}
```

Hotel dostal iba potvrdenie „áno, registrovaný športovec" a kategóriu zľavy. **Nevidí meno, dátum narodenia, klub, šport ani úroveň.**

### Krok 3: MCP alternatíva pre partnerské integrácie

Väčší reťazec (napr. sieť penziónov) môže namiesto REST použiť certifikovaný MCP server `verification-mcp` s tým istým obmedzeným scope — vhodné pri agentickej rezervačnej integrácii:

```jsonc
// MCP tool call — verification-mcp (scope: verification:athlete_discount)
{
  "tool": "verify_athlete_status",
  "arguments": {
    "token": "vft_2bc4e7f8a9...",
    "purpose": "KOM-BENEFIT-001"
  }
}
```

```json
{
  "result": { "valid": true, "category_tier": "registered", "data_form": "boolean_only_no_pii" }
}
```

## Side effects

### Audit log (prístupný dotknutej osobe)

Každé overenie sa zapíše ako event, ktorý si osoba vie pozrieť vo svojej aplikácii:

```
Event: VerificationPerformed
  aggregate: Person
  aggregate_id: 7c9e6a1f-...
  data: {
    purpose: "KOM-BENEFIT-001",
    verifier_organization_id: "hotel-jasna-uuid",
    verifier_name: "Hotel Grand Jasná",
    attributes_disclosed: ["has_active_athlete_affiliation", "category_tier"],
    occurred_at: "2026-04-19T14:03:00Z"
  }
```

### Projekcie

| Projekcia | Zmena |
|---|---|
| `person_verification_log` | Nový riadok — kto, kedy, aké atribúty |
| `organization_verification_usage` (hotel) | Inkrement počítadla overení (pre fakturáciu/kvóty) |

## Edge cases

### Expirovaný token

Ak token vypršal (`valid_until` v minulosti), server vráti `410 Gone` s `error_code: token_expired`. Hotel musí požiadať hosťa o nový QR.

### Osoba nie je športovec, ale iný typ osoby

Ak token patrí napr. **trénerovi bez aktívnej hráčskej afiliácie**, odpoveď na `has_active_athlete_affiliation` je `false` — hotel zľavu neposkytne. (Iný benefit pre trénerov by používal iný účel/atribút, napr. `has_active_coach_affiliation`.) Systém pokrýva všetky typy osôb, ale každý benefit sa viaže na konkrétny atribút.

### Hotel žiada viac, než má scope

Ak certifikovaná aplikácia hotela požiada o atribút mimo svojho scope (napr. `full_name`), policy engine vráti `403 Forbidden` s `error_code: attribute_out_of_scope`. Minimalizácia je vynútená serverom, nie dôverou v klienta.

### Odvolanie súhlasu

`KOM-BENEFIT-001` stojí na súhlase (`consent`). Ak osoba súhlas odvolá, generovanie tokenov pre tento účel prestane fungovať (`403`, `error_code: consent_withdrawn`), aj keď má stále platnú športovú afiliáciu.

## Test data

`data/scenarios/04-commercial-verification/`:

```
fixtures.json    ← Person s aktívnou athlete afiliáciou + hotel (certifikovaná app, scope)
expected.json    ← verifikačná odpoveď (boolean_only_no_pii) + audit event
events.json      ← VerificationPerformed
```

## Status

- [x] Obsah doplnený
- [ ] Review
- [ ] Schválené

## Referencie

- [`../gdpr/purposes/KOM-commercial-verification.md`](../gdpr/purposes/KOM-commercial-verification.md)
- [`../gdpr/data-classification.md`](../gdpr/data-classification.md) — minimalizácia údajov
- [`../architecture/policy-engine.md`](../architecture/policy-engine.md) — vynútenie scope
- [`../mcp/README.md`](../mcp/README.md) — verification-mcp
- Vizualizácia minimalizácie dát — pozri stránku „Príklady" na webe (`website/priklady.html`)
