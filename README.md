# SportUp.sk

> **Otvorené riešenie pre slovenský šport a podporu cestovného ruchu**
>
> Jednotný národný register osôb, organizácií a aktivít s verejným registrom športovísk a vzdelávacími a rozvojovými službami postavený na otvorenej architektúre s otvorenými zdrojovými kódmi.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: Concept](https://img.shields.io/badge/Status-Concept_v0.1-orange.svg)]()
[![Slovak](https://img.shields.io/badge/Lang-Slovak-blue.svg)]()

---

## O projekte

SportUp.sk je koncepčný návrh nového informačného systému športu pre Slovenskú republiku. Cieľom je nahradiť existujúce čiastkové registre jednotným dátovým ekosystémom, ktorý:

- **eviduje všetky osoby v športe** — športovcov (profesionálov, amatérov, voľnočasových), trénerov, rozhodcov, delegátov, lekárov, dobrovoľníkov, organizátorov a ďalších
- **eviduje všetky organizácie** zapojené do športu — zväzy, kluby, mestá a obce, VÚC, školy, akadémie, štátne orgány, komerčné subjekty
- **eviduje šport a aktivity v dvoch osách** — uznané/neuznané, olympijské/neolympijské, organizované/neorganizované
- **udržiava verejný register športovísk** — slúži športu aj cestovnému ruchu (v súlade s pôsobnosťou MCRŠ SR)
- **poskytuje API a MCP rozhrania** — integráciu pre zväzové, klubové, samosprávne a komerčné aplikácie
- **prepája sa na štátne registre** — RFO, RPO cez ÚPVS

## Repozitár obsahuje

```
.
├── README.md                  ← ste tu
├── CONTRIBUTING.md            ← ako prispieť
├── CODE_OF_CONDUCT.md         ← pravidlá komunity
├── SECURITY.md                ← bezpečnostná politika
├── CHANGELOG.md               ← história zmien
├── ROADMAP.md                 ← plán implementácie
├── LICENSE                    ← MIT (zdrojové kódy)
├── LICENSE-DOCS               ← CC-BY-4.0 (dokumentácia)
├── vercel.json                ← konfigurácia Vercel deploymentu
├── docs/                      ← kompletná dokumentácia
│   ├── 00-overview.md         ← prehľad systému
│   ├── 01-glossary.md         ← slovník pojmov
│   ├── architecture/          ← architektonické rozhodnutia
│   ├── domain/                ← doménový model, entity, eventy
│   ├── catalogs/              ← centrálne číselníky
│   ├── api/                   ← REST API špecifikácia
│   ├── mcp/                   ← MCP servery a tools
│   ├── gdpr/                  ← Purpose Catalogue a právne základy
│   ├── scenarios/             ← reálne príklady použitia
│   ├── integration/           ← napojenie na RFO, RPO, ÚPVS
│   └── operations/            ← prevádzka, monitoring, security
└── website/                   ← statická prezentačná stránka (sportup.sk)
    ├── index.html, *.html     ← jednotlivé stránky
    ├── styles.css, script.js  ← štýly a skripty
    ├── brand/                 ← logá, design manuál (PDF)
    └── favicon/               ← ikony
```

## Začnite tu

| Som… | Začnem v… |
|---|---|
| **Nový prispievateľ** | [`docs/00-overview.md`](docs/00-overview.md) → [`docs/01-glossary.md`](docs/01-glossary.md) |
| **Architekt / tech lead** | [`docs/architecture/README.md`](docs/architecture/README.md) |
| **Backend vývojár** | [`docs/domain/README.md`](docs/domain/README.md) → [`docs/api/README.md`](docs/api/README.md) |
| **API klient (zväz, klub)** | [`docs/api/README.md`](docs/api/README.md) → [`docs/scenarios/`](docs/scenarios/) |
| **MCP integrácia** | [`docs/mcp/README.md`](docs/mcp/README.md) |
| **Compliance / DPO** | [`docs/gdpr/README.md`](docs/gdpr/README.md) |
| **Pre štátnu správu** | [`docs/integration/state-registers.md`](docs/integration/state-registers.md) |

## Princípy projektu

1. **API-first a headless** — register sám nie je aplikácia, je to infraštruktúra
2. **Identita oddelená od role** — jeden človek = jeden záznam, viacero súbežných rolí
3. **Event-sourced jadro** — každá zmena je nemenná udalosť, history je úplná a auditovateľná
4. **Referenčné dáta zo štátu** — RFO/RPO sú master pre identitu, šport. register pre športové dáta
5. **GDPR v jadre** — Purpose Catalogue, consent management a policy engine sú prvotriedne entity
6. **Zero-trust prístup** — každé volanie je autentifikované, autorizované a auditované

## Stav

**Verzia 0.1 — koncepčný návrh.** Aktuálne v repozitári je úplná dokumentácia architektúry, doménového modelu, číselníkov, GDPR Purpose Catalogue a integračných scenárov. Implementácia samotného systému ešte nebola začatá — repo slúži ako východiskový bod pre tím, ktorý ju zrealizuje.

Stack pre samotnú implementáciu (návrh): **Next.js + Node.js + MongoDB**, policy engine **OPA**, cache **Redis**, eventy **MongoDB change streams** alebo **Kafka**.

## Licencia

- **Zdrojové kódy** — [MIT License](LICENSE)
- **Dokumentácia, číselníky, schémy** — [CC-BY-4.0](LICENSE-DOCS)

## Autor a kontakt

**Autor návrhu:** Ján Letko
**E-mail:** sportup@ltk.solutions
**Web:** [sportup.sk](https://sportup.sk) (koncepčná prezentácia)
**Repo:** [github.com/ltksolutions/sportup.sk](https://github.com/ltksolutions/sportup.sk)

Komunikácia s autorom prebieha v **slovenčine**. Issues a PR môžu byť písané po slovensky aj po anglicky.

## Ako prispieť

Pozrite si [CONTRIBUTING.md](CONTRIBUTING.md). V skratke:

1. **Návrhy a otázky** → otvorte [Issue](https://github.com/ltksolutions/sportup.sk/issues)
2. **Konkrétne zmeny** → otvorte [Pull Request](https://github.com/ltksolutions/sportup.sk/pulls) z feature branche
3. **Bezpečnostné incidenty** → e-mail na sportup@ltk.solutions, nie cez verejné Issues
