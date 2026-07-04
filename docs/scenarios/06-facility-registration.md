# Scenár 06 — Registrácia nového športoviska

## Východisko

Mesto **Žilina** dokončilo výstavbu novej multifunkčnej športovej haly a zapisuje ju do centrálneho katalógu športovísk. Jeden zápis súčasne vytvára hodnotu pre **šport** (rezervačný systém, súťaže, ligy) aj pre **cestovný ruch** (verejná mapa, ubytovanie v okolí) — v súlade s pôsobnosťou Ministerstva cestovného ruchu a športu SR.

Scenár ukazuje, že oficiálnym zdrojom dát nie je len zväz či klub, ale aj **samospráva (mesto)**, a že tá istá dátová položka slúži dvom rôznym konzumentom s dvoma rôznymi právnymi základmi.

## Aktéri

- **Mesto Žilina** (Organization — typ `mesto`, RPO previazané, `organization_id: mesto-za-uuid`) — vlastník
- **Mestská športová hala Žilina, p.o.** (Organization — mestská príspevková organizácia, `organization_id: msh-za-uuid`) — prevádzkovateľ
- **Facility** — nové športovisko (`facility_id: fac-za-vlcince-uuid`)
- **Aplikácia Mesto-Žilina-portal** (certifikovaná aplikácia samosprávy)
- **Konzumenti dát** (certifikované aplikácie): SBA/SHF/SZH (zväzy pre ligy), rezervačné systémy, turistické platformy (visitslovakia.com, GoŽilina), OOCR

## Cieľ

1. Zaregistrovať vlastníka a prevádzkovateľa (obe už existujú v RPO).
2. Zaregistrovať Facility s plnými atribútmi (šport + turizmus).
3. Po aktivácii sprístupniť dáta cez otvorené API viacerým konzumentom.
4. Ukázať dvojakú použiteľnosť: šport aj cestovný ruch.

## Kroky

### Krok 1: Overenie vlastníka a prevádzkovateľa

Obe organizácie sú právnické osoby — Identity Broker ich matchuje voči RPO (register právnických osôb) cez ÚPVS. Ak už v systéme sú, vráti sa existujúce `organization_id`.

```http
POST /v1/organizations/match-or-create HTTP/1.1
Authorization: Bearer <token Mesto-Žilina-portal>
Content-Type: application/json

{
  "ico": "00321796",
  "legal_name": "Mesto Žilina",
  "organization_type": "mesto"
}
```

```json
{
  "organization_id": "mesto-za-uuid",
  "matched": true,
  "verification_status": "verified_by_rpo"
}
```

### Krok 2: Registrácia športoviska

```http
POST /v1/facilities HTTP/1.1
Authorization: Bearer <token Mesto-Žilina-portal>
Content-Type: application/json
Idempotency-Key: fac-za-vlcince-2026-04-15

{
  "name_sk": "Mestská športová hala Žilina-Vlčince",
  "facility_type": "ruznopouzitelna_hala",
  "supported_sports": ["SK-VLB", "SK-BAS", "SK-HDB", "SK-FLB"],
  "owner_organization_id": "mesto-za-uuid",
  "operator_organization_id": "msh-za-uuid",
  "address": {
    "street": "Obežná 16",
    "municipality_code": "SK-ZA-514301",
    "region_code": "SK-ZA",
    "postal_code": "01008",
    "gps": { "lat": 49.2175, "lng": 18.7492 }
  },
  "capacity_spectators": 1800,
  "surfaces": [
    { "type": "sport_parquet", "indoor": true, "dimensions_m": "44 × 25" }
  ],
  "accessibility": {
    "wheelchair": true,
    "hearing_loop": true,
    "parking_disabled": true
  },
  "public_access": "reservation",
  "certifications": ["STN-EN-14904", "hygienicky_posudok_2026"],
  "amenities": ["parking", "changing_rooms", "showers", "cafeteria", "medical", "wifi"],
  "tourism": {
    "nearby_accommodation": true,
    "public_transport_stop_m": 120,
    "parking_spaces": 95,
    "ev_charging": true,
    "bike_parking": true
  },
  "valid_from": "2026-04-15"
}
```

### Response 201 Created

```json
{
  "facility_id": "fac-za-vlcince-uuid",
  "status": "operational",
  "public_data_url": "https://data.sportup.sk/facilities/fac-za-vlcince-uuid"
}
```

