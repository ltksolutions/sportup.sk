# ADR-0003: Granulárny consent model (jeden záznam = osoba × účel × prijímateľ)

- **Status:** Accepted
- **Date:** 2026-04-15
- **Authors:** @janletko
- **Reviewers:** —

## Context

Súhlas dotknutej osoby (Consent) podľa GDPR môže byť modelovaný v rôznych granularitách:

1. **Hrubý (blanket) súhlas** — jeden záznam pokrýva všetky účely jednej organizácie. Najjednoduchšie pre developera, ale nezodpovedá prísnemu výkladu GDPR čl. 7 ods. 2 ("musí byť jasne odlíšiteľný od ostatných záležitostí").

2. **Stredný** — jeden záznam = osoba × kategória účelov × organizácia. Praktický kompromis, ale stále nemusí stačiť pre všetky scenáre.

3. **Granulárny** — jeden záznam = osoba × konkrétny účel × konkrétny prijímateľ. Najprísnejší výklad GDPR, najflexibilnejší pre dotknutú osobu, najviac záznamov.

Slovenská judikatúra a stanoviská ÚOOÚ smerujú k **prísnemu výkladu** — pre každý účel samostatný súhlas. Pre šport, kde existujú desiatky rôznych účelov (registrácia, prestup, marketing, fotky maloletého, biologický pas, anti-doping), to znamená, že hrubý súhlas neobstojí.

## Decision

**Pre Consent v SportUp.sk implementujeme granulárny model:**

> Jeden Consent záznam = jedna kombinácia (osoba, konkrétny účel z Purpose Catalogue, konkrétny prijímateľ, verzia účelu).

Každý záznam je **eventovaný** (pozri ADR-0001). Eventy:

- `ConsentGranted` — udelenie
- `ConsentWithdrawn` — odvolanie (ak je `withdrawal_allowed`)
- `ConsentExpired` — automatické vypršanie podľa lehoty
- `ConsentRenewed` — predlženie alebo re-consent po major verzii účelu

### Schéma

```
consent_id              UUID PK
person_id               UUID FK → Person
purpose_code            String FK → Purpose Catalogue
purpose_version         Integer (verzia účelu v čase udelenia)
legal_basis             Enum (consent | contract | legal_obligation | ...)
granted_to_type         Enum (organization | app | public_sector)
granted_to_id           UUID
granted_at              Timestamp
granted_by              UUID (osoba alebo zákonný zástupca)
withdrawal_allowed      Boolean (kópia z katalógu v čase udelenia)
withdrawn_at            Timestamp NULL
withdrawal_reason       Text NULL
expires_at              Timestamp NULL (ak je TTL)
status                  Enum (active | withdrawn | expired | superseded)
```

### Enforcement

Každé API volanie, ktoré pristupuje k PII, prechádza policy enginom. Engine overuje:

```
1. Aplikácia má scope pre operáciu? → 403 ak nie
2. Existuje aktívny Consent (alebo iný legal basis)
   pre kombináciu (person_id, purpose_code, granted_to)? → 403 ak nie
3. Účel verzie v Consent je kompatibilný s aktuálnou verziou? → 403 ak major rozdiel
4. Consent je v platnom časovom okne? → 403 ak vypršaný
5. Aplikácia operuje v rámci svojej územnej / organizačnej príslušnosti? → 403 ak nie
```

## Consequences

### Pozitívne

- **Plne v súlade s prísnym výkladom GDPR**
- **Audit jasný** — pre každý prístup k PII vieme presne ukázať, na základe ktorého súhlasu sa konal
- **Withdrawal je presný** — odvolanie konkrétneho súhlasu nemení iné súhlasy tej istej osoby
- **Re-consent po major verzii** — keď sa účel materiálne zmení, len ten konkrétny vyžaduje obnovenie
- **Dotknutá osoba má kompletný prehľad** — môže si presne pozrieť, čo všetko súhlasila, kde, na ako dlho

### Negatívne / kompromisy

- **Veľa záznamov** — typický športovec môže mať 10–30 aktívnych Consent záznamov
- **UX náročnejšie** — pri registrácii treba osobe ukázať a vysvetliť všetky relevantné účely
- **Storage** — pri 1M aktívnych osôb a 20 priemerných súhlasov = 20M záznamov + ich eventy. Treba indexovať a archivovať.

### Rizikové

- **Chyba v Purpose Catalogue má dôsledky** — ak je účel zle definovaný, premieta sa to do tisícov consent záznamov. Preto je governance Purpose Catalogue prísna (ADR-0004).

## Alternatívy zvažované

- **Hrubý (blanket) súhlas.** Jeden záznam pre osobu × organizáciu. Riziko právneho napadnutia, neflexibilný pri withdrawal.

- **Stredne granulárny — kategórie účelov.** Napríklad jeden súhlas pre "celá kategória ZDR — zdravie a bezpečnosť". Stále nedostatočne presný — anti-doping a športová psychológia majú výrazne iné dôsledky.

## Implementačné poznámky

- **Bulk consent UI** — pri registrácii ukázať všetky relevantné účely, ale s možnosťou hromadného súhlasu pre nutné účely (napr. registrácia + zákonom predpísané) a oddeleného pre voliteľné (marketing, fotky)
- **Purpose Catalogue API** — frontend aplikácie ho čítajú live, aby vždy zobrazili aktuálnu verziu opisu
- **Withdrawal flow** — dotknutá osoba má v portáli "moje súhlasy" so zoznamom a tlačidlom "odvolať"
- **Cascading withdrawal** — odvolanie hlavného účelu môže spustiť kaskádu odvolaní závislých

## Referencie

- GDPR čl. 6, 7, 9
- Stanoviská ÚOOÚ k granularite súhlasov
- ADR-0001 — Event sourcing
- ADR-0004 — Purpose Catalogue governance
- [`../../gdpr/purpose-catalogue.md`](../../gdpr/purpose-catalogue.md)
