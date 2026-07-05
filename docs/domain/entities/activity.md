# Entity: Activity

> Konkrétna športová aktivita alebo súťaž. Prepojuje šport, organizátora, miesto a účastníkov.

## Účel

Activity eviduje **konkrétnu športovú aktivitu** — od oficiálnej súťaže riadenej zväzom cez školský turnaj až po hobby zápas v parku. Pomáha rozdeliť tri osi:

- **Organizovanosť**: oficiálne organizované / neoficiálne organizované / hobby
- **Šport / disciplína**: ku ktorému športu patrí
- **Časopriestor**: kedy a kde

## Tri kategórie aktivít

### Oficiálne organizované

Riadi národný zväz alebo jeho podzväz. Príklad: liga, pohár, majstrovstvá Slovenska.

```json
{
  "activity_id": "...",
  "activity_type": "oficialne_organizovana_sutaz",
  "is_organized": true,
  "is_official": true,
  "organizer_org_id": "sfz-uuid",
  "sport_code": "SK-FTB",
  "discipline_code": "SK-FTB-MEN"
}
```

### Neoficiálne organizované

Riadi iný subjekt — škola, klub, mesto, obec, VÚC, ministerstvo školstva, centrum voľného času. Príklad: školská liga, mestský turnaj, firemná olympiáda.

```json
{
  "activity_id": "...",
  "activity_type": "neoficialne_organizovana_sutaz",
  "is_organized": true,
  "is_official": false,
  "organizer_org_id": "mesto-presov-uuid",
  "sport_code": "SK-FTB"
}
```

### Hobby (neorganizované)

Voľnočasová aktivita bez organizátora. **Eviduje sa len agregátne, nie personálne.** Je to spôsob, ako zachytiť aktivitu v komunite bez toho, aby sme registrovali konkrétne osoby.

```json
{
  "activity_id": "...",
  "activity_type": "hobby",
  "is_organized": false,
  "is_official": false,
  "organizer_org_id": null,
  "sport_code": "SK-FTB",
  "estimated_participants": 12,
  "location_facility_id": "park-..."
}
```

### Tábory a kempy (organizovaná vzdelávacia/rekreačná aktivita)

**Tábor ani kemp nie je súťaž — je to organizovaná vzdelávacia a rekreačná
aktivita** s trénermi, inštruktormi a účastníkmi (deťmi alebo dospelými). Príklad:
Letný futbalový kemp MFK Nová Baňa, Junior Golf Camp Tri Duby, prímestský
tenisový tábor. Modelujeme ho ako `Activity` typu `camp` — nie ako `Competition`
(tábor sa nesúťaží) ani ako `Match`.

Charakteristika, prečo je to samostatný typ aktivity:

- **prihlasovateľný** — verejne ponúkaný, rodič/účastník sa prihlasuje (na rozdiel
  od zápasu, na ktorý sa neprihlasuje),
- **cieľová skupina** — deti, mládež, dospelí, seniori (`target_audience`),
- **realizačný tím** — tréneri, inštruktori, zdravotný dozor, vedúci tábora; opäť
  **nielen športovci**, ale všetky osoby nevyhnutné pre chod tábora,
- **safeguarding** — pri táboroch pre **maloletých** je povinný bezpečnostný režim:
  certifikovaní tréneri (safeguarding certifikát), súhlas zákonného zástupcu,
  zdravotný dozor. To sa viaže na scenár 11 (Safeguarding) a na `Qualification`.

| Pole (nad rámec základnej schémy) | Typ | Popis |
|---|---|---|
| `activity_type` | Enum | `camp` |
| `target_audience` | Enum | `children` / `youth` / `adults` / `seniors` / `mixed` |
| `involves_minors` | Boolean | Či sa zúčastňujú maloletí (→ safeguarding povinný) |
| `registration_url` | String \| null | Kam sa prihlásiť (web organizátora) |
| `price_from` | Number \| null | Orientačná cena (pre verejný katalóg) |

```json
{
  "activity_id": "act_mfknb_letny_kemp_2026",
  "activity_type": "camp",
  "name": "Letný futbalový kemp — MFK Nová Baňa",
  "is_organized": true,
  "is_official": false,
  "organizer_org_id": "org_mfk_nova_bana",
  "sport_code": "SK-FTB",
  "discipline_code": "SK-FTB-FUTBAL",
  "target_audience": "children",
  "involves_minors": true,
  "category_codes": ["deti_7_14"],
  "start_at": "2026-07-14T08:00:00+02:00",
  "end_at": "2026-07-18T16:00:00+02:00",
  "location_facility_id": "fac_mfknb_stadion",
  "is_public": true,
  "tourism_relevance": "regional",
  "registration_url": "https://mfknovabana.sk/",
  "price_from": 89
}
```

> **Safeguarding pri deťoch:** keďže `involves_minors: true`, policy engine vyžaduje,
> aby tréneri tábora mali platný safeguarding certifikát a aby existoval súhlas
> zákonného zástupcu. Bez toho sa afiliácie realizačného tímu k táboru neaktivujú
> (rovnaký mechanizmus ako scenár 11). Do **verejnej vrstvy** idú len miesto, termín,
> cieľová skupina a odkaz na prihlásenie — nikdy zoznam prihlásených detí.

