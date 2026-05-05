<!--
SPDX-FileCopyrightText: 2026 Ján Letko / LTK Solutions
SPDX-License-Identifier: EUPL-1.2
-->

# Implementačný kód SportUp.sk

Tento adresár je **rezervovaný pre samotnú implementáciu** národného informačného systému (Fáza 1+ podľa [ROADMAP](../ROADMAP.md)).

## Plánovaná štruktúra (návrh)

```
src/
├── apps/
│   ├── api/                ← REST API (Next.js / Node.js)
│   ├── admin/              ← administratívne UI
│   ├── identity-broker/    ← integrácia s ÚPVS, RFO, RPO, eID
│   └── mcp-servers/        ← MCP servery pre agentický prístup
└── packages/
    ├── domain/             ← doménové entity, eventy, value objects
    ├── event-store/        ← event sourcing infraštruktúra
    ├── policy-engine/      ← OPA policies a authorization
    ├── catalogs/           ← centrálne číselníky ako kód
    └── shared/             ← shared types, utilities
```

## Licencia

Všetok zdrojový kód v `src/` bude licencovaný pod **[European Union Public Licence v1.2](../LICENSES/EUPL-1.2.txt)**.

Každý nový zdrojový súbor by mal obsahovať SPDX hlavičku, napríklad:

```javascript
// SPDX-FileCopyrightText: 2026 Ján Letko / LTK Solutions
// SPDX-License-Identifier: EUPL-1.2
```

Alternatívne sa licencovanie dá riešiť hromadne v [`REUSE.toml`](../REUSE.toml) v koreni repa pridaním ďalšej `[[annotations]]` sekcie pre `src/**`.

## Stav

**Implementácia ešte nezačala.** Repozitár je momentálne v koncepčnej fáze (v0.1) a obsahuje len architektonickú dokumentáciu. Tento súbor slúži ako rezervovaný kotviaci bod pre budúci kód a zároveň ako referenčné použitie EUPL-1.2 licencie pre [REUSE compliance](https://reuse.software).

Pozri [ROADMAP.md](../ROADMAP.md) pre plán implementácie.
