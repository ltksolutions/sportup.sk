# GDPR a Purpose Catalogue

> SportUp.sk je systém, ktorý pracuje s veľkým objemom osobných údajov vrátane osobitných kategórií podľa čl. 9 GDPR. Tento adresár obsahuje GDPR-relevantnú dokumentáciu — najmä **Purpose Catalogue**, ktorý je centrálnym registrom účelov spracovania.

## Štruktúra adresára

```
gdpr/
├── README.md                     ← ste tu
├── purpose-catalogue.md          ← detail Purpose Catalogue
├── purposes/                     ← jednotlivé kategórie účelov
│   ├── REG-identity.md
│   ├── KVL-qualifications.md
│   ├── POD-competitions.md
│   ├── ZDR-health.md             ← čl. 9 GDPR osobitné kategórie
│   ├── FIN-financial.md
│   ├── DIS-disciplinary.md
│   ├── VYS-research.md
│   ├── MKT-marketing.md
│   ├── KOM-commercial-verification.md
│   ├── TUR-tourism.md
│   └── REP-representation.md
├── data-classification.md        ← citlivosť polí
├── consent-flow.md               ← UX flow udelenia/odvolania
├── data-subject-rights.md        ← prístup, výmaz, prenosnosť
├── retention-policies.md         ← lehoty uchovania
└── data-protection-impact-assessment.md  ← DPIA šablóna
```

## Princípy

1. **Granulárny consent** (ADR-0003) — jeden záznam = osoba × konkrétny účel × prijímateľ × verzia
2. **Vrstvený Purpose Catalogue** — univerzálne / kategóriové / špecifické / disciplinárne
3. **Policy engine vynucuje** — každé volanie cez OPA s overením scope, consent a legal basis
4. **Versioning účelov** — sémantický (1.0, 1.1, 2.0); major znamená re-consent
5. **Open data** — katalóg je verejný v JSON/CSV/RDF s licenciou CC-BY

## Legal basis (čl. 6 GDPR)

| Kód | Popis | Typický príklad |
|---|---|---|
| `consent` | Súhlas dotknutej osoby | Marketing, fotografie |
| `contract` | Plnenie zmluvy | Registrácia hráča |
| `legal_obligation` | Právna povinnosť | Anti-doping, daňové hlásenia |
| `vital_interests` | Životné záujmy | Núdzové kontakty |
| `public_task` | Verejná úloha | Registrácia v IS športu |
| `legitimate_interest` | Oprávnený záujem | Verejné výsledky súťaží |

## Osobitné kategórie (čl. 9 GDPR)

Pre niektoré údaje súhlas sám nestačí — potrebný je dodatočný legal basis podľa čl. 9(2):

| Druh údajov | Kde sa vyskytujú |
|---|---|
| Zdravotné údaje | ZDR-* účely (lekárska prehliadka, anti-doping, úrazy) |
| Biometrické údaje | Fotografie tváre pre akreditácie (interpretácia ÚOOÚ) |
| Údaje o trestných činoch | DIS-* účely (najmä disciplinárne konania) |

## Workflow zmeny účelu

Pridanie nového alebo zmena existujúceho účelu:

1. **Návrh** — Issue s `purpose:` prefixom
2. **Pripomienkovanie** — DPO, právny tím, dotknuté zväzy, ÚOOÚ pri univerzálnych
3. **Schválenie** — pridelený kód, verzia 1.0
4. **Aktivácia** — zverejnenie, klienti dostávajú cez API
5. **Deprecate** — staré sa už neudeľujú, existujúce platné do skončenia
6. **Sunset** — po vypršaní všetkých súvisiacich súhlasov

Pri **major verzii** (1.x → 2.0) sa všetkým držiteľom súhlasov zašle žiadosť o re-consent. Po definovanej lehote (typicky 60 dní) sa staré súhlasy automaticky odvolajú.

## Integrácia s policy engine

Purpose Catalogue sa exportuje do **Open Policy Agent** ako rule set. Pri každom volaní:

```rego
allow {
    input.app.is_certified
    input.app.scopes[_] == required_scope
    valid_consent_exists(input.person_id, input.purpose_code, input.app_id)
    purpose_active(input.purpose_code)
    territorial_scope_match(input.app, input.target)
}
```

## Referencie

- ADR-0003 — Granulárny consent
- [`purpose-catalogue.md`](purpose-catalogue.md) — kompletný katalóg
- [`data-subject-rights.md`](data-subject-rights.md) — práva dotknutej osoby
- [`../architecture/policy-engine.md`](../architecture/policy-engine.md) — technická implementácia
