<!--
SPDX-FileCopyrightText: 2026 LTK Solutions s.r.o.
SPDX-License-Identifier: CC-BY-4.0
-->

# R3 — Hotel overí športovca bez osobných údajov

**Časť 2 kampane · 9 slidov · podklad:** scenár 04 na [`website/priklady.html`](../../../website/priklady.html)
**Cieľ:** ukázať najpraktickejší most medzi športom a cestovným ruchom + silná správa o ochrane údajov.
**Publikum:** hotely, penzióny, komerčné subjekty v cestovnom ruchu, športovci.
**Vizuály:** `carousels/R3-hotel-overenie/`

---

## Obsah slidov

| # | Slide | Funkcia |
|---|---|---|
| 01 | Hotel ponúka 20 % zľavu registrovaným športovcom | Hook |
| 02 | Dnes to nejde overiť. Tak sa to neponúka. | Dnes vs. so SportUp |
| 03 | Športovec vygeneruje token | Krok 1 |
| 04 | Recepcia naskenuje kód | Krok 2 |
| 05 | Odpoveď: áno. | Krok 3 |
| 06 | Čo hotel nevidí | **Minimalizácia dát** |
| 07 | A športovec vidí, kto sa jeho dát dotkol | Audit |
| 08 | Takto sa šport a cestovný ruch prepájajú bezpečne | Pointa |
| 09 | Celý scenár aj s dátami je verejný | CTA |

---

## LinkedIn

**Formát:** `R3-hotel-overenie-linkedin.pdf` · **Hashtagy:** 3–5

> Komerčné subjekty by radi ponúkali benefity športovcom. Problém je, že si ich status nevedia overiť — a tak benefit buď neponúknu, alebo ho poskytujú naslepo.
>
> Riešením je overenie postavené na minimalizácii dát. Športovec si vygeneruje krátkodobý token, hotel sa cez certifikovanú aplikáciu opýta jedinú uzavretú otázku a dostane odpoveď áno/nie.
>
> Hotel nevidí meno, dátum narodenia, klub, šport ani úroveň. Vidí iba to, že ide o registrovaného športovca. Každé takéto overenie sa navyše zapisuje do auditu, takže osoba si vie spätne pozrieť, ktoré subjekty a kedy sa na jej status pýtali.
>
> Toto je podľa mňa najpraktickejší most medzi športom a cestovným ruchom. Ubytovacie zariadenia, doprava, požičovne či športové centrá môžu stavať benefitné programy bez toho, aby sa vôbec dotkli osobných údajov — a bez rizika, ktoré by z toho pre nich vyplývalo.
>
> Architektonicky ide o rovnaký princíp ako pri verejnom portáli: von ide len minimum potrebné na daný účel, vynútené serverom.
>
> sportup.sk/priklady.html
>
> #cestovnýruch #GDPR #šport #dataMinimization #hotelierstvo

---

## Facebook

**Formát:** obrázkový carousel zo `square/` · **Hashtagy:** 0–2

> Zľava pre športovcov v hoteli znie skvele — kým ju niekto nemá overiť. 🏨
>
> Preukaz? Každý zväz ho vydáva inak. Potvrdenie z klubu? Na papieri. Tak sa benefit radšej neponúkne vôbec.
>
> Ukazujeme riešenie: športovec ukáže QR kód, hotel dostane odpoveď „áno" — a nič viac. Žiadne meno, žiadny klub, žiadne osobné údaje.
>
> A športovec si vie spätne pozrieť, kto sa naňho pýtal.
>
> 👉 sportup.sk/priklady.html

---

## Instagram

**Formát:** carousel z `portrait/` · **Hashtagy:** 8–12

> Hotel sa dozvie jediné slovo: „áno". 🏨✅
>
> Zľava pre športovcov bez toho, aby ste odovzdali čokoľvek o sebe.
>
> Swipe a pozri, ako to funguje ➡️
>
> sportup.sk (link v bio)
>
> #cestovnýruch #šport #GDPR #hotel #zľava #sportup #Slovensko #súkromie

---

## Poznámky

- **Slide 06** („Čo hotel nevidí") je najsilnejší samostatný post pre tému ochrany údajov.
- Tento carousel je vhodný na cielenie **komerčným subjektom v cestovnom ruchu** — hotelom, penziónom, rezortom.
