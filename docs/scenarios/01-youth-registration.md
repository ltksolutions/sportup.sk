# Scenár 01 — Mládežnícka registrácia

## Východisko

12-ročná **Petra Hájková** chce začať hrať volejbal v klube **VK Slávia EU Bratislava**. Otec **Marek Hájek** vyplní registráciu cez klubovú web aplikáciu. Petra ešte nemá záznam v žiadnom športovom systéme.

## Aktéri

- **Petra Hájková** (Person, maloletá, *2014-03-22)
- **Marek Hájek** (Person, otec a zákonný zástupca)
- **VK Slávia EU Bratislava** (Organization)
- **SVF** (Slovenský volejbalový zväz, schvaľuje registrácie)
- **Klubová aplikácia** (certifikovaná)

## Cieľ

1. Vytvoriť záznam Person pre Petru s overením voči RFO
2. Prepojiť ju so zákonným zástupcom (Marek)
3. Vytvoriť afiliáciu v klube
4. Získať všetky potrebné súhlasy s GDPR účelmi

## Kroky

### Krok 1: Otec sa prihlasuje cez klubovú aplikáciu

Marek je už registrovaný v SportUp (máva tam svoje vlastné dáta). Prihlási sa cez eID. Aplikácia získa OAuth2 token s jeho identitou.

### Krok 2: Aplikácia pridá nového hráča

```http
POST /v1/persons HTTP/1.1
Authorization: Bearer eyJhbGc...
Content-Type: application/json
Idempotency-Key: 550e8400-...

{
  "given_name": "Petra",
  "family_name": "Hájková",
  "date_of_birth": "2014-03-22",
  "gender": "female",
  "nationality": "SK",
  "national_id": "1452260123",
  "guardian_person_id": "marek-uuid"
}
```

Identity Broker overí voči RFO:

- Match nájdený — vytvorí Person s `verification_status: verified_by_rfo`
- Vytvorí vzťah `LegalGuardianRelation(petra, marek)` so začiatkom platnosti k dnešku

```json
{
  "person_id": "petra-uuid",
  "is_minor": true,
  "verification_status": "verified_by_rfo",
  "guardian": {
    "person_id": "marek-uuid",
    "relation": "father"
  }
}
```

### Krok 3: Aplikácia získa potrebné súhlasy

Pre maloletého udeľuje súhlas zákonný zástupca. Aplikácia zobrazí všetky relevantné účely:

| Purpose | Charakter | Príklad textu |
|---|---|---|
| `REG-OSOBA-001` | Povinné (public_task) | "Registrácia v centrálnom IS športu — povinné pre účasť na súťažiach" |
| `REG-SPORTOVEC-001` | Povinné (contract) | "Registrácia ako športovkyňa vo VK Slávia EU a SVF" |
| `ZDR-PREHLIADKA-001` | Povinné (legal_obligation) | "Lekárska prehliadka pred súťažami" |
| `MKT-FOTO-001-MALOLETY` | Voliteľné (consent + asent) | "Fotografie z tréningov a zápasov pre klubové médiá" |
| `MKT-NEWSLETTER-001` | Voliteľné (consent) | "Klubový newsletter rodičom" |

Pre povinné: vyplynú z legal basis automaticky, nepotrebujú explicitný súhlas. Pre voliteľné:

```http
POST /v1/consents HTTP/1.1
{
  "person_id": "petra-uuid",
  "consents": [
    {
      "purpose_code": "MKT-FOTO-001-MALOLETY",
      "purpose_version": "1.0",
      "granted_to_type": "organization",
      "granted_to_id": "vk-slavia-uuid",
      "granted_by": "marek-uuid"
    },
    {
      "purpose_code": "MKT-NEWSLETTER-001",
      "purpose_version": "1.0",
      "granted_to_type": "organization",
      "granted_to_id": "vk-slavia-uuid",
      "granted_by": "marek-uuid"
    }
  ]
}
```

### Krok 4: Aplikácia vytvorí afiliáciu

```http
POST /v1/affiliations HTTP/1.1
Idempotency-Key: ...

{
  "person_id": "petra-uuid",
  "organization_id": "vk-slavia-uuid",
  "role_code": "amatersky_sportovec",
  "sport_code": "SK-VLB",
  "discipline_code": "SK-VLB-WOMEN",
  "category_code": "SK-VLB-U13-GIRLS",
  "valid_from": "2026-09-01",
  "legal_title_code": "registracia_clen",
  "registration_number": "VKSV-2026-12345"
}
```

Stav po: `pending`. Po overení (lekárska prehliadka, platba členského):

```http
POST /v1/affiliations/{id}/activate
```

Stav po: `active`.

## Eventy

```
PersonRegistered (Petra, verified_by_rfo)
LegalGuardianRelationCreated (Petra ← Marek)
ConsentGranted (Petra, MKT-FOTO-001-MALOLETY, klub)
ConsentGranted (Petra, MKT-NEWSLETTER-001, klub)
AffiliationRegistered (Petra v VK Slávia, volejbal, U13)
AffiliationActivated (Petra v VK Slávia)
```

## Side effects

### Webhooky

- SVF dostane `AffiliationActivated` na svojom webhooku → automaticky pridá Petru do svojho registračného zoznamu
- VK Slávia interný systém dostane notifikáciu → vystaví preukaz

### Projekcie

- `current_affiliations` — pridaná Petra
- `vk-slavia-roster` — pridaná do tímu U13
- `svf-licensed-players` — pridaná do federačnej databázy

## Edge cases

### Petra nie je v RFO

Cudzinka, alebo chyba v zadanom rodnom čísle. Identity Broker vráti no_match.

```json
{
  "person_id": "petra-uuid",
  "verification_status": "self_declared",
  "warning": "Identity not verified against RFO. Some operations may require manual verification."
}
```

Petra môže hrať mládežnícke turnaje, ale pre prestup do reprezentácie alebo medzinárodný turnaj bude potrebné dodatočné overenie.

### Marek nie je registrovaný

V kroku 1 aplikácia zistí, že Marek nemá account. Najprv vytvorí jeho Person, potom pokračuje s Petrou. Marek sa zaregistruje cez eID.

### Petra dosiahne plnoletosť

Po dosiahnutí 18 rokov (2032-03-22):

- Systém automaticky vygeneruje notifikáciu
- Petra dostane požiadavku na **re-confirm** voliteľných súhlasov vo svojom mene
- Súhlasy zákonného zástupcu strácajú platnosť do 60 dní, ak Petra nepotvrdí
- Povinné registrácie a afiliácie zostávajú nezmenené

### Marek odvolá súhlas s fotkami

```http
POST /v1/consents/{consent_id}/withdraw
{
  "reason": "no_longer_wished"
}
```

- Klub stratí oprávnenie publikovať Petriny fotky
- Existujúce fotky musí stiahnuť z verejných platforiem (čl. 17 GDPR)
- Iné súhlasy zostávajú nedotknuté

## Test data

`data/scenarios/01-youth-registration/`:

```
fixtures.json   — pred registráciou
expected.json   — stav po registrácii
events.json     — sekvencia eventov
```

## Referencie

- [`../domain/entities/person.md`](../domain/entities/person.md) — najmä sekcia "Maloletí"
- [`../gdpr/README.md`](../gdpr/README.md) — granulárny consent
- [`../api/endpoints/persons.md`](../api/endpoints/persons.md)
