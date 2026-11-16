# Číselník: Typy aktivít

> Aktivita je **merná jednotka** SportUp.sk. Nemeriame len, kto je registrovaný, ale ako často sa ľudia skutočne hýbu a ako sa využívajú športoviská. Použité v `Activity.activity_type`.

**12 typov v 8 skupinách.** Zoznam je zhodný s [activity.sportup.sk](https://activity.sportup.sk/aktivity) (rozhodnutie: ADR-015 v repozitári `ltksolutions/activity`, 16. 11. 2026).

Nezamieňať s číselníkom [`activity-types.md`](activity-types.md), ktorý napriek názvu obsahuje **druhy športovej činnosti osôb** (roly: tréner, rozhodca, dobrovoľník…), nie typy aktivít.

## Čo je aktivita

Udalosť v čase, ktorú zapisuje ten, kto šport organizuje: zväz, klub, škola, obec, VÚC, fitness centrum alebo organizátor podujatia, vždy cez certifikovanú aplikáciu. Každá aktivita má:

| Pole | Význam |
|---|---|
| `activity_type` | typ z tabuľky nižšie |
| `occurred_at`, `duration_minutes` | kedy a ako dlho |
| `facility_id` | kde: športovisko z katalógu SportUp.sk (základ pre vyťaženosť športovísk) |
| `sport_code` | šport z [`sports.md`](sports.md) |
| `participants` | kto, a v akej roli z [`activity-types.md`](activity-types.md) |
| `organizer_id` | kto aktivitu organizuje a zapísal |

## Typy aktivít

| Kód | Typ | Skupina | Pohybová | Popis |
|---|---|---|---|---|
| `training` | Tréning | Tréning | áno | kondičný, technický, taktický, regeneračný |
| `match` | Zápas a pretek | Zápas a pretek | áno | účasť hráča, pretekára alebo člena družstva; zápas či pretek určuje šport |
| `exercise` | Cvičenie a pohyb | Cvičenie a pohyb | áno | pravidelné aj príležitostné cvičenie mimo súťaží: joga, fitness, beh, turistika; šport pre všetkých |
| `referee` | Rozhodca | Rozhodcovia a delegáti | áno | rozhodovanie zápasu alebo preteku |
| `delegate` | Delegát | Rozhodcovia a delegáti | nie | práca delegáta zápasu vrátane hodnotenia rozhodcu |
| `volunteering` | Dobrovoľníctvo | Dobrovoľníctvo | nie | pomoc pri podujatí, v klube, usporiadateľská služba bez odmeny |
| `education` | Vzdelávanie | Vzdelávanie a rozvoj | nie | kurzy, semináre, antidopingové školenia |
| `mentoring` | Mentoring | Vzdelávanie a rozvoj | nie | štruktúrované stretnutie mentora a mentee |
| `medical` | Starostlivosť o zdravie | Starostlivosť o zdravie | nie | prehliadky, ošetrenia, fyzioterapia; **citlivé údaje** |
| `donation` | Dar | Podpora a fanúšikovia | nie | dar, 2 % z dane, crowdfunding |
| `sponsorship` | Sponzoring | Podpora a fanúšikovia | nie | sponzorská aktivácia, kampane |
| `fans` | Fanúšikovia | Podpora a fanúšikovia | nie | návšteva podujatia, hlasovanie, kvíz |

**Skupina** slúži na štatistiky a výstupy pre štát a samosprávu. **Pohybová** aktivita sa započítava do ukazovateľov pohybu populácie a pravidelnosti; ostatné typy sa evidujú, ale meradlom pohybu nie sú.

## Pravidelnosť

Zákon č. 440/2015 Z. z. o športe považuje za aktívneho športovca toho, kto sa za posledný rok zúčastnil najmenej na troch súťažiach. O tom, či sa človek hýbe pravidelne, to nehovorí takmer nič, a šport pre všetkých nezachytí vôbec.

SportUp.sk preto počíta pravidelnosť z pohybových aktivít jednej osoby v čase. Návrh ukazovateľa (na rozhodnutie, Q-028 v repozitári `ltksolutions/activity`):

- **hlavný:** aspoň jedna pohybová aktivita týždenne v 4 zo 6 posledných týždňov,
- **doplnkový:** minúty pohybovej aktivity týždenne v porovnaní s odporúčaním WHO (150 minút).

Štát a samospráva dostávajú len súhrnné údaje (podľa veku, obce, športu a typu športoviska), nie údaje o jednotlivcoch.

## Čo z aktivít vzniká

- **Pravidelnosť pohybu** populácie podľa veku, obce a športu.
- **Vyťaženosť športovísk** z `facility_id`, času a trvania.
- **Športový pas osoby** a **digitálna športová žiacka knižka** (ROADMAP, Fáza 2).

## Na rozhodnutie

Navrhnuté ďalšie typy: tábor alebo sústredenie (`camp`), antidopingová kontrola (`doping_control`, citlivá), organizácia podujatia (`organizer`).
