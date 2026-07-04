# Discovery — ukážkové vzory dát

> Konkrétne príklady toho, čo verejné Discovery API vracia. Zámerne písané tak,
> aby dávali zmysel **programátorovi** (presná štruktúra) aj **netechnickému
> človeku** (čitateľný scenár). Všetky dáta sú fiktívne, štruktúra zodpovedá
> doménovému modelu. Žiadne osobné údaje sa v Discovery nevyskytujú.

Vedúci scenár celého portálu: **návštevník prichádza na víkend do Novej Bane a
hľadá, čo môže robiť v okolí.** Ukážky nižšie postupne skladajú odpoveď na túto
otázku — od jedného miesta cez okruh až po hotový víkendový balíček.

---

## 1. Verejné miesto (Venue) — športovisko

Odvodené z entity `Facility`, ale len verejné polia (`is_public_catalog = true`).
Žiadny prevádzkovateľský detail, žiadne PII.

```json
{
  "venue_id": "fac_nova_bana_arena_...",
  "name_sk": "Mestská športová hala Nová Baňa",
  "venue_type": "multifunkcna_hala",
  "sports": ["SK-VLB", "SK-BAS", "SK-FLB"],
  "location": {
    "municipality": "Nová Baňa",
    "district": "Žarnovica",
    "region": "SK-BC",
    "gps": { "lat": 48.4245, "lng": 18.6398 }
  },
  "indoor_outdoor": "indoor",
  "amenities": ["parking", "changing_rooms", "showers", "cafeteria", "wifi"],
  "accessibility": { "wheelchair": true, "parking_disabled": true },
  "public_access": "reservation",
  "tourism_features": {
    "nearby_accommodation": true,
    "public_transport_stop_m": 250,
    "bike_parking": true
  },
  "status": "operational"
}
```

**Pre laika:** „Toto je športová hala v Novej Bani, dá sa v nej hrať volejbal,
basketbal a florbal, má parkovanie a bezbariérový prístup a je 250 m od zastávky."

**Pre vývojára:** verejný podmnožinový view nad `Facility`. `sports` sú kódy z
číselníka 90 športov. `region` je ISO 3166-2:SK. Endpoint by bol
`GET /v1/public/venues/{venue_id}`.

---

## 2. Komerčný subjekt (Venue) — ubytovanie s vybavením

Hotel je `Organization` typu `komercny_subjekt`, ktorý sa v Discovery zobrazuje
ako miesto s vybavením relevantným pre šport a wellness. Práve tu sa **spája
turizmus so športom**.

```json
{
  "venue_id": "org_penzion_zlaty_potok_...",
  "name_sk": "Penzión Zlatý potok",
  "venue_type": "ubytovanie",
  "location": {
    "municipality": "Nová Baňa",
    "region": "SK-BC",
    "gps": { "lat": 48.4180, "lng": 18.6521 }
  },
  "amenities": ["pool_indoor", "tennis_court", "spa", "sauna", "bike_rental", "parking"],
  "sport_amenities": {
    "pool": { "indoor": true, "length_m": 15 },
    "tennis_court": { "surface": "clay", "count": 1 },
    "spa": { "sauna": true, "massage": true },
    "bike_rental": { "ebike": true, "count": 8 }
  },
  "tourism_features": {
    "accommodation": true,
    "capacity_beds": 32,
    "near_trails": true
  },
  "data_form": "public_no_pii"
}
```

**Pre laika:** presne odpoveď na *„hľadám ubytovanie s bazénom, tenisovým kurtom
a SPA"* — a navyše požičiavajú e-biky.

**Pre vývojára:** `amenities` je plochý zoznam pre rýchle filtre; `sport_amenities`
je štruktúrovaný detail pre kartu miesta. Filter by vyzeral:
`GET /v1/public/venues?amenities=pool_indoor,tennis_court,spa&near=Nová Baňa`.

---

## 3. Verejné podujatie (Activity) — lokálny event

