# Discovery — verejný portál s mapovým podkladom

> Verejná objavovacia vrstva nad centrálnym registrom. Spája šport a cestovný ruch
> cez infraštruktúru a lokálne podujatia. **Nie je zdroj dát — je certifikovaný konzument.**

## Čo Discovery je (a čo nie je)

Discovery je **prezentačná a objavovacia vrstva**, ktorá číta verejnú,
anonymizovanú podmnožinu centrálnych dát a zobrazuje ju občanom, turistom a
organizátorom na mape a vo vyhľadávaní. Odpovedá na otázky typu:

- *„Prídem do Novej Bane na víkend — čo je v okolí, aké mám možnosti?"*
- *„Kam na víkend, chcem bicyklovať na e-biku?"*
- *„Hľadám ubytovanie s bazénom, tenisovým kurtom a SPA."*
- *„Aké športové podujatie sa deje tento víkend v regióne?"*

Kľúčová myšlienka: **cestovný ruch a šport sú úzko prepojené — práve cez
infraštruktúru a lokálne športové eventy.** Discovery túto väzbu zviditeľňuje.

Čím Discovery **nie je**:

- **Nie je ďalší register.** Nevlastní žiadne dáta, nič nezapisuje do jadra.
- **Nie je štvrtá platforma.** Je to referenčná read-aplikácia nad tromi
  existujúcimi platformami (SportUp, Activity, ClubUp).
- **Nevidí osobné údaje.** Pracuje len s miestami, podujatiami a agregátmi.

## Prečo je Discovery dôležitý pre celý projekt

Discovery je **living proof** architektúry SportUp. Dokazuje, že princípy
„API-first, identita oddelená od roly, čítanie len cez certifikované aplikácie,
GDPR v jadre" nie sú len dokumentácia — produkujú konkrétnu verejnú hodnotu,
ktorú vidí aj netechnický človek. Je to zároveň najlepší marketingový nástroj
projektu: mapa, ktorú si každý vie otvoriť a pochopiť za 10 sekúnd.

## Postavené na existujúcich entitách

Discovery **nezavádza nové doménové entity** — agreguje existujúce:

| Zdrojová entita | Súbor | Čo Discovery z nej berie |
|---|---|---|
| `Facility` (športovisko) | [`../domain/entities/facility.md`](../domain/entities/facility.md) | poloha, typ, vybavenie (`amenities`), `tourism_features`, `is_public_catalog` |
| `Activity` (aktivita/podujatie) | [`../domain/entities/activity.md`](../domain/entities/activity.md) | verejné podujatia, `tourism_relevance`, čas a miesto |
| `Organization` (subjekt) | [`../domain/entities/organization.md`](../domain/entities/organization.md) | prevádzkovateľ, komerčné subjekty (hotely, penzióny) |

