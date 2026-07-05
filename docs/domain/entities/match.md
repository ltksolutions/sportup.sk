# Entity: Match

> Jednotlivé súťažné stretnutie dvoch družstiev. Má miesto (GPS), čas, výsledok a účastníkov vrátane rozhodcov a delegátov.

## Účel

Match eviduje **jeden konkrétny zápas** — to, čo Futbalnet zobrazuje ako riadok
výsledku (napr. *OFK Hliník nad Hronom — MFK Nová Baňa 2:1*) a čo má vlastnú
adresu `/portal/zapas/{id}`. Je to špecializácia eventu: viaže sa na súťaž
([`competition.md`](competition.md)), dve družstvá ([`team.md`](team.md)) a miesto
([`facility.md`](facility.md)) s GPS.

**Match je most medzi športovou vrstvou a mapou.** Keďže má `facility_id` s GPS
a dátum, na verejnej mape sa z neho stane vrstva „čo sa hrá tento víkend v okolí"
s tlačidlom **„Naviguj ma"**.

## Vzťah k Activity / Event

`Match` je špecializácia všeobecného eventu — dá sa chápať ako `Activity` typu
`match` s dvomi tímami a výsledkom. Účasť osôb (rozhodca, delegát, hráč) sa
eviduje cez [`event-participation.md`](event-participation.md), rovnako ako pri
iných podujatiach. Tým sa nezavádza nová logika účasti, len sa využíva existujúca.

## Schéma

| Pole | Typ | Popis |
|---|---|---|
| `match_id` | UUID | Primárny kľúč |
| `competition_id` | UUID FK | Súťaž |
| `round` | Integer \| null | Kolo |
| `sport_code` | String FK | Šport (pre mapu/filtre) |
| `home_team_id` | UUID FK | Domáce družstvo |
| `away_team_id` | UUID FK | Hosťujúce družstvo |
| `facility_id` | UUID FK | Miesto konania ([`facility.md`](facility.md)) — GPS |
| `starts_at` | Timestamp | Dátum a čas výkopu |
| `status` | Enum | `scheduled` / `live` / `finished` / `postponed` / `cancelled` |
| `score` | Object \| null | `{ home, away }` po ukončení |
| `officials` | Array | Rozhodcovia, delegáti (cez event-participation) |
| `is_public` | Boolean | Verejne zobraziteľný |
| `data_provenance` | Enum | `native` / `imported` |

## Účastníci — nielen hráči

Zápas je ukážkou, že šport nie je len o hráčoch. Do `officials` a súpisiek
zápasu vstupujú cez [`event-participation.md`](event-participation.md):

- **rozhodcovia** (hlavný, asistenti),
- **delegát** zväzu,
- **hráči** oboch tímov (zo súpisiek),
- **realizačné tímy** (tréner, lekár, fyzioterapeut),
- niekedy **technický delegát**, **časomerač**, **zapisovateľ**.

To presne napĺňa zadanie: SportUp eviduje **všetky osoby nevyhnutné pre priebeh
podujatia**, nielen športovcov.

## Príklad — reálny zápas MFK Nová Baňa

```json
{
  "match_id": "mch_hliknik_mfknb_r22",
  "competition_id": "cmp_vliga_ssfz_juh_2025",
  "round": 22,
  "sport_code": "SK-FTB",
  "home_team_id": "team_ofk_hlinik",
  "away_team_id": "team_mfknb_dospeli_a",
  "facility_id": "fac_hlinik_ihrisko",
  "starts_at": "2026-05-16T17:00:00+02:00",
  "status": "finished",
  "score": { "home": 2, "away": 1 },
  "is_public": true,
  "data_provenance": "imported"
}
```

## Verejná mapová projekcia (Discovery)

Pre verejnú mapu sa zo zápasu odvodí **odľahčená projekcia bez PII**:

```json
// GET /v1/public/matches?region=SK-BC&from=2026-05-15&to=2026-05-17
{
  "match_id": "mch_...",
  "sport": "Futbal",
  "competition_name": "V. liga SsFZ — Juh",
  "home": "OFK Hliník nad Hronom",
  "away": "MFK Nová Baňa",
  "starts_at": "2026-05-16T17:00:00+02:00",
  "venue": { "name": "Ihrisko Hliník nad Hronom", "lat": 48.44, "lng": 18.60 },
  "score": { "home": 2, "away": 1 },
  "navigate_url": "geo:48.44,18.60?q=Ihrisko+Hliník+nad+Hronom",
  "detail_url": "/portal/zapas/mch_hliknik_mfknb_r22",
  "data_form": "public_no_pii"
}
```

**Von idú tímy, súťaž, miesto, čas, výsledok — nikdy zoznamy hráčov s PII.**
`navigate_url` (`geo:` schéma) otvorí navigáciu v mobile; `detail_url` vedie na
verejný detail zápasu.

## GDPR

- Verejná projekcia zápasu **neobsahuje osobné údaje** účastníkov.
- Detail zápasu na portáli môže zobraziť **verejné** mená hráčov v súťaži
  (rovnako ako Futbalnet), ale nie kontakty; pri **maloletých** kategóriách
  platí prísnejší režim (pozri [`../../discovery/url-schema.md`](../../discovery/url-schema.md)).
- Rozhodcovia a delegáti sú osoby s rolou — ich zaradenie je interné, verejne sa
  zobrazuje len v rozsahu, ktorý zväz označí ako verejný.

## Referencie

- [`competition.md`](competition.md) — súťaž
- [`team.md`](team.md) — družstvá
- [`facility.md`](facility.md) — miesto (GPS pre „Naviguj ma")
- [`event-participation.md`](event-participation.md) — rozhodcovia, delegáti, hráči
- [`../../discovery/url-schema.md`](../../discovery/url-schema.md) — verejná vrstva a URL
- [`../../discovery/README.md`](../../discovery/README.md) — mapa a vrstva zápasov