Odvodené z `Activity` s `is_public = true`. **Bez zoznamu účastníkov** — len to,
čo turista potrebuje vedieť, aby prišiel.

```json
{
  "event_id": "act_nova_bana_ebike_marathon_...",
  "name_sk": "Pohronský e-bike maratón",
  "sport_code": "SK-CYK",
  "discipline_code": "SK-CYK-MTB",
  "starts_at": "2026-07-11T09:00:00+02:00",
  "location": {
    "venue_id": "fac_nova_bana_arena_...",
    "municipality": "Nová Baňa",
    "region": "SK-BC"
  },
  "is_public": true,
  "tourism_relevance": "regional",
  "audience": "open_to_public",
  "data_form": "public_no_participant_pii"
}
```

**Pre laika:** „V sobotu ráno je v Novej Bani e-bike maratón, môžeš prísť."

**Pre vývojára:** `tourism_relevance` (`none`/`local`/`regional`/`national`/
`international`) je práve to pole, ktoré prepája event s cestovným ruchom.
Endpoint: `GET /v1/public/events?region=SK-BC&from=2026-07-10&to=2026-07-13`.

---

## 3b. Komunitné / kultúrne podujatie — dedinský zápas

Amatérske a lokálne športové podujatie je fakticky aj **kultúrno-spoločenská
udalosť**. Discovery to zobrazí cez atribút `community_dimension` — nie ako
samostatnú doménu, ale ako príznak športového podujatia (viaž sa na `Activity`).

```json
{
  "event_id": "act_terchova_hodovy_zapas_...",
  "name_sk": "Hodový futbalový zápas — Terchová",
  "sport_code": "SK-FTB",
  "organizer": { "type": "obec", "name_sk": "Obec Terchová" },
  "starts_at": "2026-07-12T15:00:00+02:00",
  "location": { "municipality": "Terchová", "region": "SK-ZA" },
  "is_public": true,
  "tourism_relevance": "local",
  "community_dimension": "local_community",
  "community_tags": ["hody", "obecna_slavnost", "rodinne"],
  "data_form": "public_no_participant_pii"
}
```

**Pre laika:** „V nedeľu sú v Terchovej hody a k tomu futbalový zápas — prísť
s rodinou, je to obecná slávnosť, nielen šport.“ To je práve dôvod, prečo turista
príde do regiónu.

**Pre vývojára:** `community_dimension` (`none`/`local_community`/`regional_cultural`/
`heritage`) a `community_tags` sú filtrovateľné — Discovery vie zobraziť „komunitné
podujatia" popri čisto súťažných. Ostatné podujatie ostane športom, len s príznakom.

---

## 3c. Vrstva podujatí — viaceré oficiálne zdroje

Rovnaký verejný kalendár zjednocuje podujatia od rôznych zdrojov. Každý zapisuje
cez svoju certifikovanú aplikáciu; Discovery ich číta ako jednu vrstvu.

```json
// GET /v1/public/events?region=SK-ZA&from=2026-07-10&to=2026-07-13
{
  "events": [
    { "name_sk": "Fortuna liga — MŠK Žilina : Slovan", "organizer": "národný zväz", "is_official": true,  "community_dimension": "none" },
    { "name_sk": "Mestský beh Žilinou",                  "organizer": "mesto",       "is_official": false, "community_dimension": "local_community" },
    { "name_sk": "Hodový zápas — Terchová",              "organizer": "obec",        "is_official": false, "community_dimension": "local_community" },
    { "name_sk": "Seniorský tenisový turnaj",            "organizer": "klub",        "is_official": false, "community_dimension": "local_community" },
    { "name_sk": "Firemná olympiáda (hotel)",            "organizer": "komerčný",    "is_official": false, "community_dimension": "none" }
  ]
}
```

**Pre laika:** jeden kalendár ukazuje všetko — ligu profesionálov aj hodový zápas
aj seniorský turnaj. Turista vidí celý „čo sa deje" regiónu naraz.

