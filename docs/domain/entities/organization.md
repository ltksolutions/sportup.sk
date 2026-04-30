# Entity: Organization

> Subjekt zapojený do športového ekosystému — zväz, klub, mesto, škola, štátny orgán, komerčný subjekt.

## Účel

Organization eviduje **právnické osoby a iné subjekty** zapojené do športu a cestovného ruchu. Každá Affiliation osoby smeruje k nejakej organizácii.

## Master register

**RPO (Register právnických osôb)** je master pre identitu právnických osôb v SR. SportUp si drží cache (názov, IČO, sídlo, štatutári) a aktualizuje cez CSRÚ notifikácie.

**Výnimky** — tieto subjekty nemusia byť v RPO:
- Ad-hoc organizačné výbory podujatí
- Neformálne dobrovoľnícke zoskupenia
- Niektoré medzinárodné federácie

Pre tie sa udržiava lokálny záznam s `rpo_identifier = null`.

## Schéma

| Pole | Typ | Popis |
|---|---|---|
| `organization_id` | UUID | Primárny kľúč |
| `org_type` | String FK | Z číselníka typov organizácií |
| `legal_form_code` | String FK | Z číselníka právnych foriem |
| `ico` | String \| null | IČO (voči RPO) |
| `rpo_identifier` | String \| null | Identifikátor v RPO |
| `legal_name` | String | Plný právny názov |
| `display_name` | String | Skrátený názov pre UI |
| `parent_org_id` | UUID FK \| null | Nadradená organizácia (pre hierarchiu) |
| `address` | Object | Sídlo |
| `contact` | Object | E-mail, telefón, web |
| `statutory_persons` | Array | Štatutári (z RPO) |
| `valid_from` | Date | Vznik |
| `valid_to` | Date \| null | Zánik |
| `status` | Enum | `active` / `dissolved` / `merged` / `inactive` |
| `accreditations` | Array | Akreditácie v športoch (cez ORG_SPORT_ACCREDITATION) |

## Hierarchia

Organizácie môžu byť hierarchicky usporiadané cez `parent_org_id`:

```
SFZ (national_federation)
├── ZsFZ (regional_federation)
│   ├── ObFZ Bratislava
│   │   ├── ŠK Slovan Bratislava (sportovy_klub)
│   │   ├── FC Petržalka
│   │   └── ...
│   └── ObFZ Trnava
└── ...
```

## Akreditácie v športoch

Polyvalentný klub môže byť akreditovaný vo viacerých športoch. Modelované ako samostatná entita `ORG_SPORT_ACCREDITATION`:

```
org_sport_accreditation
  org_id, sport_code, discipline_code,
  accredited_by_org_id (kto udelil),
  valid_from, valid_to, status
```

## Príklad

```json
{
  "organization_id": "7c3a9f1e-...",
  "org_type": "sportovy_klub",
  "legal_form_code": "751",
  "ico": "12345678",
  "rpo_identifier": "RPO-12345678",
  "legal_name": "Športový klub Slovan Bratislava, o.z.",
  "display_name": "ŠK Slovan Bratislava",
  "parent_org_id": "obfz-ba-uuid",
  "address": {
    "street": "Tehelné pole 4",
    "city": "Bratislava",
    "postal_code": "83103",
    "country": "SK"
  },
  "valid_from": "1919-04-03",
  "status": "active"
}
```

## Referencie

- [`../../catalogs/organization-types.md`](../../catalogs/organization-types.md) — typy organizácií
- [`../../catalogs/legal-forms.md`](../../catalogs/legal-forms.md) — právne formy
- [`../../integration/state-registers.md`](../../integration/state-registers.md) — RPO integrácia
