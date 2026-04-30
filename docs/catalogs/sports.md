# Číselník: Športy

> 90+ uznaných športov v SR, plus neuznané a hobby. Vrátane medzinárodných mapovaní (IOC, IFs).

## Tri osi delenia

Šport je v SportUp.sk klasifikovaný v troch nezávislých osiach. Každý šport môže byť kombináciou hodnôt:

### Os 1: Uznanie

| Hodnota | Popis |
|---|---|
| `recognized` (uznaný) | Štátne uznanie podľa zákona č. 440/2015 o športe. Má národný zväz. |
| `unrecognized` (neuznaný) | Bez štátneho uznania. Komunitné, hobby, nové trendy. |

### Os 2: Olympijská disciplína

| Hodnota | Popis |
|---|---|
| `olympic` | Aktuálny olympijský program. Zastrešuje **Slovenský olympijský a športový výbor (SOŠV)**. |
| `paralympic` | Paralympijský program. Zastrešuje **Slovenský paralympijský výbor (SPV)**. |
| `non_olympic` | Mimo olympijského a paralympijského programu. |

Zoznam olympijských športov: [olympic.sk/sporty/prehlad](https://www.olympic.sk/sporty/prehlad/).

### Os 3: Forma činnosti (Activity, nie Sport)

Tu už ide o **konkrétnu aktivitu**, nie šport ako taký. Pozri [`../domain/entities/activity.md`](../domain/entities/activity.md):

- `oficialne_organizovana` — riadi národný zväz
- `neoficialne_organizovana` — riadi škola, klub, mesto, obec, VÚC, ministerstvo školstva, CVČ
- `hobby` — neorganizovaná voľnočasová aktivita

## Schéma záznamu

```yaml
- code: SK-FTB
  label_sk: "Futbal"
  label_en: "Football"

  # Os 1: uznanie
  is_recognized: true
  recognition_date: "2008-06-30"
  recognition_law_reference: "§ 75 zák. č. 440/2015 Z.z."

  # Národné zväzy (1+)
  national_federations:
    - org_id: "sfz-uuid"
      name: "Slovenský futbalový zväz"
      sub_federations: 38

  # Os 2: olympijská
  is_olympic: true
  is_paralympic: false
  olympic_program:
    summer: true
    winter: false

  # Medzinárodné mapovanie
  ioc_code: "FOT"
  international_federations:
    - "FIFA"
    - "UEFA"

  # Disciplíny
  disciplines:
    - code: "SK-FTB-MEN"
      label_sk: "Futbal mužov"
    - code: "SK-FTB-WOMEN"
      label_sk: "Futbal žien"
    - code: "SK-FTB-FUTSAL"
      label_sk: "Futsal"
    - code: "SK-FTB-BEACH"
      label_sk: "Plážový futbal"

  category: "team_ball"
  status: "active"
  version: "1.0"
```

## Príklady — štyri štvrtiny dvojrozmernej tabuľky

### Uznaný + olympijský

Najtypickejší prípad. Príklady: Futbal (SK-FTB), Atletika (SK-ATH), Plávanie (SK-PLV), Hokej (SK-HKJ), Lyžovanie (SK-LYZ).

### Uznaný + neolympijský

Šport má národný zväz, ale nie je v aktuálnom OH programe. Príklady: Šach (SK-SCH), Bridž (SK-BRD), Floorball (SK-FLB) — niektoré z nich sú olympijské v špecifických edíciách.

### Neuznaný + olympijský

Vzácne. Šport, ktorý je v OH programe, ale na Slovensku ešte nie je uznaný (chýba aktívny zväz). Spravidla po čase prejde do uznaného.

### Neuznaný + neolympijský

Hobby a komunitné športy. Discgolf (SK-DSG), Kabaddi (SK-KBD), Tchoukball, Roundnet, eSport (SK-EST — ide o uznanie), Drone Racing.

## Kompletný zoznam (vzorka)

Plná verzia v `data/catalogs/sports.yaml`. Tu reprezentatívna vzorka:

### Kolektívne loptové
`SK-FTB` Futbal · `SK-HKJ` Ľadový hokej · `SK-BAS` Basketbal · `SK-VLB` Volejbal · `SK-HDB` Hádzaná · `SK-RGB` Rugby · `SK-FLB` Florbal · `SK-VDP` Vodné pólo

### Individuálne a vytrvalostné
`SK-ATH` Atletika · `SK-PLV` Plávanie · `SK-CYK` Cyklistika · `SK-TRI` Triatlon · `SK-VSL` Veslovanie · `SK-KNT` Kanoistika · `SK-GYM` Gymnastika

### Úpolové a bojové
`SK-JUD` Judo · `SK-ZPS` Zápasenie · `SK-BOX` Box · `SK-KRT` Karate · `SK-TKW` Taekwondo · `SK-FNC` Šerm

### Zimné
`SK-LYZ` Lyžovanie · `SK-KRK` Krasokorčuľovanie · `SK-BIA` Biatlon · `SK-SNY` Sánkovanie · `SK-CRL` Curling

### Strelecké a technické
`SK-STR` Streľba · `SK-LUK` Lukostreľba · `SK-MOT` Motorizmus · `SK-MTC` Motocykel

### Mysľové
`SK-SCH` Šach · `SK-DMA` Dáma · `SK-BRD` Bridž · `SK-EST` eSport

## Disciplíny a kategórie

Disciplíny sú v samostatnom dokumente: [`disciplines.md`](disciplines.md).
Vekové a výkonnostné kategórie: [`categories.md`](categories.md).

## Aktualizácia

Pridanie nového športu:

1. **Pre uznané** — zmena prichádza zo zákona, MCRŠ aktualizuje
2. **Pre neuznané** — návrh komunity / klubu cez Issue
3. PR meniaci `data/catalogs/sports.yaml`
4. Po schválení → release nového minor verzia

## Referencie

- Zákon č. 440/2015 Z.z. o športe
- [olympic.sk — prehľad športov](https://www.olympic.sk/sporty/prehlad/)
- [`disciplines.md`](disciplines.md)
- [`categories.md`](categories.md)
- [`../domain/entities/activity.md`](../domain/entities/activity.md) — Activity vs Sport
