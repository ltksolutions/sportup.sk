# Entity: Team

> Družstvo klubu v konkrétnej súťaži a kategórii. Jeden klub má spravidla viac tímov (A-tím, dorast, žiaci).

## Účel

Team eviduje **konkrétne družstvo** organizácie — to, čo Futbalnet zobrazuje ako
`/k/mfk-nova-bana/tim/dospeli-m-a/`. Rozlíšenie klub vs. tím je dôležité, lebo:

- jeden **klub** ([`organization.md`](organization.md)) má viac **tímov**
  (A-mužstvo, U19 dorast, U15 žiaci, ženy…),
- každý tím hrá **inú súťaž** ([`competition.md`](competition.md)) a inú kategóriu,
- **súpiska** je väzba tímu na osoby cez [`affiliation.md`](affiliation.md) —
  a to nielen hráči, ale aj realizačný tím (tréner, asistent, fyzioterapeut,
  vedúci družstva, lekár).

## Prečo samostatná entita, nie pole na klube

Keby bol tím len atribút klubu, nedalo by sa čisto vyjadriť, že „ten istý klub
hrá A-tímom V. ligu a dorastom II. ligu dorastu". Tím je preto samostatná entita
so vzťahom `club_org_id` → klub a `competition_id` → súťaž. Súpiska je množina
afiliácií, čím sa športová vrstva napája na **identitu oddelenú od roly**: osoba
je stabilná, jej pôsobenie v tíme je časovo ohraničená afiliácia.

## Schéma

| Pole | Typ | Popis |
|---|---|---|
| `team_id` | UUID | Primárny kľúč |
| `slug` | String | URL identifikátor v rámci klubu (napr. `dospeli-m-a`) |
| `club_org_id` | UUID FK | Klub ([`organization.md`](organization.md), `org_type` klub) |
| `name` | String | Názov tímu (napr. „A-mužstvo") |
| `sport_code` | String FK | Šport |
| `discipline_code` | String FK \| null | Odvetvie |
| `category_code` | String FK | Veková/výkonnostná kategória (dospelí, U19…) |
| `competition_id` | UUID FK \| null | Súťaž, ktorú tím aktuálne hrá |
| `home_facility_id` | UUID FK \| null | Domáci štadión/hala ([`facility.md`](facility.md)) — GPS pre mapu |
| `roster` | Array | Súpiska — odkazy na afiliácie (pozri nižšie) |
| `status` | Enum | `active` / `withdrawn` / `dissolved` |

## Súpiska (roster)

Súpiska nie je zoznam mien, ale zoznam **afiliácií** — každá viaže osobu na tím
s konkrétnou rolou a časovou platnosťou:

```
roster = [
  { affiliation_id, role_code: "hrac",          number: 9 },
  { affiliation_id, role_code: "hrac",          number: 1, position: "brankar" },
  { affiliation_id, role_code: "trener" },
  { affiliation_id, role_code: "asistent_trenera" },
  { affiliation_id, role_code: "fyzioterapeut" },
  { affiliation_id, role_code: "veduci_druzstva" }
]
```

> Rola je z číselníka rolí a pokrýva **všetky typy osôb v športe**, nie len
> hráčov — tréner, asistent, fyzioterapeut, lekár, vedúci družstva, technický
> vedúci. To je jadro zadania: SportUp eviduje každého, kto je nevyhnutný pre
> fungovanie tímu.

## Príklad — A-tím MFK Nová Baňa

```json
{
  "team_id": "team_mfknb_dospeli_a",
  "slug": "dospeli-m-a",
  "club_org_id": "org_mfk_nova_bana",
  "name": "A-mužstvo",
  "sport_code": "SK-FTB",
  "discipline_code": "SK-FTB-FUTBAL",
  "category_code": "dospeli_muzi",
  "competition_id": "cmp_vliga_ssfz_juh_2025",
  "home_facility_id": "fac_mfknb_stadion",
  "status": "active"
}
```

> `home_facility_id` → Mestský futbalový štadión, Dlhá lúka 711/14, Nová Baňa.
> Práve táto väzba na `Facility` s GPS umožní zobraziť domáce zápasy na mape
> a ponúknuť „Naviguj ma".

## GDPR

Súpiska obsahuje odkazy na osoby — do **verejnej vrstvy** ide len to, čo je
verejné (meno hráča v súťaži, číslo dresu, klub), nikdy kontakty ani rodné číslo.
Pri **maloletých** je verejné zobrazenie ešte prísnejšie (bez priezviska/foto bez
súhlasu zákonného zástupcu). Detaily v [`../../discovery/url-schema.md`](../../discovery/url-schema.md).

## Referencie

- [`competition.md`](competition.md) — súťaž, ktorú tím hrá
- [`match.md`](match.md) — zápasy tímu
- [`organization.md`](organization.md) — klub
- [`affiliation.md`](affiliation.md) — súpiska = afiliácie
- [`facility.md`](facility.md) — domáci štadión (GPS)
