# Verejný portál — URL schéma a verejná vrstva

> Každá športová entita má vlastnú adresu. To umožňuje zdieľanie, navigáciu,
> ďalšie dátové vrstvy na mape a strojovú čitateľnosť — pri striktnej GDPR hranici.

## Prečo „každá entita má adresu"

Inšpirácia: Futbalnet (`sportnet.sme.sk/futbalnet`) dáva zväzu, súťaži, klubu,
tímu aj zápasu vlastnú URL. To má tri efekty, ktoré chceme aj my:

1. **Zdieľateľnosť** — pošleš odkaz na konkrétny zápas či klub.
2. **Ďalšie vrstvy na mape** — keď má zápas adresu a väzbu na miesto s GPS,
   mapa dostane vrstvu „čo sa hrá v okolí" + tlačidlo **„Naviguj ma"**.
3. **Strojová čitateľnosť** — každá stránka má strojový náprotivok cez API/MCP
   (rovnaká entita, verejný rozsah bez PII).

Dôležité: portál je **certifikovaná read-aplikácia** — číta verejnú vrstvu cez
štandardizované API. Nie je to zdroj dát ani štvrtá platforma.

## URL schéma

Ľudské (SEO-friendly) adresy vo verejnom portáli:

```
/portal                         → rozcestník (mapa, súťaže, kluby)
/portal/zvaz/{slug}             → zväz: kontakty, súťaže, správy
/portal/sutaz/{slug}            → súťaž: tabuľka, program, výsledky
/portal/klub/{slug}             → klub: tímy, kontakt, štadión (GPS)
/portal/klub/{slug}/tim/{tim}   → tím: súpiska, výsledky, program
/portal/zapas/{id}              → zápas: detail + „Naviguj ma"
/portal/miesto/{slug}           → športovisko: čo sa tu hrá, dostupnosť
/portal/osoba/{id}              → verejný profil osoby (len verejné dáta)
```

Strojový náprotivok (API — verejný rozsah, bez PII):

```
GET /v1/public/federations/{slug}
GET /v1/public/competitions/{slug}
GET /v1/public/competitions/{slug}/standings
GET /v1/public/clubs/{slug}
GET /v1/public/clubs/{slug}/teams/{team}
GET /v1/public/matches?region=…&from=…&to=…
GET /v1/public/venues/{slug}
```

Slug je stabilný, ľudsky čitateľný identifikátor (napr. `vliga-ssfz-juh`,
`mfk-nova-bana`). Mapovanie slug → entity `_id` je interné.

## „Naviguj ma"

Každý zápas a miesto s GPS ponúkne navigáciu cez `geo:` schému, ktorú mobil
otvorí v predvolenej mapovej aplikácii:

```
geo:48.4245,18.6390?q=Mestský+futbalový+štadión+Nová+Baňa
```

Na desktope sa použije odkaz na webovú mapu (OSM/Google/Apple). Portál nikam
neposiela polohu používateľa — len otvorí cieľ.

## GDPR hranica — čo smie ísť von

Toto je **náš rozdiel oproti Futbalnetu**. Verejná vrstva zobrazuje len to, čo je
verejné, a rešpektuje osobitný režim maloletých.

### Verejné (smie von)

- **Entity bez PII**: zväz, súťaž, klub, tím, zápas, miesto, tabuľka, program,
  výsledky, štatistiky súťaže.
- **Dospelé osoby v súťažnom kontexte** (rovnako ako to robí Futbalnet): meno
  hráča/trénera/rozhodcu v rámci súťaže, číslo dresu, klub, súťažné štatistiky —
  **ak** to zväz cez svoju certifikovanú aplikáciu označí ako verejné.

### Nikdy von

- kontakty (e-mail, telefón), adresy bydliska, rodné číslo, dátum narodenia
  v plnom tvare, zdravotné údaje, občianske doklady;
- interné poznámky, disciplinárne detaily nad rámec verejného výroku;
- zoznamy s PII v mapovej/kalendárovej projekcii (tie sú vždy `public_no_pii`).

### Maloletí — prísnejší režim

Pri kategóriách maloletých (U19, U15, žiaci…) sa verejne **nezobrazuje**
priezvisko v plnom tvare ani fotografia bez súhlasu zákonného zástupcu.
Predvolený stav je minimalizácia; zverejnenie je opt-in cez súhlas
([`../domain/entities/consent.md`](../domain/entities/consent.md)).

### Rozhodnutie o verejnosti je na zdroji

Certifikovaná aplikácia zväzu/klubu určuje, čo je verejné (`is_public`,
rozsah profilu). Portál to len rešpektuje — sám nič „neodkrýva". Policy engine
na strane systému vynúti, že požiadavka na neverejné pole vráti `403`, nie dáta.

## Príklad — verejný profil klubu

```json
// GET /v1/public/clubs/mfk-nova-bana
{
  "slug": "mfk-nova-bana",
  "name": "MFK Nová Baňa",
  "sport": "Futbal",
  "federation": "SsFZ",
  "venue": {
    "name": "Mestský futbalový štadión",
    "address": "Dlhá lúka 711/14, Nová Baňa",
    "lat": 48.4210, "lng": 18.6470
  },
  "contact_public": { "email": "manager@mfknovabana.sk" },
  "teams": [
    { "slug": "dospeli-m-a", "name": "A-mužstvo", "competition": "V. liga SsFZ — Juh" },
    { "slug": "mladez", "name": "Mládež" }
  ],
  "data_form": "public_no_pii"
}
```

> `contact_public` je verejný kontakt klubu (nie osoby) — ten býva verejný na
> webe klubu. Osobné kontakty funkcionárov sa nezverejňujú.

## Referencie

- [`README.md`](README.md) — koncept verejného portálu
- [`../domain/entities/competition.md`](../domain/entities/competition.md)
- [`../domain/entities/team.md`](../domain/entities/team.md)
- [`../domain/entities/match.md`](../domain/entities/match.md)
- [`../domain/entities/organization.md`](../domain/entities/organization.md)
- [`../gdpr`](../gdpr) — GDPR princípy v jadre
