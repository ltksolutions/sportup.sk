# Entity: Facility (športovisko)

> Verejne katalogizované športovisko. Slúži športu aj cestovnému ruchu.

## Účel

Facility eviduje **fyzické miesta na vykonávanie športu** — štadióny, telocvične, ihriská, bazény, lyžiarske areály, multifunkčné centrá. Cieľom je vytvoriť **úplný verejný katalóg športovej infraštruktúry SR** dostupný cez API a webovo.

Dvojitá použiteľnosť (šport + cestovný ruch) je zámerná — v súlade s pôsobnosťou Ministerstva cestovného ruchu a športu SR. Tá istá evidencia slúži:

- **Športovým zväzom** na výber dejiska majstrovstiev
- **Klubom** na rezerváciu tréningov a zápasov
- **Samospráve** na plánovanie investícií
- **Turistom a OOCR** na odporúčanie v destinácii
- **Komerčným subjektom** na ponuky balíčkov

## Schéma

| Pole | Typ | Popis |
|---|---|---|
| `facility_id` | UUID | Primárny kľúč |
| `name` | String | Názov športoviska |
| `facility_type` | String FK | Z číselníka typov športovísk |
| `operator_org_id` | UUID FK | → Organization (prevádzkovateľ) |
| `owner_org_id` | UUID FK \| null | Vlastník (ak je iný než prevádzkovateľ) |
| `address` | Object | Štruktúrovaná adresa |
| `coordinates` | GeoPoint | Lat/lng pre mapy |
| `cadastral_info` | Object | Katastrálne údaje (parcela, KÚ) |
| `region` | Object | Mesto/obec, okres, kraj |
| `sports` | Array<String> | Športy, ktoré sa tu dajú vykonávať |
| `disciplines` | Array<String> | Konkrétne disciplíny |
| `capacity` | Object | `seated`, `standing`, `total` |
| `dimensions` | Object | Rozmery (m), plocha (m²) |
| `surface_type` | String | Tráva, umelá tráva, parkety, tartán, ľad, voda... |
| `indoor_outdoor` | Enum | `indoor` / `outdoor` / `mixed` |
| `lighting` | Boolean | Osvetlenie |
| `heating` | Boolean | Vykurovanie (pre indoor) |
| `accessibility` | Object | Bezbariérovosť, parkovanie, MHD, sociálne zariadenia |
| `equipment` | Array<String> | Dostupné vybavenie |
| `services` | Array<String> | Šatne, sprchy, bufet, parkovanie |
| `certification` | Array | Certifikáty pre súťaže (FIFA, UEFA, FIS...) |
| `opening_hours` | Object | Štandardné otváracie hodiny |
| `pricing` | Object | Cenník (referenčný, môže byť neaktuálny) |
| `photos` | Array<UUID> | Document UUID s fotkami |
| `tourism_features` | Object | Pre cestovný ruch (terasa, výhľad, blízkosť atrakcií) |
| `nearby_services` | Array | Blízke ubytovanie, doprava, stravovanie |
| `rating` | Number | Hodnotenie (od používateľov, po fáze 4) |
| `valid_from` | Date | Otvorené od |
| `valid_to` | Date \| null | Zatvorené od |
| `status` | Enum | `active` / `under_renovation` / `closed_seasonal` / `closed_permanent` |

## Príklad

```json
{
  "facility_id": "f8a3b9d0-...",
  "name": "Národný futbalový štadión",
  "facility_type": "futbalovy_stadion",
  "operator_org_id": "narodny-fut-stadion-uuid",
  "address": {
    "street": "Tehelné pole 4",
    "city": "Bratislava",
    "postal_code": "83103",
    "country": "SK"
  },
  "coordinates": {"lat": 48.16139, "lng": 17.13694},
  "region": {
    "municipality": "Bratislava",
    "district": "Bratislava III",
    "region": "Bratislavský kraj"
  },
  "sports": ["SK-FTB"],
  "disciplines": ["SK-FTB-MEN", "SK-FTB-WOMEN"],
  "capacity": {"seated": 22500, "standing": 0, "total": 22500},
  "surface_type": "natural_grass",
  "indoor_outdoor": "outdoor",
  "lighting": true,
  "heating": false,
  "accessibility": {
    "wheelchair": true,
    "parking_spots": 1200,
    "public_transport": ["bus_X1", "tram_2", "tram_4"]
  },
  "certification": [
    {"body": "UEFA", "category": "Category 4", "valid_until": "2028-12-31"}
  ],
  "tourism_features": {
    "tours_available": true,
    "museum": false,
    "viewing_decks": ["VIP", "Press"]
  },
  "status": "active"
}
```

## Verejný katalóg

Špecifické pole `is_public_catalog = true` znamená, že záznam je dostupný cez verejné API bez autentifikácie:

```
GET /v1/public/facilities?sport=SK-LYZ&region=Žilinský
```

Bez PII, žiadne identifikátory osôb, len opisné informácie.

## Tourism aspekt

Pole `tourism_features` a related metódy umožňujú integráciu s:

- **OOCR portálmi** — odporúčania pre návštevníkov
- **Turistickými kalendármi** — verejné podujatia
- **Booking platformami** — rezervácie ubytovania pri športovisku
- **Mapovým službami** — ikona na mape s detailmi

## Referencie

- [`activity.md`](activity.md) — aktivity konané v Facility
- [`organization.md`](organization.md) — prevádzkovateľ
- [`../../catalogs/facility-types.md`](../../catalogs/facility-types.md) — typy športovísk
- [`../../api/endpoints/facilities.md`](../../api/endpoints/facilities.md) — API
- [`../../scenarios/06-facility-registration.md`](../../scenarios/06-facility-registration.md)
