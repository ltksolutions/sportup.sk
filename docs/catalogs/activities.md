# Číselník: Typy aktivít

> Aktivita je **merná jednotka** SportUp.sk. Nemeriame len, kto je registrovaný, ale ako často sa ľudia skutočne hýbu a ako sa využívajú športoviská. Použité v `Activity.activity_type`.

**15 typov v 8 skupinách.** Zoznam je zhodný s [activity.sportup.sk](https://activity.sportup.sk/aktivity) (rozhodnutia: ADR-015 a ADR-016 v repozitári `ltksolutions/activity`, 16. 11. 2026).

Nezamieňať s číselníkom [`sport-roles.md`](sport-roles.md): ten obsahuje **druhy športovej činnosti osôb** (roly: tréner, rozhodca, dobrovoľník…), nie typy aktivít.

## Čo je aktivita

Udalosť v čase, ktorú zapisuje ten, kto šport organizuje: zväz, klub, škola, obec, VÚC, fitness centrum alebo organizátor podujatia, vždy cez certifikovanú aplikáciu. Každá aktivita má:

| Pole | Význam |
|---|---|
| `activity_type` | typ z tabuľky nižšie |
| `occurred_at`, `duration_minutes` | kedy a ako dlho |
| `facility_id` | kde: športovisko z katalógu SportUp.sk (základ pre vyťaženosť športovísk) |
| `sport_code` | šport z [`sports.md`](sports.md) |
| `participants` | kto, a v akej roli z [`sport-roles.md`](sport-roles.md) |
| `organizer_id` | kto aktivitu organizuje a zapísal |

## Typy aktivít

| Kód | Typ | Skupina | Pohybová | Popis |
|---|---|---|---|---|
| `training` | Tréning | Tréning | áno | kondičný, technický, taktický, regeneračný |
| `camp` | Tábor a sústredenie | Tréning | áno | viacdňový program s ubytovaním a dozorom; pri deťoch safeguarding |
| `match` | Zápas a pretek | Zápas a pretek | áno | účasť hráča, pretekára alebo člena družstva; zápas či pretek určuje šport |
| `exercise` | Cvičenie a pohyb | Cvičenie a pohyb | áno | pravidelné aj príležitostné cvičenie mimo súťaží: joga, fitness, beh, turistika; šport pre všetkých |
| `referee` | Rozhodca | Rozhodovanie a kontrola | áno | rozhodovanie zápasu alebo preteku |
| `delegate` | Delegát | Rozhodovanie a kontrola | nie | práca delegáta zápasu vrátane hodnotenia rozhodcu |
| `doping_control` | Antidopingová kontrola | Rozhodovanie a kontrola | nie | priebeh a výsledok kontroly; **citlivé**, bez zdravotných údajov |
| `organizer` | Organizácia podujatia | Organizácia a dobrovoľníctvo | nie | riaditeľ pretekov, usporiadateľ, technický delegát podujatia; aj za odmenu |
| `volunteering` | Dobrovoľníctvo | Organizácia a dobrovoľníctvo | nie | pomoc pri podujatí, v klube, usporiadateľská služba bez odmeny |
| `education` | Vzdelávanie | Vzdelávanie a rozvoj | nie | kurzy, semináre, antidopingové školenia |
| `mentoring` | Mentoring | Vzdelávanie a rozvoj | nie | štruktúrované stretnutie mentora a mentee |
| `medical` | Starostlivosť o zdravie | Starostlivosť o zdravie | nie | prehliadky, ošetrenia, fyzioterapia; **citlivé údaje** |
| `donation` | Dar | Podpora a fanúšikovia | nie | dar, 2 % z dane, crowdfunding |
| `sponsorship` | Sponzoring | Podpora a fanúšikovia | nie | sponzorská aktivácia, kampane |
| `fans` | Fanúšikovia | Podpora a fanúšikovia | nie | návšteva podujatia, hlasovanie, kvíz |

**Skupina** slúži na štatistiky a výstupy pre štát a samosprávu. Meriame **všetky** aktivity v športe. **Pohybové** aktivity sú v dátach oddeliteľné, aby sa z nich dali počítať štatistiky pohybu populácie a pravidelnosti.

## Pravidelnosť

Zákon č. 440/2015 Z. z. o športe považuje za aktívneho športovca toho, kto sa za posledný rok zúčastnil najmenej na troch súťažiach. O tom, či sa človek hýbe pravidelne, to nehovorí takmer nič, a šport pre všetkých nezachytí vôbec.

SportUp.sk preto počíta pravidelnosť z pohybových aktivít jednej osoby v čase. **Príklad** ukazovateľa (presná definícia je otvorená, Q-028 v repozitári `ltksolutions/activity`):

- aspoň jedna pohybová aktivita týždenne v 4 zo 6 posledných týždňov,
- doplnkovo minúty pohybovej aktivity týždenne v porovnaní s odporúčaním WHO.

Štát a samospráva dostávajú len súhrnné údaje (podľa veku, obce, športu a typu športoviska), nie údaje o jednotlivcoch.

## Čo z aktivít vzniká

- **Pravidelnosť pohybu** populácie podľa veku, obce a športu.
- **Vyťaženosť športovísk** z `facility_id`, času a trvania.
- **Športový pas osoby** a **digitálna športová žiacka knižka** (ROADMAP, Fáza 2).
