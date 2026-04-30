# Scenáre použitia

> Konkrétne príklady, ako systém reaguje v reálnych situáciách. Slúžia ako **integračné testy v naratívnej forme** a ako **referencia pre implementáciu**.

## Index scenárov

| # | Scenár | Pokrýva |
|---|---|---|
| 01 | [Mládežnícka registrácia](01-youth-registration.md) | Person, Affiliation, Consent zákonného zástupcu, RFO match |
| 02 | [Prestup hráča (saga)](02-player-transfer.md) | Affiliation lifecycle, saga pattern, correlation_id |
| 03 | [Multi-role osoba](03-multi-role-person.md) | Hráč + tréner + dobrovoľník v jednej Person |
| 04 | [Komerčné overenie pre hotel](04-commercial-verification.md) | KOM-OVERENIE-001, áno/nie response, žiadne PII |
| 05 | [Úmrtie a kaskáda](05-death-cascade.md) | CSRÚ notifikácia, automatické termináty afiliácií |
| 06 | [Registrácia nového športoviska](06-facility-registration.md) | Facility entity, dvojitá použiteľnosť šport+turizmus |
| 07 | [Voľnočasová aktivita (hobby)](07-hobby-activity.md) | Activity bez personálnej evidencie, agregátne dáta |
| 08 | [Akadémia nahrávajúca dáta](08-academy-bulk-import.md) | Bulk import, idempotency, validation |
| 09 | [Dáta pre cestovný ruch (TIC)](09-tourism-integration.md) | TUR-* purposes, OOCR, verejný katalóg |
| 10 | [Žiadosť o výmaz dát](10-data-erasure-request.md) | GDPR čl. 17, čo sa zmaže, čo zostáva |

## Princípy formátu

Každý scenár obsahuje:

1. **Východisko** — situácia v reálnom svete
2. **Aktéri** — osoby a organizácie
3. **Cieľ** — čo chceme dosiahnuť
4. **Kroky** — sekvencia API volaní s príkladmi
5. **Eventy** — aké eventy vzniknú v event store
6. **Side effects** — projekcie, webhooks, notifikácie
7. **Edge cases** — čo môže pokaziť
8. **Test data** — JSON pre fixture v testoch

## Ako prispieť novým scenárom

Otvor PR, ktorý:

1. Pridá nový dokument `scenarios/NN-nazov.md` (NN = poradové číslo)
2. Aktualizuje tento README — pridá riadok do tabuľky
3. Definuje fixture v `data/scenarios/NN-nazov/` ako JSON

Užitočné scenáre, ktoré ešte chýbajú a privítame:

- Renominácia trénera (zmena role bez prestupu)
- Disciplinárne konanie a suspension
- Anti-doping pozitívny test a kaskáda
- Reprezentácia (REP-* purposes)
- Akreditácia médií na podujatie
- Migrácia osoby z ISŠ do SportUp
