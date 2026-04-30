# Ako prispieť do SportUp.sk

Vďaka, že máte záujem prispieť do projektu. Tento dokument popisuje, ako spolupracujeme.

## Tabuľka obsahu

1. [Druhy prispievania](#druhy-prispievania)
2. [Pred prvým commitom](#pred-prvým-commitom)
3. [Workflow](#workflow)
4. [Konvencie commitov](#konvencie-commitov)
5. [Conventional Commits](#conventional-commits)
6. [Branch model](#branch-model)
7. [Pull Request proces](#pull-request-proces)
8. [Štýl dokumentácie](#štýl-dokumentácie)
9. [Štýl kódu](#štýl-kódu)
10. [Architektonické rozhodnutia](#architektonické-rozhodnutia)
11. [Bezpečnosť](#bezpečnosť)

## Druhy prispievania

V tejto fáze projektu je najdôležitejší príspevok do **dokumentácie a dátového modelu**. Konkrétne:

- **Pripomienky k doménovému modelu** — chýbajúce entity, atribúty, edge cases
- **Doplnenie číselníkov** — najmä športovo-špecifické katalógy, regionálne dáta, vekové kategórie zväzov
- **Návrhy účelov spracovania** — pre konkrétne športy alebo subjekty, ktoré sme nevyhodnotili
- **Validácia právnych základov** — od právnikov, DPO a osôb znalých ÚOOÚ judikatúry
- **Recenzia integračných scenárov** — najmä napojenie na RFO/RPO/ÚPVS
- **API návrhy** — definícia konkrétnych endpointov, schém, error response
- **MCP servery** — návrh tools a ich semantík
- **Príklady ukážkových dát** — pre nové scenáre, ktoré v `docs/scenarios/` chýbajú

V neskorších fázach pribudne kód (Next.js aplikácia, MongoDB schémy, OPA policy, MCP server implementácie).

## Pred prvým commitom

1. **Prečítajte si [docs/00-overview.md](docs/00-overview.md)** — princípy a hlavné rozhodnutia
2. **Prečítajte si [docs/01-glossary.md](docs/01-glossary.md)** — používame ucelený slovník pojmov
3. **Skontrolujte [Issues](https://github.com/ltksolutions/sportup.sk/issues)** — možno už niekto pracuje na tom istom

## Workflow

```
1. Otvorte Issue, ak ide o väčšiu zmenu — diskusia o smere
2. Forknite repo (alebo si vyžiadajte prístup, ak ste z tímu)
3. Vytvorte branch z `main` s vhodným menom
4. Urobte commity s popisnými správami
5. Otvorte Pull Request voči `main`
6. Reagujte na review komentáre
7. Po schválení merge cez "Squash and merge"
```

## Conventional Commits

Používame [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[body]

[footer]
```

**Typy:**
- `docs` — zmena v dokumentácii
- `model` — zmena doménového modelu, schémy entity alebo eventu
- `catalog` — zmena číselníka
- `purpose` — zmena Purpose Catalogue (GDPR účely)
- `api` — zmena API špecifikácie
- `mcp` — zmena MCP servera alebo tools
- `feat` — nová funkcionalita (kód)
- `fix` — oprava bugu (kód)
- `refactor` — refaktoring kódu bez zmeny správania
- `chore` — údržba, build, CI

**Príklady:**

```
docs(architecture): doplniť stratégiu disaster recovery

model(person): pridať pole national_id_hash pre deduplikáciu

catalog(activity-types): pridať volnocasovy_sportovec

purpose(tur): nový účel TUR-SLUZBA-001 pre cestovné kancelárie

api(affiliations): definovať POST /v1/affiliations endpoint
```

## Branch model

- **`main`** — stabilná verzia, vždy nasaditeľná. Priame commity sú zakázané, len cez PR.
- **`feat/<short-name>`** — feature branche pre nové funkcionality
- **`fix/<short-name>`** — bugfixy
- **`docs/<short-name>`** — väčšie zmeny dokumentácie
- **`exp/<short-name>`** — experimentálne návrhy, ktoré nemusia merge

Branch by mal žiť čo najkratšie. Ak sa práca naťahuje, pravidelne mergujte `main` do feature branche, aby ste predišli veľkým konfliktom.

## Pull Request proces

PR by mal:

- Mať popisný titulok podľa Conventional Commits
- V tele odkazovať na súvisiace Issue (`Fixes #42`, `Refs #58`)
- Vysvetliť **prečo**, nie len **čo** sa mení
- Mať checklist relevantných úloh (viď [šablónu PR](.github/pull_request_template.md))
- Prejsť cez review aspoň jedného maintainera

Maintaineri budú reagovať do **5 pracovných dní**. Ak sa tak nestane, pingnite v komentári.

## Štýl dokumentácie

- **Jazyk:** primárny je slovenčina. Anglické verzie sú vítané v paralelných súboroch s príponou `.en.md`.
- **Formát:** Markdown podľa [GitHub Flavored Markdown](https://github.github.com/gfm/)
- **Riadky:** zalomujte na ~100 znakov pre čitateľnosť v editore aj na GitHube
- **Diakritika:** áno, používame plnú slovenskú diakritiku
- **Identifikátory v texte:** používajte `code style` (napr. `affiliation_id`)
- **Krížové odkazy:** relatívne cesty (`[Glossary](../01-glossary.md)`)
- **Diagramy:** preferujeme [Mermaid](https://mermaid.js.org/) — renderuje sa priamo v GitHube
- **Schémy entít:** v sekciách s tabuľkami `Pole | Typ | Popis`

## Štýl kódu

> Aktuálne sa kód ešte nepíše. Tieto pravidlá platia, keď začneme implementáciu.

- **TypeScript** pre celý backend a frontend
- **Prettier** + **ESLint** s konfiguráciou v repe
- **Strict mode** zapnutý vo všetkých `tsconfig.json`
- **Žiadne `any`** bez explicitného komentára prečo
- **Funkčný štýl** prefe nad imperatívnym, kde to dáva zmysel
- **Testy** povinné pre každú novú feature (`*.test.ts` vedľa zdrojáku)

Kompletný štýlový sprievodca bude v `docs/operations/code-style.md`, keď začneme kódovanie.

## Architektonické rozhodnutia

Väčšie zmeny v architektúre alebo doménovom modeli si vyžadujú **ADR (Architecture Decision Record)**. Šablóna je v [`docs/architecture/decisions/0000-template.md`](docs/architecture/decisions/0000-template.md).

ADR má:
- **Číslo a názov** — `0001-event-sourcing-for-affiliations.md`
- **Status** — Proposed, Accepted, Deprecated, Superseded
- **Context** — prečo riešime
- **Decision** — čo sme rozhodli
- **Consequences** — čo to spôsobí, kompromisy

Existujúce ADR sú v `docs/architecture/decisions/`.

## Bezpečnosť

Ak nájdete bezpečnostnú zraniteľnosť alebo problém ovplyvňujúci ochranu osobných údajov:

- **NEOTVÁRAJTE Issue.** Verejné Issue dáva útočníkom čas zneužiť problém pred opravou.
- **Pošlite e-mail na `sportup@ltk.solutions`** s popisom a možnými dôsledkami.
- **Nevyžadujte odpoveď za hodinu** — ak ide o critical, dostanete reakciu do 48 hodín.

Pozri tiež [SECURITY.md](SECURITY.md).

## Otázky

Ak niečo z tohto dokumentu nie je jasné, otvorte Issue s tagom `question` alebo napíšte na sportup@ltk.solutions.