```
Event: FacilityRegistered
  aggregate: Facility
  aggregate_id: fac-za-vlcince-uuid
  data: { ...facility payload... }

Event: FacilityActivated
  aggregate: Facility
  aggregate_id: fac-za-vlcince-uuid
  data: { status: "operational", public: true }
```

### Krok 3: Dvojaká konzumácia dát cez otvorené API

Len čo je stav `operational`, tá istá evidencia slúži dvom svetom:

```http
GET /v1/facilities/fac-za-vlcince-uuid HTTP/1.1
Accept: application/json
```

**Konzument A — šport** (zväz priraďuje halu k ligovému zápasu):

```jsonc
// MCP tool call — facilities-mcp (zväzová aplikácia)
{
  "tool": "find_facilities_for_competition",
  "arguments": { "sport_code": "SK-BAS", "region_code": "SK-ZA", "min_capacity": 1000 }
}
```

**Konzument B — cestovný ruch** (turistická platforma zobrazí halu na verejnej mape):

```http
GET /v1/public/facilities?region=SK-ZA&has_tourism=true HTTP/1.1
Accept: application/json
```

Rovnaká `Facility`, dva rôzne účely (`TUR-KATALOG-001` pre verejnosť, `POD-SPORTOVISKO-001` pre súťaže).

## Side effects

### Projekcie

| Projekcia | Zmena |
|---|---|
| `facility_catalog` | Nový záznam, `status: operational` |
| `public_facility_map` | Hala pridaná na verejnú mapu (otvorené dáta) |
| `facility_by_sport` (×4) | Hala indexovaná pre VLB, BAS, HDB, FLB |
| `tourism_facilities` | Hala pridaná do turistickej vrstvy (dostupnosť, mobilita) |

### Webhooks

Zväzy s registrovaným webhookom na `FacilityRegistered` (SBA, SHF, SZH) dostanú notifikáciu o novom dejisku vo svojom regióne.

### Následné okamžité použitie

- Verejná mapa SportUp + otvorené API — hala viditeľná okamžite.
- Turistické platformy (visitslovakia.com, GoŽilina) ju môžu zobraziť.
- Rezervačné systémy môžu ponúkať termíny.
- Zväzy môžu halu priraďovať k ligovým zápasom.
- Obec má podklad pre výročné hlásenie o športovej infraštruktúre.
- Magistrát môže vypisovať verejné obstarávanie na údržbu s presným popisom objektu.

## Edge cases

### Šport s viacerými odvetviami

`supported_sports` obsahuje kódy športov. Ak hala podporuje šport s viacerými odvetviami (napr. Futbal → Futbal, Futsal, Plážový futbal), pri konkrétnej súťaži sa dostupnosť overuje aj podľa `discipline_code` — halová plocha vhodná pre futsal nemusí byť vhodná pre plážový futbal.

### Vlastník ≠ prevádzkovateľ

Bežný prípad (mesto vlastní, príspevková organizácia prevádzkuje). Obe sú samostatné `organization_id`. Ak sa prevádzkovateľ zmení (nový nájomca), vydá sa `FacilityOperatorChanged` — vlastník ostáva.

### Dočasne uzavreté športovisko

Pri rekonštrukcii sa vydá `FacilitySuspended` (`status: suspended`). Zmizne z rezervačných systémov a súťažného priraďovania, ale ostane na verejnej mape s poznámkou „dočasne uzavreté".

### Neúplné turistické dáta

`tourism` blok je voliteľný. Ak ho samospráva nevyplní, hala je plne funkčná pre šport, len sa nezobrazí v turistickej vrstve s mobilitou/dostupnosťou.

## Test data

`data/scenarios/06-facility-registration/`:

```
fixtures.json    ← mesto + príspevková organizácia (RPO), prázdny facility catalog
expected.json    ← facility_catalog + public_facility_map + tourism_facilities po aktivácii
events.json      ← FacilityRegistered + FacilityActivated
```

## Status

- [x] Obsah doplnený
- [ ] Review
- [ ] Schválené

## Referencie

- [`../domain/entities/facility.md`](../domain/entities/facility.md) — dvojaká použiteľnosť
- [`../catalogs/facility-types.md`](../catalogs/facility-types.md)
- [`../gdpr/purposes/TUR-tourism.md`](../gdpr/purposes/TUR-tourism.md)
- [`../integration/state-registers.md`](../integration/state-registers.md) — RPO cez ÚPVS
- [`09` turizmus TIC](09-tourism-integration.md) — nadväzujúca turistická integrácia
