# Číselník: Druhy organizácií

> ~35 typov subjektov v 5 kategóriách. Pokrýva celý ekosystém — od zväzov a klubov cez samosprávu až po komerčné subjekty (vrátane cestovného ruchu).

## Kategória 1: Športové organizácie

| Kód | Typ | Príklad |
|---|---|---|
| `narodny_zvaz` | Národný športový zväz | SFZ, SZĽH, SZTK |
| `regionalny_zvaz` | Regionálny / oblastný zväz | ObFZ, KrFZ |
| `sportovy_klub` | Športový klub | ŠK, TJ |
| `sportovy_oddiel` | Športový oddiel (org. jednotka klubu) | Oddiel hokeja, atletiky |
| `ina_sportova_organizacia` | Iná športová organizácia | Záujmové združenie, OZ |
| `sportova_unia` | Športová únia (zastrešujúca) | KŠZ, SOŠV, SPV |

## Kategória 2: Územná samospráva

| Kód | Typ | RPO mapovanie |
|---|---|---|
| `obec` | Obec | Právna forma 801 |
| `mesto` | Mesto | Právna forma 801 |
| `mestska_cast` | Mestská časť | Právna forma 801 |
| `vuc` | Vyšší územný celok (VÚC) | Právna forma 803 |

## Kategória 3: Štátne orgány a vzdelávanie

| Kód | Typ | Príklad |
|---|---|---|
| `ministerstvo` | Ministerstvo | MCRŠ SR |
| `statna_organizacia` | Príspevková / rozpočtová | NŠC do decommissioningu, iné |
| `agentura` | Štátna agentúra | SADA |
| `skola_zakladna` | Základná škola | |
| `skola_stredna` | Stredná škola | Gymnáziá so šport. triedami |
| `vysoka_skola` | Vysoká škola / fakulta | FTVŠ UK, FŠ PU |
| `sportove_gymnazium` | Športové gymnázium, šport. trieda | |
| `akademia_mladeze` | Športová akadémia mládeže | Akadémie SZĽH, SFZ |
| `stredisko_vrcholu` | Stredisko vrcholového športu | VŠC Dukla |
| `skolske_stredisko` | Školské športové stredisko | Pri ZŠ/SŠ |
| `centrum_volneho_casu` | Centrum voľného času (CVČ) | |

## Kategória 4: Komerčné subjekty (šport + cestovný ruch)

> Pri komerčných subjektoch je **prístup obmedzený na overovacie volania a verejné katalógy.** Žiaden komerčný subjekt nedostane úplné PII.

| Kód | Typ | Typická úloha |
|---|---|---|
| `prevadzkovatel_sportoviska` | Prevádzkovateľ športoviska | Registrácia a správa Facility |
| `ubytovanie` | Ubytovacie zariadenie | Hotel, penzión, apartmán |
| `stravovanie` | Stravovacie zariadenie | Reštaurácia |
| `doprava` | Prepravca | Autobus, vlak, leteckí dopravcovia |
| `pozicovna` | Požičovňa športového vybavenia | Lyže, bicykle, kajaky |
| `predajca` | Predajca športových potrieb | |
| `poistovna` | Poisťovňa | |
| `cestovna_kancelaria` | Cestovná kancelária / agentúra | Športové zájazdy |
| `turisticke_informacne_centrum` | Turistické informačné centrum (TIC) | Mestské, oblastné |
| `oocr` | Oblastná organizácia cestovného ruchu | OOCR Bratislava... |
| `media_subjekt` | Mediálny subjekt | TV, rozhlas, portál |
| `marketing_agency` | Marketingová agentúra | |
| `stavkova_kancelaria` | Stávková kancelária | Regulované, integrita |

## Kategória 5: Organizátori a medzinárodné

| Kód | Typ | Poznámka |
|---|---|---|
| `organizator_podujatia` | Organizačný výbor podujatia (ad-hoc) | RPO voliteľné |
| `medzinarodna_federacia` | Medzinárodná federácia | FIFA, FIS, IFAB |
| `medzinarodna_konfederacia` | Medzinárodná konfederácia | UEFA, EHF |
| `mov_mpv` | MOV, MPV, SOŠV, SPV | |
| `integritna_organizacia` | WADA, ITA, CAS | |

## Schéma záznamu

```yaml
- code: sportovy_klub
  label_sk: "Športový klub"
  label_en: "Sports club"
  category: sportove_organizacie
  parent: null

  # Vzťah k RPO
  requires_rpo: true
  typical_legal_forms: [751, 701]  # OZ, n.o.

  # Vlastnosti
  can_have_members: true
  can_organize_competitions: true
  can_be_accredited_in_sports: true

  # Hierarchia
  typical_parent_types: [regionalny_zvaz, narodny_zvaz]

  status: active
  version: "1.0"
```

## Hierarchia v praxi

```
narodny_zvaz (SFZ)
└── regionalny_zvaz (ZsFZ)
    └── regionalny_zvaz (ObFZ Bratislava)
        └── sportovy_klub (ŠK Slovan Bratislava)
            └── sportovy_oddiel (Oddiel mládeže)
```

```
mesto (Bratislava)
└── mestska_cast (Staré Mesto)
    └── skola_zakladna (ZŠ Hlavná)
        └── skolske_stredisko (Šport. stredisko ZŠ Hlavná)
```

## Aktualizácia

Pridanie typu organizácie:

1. Issue s motiváciou (čo nový typ rieši)
2. Kontrola, či sa nedá zaradiť pod existujúci typ
3. PR meniaci `data/catalogs/organization-types.yaml`
4. Schválenie minimálne 2 maintainerov + konzultácia s MCRŠ pre štátne, MV pre územné

## Referencie

- [`legal-forms.md`](legal-forms.md) — RPO právne formy
- [`../domain/entities/organization.md`](../domain/entities/organization.md)
- [`../integration/state-registers.md`](../integration/state-registers.md)
