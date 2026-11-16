# SPDX-FileCopyrightText: 2026 LTK Solutions s.r.o.
# SPDX-License-Identifier: EUPL-1.2
"""
SportUp — render carouselov pre sociálne siete.

Spustenie z adresára marketing/social/:
    python3 tools/render.py            # všetky carousely, oba formáty + PDF
    python3 tools/render.py P1         # len konkrétny carousel

Výstup:
    carousels/<folder>/square/    1080×1080  — LinkedIn, Facebook
    carousels/<folder>/portrait/  1080×1350  — Instagram (4:5)
    carousels/<folder>/<folder>-linkedin.pdf — dokumentový carousel na LinkedIn
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import brand_slides as B
import diagrams as D

OUT = Path(__file__).resolve().parents[1] / "carousels"


# ══════════════════════════════════════════════════════════════════════════
# G1 — Šport nerobia len športové organizácie
# Otvárací príspevok kampane. Podklad: zákon 440/2015, stanoviská NKÚ.
# ══════════════════════════════════════════════════════════════════════════
def G1(o):
    """G1 — Rozsah systému je daný definíciou, nie kvalitou."""
    B.slide(f"{o}/01.png",
            "Šport nerobia len športové organizácie.",
            kicker="SportUp",
            body="A práve v tom je jadro nedorozumenia.", hsize=62)

    B.slide(f"{o}/02.png",
            "Zákon o športe pozná pojem „športová organizácia“.",
            body="Tým je daný celý rozsah informačného systému športu. "
                 "Kto do definície nespadá, ten v systéme nie je.",
            hsize=54)

    B.slide(f"{o}/03.png",
            "Kto v ňom je a ako.", badge="Dnešný stav",
            ex_label="Rozsah funkcionality",
            example="Národné zväzy — plnohodnotný aktér, vlastné systémy.|"
                    "Kluby — len sprostredkovane. Ich údaje zapisuje materská organizácia.|"
                    "Ostatní — mimo pôsobnosti zákona.",
            hsize=58)

    B.slide(f"{o}/04.png",
            "A kto v ňom nie je vôbec.",
            ex_label="Pritom bez nich by sa šport nekonal",
            example="Mestá a obce — vlastníci ihrísk, telocviční, cyklotrás.|"
                    "VÚC — krajské programy a investície.|"
                    "Školy a škôlky — prvý kontakt detí s pohybom.|"
                    "Komerčné haly, hotely, požičovne, kempy.|"
                    "Dobrovoľníci a organizátori lokálnych podujatí.",
            hsize=58)

    B.slide(f"{o}/05.png",
            "Nie sú opomenutí. Sú mimo definície.", accent=True,
            body="To nie je chyba implementácie, ktorú opraví nová verzia. "
                 "Je to dôsledok toho, ako je systém vymedzený.",
            hsize=58)

    B.slide(f"{o}/06.png",
            "Voľnočasový šport je najväčšia skupina.",
            body="Beh, ebike, rýchla chôdza, plávanie, príležitostný zápas s kamarátmi.",
            ex_label="A kde sa odohráva",
            example="Na mestských cyklotrasách, obecných ihriskách, v telocvičniach a na plavárňach.|"
                    "Teda na infraštruktúre, ktorú platí samospráva — nie štát.",
            hsize=54)

    B.slide(f"{o}/07.png",
            "A šport je zároveň produktom cestovného ruchu.",
            body="Voľnočasový aj organizovaný — každý iným spôsobom.",
            ex_label="Dva zdroje toho istého dopytu",
            example="Cyklotrasa: cez týždeň miestnym, cez víkend návštevníkom.|"
                    "Mládežnícky turnaj: dvadsať tímov, rodičia, dva nocľahy.|"
                    "Sústredenia a letné kempy: celý týždeň v regióne, často mimo sezóny.",
            hsize=50)

    B.slide(f"{o}/08.png",
            "A tento dopyt sa dá plánovať.", accent=True,
            body="Súťažný kalendár je známy rok dopredu — je to zároveň predpoveď, "
                 "kedy do regiónu príde koľko ľudí. Ak to niekto vie, vie sa pripraviť.",
            hsize=56)

    B.slide(f"{o}/09.png",
            "Samospráva infraštruktúru platí, no nemá dáta o jej využití.",
            body="Ani o športe, ani o cestovnom ruchu. Dátová diera ju stojí dvakrát.",
            ex_label="Bez dát sa nedá",
            example="Obhájiť ďalšiu investíciu.|"
                    "Ukázať, že cyklotrasa či telocvičňa má zmysel.|"
                    "Plánovať kapacity pre deti a seniorov.",
            hsize=48)

    B.slide(f"{o}/10.png",
            "Na to isté upozorňuje aj NKÚ.", badge="Nezávislý pohľad",
            ex_label="Najvyšší kontrolný úrad SR",
            example="Podľa NKÚ dodnes nevznikol národný informačný systém s dátami o tom, "
                    "koľko prostriedkov získali športovci, športové organizácie a prevádzkovatelia "
                    "športovej infraštruktúry. K transparentnosti by prispel centrálny register "
                    "športovej infraštruktúry.",
            hsize=54)

    B.slide(f"{o}/11.png",
            "Ide o dve rôzne otázky.", accent=True,
            ex_label="Preto nejde o náhradu, ale o doplnenie",
            example="Informačný systém športu odpovedá: kto je registrovaný a kto má nárok na dotáciu.|"
                    "SportUp odpovedá: kto v tejto krajine športuje, kde a na akej infraštruktúre.",
            hsize=58)

    B.slide_image(f"{o}/12.png",
            "Nie je to len návrh na papieri.",
            image="portal-mapa-zoznam.png",
            caption="Víkend v Novej Bani — športoviská, ubytovanie, trasy aj podujatia na jednej mape.",
            hsize=50)

    B.slide(f"{o}/13.png",
            "Otvorený návrh. Verejný od prvého dňa.", cta=True,
            body="sportup.sk — architektúra, doménový model aj zdrojový kód.",
            hsize=56)


# ══════════════════════════════════════════════════════════════════════════
# ČASŤ 1 — Čo prinesie dobrý informačný systém pre šport a cestovný ruch
# ══════════════════════════════════════════════════════════════════════════

def P1(o):
    """P1 — Jedno miesto, všetky informácie. Podklad: website/portal.html"""
    B.slide(f"{o}/01.png",
            "Čo prinesie dobrý informačný systém pre šport a cestovný ruch?",
            kicker="SportUp · časť 1",
            body="Nie zväzom. Nie úradom. Celej spoločnosti.", hsize=54)

    B.slide_vs(f"{o}/02.png",
               "Prídeš na víkend do Novej Bane. Čo tu môžeš robiť?",
               before="Googliš športoviská. Iný web na ubytovanie.|"
                      "Tretí na trasy. Štvrtý na podujatia.|"
                      "Polovica informácií je zastaraná.",
               after="Jedna mapa: športoviská, ubytovanie, trasy aj podujatia.|"
                     "Dáta priamo od tých, ktorí ich vlastnia.|"
                     "Aktuálne, lebo ich aktualizuje zdroj.")

    B.slide(f"{o}/03.png",
            "Jedno miesto. Všetky informácie.",
            body="Verejný portál číta centrálny register — jediný zdroj pravdy, "
                 "do ktorého zapisujú všetci, ktorí šport organizujú a podporujú.",
            hsize=60)

    B.slide(f"{o}/04.png",
            "Kto dáta zapisuje?", badge="Oficiálne zdroje",
            ex_label="Každý cez svoju certifikovanú aplikáciu",
            example="Národné zväzy — ligy, majstrovstvá, súťaže.|"
                    "Kluby — turnaje, nábory, tréningy.|"
                    "Mestá a obce — behy, hody, športoviská.|"
                    "VÚC — krajské hry a infraštruktúra.|"
                    "Komerčné subjekty — hotely, haly, požičovne, kempy.",
            hsize=56)

    B.slide(f"{o}/05.png",
            "A všetci z toho čerpajú.",
            ex_label="Tie isté dáta, rôzne použitia",
            example="Turista: čo robiť v destinácii tento víkend.|"
                    "Rodič: bazén a krúžky v okolí.|"
                    "Športovec: e-bike okruh, náročnosť, požičovňa.|"
                    "Organizátor: voľné dejisko pre turnaj.|"
                    "Hotel: napojenie ponuky na podujatia v okolí.|"
                    "Samospráva: podklad pre investície do infraštruktúry.",
            hsize=58)

    B.slide(f"{o}/06.png",
            "Víkendový balíček namiesto desiatich webov.",
            body="Hlavný rozdiel oproti bežnej mape: ubytovanie + aktivita + "
                 "podujatie zložené do jednej ponuky pre región a čas.",
            ex_label="Príklad z portálu",
            example="E-bike okruh pri jazere Tajch + penzión s požičovňou + "
                    "víkendový beh v Novej Bani. Jedna ponuka, jeden región, jeden čas.",
            hsize=52)

    B.slide(f"{o}/07.png",
            "Dedinský zápas je aj kultúrna udalosť.",
            body="Seniorský turnaj, mestský beh, hodový futbal — na tie sa chodí "
                 "aj „len tak“. Kalendár preto vie zobraziť komunitné podujatia v okolí.",
            ex_label="Prečo na tom záleží",
            example="Otázka „čo sa deje tento víkend v okolí?“ má zmysel naprieč "
                    "športom aj kultúrou — pre občana aj turistu.",
            hsize=54)

    B.slide(f"{o}/08.png",
            "Bez jediného osobného údaja.", badge="GDPR",
            ex_label="Vynútené serverom, nie sľubom",
            example="Von idú len miesta, podujatia a agregáty.|"
                    "Žiadne mená, kontakty ani zoznamy účastníkov.|"
                    "Žiadosť o osobné dáta → prístup zamietnutý.",
            hsize=58)

    B.slide(f"{o}/09.png",
            "Šport a cestovný ruch — jedna evidencia.", accent=True,
            body="Rovnaké dáta o mieste slúžia zväzu pri výbere dejiska, klubu pri "
                 "rezervácii, samospráve pri investíciách a turistovi v destinácii. "
                 "To je jadro hodnoty SportUp.",
            hsize=56)

    B.slide(f"{o}/10.png",
            "Vyskúšaj si funkčnú ukážku.", cta=True,
            body="sportup.sk/portal.html — interaktívna mapa s reálnymi miestami.",
            hsize=58)


def P2(o):
    """P2 — Pohľad na šport zhora (fikcia) a zboku (realita)."""
    B.slide(f"{o}/01.png",
            "Ako vlastne vyzerá šport na Slovensku?",
            kicker="SportUp · časť 1",
            body="Záleží na tom, odkiaľ sa naň pozeráte.", hsize=60)

    D.diagram_slide(f"{o}/02.png", "Pohľad zhora",
                    subtitle="Takto o športe hovoríme.", kind="concentric")

    D.legend_slide(f"{o}/03.png", "V strede pozornosti:",
                   [(D.RED, "Elitný a reprezentačný šport"),
                    (D.BLUE_L, "Organizovaný šport (kluby, zväzy, školy)"),
                    (D.GREEN, "Voľnočasový šport")])

    B.slide(f"{o}/04.png",
            "Lenže tento pohľad je fikcia.", accent=True,
            body="Zhora vyzerá elitný šport ako jadro všetkého. Vidno len plochu — "
                 "nie počty ľudí.", hsize=62)

    D.diagram_slide(f"{o}/05.png", "Pohľad zboku",
                    subtitle="Takto to vyzerá v realite.", accent=True,
                    lines=["Výška = úroveň  ·  Šírka = počet športovcov"])

    D.diagram_slide(f"{o}/06.png", None, kind="pyramid", highlight="tip",
                    caption="Elitný a reprezentačný šport", label_col=D.RED,
                    lines=["Špička pyramídy. Najviac pozornosti,",
                           "najviac titulkov — a najmenej ľudí.",
                           "Stojí na všetkom, čo je pod ňou."])

    D.diagram_slide(f"{o}/07.png", None, kind="pyramid", highlight="mid",
                    caption="Organizovaný šport", label_col=D.BLUE_L,
                    lines=["Školy, kluby, zväzy, športové organizácie.",
                           "Jediná časť, ktorú dnes systém eviduje —",
                           "a netvorí ani polovicu reálnych športovcov."])

    D.diagram_slide(f"{o}/08.png", None, kind="pyramid", highlight="base",
                    caption="Voľnočasový šport", label_col=D.GREEN,
                    lines=["Ebike. Beh. Rýchla chôdza. Plávanie.",
                           "Príležitostný zápas s kamarátmi.",
                           "Najviac ľudí. A v systéme nie sú vôbec."])

    D.diagram_slide(f"{o}/09.png", "A ešte jedna vec.", accent=True,
                    age_marks=True,
                    lines=["Čím nižšie v pyramíde, tým mladší športovci.",
                           "Základňa sú deti v škôlkach a na prvom stupni.",
                           "Tam sa rozhoduje, či pri pohybe zostanú."])

    B.slide(f"{o}/10.png",
            "Kde všetci títo ľudia športujú?",
            body="Na infraštruktúre miest a obcí — nie na štátnych zariadeniach.",
            ex_label="Konkrétne",
            example="Mestské cyklotrasy a bežecké okruhy.|"
                    "Obecné ihriská, telocvične a plavárne.|"
                    "Parky, multifunkčné ihriská, školské areály.",
            hsize=56)

    B.slide(f"{o}/11.png",
            "Mesto platí infraštruktúru — a nevie, kto ju používa.",
            ex_label="Bez dát sa nedá",
            example="Rozhodnúť, kam investovať ďalšie euro.|"
                    "Ukázať, že cyklotrasa má zmysel.|"
                    "Plánovať kapacity pre deti a seniorov.",
            hsize=50)

    B.slide(f"{o}/12.png",
            "Preto register nemôže byť len o registrovaných.", accent=True,
            body="SportUp pokrýva celú pyramídu — od príležitostného behu, cez "
                 "klubový šport, až po reprezentáciu.", hsize=56)

    B.slide(f"{o}/13.png",
            "Pozri si celý koncept.", cta=True, body="sportup.sk", hsize=62)


# ══════════════════════════════════════════════════════════════════════════
# ČASŤ 2 — Reálne použitia v praxi
# Podklad: website/priklady.html
# ══════════════════════════════════════════════════════════════════════════

def R1(o):
    """R1 — Rodič registruje dieťa do klubu. Scenár 01."""
    B.slide(f"{o}/01.png",
            "Tomáš má 12 rokov a chce hrať basketbal.",
            kicker="SportUp · časť 2 · v praxi",
            body="Čo všetko musí klub vybaviť, aby mohol nastúpiť?", hsize=56)

    B.slide_vs(f"{o}/02.png",
               "Toto pozná každý klubový manažér.",
               before="Prihláška, kópia rodného listu, podpis.|"
                      "Prepis do klubového excelu, potom do zväzu.|"
                      "Tri evidencie, tri šance na preklep.",
               after="Jedno zadanie v klubovej aplikácii.|"
                     "Údaje overené voči štátnemu registru.|"
                     "Klub aj zväz vidia to isté.")

    B.slide(f"{o}/03.png", "Meno sedí. Vždy.", badge="01",
            body="Systém overí dieťa voči štátnemu registru fyzických osôb.",
            ex_label="Čo to znamená pre klub",
            example="Žiadne „Hudák“ vs. „Hudak“ v troch systémoch.|"
                    "Žiadne telefonáty pred súťažou, či sedí dátum narodenia.")

    B.slide(f"{o}/04.png", "Rodič je súčasťou záznamu.", badge="02",
            body="Tomáš je maloletý — systém prepojí jeho záznam s otcom Petrom.",
            ex_label="Prakticky",
            example="Klub vie, kto smie podpisovať a koho kontaktovať pri úraze.|"
                    "Vzťah je v systéme, nie na papieri v šuplíku trénera.")

    B.slide(f"{o}/05.png", "Tri súhlasy. Každý zvlášť.", badge="03",
            body="Rodič presne vie, na čo súhlas dal.",
            ex_label="Otec Peter udelí",
            example="Registrácia do klubu — zmluvná, trvá počas členstva.|"
                    "Fotografie na web a sociálne siete — kedykoľvek odvolateľná.|"
                    "Anonymný výskum — bez mena, len štatistika.")

    B.slide(f"{o}/06.png", "Odvolanie súhlasu neruší registráciu.",
            ex_label="Konkrétne",
            example="Peter zruší súhlas s fotkami po zápase.|"
                    "Tomáš hrá ďalej — registrácia stojí na inom právnom základe.|"
                    "Klub dostane upozornenie, že fotky Tomáša už nesmie zverejniť.",
            hsize=52)

    B.slide(f"{o}/07.png", "Tomáš je registrovaný.", badge="04",
            ex_label="Vzniká jeden záznam",
            example="ŠK Tatran Spišská Nová Ves · basketbal · 5v5 · kategória U13|"
                    "Platnosť od 1. 9. 2026|"
                    "Rovnaký záznam vidí klub, zväz aj rodič.")

    B.slide(f"{o}/08.png", "Menej papierov. Viac tréningu.", accent=True,
            body="Administratíva, ktorú dnes robia tréneri a dobrovoľníci vo voľnom "
                 "čase, sa presunie na infraštruktúru.", hsize=60)

    B.slide(f"{o}/09.png", "Celý scenár aj s dátami je verejný.", cta=True,
            body="sportup.sk/priklady.html", hsize=56)


def R2(o):
    """R2 — Jedna osoba, štyri role. Scenár 03."""
    B.slide(f"{o}/01.png",
            "Martina má 34 rokov.",
            kicker="SportUp · časť 2 · v praxi",
            body="V dnešných systémoch športu existuje ako štyri rôzne osoby.",
            hsize=62)

    B.slide(f"{o}/02.png", "Profesionálna bežkyňa", badge="Rola 1",
            ex_label="Atletický klub",
            example="Trailový beh · aktívna od 2018")

    B.slide(f"{o}/03.png", "Trénerka mládeže", badge="Rola 2",
            ex_label="Bežecký klub",
            example="Práca s deťmi · trénerská licencia · od 2022")

    B.slide(f"{o}/04.png", "Dobrovoľníčka", badge="Rola 3",
            ex_label="Horský ultramaratón",
            example="Organizačný výbor · tri týždne v roku")

    B.slide(f"{o}/05.png", "Šachová rozhodkyňa", badge="Rola 4",
            ex_label="Šachový zväz",
            example="Úplne iný šport · iná organizácia · od 2020")

    B.slide_vs(f"{o}/06.png",
               "Štyri role. Koľko záznamov?",
               before="Štyri systémy, štyri neprepojené záznamy.|"
                      "Zmenu mena musí nahlásiť štyrikrát.|"
                      "Nikto nevie, koľko ľudí má viac rolí naraz.",
               after="Jedna osoba, štyri súbežné afiliácie.|"
                     "Zmena sa premietne všade naraz.|"
                     "Osoba je stabilná, rola je časovo ohraničená.")

    B.slide(f"{o}/07.png", "A systém vie aj toto.",
            ex_label="Konflikt záujmov",
            example="Keď má Martina rozhodovať zápas klubu, kde zároveň trénuje, "
                    "systém na to automaticky upozorní.",
            hsize=58)

    B.slide(f"{o}/08.png", "Osoba nie je definovaná svojou rolou.", accent=True,
            body="Identita oddelená od role je základný princíp architektúry — a "
                 "práve ľudia s viacerými rolami často držia lokálny šport pri živote.",
            hsize=54)

    B.slide(f"{o}/09.png", "Celý scenár aj s dátami je verejný.", cta=True,
            body="sportup.sk/priklady.html", hsize=56)


def R3(o):
    """R3 — Hotel overí športovca bez osobných údajov. Scenár 04."""
    B.slide(f"{o}/01.png",
            "Hotel ponúka 20 % zľavu registrovaným športovcom.",
            kicker="SportUp · časť 2 · v praxi",
            body="Ako si overí, že naozaj sú?", hsize=54)

    B.slide_vs(f"{o}/02.png",
               "Dnes to nejde overiť. Tak sa to neponúka.",
               before="Ukážte preukaz — ktorý každý zväz vydáva inak.|"
                      "Alebo potvrdenie z klubu na papieri.|"
                      "Alebo hotel benefit radšej neponúkne.",
               after="Hosť ukáže QR kód z mobilu.|"
                     "Recepcia dostane odpoveď áno / nie.|"
                     "Nič viac sa nedozvie — a ani nepotrebuje.")

    B.slide(f"{o}/03.png", "Športovec vygeneruje token.", badge="01",
            ex_label="V mobilnej aplikácii",
            example="Vznikne krátkodobý QR kód.|"
                    "Neobsahuje meno ani žiadny osobný údaj.")

    B.slide(f"{o}/04.png", "Recepcia naskenuje kód.", badge="02",
            ex_label="Certifikovaná aplikácia hotela sa pýta",
            example="Má táto osoba platnú športovú registráciu?")

    B.slide(f"{o}/05.png", "Odpoveď: áno.", badge="03",
            body="A to je všetko, čo sa hotel dozvie.", hsize=64)

    B.slide(f"{o}/06.png", "Čo hotel nevidí.",
            ex_label="Nedozvie sa nič z tohto",
            example="Meno. Dátum narodenia.|"
                    "Klub. Šport. Úroveň.|"
                    "Dostal iba „áno“.",
            hsize=58)

    B.slide(f"{o}/07.png", "A športovec vidí, kto sa jeho dát dotkol.",
            body="Každé overenie sa zapisuje do auditu.",
            ex_label="Prečo na tom záleží",
            example="Osoba si vie spätne pozrieť, ktoré subjekty a kedy sa na jej "
                    "status pýtali.", hsize=52)

    B.slide(f"{o}/08.png", "Takto sa šport a cestovný ruch prepájajú bezpečne.",
            accent=True,
            body="Reálny benefit pre športovca, reálny zákazník pre hotel — a nula "
                 "vyzradených osobných údajov.", hsize=52)

    B.slide(f"{o}/09.png", "Celý scenár aj s dátami je verejný.", cta=True,
            body="sportup.sk/priklady.html", hsize=56)


def R4(o):
    """R4 — Prevádzkovatelia športovísk a hál. Scenár 06."""
    B.slide(f"{o}/01.png",
            "Prevádzkujete halu, ihrisko alebo športové centrum?",
            kicker="SportUp · časť 2 · v praxi",
            body="Tento projekt je aj pre vás.", hsize=54)

    B.slide_vs(f"{o}/02.png",
               "Ako vás dnes ľudia nájdu?",
               before="Vlastný web, ktorý nikto nehľadá.|"
                      "Telefonát: a máte voľné v sobotu?|"
                      "Zväz o vašej hale nevie nič.",
               after="Jeden zápis v národnom katalógu.|"
                     "Nájde vás občan, turista aj zväz.|"
                     "Údaje spravujete vy — sú vždy platné.")

    B.slide(f"{o}/03.png", "Váš profil, ako ho vidí systém.", badge="01",
            ex_label="Mestská športová hala Žilina-Vlčince",
            example="Športy: volejbal, basketbal, hádzaná, florbal|"
                    "Povrch: športový parket 44 × 25 m · kapacita 1 800 divákov|"
                    "Bezbariérovosť: vozíček, indukčná slučka, parkovanie|"
                    "Zázemie: šatne, sprchy, bufet, zdravotník, wifi",
            hsize=54)

    B.slide(f"{o}/04.png", "A údaje, ktoré zaujímajú turistu.", badge="02",
            body="Jeden zápis slúži športu aj cestovnému ruchu.",
            ex_label="Tá istá hala, druhý pohľad",
            example="Zastávka MHD 120 m · 95 parkovacích miest|"
                    "Nabíjačky pre elektromobily · stojany na bicykle|"
                    "Ubytovanie v okolí: áno",
            hsize=56)

    B.slide(f"{o}/05.png", "Čo sa stane hneď po zápise.", badge="03",
            ex_label="Automaticky, bez ďalšej práce",
            example="Objavíte sa na verejnej mape športovísk.|"
                    "Zväzy vám môžu prideliť ligové zápasy.|"
                    "Rezervačné systémy môžu ponúkať vaše termíny.|"
                    "Turistické platformy vás môžu zobraziť.|"
                    "Mesto má podklad pre obstarávanie na údržbu.",
            hsize=54)

    B.slide(f"{o}/06.png", "Vaše podujatia na mape Slovenska.",
            body="Aktualizovaný kalendár = viac ľudí vo vašej hale.",
            ex_label="Zadáte turnaj — a stane sa toto",
            example="Rodičia v okolí ho nájdu vo vyhľadávaní podujatí.|"
                    "Penzióny a hotely vidia dopyt na daný víkend.|"
                    "Mesto vie, že sa v regióne niečo deje.",
            hsize=56)

    B.slide(f"{o}/07.png", "Prečo sa oplatí údaje udržiavať aktuálne.",
            ex_label="Aktuálny profil znamená",
            example="Zväz vás zaradí medzi možné dejiská súťaží.|"
                    "Turista vás nájde v destinácii, kde práve je.|"
                    "Samospráva vidí reálne využitie pri plánovaní investícií.",
            hsize=52)

    B.slide(f"{o}/08.png", "Zápis je zadarmo a dáta zostávajú vaše.",
            accent=True,
            body="Otvorený register, otvorené API, žiadny vendor lock-in.",
            hsize=56)

    B.slide(f"{o}/09.png", "Pozrite si katalóg športovísk.", cta=True,
            body="sportup.sk/portal.html", hsize=58)


def R5(o):
    """R5 — Mesto, obec a VÚC. Podklad: scenár 06 + portal.html."""
    B.slide(f"{o}/01.png",
            "Mesto dostavalo novú športovú halu.",
            kicker="SportUp · časť 2 · v praxi",
            body="Čo sa stane, keď ju zapíše do centrálneho katalógu?", hsize=56)

    B.slide(f"{o}/02.png", "Jeden zápis. Kompletný profil.",
            ex_label="Čo mesto zadá",
            example="Šport, povrch, rozmery, kapacita.|"
                    "Bezbariérovosť, parkovanie, dostupnosť MHD.|"
                    "Nabíjačky, stojany na bicykle, ubytovanie v okolí.",
            hsize=58)

    B.slide(f"{o}/03.png", "Päť použití z jedného zápisu.", badge="Efekt",
            ex_label="Bez ďalšej práce úradníka",
            example="Verejná mapa pre občana aj turistu.|"
                    "Zväzy môžu prideliť ligové zápasy.|"
                    "Rezervačné systémy ponúkajú termíny.|"
                    "Turistické platformy halu zobrazia.|"
                    "Podklad pre výročné hlásenie a obstarávanie na údržbu.",
            hsize=54)

    B.slide(f"{o}/04.png", "Ale hala je len začiatok.",
            body="Väčšina ľudí v obci nešportuje v hale. Beží po cyklotrase, chodí "
                 "do parku, pláva na obecnej plavárni.", hsize=58)

    B.slide(f"{o}/05.png", "A práve o tých mesto nemá dáta.",
            ex_label="Bez dát sa nedá",
            example="Rozhodnúť, kam investovať ďalšie euro.|"
                    "Obhájiť predĺženie cyklotrasy.|"
                    "Plánovať kapacity pre deti a seniorov.",
            hsize=54)

    B.slide_vs(f"{o}/06.png",
               "Ako sa dnes plánujú investície do športu?",
               before="Odhad. Skúsenosť. Politická dohoda.|"
                      "Čísla len od registrovaných klubov.|"
                      "O voľnočasovom športe nevie nikto nič.",
               after="Agregované, anonymné dáta o využití.|"
                     "Prehľad za obec, okres aj kraj.|"
                     "Investícia sa dá obhájiť číslami.")

    B.slide(f"{o}/07.png", "Anonymne. Vždy.", badge="GDPR",
            ex_label="Samospráva dostane agregáty, nie osoby",
            example="Koľko ľudí v území športuje a v akých kategóriách.|"
                    "Nikdy nie mená, kontakty ani konkrétne osoby.",
            hsize=60)

    B.slide(f"{o}/08.png", "Šport je dôvod, prečo ľudia prídu do regiónu.",
            accent=True,
            body="Turnaj naplní penzióny. Cyklotrasa priláka víkendových "
                 "návštevníkov. Pre samosprávu je šport aj nástroj cestovného ruchu.",
            hsize=52)

    B.slide(f"{o}/09.png", "Pozrite si verejný portál.", cta=True,
            body="sportup.sk/portal.html", hsize=58)


CAROUSELS = {
    # Otvárací príspevok
    "G1": ("G1-nielen-organizacie", G1),
    # Časť 1 — hodnota pre celú spoločnosť
    "P1": ("P1-portal", P1),
    "P2": ("P2-pyramida", P2),
    # Časť 2 — reálne použitia v praxi
    "R1": ("R1-rodic-klub", R1),
    "R2": ("R2-viac-roli", R2),
    "R3": ("R3-hotel-overenie", R3),
    "R4": ("R4-prevadzkovatel", R4),
    "R5": ("R5-samosprava", R5),
}


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    if only and only not in CAROUSELS:
        print(f"Neznámy carousel: {only}. Dostupné: {', '.join(CAROUSELS)}")
        return
    for cid, (folder, builder) in CAROUSELS.items():
        if only and cid != only:
            continue
        base = OUT / folder
        for fmt in ("square", "portrait"):
            d = base / fmt
            d.mkdir(parents=True, exist_ok=True)
            for old in d.glob("*.png"):
                old.unlink()
            B.set_format(fmt)
            builder(str(d))
            print(f"  {folder}/{fmt}: {len(list(d.glob('*.png')))} slidov")
        B.build_pdf(base / "square", base / f"{folder}-linkedin.pdf")
        print(f"  {folder}: PDF pre LinkedIn")


if __name__ == "__main__":
    main()