**Pre vývojára:** heterogénne zdroje (zväz, mesto, obec, klub, komerčný subjekt),
jedna projekcia. `is_official` a `community_dimension` sú nezávislé osi — podujatie
môže byť neoficiálne a zároveň komunitné, alebo oficiálne a nekomunitné.

---

## 4. Objavovanie do okruhu — „čo je do X km"

Geodotaz nad verejným katalógom. Vstup: bod + polomer + voliteľné filtre.
Výstup: zoznam miest a podujatí zoradený podľa vzdialenosti.

```json
// GET /v1/public/discover?lat=48.4245&lng=18.6398&radius_km=15&type=all
{
  "center": { "municipality": "Nová Baňa", "gps": { "lat": 48.4245, "lng": 18.6398 } },
  "radius_km": 15,
  "results": {
    "venues": [
      { "venue_id": "fac_nova_bana_arena_...", "name_sk": "Mestská športová hala", "distance_km": 0.4, "sports": ["SK-VLB", "SK-BAS"] },
      { "venue_id": "org_penzion_zlaty_potok_...", "name_sk": "Penzión Zlatý potok", "distance_km": 1.2, "amenities": ["pool_indoor", "spa", "bike_rental"] },
      { "venue_id": "fac_tajch_trail_...", "name_sk": "Tajch — okruh pre bicykle", "distance_km": 2.1, "amenities": ["bike_trail"], "difficulty": "medium" }
    ],
    "events": [
      { "event_id": "act_nova_bana_ebike_marathon_...", "name_sk": "Pohronský e-bike maratón", "starts_at": "2026-07-11T09:00:00+02:00", "distance_km": 0.4 }
    ]
  }
}
```

**Pre laika:** *„Do 15 km od Novej Bane máš halu, penzión s bazénom a SPA, okruh
pre bicykle a v sobotu e-bike maratón."*

**Pre vývojára:** jeden geodotaz vráti heterogénny výsledok (miesta aj eventy)
s `distance_km`. Vhodné pre mapu aj pre zoznam. Radius filter je server-side.

---

## 5. Víkendový balíček — kompozitný pohľad (hlavný diferenciátor)

Toto **nie je uložená entita** — je to pohľad počítaný za behu z verejných dát.
Skladá ubytovanie + športovisko/aktivitu + požičovňu + podujatie do jednej
ponuky pre región a čas. Presne to, čo bežná mapa nevie.

```json
// GET /v1/public/packages?region=SK-BC&near=Nová Baňa&interest=ebike&from=2026-07-10&to=2026-07-13
{
  "package_id": "pkg_nova_bana_ebike_weekend",
  "title_sk": "E-bike víkend v Novej Bani",
  "region": "SK-BC",
  "interest": "ebike",
  "components": {
    "stay": {
      "venue_id": "org_penzion_zlaty_potok_...",
      "name_sk": "Penzión Zlatý potok",
      "amenities": ["pool_indoor", "spa", "bike_rental"],
      "note_sk": "ubytovanie s bazénom a SPA, požičiavajú e-biky"
    },
    "activity": {
      "venue_id": "fac_tajch_trail_...",
      "name_sk": "Tajch — okruh pre bicykle",
      "difficulty": "medium",
      "note_sk": "vhodné pre e-bike, okruh 12 km"
    },
    "event": {
      "event_id": "act_nova_bana_ebike_marathon_...",
      "name_sk": "Pohronský e-bike maratón",
      "starts_at": "2026-07-11T09:00:00+02:00",
      "note_sk": "sobota ráno — dá sa prísť aj len fandiť"
    }
  },
  "data_sources": {
    "A_authoritative": ["stay.venue", "activity.venue", "event"],
    "B_context": ["osm_trail_geometry"],
    "C_enrichment": ["accommodation_availability (booking API, cached)"]
  }
}
```