## Schéma

| Pole | Typ | Popis |
|---|---|---|
| `activity_id` | UUID | Primárny kľúč |
| `activity_type` | Enum | `oficialne_organizovana_sutaz` / `neoficialne_organizovana_sutaz` / `camp` (tábor/kemp) / `tréning` / `vystúpenie` / `hobby` / iné |
| `is_organized` | Boolean | Má identifikovateľného organizátora |
| `is_official` | Boolean | Riadi ho národný zväz alebo jeho podzväz |
| `name` | String | Názov aktivity |
| `organizer_org_id` | UUID FK \| null | Organizátor (null pre hobby) |
| `sport_code` | String FK | |
| `discipline_code` | String FK \| null | |
| `category_codes` | Array<String> | Vekové/výkonnostné kategórie |
| `start_at` | Timestamp | Začiatok |
| `end_at` | Timestamp | Koniec |
| `location_facility_id` | UUID FK \| null | Miesto konania |
| `location_text` | String \| null | Voľný popis miesta |
| `is_public` | Boolean | Verejne prístupné podujatie |
| `tourism_relevance` | Enum | `none` / `local` / `regional` / `national` / `international` (pre cestovný ruch) |

## Komunitný / kultúrny rozmer podujatia

**Amatérske a lokálne športové podujatie je fakticky aj kultúrno-spoločenská udalosť.** Dedinský futbalový zápas, seniorský tenisový turnaj alebo mestský beh nie sú len súťaž — sú to komunitné podujatia, na ktoré sa chodí aj „len tak". Z pohľadu občana a turistu (Discovery vrstva) je hranica medzi „športovým" a „kultúrnym" eventom rozmazaná a práve to je hodnota: otázka *„čo sa deje tento víkend v okolí"* má zmysel odpovedať naprieč oboma.

Toto **nezavádzame ako samostatnú doménu** (SportUp ostáva systémom o športe, nie o divadlách a koncertoch), ale ako **atribút** podujatia — príznak, že dané športové podujatie má aj komunitno-kultúrny charakter. Dedinský zápas ho má, liga profesionálov spravidla nie.

| Pole | Typ | Popis |
|---|---|---|
| `community_dimension` | Enum | `none` / `local_community` / `regional_cultural` / `heritage` — miera komunitno-kultúrneho charakteru |
| `community_tags` | Array<String> | napr. `hody`, `obecna_slavnost`, `seniori`, `rodinne`, `charita`, `tradicia` |

```json
{
  "activity_id": "...",
  "activity_type": "neoficialne_organizovana_sutaz",
  "name": "Hodový futbalový zápas — Terchová",
  "is_organized": true,
  "is_official": false,
  "organizer_org_id": "obec-terchova-uuid",
  "sport_code": "SK-FTB",
  "is_public": true,
  "tourism_relevance": "local",
  "community_dimension": "local_community",
  "community_tags": ["hody", "obecna_slavnost", "rodinne"]
}
```

**Prečo atribút a nie doména:** drží fokus systému na šport, no Discovery vrstva z toho ťaží okamžite — vie zobraziť „komunitné/kultúrne podujatia v okolí" bez toho, aby systém musel spravovať nešportovú kultúru. Ak by neskôr prišlo zadanie prepojiť sa s reálnym kultúrnym systémom (napr. rezortný kalendár kultúry), spraví sa to cez integráciu/federáciu, nie duplikáciou dát.

## Vrstva podujatí — viaceré oficiálne zdroje

Podujatia do systému zapisujú **rôzne oficiálne zdroje**, každý cez svoju certifikovanú aplikáciu. `Activity` je preto vrstva, ktorá zjednocuje podujatia naprieč celým športovým ekosystémom:

| Zdroj | Typický druh podujatia | `is_official` |
|---|---|---|
| **Národný zväz** (a podzväzy) | liga, pohár, majstrovstvá SR | `true` |
| **Klub** | prípravný zápas, klubový turnaj, nábor | `false` |
| **Mesto / obec** | mestský beh, hodový turnaj, MDD športom | `false` |
| **VÚC** | krajské hry, župná olympiáda | `false` |
| **Škola / CVČ** | školská liga, športový deň | `false` |
| **Komerčný subjekt** (hotel, penzión, areál) | firemná olympiáda, komerčný pretek, e-bike maratón | `false` |

Bez ohľadu na zdroj sa každé **verejné** podujatie (`is_public = true`) objaví vo verejnom kalendári Discovery vrstvy — bez osobných údajov účastníkov. Účasť konkrétnych osôb (rozhodca, delegát, dobrovoľník, lekár, technický vedúci, hráč) sa eviduje cez [`event-participation.md`](event-participation.md), nikdy nie vo verejnej vrstve.


## Referencie

- [`facility.md`](facility.md) — miesto konania
- [`event-participation.md`](event-participation.md) — účasť osôb
- [`../../catalogs/activity-types.md`](../../catalogs/activity-types.md) — typy aktivít
