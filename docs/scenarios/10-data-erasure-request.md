# Scenár 10 — Žiadosť o výmaz dát (GDPR čl. 17)

## Východisko

Bývalá **dobrovoľníčka a rozhodkyňa** **Zuzana Malíková** ukončila akúkoľvek činnosť v športe a podáva žiadosť o výmaz osobných údajov podľa **čl. 17 GDPR (právo na zabudnutie)**. Systém musí posúdiť, čo môže vymazať, a čo naopak **musí zachovať** kvôli zákonným povinnostiam, historickým časovým radom alebo prebiehajúcim konaniam. Právo na výmaz nie je absolútne.

Scenár ukazuje, že aj osoba, ktorá nebola športovec (dobrovoľník + rozhodca), má plné práva dotknutej osoby — a že výmaz je **selektívny**, nie zmazanie celého záznamu.

> Poznámka o kontinuite: ide o tú istú osobu, ktorá sa v [scenári 11](11-volunteer-safeguarding.md) prihlásila ako dobrovoľníčka. Tu ju vidíme na konci jej dráhy v športe.

## Aktéri

- **Zuzana Malíková** (Person, `person_id: 8d2f4a91-...`)
- **Aplikácia SportUp-mobil** (aplikácia dotknutej osoby, podáva žiadosť cez eID)
- **DPO / Erasure Coordinator** (interná služba posudzujúca výmaz voči účelom)
- **Purpose Catalogue** (zdroj pravidiel retencie a právnych základov)

## Cieľ

1. Prijať žiadosť o výmaz autentifikovanú cez eID.
2. Posúdiť každý účel: možno vymazať vs. treba zachovať (a prečo).
3. Vymazať/anonymizovať, čo sa smie; zachovať, čo zákon vyžaduje.
4. Poskytnúť osobe transparentný výsledok (čo, prečo).

## Kroky

### Krok 1: Podanie žiadosti o výmaz

```http
POST /v1/my/erasure-requests HTTP/1.1
Authorization: Bearer <token osoby, eID/slovensko.sk session>
Content-Type: application/json

{
  "person_id": "8d2f4a91-...",
  "scope": "all_erasable",
  "reason": "no_longer_active_in_sport"
}
```

### Response 202 Accepted

```json
{
  "request_id": "erasure-2026-07-04-xyz",
  "status": "under_review",
  "estimated_completion": "2026-08-03",
  "_links": { "status": "/v1/my/erasure-requests/erasure-2026-07-04-xyz" }
}
```

### Krok 2: Posúdenie voči účelom (interne)

Erasure Coordinator prejde všetky dáta osoby a pre každý účel z Purpose Catalogue rozhodne podľa `legal_basis` a `retention`:

```
Event: ErasureRequested
  aggregate: Person
  aggregate_id: 8d2f4a91-...
  correlation_id: erasure-2026-07-04-xyz

Event: ErasureAssessed
  aggregate: Person
  data: {
    erasable: [
      { purpose: "MKT-FOTO-001", action: "delete" },
      { purpose: "MKT-NEWSLETTER-001", action: "delete" },
      { purpose: "REG-DOBROVOLNIK-001", action: "delete" }
    ],
    retained: [
      { purpose: "DIS-KONANIE-001", reason: "active_legal_proceeding" },
      { purpose: "FIN-DOTACIA-001", reason: "legal_retention_10y" },
      { purpose: "POD-VYSLEDKY-001", reason: "historical_public_record" }
    ]
  }
```

### Krok 3: Vykonanie výmazu a anonymizácie

```
Event: PersonalDataErased
  aggregate: Person
  aggregate_id: 8d2f4a91-...
  correlation_id: erasure-2026-07-04-xyz
  data: {
    deleted_scopes: ["contact", "photo", "marketing_preferences"],
    deleted_purposes: ["MKT-FOTO-001", "MKT-NEWSLETTER-001", "REG-DOBROVOLNIK-001"]
  }

Event: PersonalDataAnonymized
  aggregate: Person
  data: {
    anonymized_scopes: ["historical_results"],
    method: "pseudonym_replaced_with_participant_code",
    note: "Rozhodcovské výkony ostávajú ako anonymný záznam v časovom rade."
  }
```

### Krok 4: Transparentný výsledok pre osobu

