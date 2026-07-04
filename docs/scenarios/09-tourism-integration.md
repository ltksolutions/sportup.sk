# Scenár 09 — Dáta pre cestovný ruch (TIC integrácia)

## Východisko

**Turistické informačné centrum (TIC) Vysoké Tatry** a oblastná organizácia cestovného ruchu **OOCR Región Vysoké Tatry** chcú vo svojich aplikáciách zobrazovať športovú infraštruktúru a verejné športové podujatia v regióne — pre návštevníkov, ktorí hľadajú aktívnu dovolenku. Na to čítajú dáta zo SportUp cez **otvorené API** a účely kategórie `TUR-*`. Nadväzujúce komerčné služby (hotely, penzióny) môžu ponúknuť ubytovanie v okolí.

Scenár ukazuje, že oficiálnym konzumentom dát je aj **cestovný ruch** (TIC, OOCR, samospráva) a **komerčné subjekty** — a že tá istá evidencia športovísk a podujatí slúži športu aj turizmu s rôznymi právnymi základmi.

## Aktéri

- **TIC Vysoké Tatry** (Organization — turistické informačné centrum, `organization_id: tic-tatry-uuid`)
- **OOCR Región Vysoké Tatry** (Organization — oblastná organizácia cestovného ruchu, `organization_id: oocr-tatry-uuid`)
- **Aplikácia VisitTatry-app** (certifikovaná aplikácia, scope `read:public_facilities`, `read:public_events`)
- **Hotel Grand Jasná, Penzión Tatry** (komerčné subjekty — nadväzujúce služby)
- **Facilities/Events dáta** — verejné dáta zo SportUp (otvorené dáta, CC-BY)

## Cieľ

1. TIC/OOCR čítajú verejný katalóg športovísk a podujatí cez otvorené API.
2. Dáta sú anonymné/verejné — žiadne PII účastníkov.
3. Komerčné subjekty môžu nadviazať na lokalitu (ubytovanie, služby).
4. Ukázať dvojaký právny základ tej istej dátovej položky.

## Kroky

### Krok 1: TIC číta verejný katalóg športovísk v regióne

```http
GET /v1/public/facilities?region=SK-PO&tourism=true&sport=SK-ATH HTTP/1.1
Authorization: Bearer <token VisitTatry-app, scope read:public_facilities>
Accept: application/json
```

```json
{
  "facilities": [
    {
      "facility_id": "fac-tatry-trail-uuid",
      "name_sk": "Tatranský bežecký okruh Štrbské Pleso",
      "facility_type": "bezecky_areal",
      "supported_sports": ["SK-ATH", "SK-BTL"],
      "public_access": "free",
      "tourism": {
        "nearby_accommodation": true,
        "public_transport_stop_m": 200,
        "difficulty": "medium",
        "elevation_gain_m": 320
      },
      "purpose": "TUR-KATALOG-001"
    }
  ]
}
```

### Krok 2: TIC číta kalendár verejných podujatí

```http
GET /v1/public/events?region=SK-PO&from=2026-07-01&to=2026-09-30 HTTP/1.1
Authorization: Bearer <token VisitTatry-app, scope read:public_events>
Accept: application/json
```

```json
{
  "events": [
    {
      "event_id": "evt-tatry-ultra-uuid",
      "name_sk": "Tatry Ultra Trail 2026",
      "sport_code": "SK-ATH", "discipline_code": "SK-ATH-TRAIL",
      "dates": { "from": "2026-08-15", "to": "2026-08-17" },
      "facility_id": "fac-tatry-trail-uuid",
      "public": true,
      "spectator_access": "free",
      "purpose": "TUR-PODUJATIE-001",
      "data_form": "public_no_participant_pii"
    }
  ]
}
```

Kalendár obsahuje verejné podujatia — **žiadne osobné údaje účastníkov** (tie sú chránené inými účelmi a nie sú v `TUR-*` scope).

### Krok 3: MCP agentická integrácia pre plánovač pobytu

Väčšia turistická platforma môže použiť certifikovaný MCP server `tourism-mcp` na zostavenie športového itinerára:

```jsonc
// MCP tool call — tourism-mcp (scope: read:public_facilities, read:public_events)
{
  "tool": "build_active_holiday",
  "arguments": {
    "region_code": "SK-PO",
    "interests": ["SK-ATH", "SK-CYK"],
    "date_range": { "from": "2026-08-14", "to": "2026-08-18" }
  }
}
```

```json
{
  "result": {
    "facilities": [ /* bežecké a cyklo areály */ ],
    "events": [ /* Tatry Ultra Trail */ ],
    "nearby_accommodation_available": true,
    "data_form": "public_no_pii"
  }
}
```

### Krok 4: Nadväzujúce komerčné služby

Hotely/penzióny (samostatné certifikované subjekty) môžu na lokalitu športoviska nadviazať ponuku ubytovania — cez účel `TUR-SLUZBA-001` a s vlastným súhlasovým rámcom. SportUp im poskytne len verejné dáta o lokalite, nie údaje o osobách.

## Side effects

### Projekcie (read-only pre TIC/OOCR)

| Projekcia | Použitie |
|---|---|
| `public_facility_map` | Zdroj pre turistické mapy |
| `public_events_calendar` | Zdroj pre kalendár podujatí |
| `tourism_facilities` | Vrstva s dostupnosťou a mobilitou |

TIC/OOCR **nezapisujú** — majú len read scope. Zápis robia oficiálne zdroje (mestá, zväzy, organizátori).

### Audit prístupu

Prístup certifikovaných turistických aplikácií sa loguje pre transparentnosť a prípadné kvóty (`organization_api_usage`).

## Edge cases

### Pokus o čítanie neverejných dát

Ak VisitTatry-app požiada o endpoint mimo verejného scope (napr. `/v1/persons/...`), policy engine vráti `403 Forbidden` — turistický scope nikdy nedáva prístup k osobám.

### Podujatie s obmedzeným prístupom

Ak organizátor označí podujatie ako neverejné (`public: false`), nezobrazí sa v `TUR-PODUJATIE-001` kalendári, aj keď existuje v systéme.

### Šport s viacerými odvetviami v turistickom filtri

Pri filtrovaní podľa športu s viacerými odvetviami (napr. Cyklistika → cestná, horská, BMX) môže turista chcieť len horskú — filter podporuje `discipline_code`, takže sa zobrazia len relevantné areály/podujatia.

### Zmena verejného dáta sa premietne konzumentom

Ak mesto aktualizuje športovisko (napr. `FacilitySuspended` pri rekonštrukcii), turistické platformy s webhookom dostanú notifikáciu a stiahnu/označia záznam — dáta ostávajú konzistentné naprieč zdrojmi.

## Test data

`data/scenarios/09-tourism-integration/`:

```
fixtures.json    ← verejné športovisko + verejné podujatie + TIC/OOCR certifikované appky
expected.json    ← odpovede public/facilities a public/events (bez PII)
events.json      ← žiadne write eventy (read-only scenár); len audit prístupu
```

## Status

- [x] Obsah doplnený
- [ ] Review
- [ ] Schválené

## Referencie

- [`../gdpr/purposes/TUR-tourism.md`](../gdpr/purposes/TUR-tourism.md) — TUR-* účely
- [`../domain/entities/facility.md`](../domain/entities/facility.md) — dvojaká použiteľnosť
- [`../api/README.md`](../api/README.md) — verejné (otvorené dáta) endpointy
- [`../mcp/README.md`](../mcp/README.md) — tourism-mcp
- [`06` registrácia športoviska](06-facility-registration.md) — odkiaľ dáta pochádzajú
