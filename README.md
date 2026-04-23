# SportUp.sk

**Otvorené riešenie pre slovenský šport a podporu cestovného ruchu.**

Jednotný národný register osôb, organizácií a aktivít s verejným registrom športovísk a vzdelávacími a rozvojovými službami. Postavený na otvorenej architektúre s otvorenými zdrojovými kódmi.

---

## O projekte

SportUp je koncepčný návrh nového informačného systému športu pre Slovenskú republiku. Cieľom je nahradiť dnešné fragmentované evidencie (zväzové registre, klubové kartotéky, samostatné tabuľky na MS Exceli) jednotnou, moderne navrhnutou platformou postavenou na princípoch:

- **API-first a headless** — systém neobsahuje používateľské rozhranie, poskytuje len rozhrania (REST API, MCP, webhooks)
- **Identita oddelená od role** — jedna osoba môže byť súčasne športovcom, trénerom, rozhodcom, dobrovoľníkom
- **Event-sourced jadro** — každá zmena je nemenná udalosť, aktuálny stav sa odvodzuje
- **Referenčné dáta zo štátu** — identita fyzických a právnických osôb sa preberá z RFO a RPO
- **GDPR v jadre** — súhlasy a účely spracovania sú prvotriedne entity
- **Zero-trust** — čítať a zapisovať môžu len certifikované aplikácie
- **Otvorenosť** — otvorený kód, otvorené API, otvorené dáta

## Prezentačný web

Statický dokumentačný web sídli v tomto repozitári v koreňovom adresári. Obsahuje 9 stránok s popisom architektúry, dátového modelu, číselníkov, účelov spracovania, príkladov, integrácií, technológií a kontaktu.

Verejne dostupný na [sportup.sk](https://sportup.sk).

## Dokumentácia

| Kapitola | Obsah |
|----------|-------|
| [Úvod](index.html) | Vízia, princípy a subjekty systému |
| [Architektúra](architektura.html) | Vrstvový model, zero-trust, event sourcing, Identity Broker |
| [Doménový model](domenovy-model.html) | Entity: Person, Affiliation, Organization, Facility, Role, Consent |
| [Číselníky](ciselniky.html) | Športy, disciplíny, súťaže, organizácie, športoviská, kvalifikácie |
| [Účely spracovania](ucely.html) | Purpose Catalogue — 11 kategórií GDPR-relevantných účelov |
| [Príklady](priklady.html) | Konkrétne scenáre: registrácia, prestup, multi-role, úmrtie |
| [Integrácie](integracie.html) | REST API, MCP, webhooks, napojenie na štátne registre |
| [Technológie](technologie.html) | Navrhovaný stack: Next.js + Node.js + MongoDB + OPA |
| [Kontakt](kontakt.html) | Autor, kontakt a spôsoby spolupráce |

## Technologický stack pre IS športu

Pre samotný informačný systém (odlišný od tohto prezentačného webu) je navrhnutý stack:

- **Backend** — Node.js + TypeScript
- **API** — Next.js (admin aplikácie), dedikované servisy pre REST a MCP
- **Databáza** — MongoDB (event store + projekcie)
- **Policy engine** — Open Policy Agent (OPA)
- **Cache** — Redis
- **Messaging** — webhooks + event stream

Detaily v [technologie.html](technologie.html).

## Lokálne spustenie prezentačného webu

Web je čisto statický — stačí otvoriť `index.html` v prehliadači. Pre lokálny development server:

```bash
python3 -m http.server 8000
# alebo
npx serve .
```

Potom otvorte `http://localhost:8000`.

## Prispievanie

Projekt je otvorený konštruktívnym pripomienkam a spolupráci.

- **Issues** — konkrétne technické návrhy, chyby v dokumentácii
- **Discussions** — strategické a koncepčné témy
- **Pull requests** — priame návrhy zmien v dokumentácii alebo kóde

Uvítame spätnú väzbu najmä od:
- národných športových zväzov
- klubov a športových akadémií
- územnej samosprávy (obce, mestá, VÚC)
- orgánov verejnej správy
- odbornej a výskumnej komunity
- športovcov, trénerov a dobrovoľníkov

## Kontakt

**Autor:** Ján Letko  
**E-mail:** [sportup@ltk.solutions](mailto:sportup@ltk.solutions)  
**Repozitár:** [github.com/ltksolutions/sportup.sk](https://github.com/ltksolutions/sportup.sk)

## Licencia

Tento projekt je pod otvorenou licenciou. Presné podmienky budú doplnené v súbore `LICENSE` pred prvým verejným release.

---

*SportUp · koncepčný dokument · verzia 0.1 · 2026*