```http
GET /v1/my/erasure-requests/erasure-2026-07-04-xyz HTTP/1.1
Authorization: Bearer <token osoby>
```

```json
{
  "request_id": "erasure-2026-07-04-xyz",
  "status": "completed_partial",
  "erased": ["Kontaktné údaje", "Fotografie", "Marketingové súhlasy", "Dobrovoľnícka evidencia"],
  "retained": [
    { "what": "Účasť v disciplinárnom konaní", "why": "Prebiehajúce konanie (čl. 17 ods. 3 písm. e)" },
    { "what": "Vyplatené dotácie", "why": "Zákonná archivačná lehota 10 rokov" },
    { "what": "Historické rozhodcovské výkony", "why": "Anonymizované — verejný historický záznam" }
  ]
}
```

## Side effects

### Projekcie

| Projekcia | Zmena |
|---|---|
| `person_directory` | Kontakt, foto, marketing zmazané |
| `current_affiliations` | Dobrovoľnícka afiliácia odstránená |
| `historical_records` | Rozhodcovské výkony **anonymizované** (nahradené participant code), nie zmazané |
| `erasure_log` | Auditný záznam žiadosti a rozhodnutí (sám podlieha retencii) |

### Event store a výmaz

Event sourcing a právo na výmaz sa riešia **crypto-shredding**: osobné údaje v eventoch sú šifrované per-person kľúčom; výmaz = zničenie kľúča. Eventy zostanú (nemenná história), ale osobné dáta v nich sú nečitateľné. Štruktúra a `correlation_id` ostávajú pre integritu.

## Edge cases

### Zákonná povinnosť bráni výmazu

Dotácie (`FIN-DOTACIA-001`) majú zákonnú archivačnú lehotu — nemožno ich vymazať pred jej uplynutím (čl. 17 ods. 3 písm. b GDPR). Osoba je o tom transparentne informovaná.

### Prebiehajúce konanie

Ak má osoba otvorené disciplinárne konanie (`DIS-KONANIE-001`), tie dáta sa zachovajú do právoplatného ukončenia (čl. 17 ods. 3 písm. e — uplatnenie právnych nárokov).

### Anti-doping retencia

Ak by šlo o športovca s anti-dopingovým záznamom (`ZDR-ANTIDOPING-001` / `DIS-DOPING-001`), platí retencia podľa WADA Code (roky) a prenos do ADAMS — výmaz sa odmietne s odkazom na medzinárodný právny záväzok, aj keby osoba už nebola aktívna.

### Historické časové rady

Verejné výsledky a rekordy (`POD-VYSLEDKY-001`) sa **anonymizujú**, nie mažú — inak by sa rozbila kontinuita rebríčkov a štatistík. Meno sa nahradí neutrálnym kódom; výkon v časovom rade ostáva.

### Opakovaná žiadosť

Ak osoba podá žiadosť znova, systém vráti stav predchádzajúcej (`erasure_log`) a doplní len to, čo medzičasom prešlo z „retained" do „erasable" (napr. po uplynutí archivačnej lehoty).

## Test data

`data/scenarios/10-data-erasure-request/`:

```
fixtures.json    ← Person (dobrovoľník/rozhodca) s mixom účelov: mazateľné + zákonne viazané
expected.json    ← výsledok: čo zmazané, čo anonymizované, čo zachované (+ dôvody)
events.json      ← ErasureRequested + ErasureAssessed + PersonalDataErased + PersonalDataAnonymized
```

## Status

- [x] Obsah doplnený
- [ ] Review
- [ ] Schválené

## Referencie

- [`../gdpr/data-subject-rights.md`](../gdpr/data-subject-rights.md) — právo na výmaz a jeho hranice
- [`../gdpr/purpose-catalogue.md`](../gdpr/purpose-catalogue.md) — retencia a právne základy
- [`../architecture/event-sourcing.md`](../architecture/event-sourcing.md) — crypto-shredding
- [`../gdpr/purposes/ZDR-health.md`](../gdpr/purposes/ZDR-health.md) — anti-doping retencia
- [`05` úmrtie a kaskáda](05-death-cascade.md) — iný prípad obmedzenia prístupu k dátam
- [`11` dobrovoľník safeguarding](11-volunteer-safeguarding.md) — tá istá osoba na začiatku dráhy
