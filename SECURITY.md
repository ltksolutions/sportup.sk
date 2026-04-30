# Security Policy

## Hlásenie zraniteľností

Bezpečnosť osobných údajov osôb v športe je jadro tohto projektu. Ak nájdete zraniteľnosť, prosíme:

### Čo robiť

- **Pošlite e-mail na `sportup@ltk.solutions`** s detailmi
- V predmete uveďte `[SECURITY]` na začiatku
- Popíšte zraniteľnosť, dôsledky a (ak možno) reprodukciu
- Ak chcete, môžete e-mail zašifrovať PGP kľúčom (kľúč bude pridaný v ďalšej verzii tohto dokumentu)

### Čo NErobiť

- **Neotvárajte verejné Issue** s detailmi zraniteľnosti
- Nepublikujte detaily na sociálnych sieťach pred fixom
- Nezneužívajte zraniteľnosť na získanie cudzích dát

## Naše záväzky

- **Potvrdíme prijatie** do 48 hodín
- **Predbežnú odpoveď** s odhadom závažnosti dáme do 7 kalendárnych dní
- **Komunikujeme priebeh** opravy a očakávané vydanie fixu
- **Po fixe vás uvedieme** v Acknowledgments (ak si želáte) v release notes

## Disclosure timeline

Praktizujeme **coordinated disclosure**:

1. Hlásenie nahlásené súkromne
2. Preverenie a oprava (typicky 30–90 dní podľa závažnosti)
3. Patch nasadený
4. Verejné zverejnenie zraniteľnosti s atribúciou

Pre zraniteľnosti, ktoré sú aktívne zneužívané, môže byť timeline kratší.

## Rozsah

Vzťahuje sa na:

- Kód v repozitári `ltksolutions/sportup.sk`
- API endpoints (po nasadení produkčnej verzie)
- MCP servery v repe
- Statickú prezentačnú stránku sportup.sk

**Mimo rozsahu:**

- Závislosti tretích strán (hláste priamo ich autorom; my zaktualizujeme po ich fixe)
- Aplikácie tretích strán postavené na SportUp API (sú zodpovednosťou ich autorov)
- Sociálne inžinierstvo a phishing voči autorom projektu

## Bezpečnostné princípy projektu

Detaily v [`docs/operations/security.md`](docs/operations/security.md):

- Zero-trust prístupový model
- Šifrovanie citlivých polí v pokoji (rodné čísla, adresy)
- Audit log každého API volania
- Rate limiting a throttling
- Pravidelné penetračné testy (po nasadení)
