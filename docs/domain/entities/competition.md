# Entity: Competition

> Dlhodobá organizovaná súťaž — liga, pohár, majstrovstvá. Zastrešuje kolá, tabuľku a účastnícke tímy naprieč ročníkom.

## Účel

Competition eviduje **súťaž s vlastným životným cyklom** — ročník, kolá,
tabuľku, účastníkov. Je to športovo-neutrálna entita: futbalová liga, hokejová
extraliga, basketbalová súťaž, tenisový turnaj aj atletický míting sú
`Competition`, líšia sa len `sport_code` / `discipline_code` a formátom.

Vzťah k [`activity.md`](activity.md): `Activity` je všeobecná (hobby, tréning,
jednorazové podujatie). `Competition` je **špecializácia pre organizovaný
súťažný šport** — to, čo Futbalnet zobrazuje ako „súťaž" (`/s/vliga/`). Jednotlivé
stretnutia v rámci súťaže sú [`match.md`](match.md).

## Prečo samostatná entita

Súťaž má vlastnosti, ktoré `Activity` nemá a mať nemá:

- **ročník / sezóna** (`2025/2026`) a viac ročníkov tej istej súťaže v čase,
- **kolá** (`round`) a rozpis (žreb),
- **tabuľka** — priebežné poradie, ktoré sa počíta zo zápasov,
- **množina účastníckych tímov** ([`team.md`](team.md)), nie osôb priamo,
- **hierarchia súťaží** (I. liga → II. liga → … → V. liga, skupiny).

## Master a zdroj dát

Súťaž riadi **národný zväz alebo jeho podzväz** ([`organization.md`](organization.md)
s `org_type` typu federácia). Zapisuje ju cez svoju **certifikovanú aplikáciu** —
SportUp je zdroj pravdy (cieľový stav A). Dočasne (stav B) sa môže súťaž
importovať z externého zdroja (napr. dáta zväzu), kým zväz nezačne zapisovať
priamo; import je označený `data_provenance: imported`.

## Schéma

| Pole | Typ | Popis |
|---|---|---|
| `competition_id` | UUID | Primárny kľúč |
| `slug` | String | URL identifikátor (napr. `vliga-ssfz-juh`) — pozri [`../../discovery/url-schema.md`](../../discovery/url-schema.md) |
| `name` | String | Názov súťaže |
| `season` | String | Ročník, napr. `2025/2026` |
| `sport_code` | String FK | Šport (z číselníka 90 športov) |
| `discipline_code` | String FK \| null | Odvetvie (napr. Futbal / Futsal / Plážový futbal) |
| `category_codes` | Array<String> | Vekové/výkonnostné kategórie (dospelí, U19, U15…) |
| `organizer_org_id` | UUID FK | Zväz/podzväz, ktorý súťaž riadi |
| `parent_competition_id` | UUID FK \| null | Nadradená súťaž (skupina v rámci ligy) |
| `format` | Enum | `league` / `cup` / `tournament` / `championship` / `series` |
| `level` | Integer \| null | Úroveň v pyramíde (1 = najvyššia) |
| `team_ids` | Array<UUID FK> | Účastnícke tímy ([`team.md`](team.md)) |
| `starts_on` | Date | Začiatok ročníka |
| `ends_on` | Date \| null | Koniec ročníka |
| `is_public` | Boolean | Verejne zobraziteľná |
| `data_provenance` | Enum | `native` (zapísané k nám) / `imported` (dočasný import) |
| `status` | Enum | `scheduled` / `in_progress` / `finished` / `cancelled` |

## Tabuľka (standings)

Tabuľka **nie je uložený stav, ale projekcia** — počíta sa zo zápasov
([`match.md`](match.md)) so stavom `finished` cez `competition_id`. To drží
konzistenciu (jeden zdroj pravdy = výsledky zápasov) a je to prirodzené pre
event-sourced prístup: každý ukončený zápas je udalosť, tabuľka je jej odvodenina.

## Príklad — reálna súťaž MFK Nová Baňa

```json
{
  "competition_id": "cmp_vliga_ssfz_juh_2025",
  "slug": "vliga-ssfz-juh",
  "name": "V. liga SsFZ — skupina Juh",
  "season": "2025/2026",
  "sport_code": "SK-FTB",
  "discipline_code": "SK-FTB-FUTBAL",
  "category_codes": ["dospeli_muzi"],
  "organizer_org_id": "org_ssfz",
  "format": "league",
  "level": 5,
  "starts_on": "2025-08-01",
  "ends_on": "2026-06-15",
  "is_public": true,
  "data_provenance": "imported",
  "status": "in_progress"
}
```

> Poznámka: `organizer_org_id` → Stredoslovenský futbalový zväz (SsFZ), podzväz
> SFZ. Vo Futbalnete zodpovedá adrese `/z/ssfz/s/vliga/`.

## GDPR

Súťaž sama neobsahuje osobné údaje. Väzba na osoby (hráči, rozhodcovia,
delegáti) vzniká až cez [`team.md`](team.md) → súpisky a [`match.md`](match.md)
→ [`event-participation.md`](event-participation.md), a do verejnej vrstvy ide
len to, čo je verejné (pozri [`../../discovery/url-schema.md`](../../discovery/url-schema.md)).

## Referencie

- [`team.md`](team.md) — účastnícke družstvá
- [`match.md`](match.md) — jednotlivé stretnutia
- [`activity.md`](activity.md) — všeobecná aktivita (nadmnožina)
- [`organization.md`](organization.md) — zväz ako organizátor
- [`../../discovery/url-schema.md`](../../discovery/url-schema.md) — URL a verejná vrstva
