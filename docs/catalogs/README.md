# Centrálne číselníky

Tento adresár obsahuje verzionované číselníky používané naprieč celým systémom.

## Princípy

1. **Žiadne magické stringy v kóde.** Aplikácie referenčne odkazujú na položky cez kódy (`"SK-FTB"`, `"trener"`).
2. **Versioning sémantický** — minor verzie sú spätne kompatibilné, major verzie vyžadujú migráciu.
3. **Hierarchia** — kde má zmysel: šport → disciplína → kategória.
4. **Medzinárodné mapovanie** — voliteľné `international_code` (IOC, IFs, FIDE…).
5. **Spätná kompatibilita** — zrušená položka sa nemaže, dostane `status: deprecated` a `valid_to`.

## Správa cez git

Číselníky sú uložené ako YAML súbory v adresári `data/catalogs/` (mimo dokumentácie). Zmeny prechádzajú cez Pull Request s povinným review.

```
data/
└── catalogs/
    ├── activity-types.yaml
    ├── organization-types.yaml
    ├── sports.yaml
    ├── disciplines.yaml
    ├── categories.yaml
    ├── qualifications.yaml
    ├── facility-types.yaml
    ├── legal-forms.yaml
    ├── legal-titles.yaml
    └── territorial.yaml
```

Z YAML sa pri release generuje:

- MongoDB collection (master)
- JSON pre API (verejne publikované otvorené dáta)
- CSV pre downloady
- TypeScript typy (`.d.ts`) pre vývoj klientov
- RDF / SKOS pre semantic web

## Číselníky

| Číselník | Popis | Dokument |
|---|---|---|
| Druhy športovej činnosti | 31 druhov v 6 kategóriách | [`activity-types.md`](activity-types.md) |
| Druhy organizácií | ~35 typov v 5 kategóriách | [`organization-types.md`](organization-types.md) |
| Športy | 90+ uznaných + neuznané | [`sports.md`](sports.md) |
| Disciplíny / odvetvia | Pod-úroveň športu | [`disciplines.md`](disciplines.md) |
| Vekové a výkonnostné kategórie | Spravujú zväzy | [`categories.md`](categories.md) |
| Kvalifikácie a licencie | Trénerské, rozhodcovské, zdravotnícke | [`qualifications.md`](qualifications.md) |
| Typy športovísk | Štadión, telocvičňa, ihrisko, bazén... | [`facility-types.md`](facility-types.md) |
| Právne formy | RPO mapovanie | [`legal-forms.md`](legal-forms.md) |
| Právne tituly | Zmluva, dobrovoľník, podnikanie... | [`legal-titles.md`](legal-titles.md) |
| Územné číselníky | Obce, okresy, kraje, NUTS | [`territorial.md`](territorial.md) |

## Governance

| Číselník | Správca | Schvaľuje |
|---|---|---|
| Športy (uznané) | MCRŠ SR | Minister (zákon o športe) |
| Disciplíny | Národný zväz | Prevádzkovateľ SportUp |
| Kategórie | Národný zväz | Prevádzkovateľ |
| Druhy činnosti | Prevádzkovateľ SportUp | Konzultácia s národnými zväzmi a ÚOOÚ |
| Druhy organizácií | Prevádzkovateľ SportUp | Konzultácia s MCRŠ a ÚPVS |
| Kvalifikácie | Národný zväz (špecifické), Prevádzkovateľ (univerzálne) | — |
| Typy športovísk | Prevádzkovateľ + cestovný ruch | MCRŠ |

## Zmena položky — workflow

1. Otvoriť Issue s návrhom (`catalog:` prefix)
2. Diskusia, prípadne stretnutie s príslušným zväzom
3. Pull Request s YAML zmenou + záznamom do `CHANGELOG.md` číselníka
4. Review minimálne 2 maintaineri + dotknutý zväz
5. Merge → automatický release nového minor / major verzia
6. Aplikácie dostávajú nové verzie cez API endpoint `/v1/catalogs/{name}?version=latest`