**Pre laika:** *„Chceš e-bike víkend? Tu máš ubytovanie s bazénom a SPA, okruh na
bicykle kúsok od neho a v sobotu maratón. Všetko na jednom mieste."*

**Pre vývojára:** kompozícia z troch verejných zdrojov. `data_sources` ukazuje,
ktorá časť je z autoritatívneho registra (A), ktorá z OSM (B) a ktorá z externého
obohatenia (C) — v súlade s dátovou stratégiou. Balíček nedrží žiadne PII a
neukladá sa ako nová entita; je to čisto derivovaný view.

---

## 6. Filtrovanie podľa vybavenia — vstup vyhľadávania

Takto vyzerá vstup, keď používateľ zaškrtne požadované vybavenie. Server vracia
len verejné miesta, ktoré spĺňajú **všetky** požadované atribúty.

```json
// GET /v1/public/venues?near=Nová Baňa&radius_km=20&amenities=pool_indoor,tennis_court,spa
{
  "query": { "near": "Nová Baňa", "radius_km": 20, "amenities": ["pool_indoor", "tennis_court", "spa"] },
  "match_count": 1,
  "venues": [
    { "venue_id": "org_penzion_zlaty_potok_...", "name_sk": "Penzión Zlatý potok", "distance_km": 1.2,
      "matched_amenities": ["pool_indoor", "tennis_court", "spa"] }
  ]
}
```

**Pre laika:** presne odpoveď na *„ubytovanie s bazénom, tenisovým kurtom a SPA"* —
systém našiel jedno, ktoré má všetky tri.

**Pre vývojára:** AND-sémantika nad `amenities`. `matched_amenities` vracia, ktoré
z požadovaných sa zhodli (užitočné pre zvýraznenie v UI).

---

## 7. Agregátna štatistika — pre samosprávu a výskum (bez PII)

Discovery vie okrem miest vystaviť aj agregáty pre plánovanie infraštruktúry —
stále bez akýchkoľvek osobných údajov. Napája sa na MCP agendu pre štatistiku a
demografiu.

```json
// GET /v1/public/stats/infrastructure?region=SK-BC&district=Žarnovica
{
  "region": "SK-BC",
  "district": "Žarnovica",
  "venue_counts": { "halls": 3, "pools": 2, "outdoor_pitches": 11, "trails": 6 },
  "sports_supported": 14,
  "public_events_last_12m": 42,
  "hobby_activity_index": { "cycling": "high", "running": "medium" },
  "data_form": "aggregate_only_no_pii"
}
```

**Pre laika:** „V okrese Žarnovica sú 3 haly, 2 bazény, 11 vonkajších ihrísk a 6
trás; za rok tu bolo 42 verejných podujatí." — podklad pre mesto, kam investovať.

**Pre vývojára:** čisté agregáty, žiadny `person_id`. `hobby_activity_index`
pochádza z anonymných počtov hobby aktivít (viď scenár 07 v `priklady.html`).

---

## Zhrnutie väzby šport ↔ cestovný ruch

| Ukážka | Šport | Cestovný ruch |
|---|---|---|
| 1 — športovisko | miesto na tréning/súťaž | bod na turistickej mape |
| 2 — ubytovanie | kurt, bazén, požičovňa | nocľah s wellness |
| 3 — podujatie | súťaž/aktivita | dôvod prísť do regiónu |
| 5 — balíček | **spája oboje do jednej ponuky** | **spája oboje do jednej ponuky** |

Rovnaká evidencia slúži obom svetom naraz — to je jadro hodnoty Discovery a celého
riešenia SportUp.

## Referencie

- [`README.md`](README.md) — koncept, funkcionality, GDPR hranica, dátová stratégia
- [`../domain/entities/facility.md`](../domain/entities/facility.md) — `Facility` (zdroj miest)
- [`../domain/entities/activity.md`](../domain/entities/activity.md) — `Activity` (zdroj podujatí)
