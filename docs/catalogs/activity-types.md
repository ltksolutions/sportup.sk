# Číselník: Druhy športovej činnosti fyzických osôb

> Aké úlohy môže osoba v športovom ekosystéme plniť. Použité v `Affiliation.role_code`.

**31 druhov v 6 kategóriách.** Ucelená taxonómia od základu, vystihuje všetky relevantné role v slovenskom športe.

## YAML zdroj

Master zdroj je v `data/catalogs/activity-types.yaml`:

```yaml
version: "1.0"
valid_from: "2026-09-01"
items:
  - code: amatersky_sportovec
    label_sk: "Amatérsky športovec"
    label_en: "Amateur athlete"
    category: sportovci
    parent: null
    description_sk: "Osoba, ktorá vykonáva šport ako amatér..."
    typical_orgs: [sportovy_klub, narodny_zvaz]
    requires_minimum_age: 0
    status: active
  # ...
```

## Kategória 1: Športovci

| Kód | Druh | Popis |
|---|---|---|
| `profesionalny_sportovec` | Profesionálny športovec | Vykonáva šport ako hlavnú zárobkovú činnosť |
| `amatersky_sportovec` | Amatérsky športovec | Súťaží v rámci registrovaných súťaží zväzu |
| `volnocasovy_sportovec` | Voľnočasový športovec | Rekreačne, mimo formálnej štruktúry; účasť na neoficiálne organizovaných podujatiach |

## Kategória 2: Tréneri a športoví odborníci

| Kód | Druh | Poznámka |
|---|---|---|
| `trener` | Tréner | Všeobecná kategória |
| `kondicny_trener` | Kondičný tréner | |
| `brankarsky_trener` | Brankársky tréner | Kolektívne športy |
| `instruktor` | Inštruktor | Vzdelávacie aktivity |
| `analytik` | Analytik, skaut, videoanalytik | |
| `iny_sportovy_odbornik` | Iný športový odborník | Catch-all |

## Kategória 3: Rozhodcovia a funkcionári

| Kód | Druh | Pôsobnosť |
|---|---|---|
| `sportovy_rozhodca` | Športový rozhodca | Národné a medzinárodné súťaže |
| `delegat_zvazu` | Delegát zväzu | |
| `kontrolor` | Kontrolór | Zväz, štátna správa |
| `funkcionar` | Funkcionár | Klub, zväz, orgány |
| `dopingovy_komisar` | Dopingový komisár | SADA, medzinárodné |
| `sportovy_agent` | Športový agent | Profesionálne prestupy |

## Kategória 4: Zdravotnícky personál

| Kód | Druh | Poznámka |
|---|---|---|
| `sportovy_lekar` | Športový lekár | Čl. 9 GDPR, atestácia |
| `fyzioterapeut` | Fyzioterapeut | Samostatná kvalifikácia |
| `sportovy_maser` | Športový masér | |
| `sportovy_psycholog` | Športový psychológ, mentálny tréner | |
| `vyzivovy_poradca` | Výživový poradca | |
| `zachranar` | Záchranár na podujatí | Bezpečnosť podujatí |

## Kategória 5: Organizácia podujatí a podpora

| Kód | Druh | Poznámka |
|---|---|---|
| `usporiadatel` | Usporiadateľ podujatia | |
| `hlavny_usporiadatel` | Hlavný usporiadateľ | |
| `bezpecnostny_manazer` | Bezpečnostný manažér | |
| `timovy_manazer` | Tímový manažér, vedúci družstva | |
| `kustod` | Kustód, správca výstroja | |
| `dobrovolnik` | Dobrovoľník | |
| `prevadzkovatel_sportoviska` | Prevádzkovateľ športoviska | Napojenie na Facility |

## Kategória 6: Právne a mediálne zastúpenie

| Kód | Druh | Poznámka |
|---|---|---|
| `zakonny_zastupca` | Zákonný zástupca maloletého | Kritické pre maloletých |
| `medialny_zastupca` | Mediálny zástupca, hovorca | Akreditácie, PR |
| `moderator_komentator` | Moderátor, komentátor | TV/stream |
| `podporovatel` | Podporovateľ, registrovaný fanúšik | Vernostné programy |

## Versioning

- v1.0 (2026-09-01) — počiatočná verzia s 31 položkami
- Pri pridaní novej položky → minor (v1.1, v1.2…)
- Pri zmene sémantiky existujúcej → major (v2.0) s migračným plánom

## Aktualizácia

Pridanie novej role:

1. Issue s motiváciou
2. Konzultácia s národnými zväzmi (cez slovak-sport komunita)
3. Pull Request meniaci `data/catalogs/activity-types.yaml`
4. Review (minimálne 2 maintaineri)
5. Merge → release v1.x

## Referencie

- [`../domain/entities/affiliation.md`](../domain/entities/affiliation.md) — vzťah cez `role_code`
- [`../gdpr/purpose-catalogue.md`](../gdpr/purpose-catalogue.md) — REG-* účely sú párované s rolami
