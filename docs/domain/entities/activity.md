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

## Schéma

| Pole | Typ | Popis |
|---|---|---|
| `activity_id` | UUID | Primárny kľúč |
| `activity_type` | Enum | `oficialne_organizovana_sutaz` / `neoficialne_organizovana_sutaz` / `tréning` / `vystúpenie` / `hobby` / iné |
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

## Vzťah k Affiliation a EventParticipation

- **Aktivity oficiálne organizované** → účastníci majú aktívnu Affiliation v príslušnom športe
- **Aktivity neoficiálne organizované** → účastníci sú evidovaní ako EventParticipation, môžu mať len rolu `volnocasovy_sportovec`
- **Hobby aktivity** → bez personálnej evidencie, len agregátne počty

## Referencie

- [`facility.md`](facility.md) — miesto konania
- [`event-participation.md`](event-participation.md) — účasť osôb
- [`../../catalogs/activity-types.md`](../../catalogs/activity-types.md) — typy aktivít