Discovery pridáva len **odvodené, kompozitné pohľady** nad nimi (napr. „balíček",
„čo je do X km") — počítané za behu z verejného API, neukladané ako nové PII.

## Cieľové skupiny

| Skupina | Čo hľadá | Príklad |
|---|---|---|
| **Turista / návštevník** | čo robiť v destinácii, ubytovanie s vybavením | víkend v Novej Bani |
| **Občan / rezident** | najbližšie športovisko, kam s deťmi, lokálne podujatia | bazén v okolí |
| **Aktívny športovec** | trasy, terén, požičovne, náročnosť | e-bike okruh, trail |
| **Organizátor podujatia** | dostupné miesta, kapacita, dostupnosť | dejisko turnaja |
| **Komerčný subjekt** | napojenie ponuky na lokalitu a eventy | hotel pri hale |
| **Samospráva / VÚC** | prehľad infraštruktúry v území | podklad pre investície |

## Kľúčové funkcionality

1. **Mapa okolia** — body záujmu (športoviská, ubytovanie, trasy, podujatia) na
   interaktívnej mape, filtrovateľné podľa typu a vybavenia.
2. **Vyhľadávanie podľa vybavenia** — „ubytovanie s bazénom + kurt + SPA",
   „hala pre volejbal do 20 km".
3. **Objavovanie do okruhu** — *„čo je do 15 km od tejto obce"* — geodotaz nad
   verejným katalógom.
4. **Víkendový balíček** — kompozitný pohľad: ubytovanie + športovisko + požičovňa
   + podujatie v jednom regióne a čase. **Toto je hlavný diferenciátor** oproti
   bežnej mape — spája šport a turizmus do jednej ponuky.
5. **Kalendár lokálnych podujatí** — verejné športové eventy s väzbou na miesto,
   bez osobných údajov účastníkov.
6. **Filtre pre aktivity** — typ športu (90 športov + odvetvia), náročnosť,
   indoor/outdoor, bezbariérovosť, sezónnosť.
7. **Vrstva podujatí z viacerých zdrojov** — jeden verejný kalendár zjednocuje
   podujatia od zväzov, klubov, miest, obcí, VÚC aj komerčných subjektov. Každý
   zapisuje cez svoju certifikovanú aplikáciu; Discovery ich číta ako jednu vrstvu.
8. **Komunitné / kultúrne podujatia** — amatérsky a lokálny šport je fakticky aj
   kultúrno-spoločenská udalosť (dedinský zápas, seniorský turnaj, mestský beh).
   Discovery to zobrazuje cez atribút `community_dimension` — nie ako samostatnú
   doménu, ale ako príznak športového podujatia. Drží fokus na šport a zároveň
   odpovedá na otázku *„čo sa deje tento víkend v okolí"* naprieč športom aj komunitou.

## Tok dát (data flow)

```
  OFICIÁLNE ZDROJE                CENTRÁLNY REGISTER            DISCOVERY (read-only)
  ─────────────────               ──────────────────           ─────────────────────
  zväzy, kluby,      ──zápis──▶   Facility · Activity  ──API──▶  verejná mapa
  mestá, obce, VÚC,   (cez cert.  Organization                    vyhľadávanie
  komerčné subjekty   aplikácie)  (event-sourced jadro)           balíčky, kalendár
                                        │
                                        │  Discovery API vystaví len:
                                        ▼
                                  • miesta (is_public_catalog = true)
                                  • verejné podujatia (is_public = true)
                                  • agregátne štatistiky (bez PII)
```

**Pravidlo:** Discovery číta výhradne cez verejné/certifikované API. Nikdy sa
nedostane k `Person`, `Affiliation`, súhlasom ani k žiadnym osobným údajom.

## GDPR hranica — čo ide von a čo nikdy

| Ide von (verejné) | Nikdy nejde von |
|---|---|
| Poloha a typ športoviska | Mená, kontakty, rodné čísla osôb |
| Vybavenie a služby miesta | `person_id`, afiliácie, role |
| Verejné podujatie (názov, čas, miesto) | Zoznam účastníkov podujatia |
| Agregátne počty (napr. „34 bežcov") | Súhlasy, zdravotné údaje |
| Prevádzkovateľ (právnická osoba, z RPO) | Súkromné rezervácie, platby |

Turistický a verejný scope **nikdy nedáva prístup k osobám** — ak by aplikácia
požiadala o `/v1/persons/...`, policy engine vráti `403`. Táto hranica je
vynútená serverom, nie dôverou v aplikáciu (viď scenár 09 v [`priklady.html`](../../website/priklady.html)).

## Dátová stratégia — tri vrstvy

Discovery kombinuje tri zdroje geodát s jasnou prioritou:

| Vrstva | Zdroj | Rola | Príklad |
|---|---|---|---|
| **A — autoritatívna** | naše dáta (register) | *pravda* o mieste | športoviská, kluby, komerčné subjekty, podujatia |
| **B — kontextová** | OpenStreetMap (ODbL) | doplnkový kontext | cyklotrasy, terén, chodníky, POI |
| **C — obohacujúca** | externé API (booking, cyklo) | on-demand, cachované | dostupnosť ubytovania, aktuálne ceny |

**Kanonická identita miesta je vždy v našom systéme.** Externé zdroje sa len
„pripájajú" cez mapovanie ID — tým sa predchádza duplicitám a závislosti na
cudzích dátach. Vrstva A nikdy nie je nahraditeľná vrstvou C.

## Mapový podklad

Odporúčaný stack: **MapLibre GL + OpenStreetMap dlaždice** (prípadne self-hosted
alebo managed tile server). Dôvody: open-source (súlad s licenčnou politikou
projektu EUPL/CC-BY), plná dátová suverenita (dôležité pre národný verejný
systém), bez per-request poplatkov pri raste, de-facto štandard pre verejné
geo-portály v EÚ. Bez vendor lock-in oproti Google Maps / Mapbox.

## Status

Táto zložka je **analytická a prezentačná vrstva** — koncept, ukážky dát a
webová prezentácia s funkčným widgetom. **Nejde o implementáciu.** Vývoj API,
tile servera a produkčného portálu si preberie senior developer v neskoršej fáze.

- [x] Koncept a funkcionality
- [x] Ukážkové vzory dát ([`data-samples.md`](data-samples.md))
- [x] Webová prezentácia + funkčný widget (`portal.html`)
- [ ] Discovery API kontrakt (OpenAPI) — neskoršia fáza
- [ ] Produkčný portál — neskoršia fáza

## Referencie

- [`data-samples.md`](data-samples.md) — konkrétne vzory dát pre vývojárov aj laikov
- [`../domain/entities/facility.md`](../domain/entities/facility.md) — zdrojová entita miesta
- [`../domain/entities/activity.md`](../domain/entities/activity.md) — zdrojová entita podujatia
- [`../gdpr/`](../gdpr/) — GDPR governance a Purpose Catalogue
