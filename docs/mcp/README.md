# MCP servery

> [Model Context Protocol](https://modelcontextprotocol.io) je otvorený štandard pre integráciu LLM agentov so systémami. SportUp poskytuje sadu MCP serverov, cez ktoré môžu agenti pristupovať k dátam a operáciám.

## Princíp

MCP servery exponujú **rovnaké schopnosti ako REST API**, ale v štruktúrovanej forme vhodnej pre LLM agentov:

- **Tools** — operácie, ktoré agent môže volať (napr. `find_athlete`, `register_player`)
- **Resources** — dátové prvky, ktoré agent môže čítať (napr. zoznam športov)
- **Prompts** — preddefinované workflow templates

**Dôležité:** MCP nesmie byť "zadný vchod". Rovnaká autorizácia, rovnaký policy engine, rovnaké audit ako pre REST API.

## Servery

```
mcp/
├── README.md
├── architecture.md       ← spoločná architektúra serverov
├── authentication.md     ← OAuth2 cez MCP
├── servers/
│   ├── persons.md        ← mcp-sport-persons
│   ├── affiliations.md   ← mcp-sport-affiliations
│   ├── qualifications.md ← mcp-sport-qualifications
│   ├── activities.md     ← mcp-sport-activities
│   ├── facilities.md     ← mcp-sport-facilities
│   ├── statistics.md     ← mcp-sport-statistics
│   ├── catalogs.md       ← mcp-sport-catalogs
│   └── tourism.md        ← mcp-sport-tourism (cestovný ruch)
└── examples/
    ├── union-workflow.md     ← agent pre zväz
    ├── club-workflow.md      ← agent pre klub
    └── research-workflow.md  ← agent pre výskum
```

## Katalóg serverov

| Server | Tools | Resources | Použitie |
|---|---|---|---|
| `mcp-sport-persons` | search_person, get_person, register_person, verify_with_rfo | persons://{id} | Identita a deduplikácia |
| `mcp-sport-affiliations` | list_affiliations, register_affiliation, transfer_athlete, suspend, terminate | affiliations://{id} | Vzťahy osôb a klubov |
| `mcp-sport-qualifications` | list_qualifications, issue_qualification, renew, check_validity | qualifications://{id} | Licencie |
| `mcp-sport-activities` | search_activities, register_activity | activities://{id} | Súťaže a podujatia |
| `mcp-sport-facilities` | search_facilities, get_availability, reserve | facilities://{id} | Športoviská |
| `mcp-sport-statistics` | aggregate, demographic_query | — | Anonymizované štatistiky |
| `mcp-sport-catalogs` | list_sports, list_disciplines, list_roles | catalogs://{name} | Číselníky |
| `mcp-sport-tourism` | search_tourism_facilities, find_events_in_region | — | Cestovný ruch |

## Príklad: mcp-sport-affiliations

### Tool: `find_athletes`

```yaml
name: find_athletes
description: |
  Vyhľadá športovcov podľa kritérií. Vracia zoznam afiliácií,
  nie kompletné profily — pre detailný profil osoby použite
  mcp-sport-persons:get_person.

input_schema:
  type: object
  properties:
    sport_code:
      type: string
      description: "Kód športu, napr. SK-FTB"
    discipline_code:
      type: string
    organization_id:
      type: string
      format: uuid
    age_range:
      type: object
      properties:
        min: {type: integer}
        max: {type: integer}
    gender:
      type: string
      enum: [male, female, other]
    is_active:
      type: boolean
      default: true
  required: [sport_code]

output_schema:
  type: object
  properties:
    athletes:
      type: array
      items:
        $ref: "#/definitions/AffiliationSummary"
    total: {type: integer}
    has_more: {type: boolean}
```

### Tool: `transfer_athlete`

```yaml
name: transfer_athlete
description: |
  Iniciuje prestup športovca z jedného klubu do druhého.
  Spustí sagu — nasleduje workflow s viacerými krokmi.
  Nevracia okamžitý výsledok; pre stav volajte get_transfer_status.

input_schema:
  type: object
  properties:
    person_id:
      type: string
      format: uuid
    from_organization_id:
      type: string
      format: uuid
    to_organization_id:
      type: string
      format: uuid
    sport_code:
      type: string
    effective_date:
      type: string
      format: date
    reason:
      type: string
      enum: [career_move, voluntary, contract_end, other]
  required: [person_id, from_organization_id, to_organization_id, sport_code, effective_date]

output_schema:
  type: object
  properties:
    correlation_id: {type: string}
    status: {type: string, enum: [pending, in_progress]}
    expected_completion_at: {type: string, format: date-time}
```

## Autentifikácia MCP

Klient (Claude Desktop, custom agent, Anthropic API) sa autentifikuje cez:

1. **OAuth2 Bearer token** v MCP request header
2. **Klientský certifikát** (mTLS) pre vyšší trust level
3. Token musí mať príslušné scopes pre operáciu

```http
POST /mcp/v1 HTTP/1.1
Host: mcp.sportup.sk
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "find_athletes",
    "arguments": {...}
  },
  "id": 1
}
```

## Policy enforcement v MCP

Každé tool volanie prechádza rovnakým policy engine ako REST API. Pri zlyhaní:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32603,
    "message": "Forbidden: consent_missing",
    "data": {
      "purpose_code": "REG-SPORTOVEC-001",
      "person_id": "550e8400-...",
      "remediation": "Get consent first via tool 'request_consent'"
    }
  },
  "id": 1
}
```

## Príklady použitia agentmi

### Workflow: Klubový agent

Agent pomáha klubovému admin-ovi spravovať členskú bázu.

```
Používateľ: "Pridaj nového hráča Petra Nováka, narodený 15. 3. 2010, do U16 tímu"

Agent (interne):
  1. mcp-sport-persons:search_person({given_name: "Peter", family_name: "Novák", date_of_birth: "2010-03-15"})
     → existuje
  2. mcp-sport-catalogs:get_category({sport: "SK-FTB", code: "U16"})
  3. mcp-sport-affiliations:register_affiliation({
       person_id, organization_id, role_code: "amatersky_sportovec",
       sport_code: "SK-FTB", category_code: "SK-FTB-U16", ...
     })
  4. Vráti potvrdenie a registračné číslo
```

### Workflow: Výskumník

```
Používateľ: "Aké je vekové rozdelenie aktívnych futbalistiek
v Bratislavskom kraji?"

Agent:
  1. mcp-sport-statistics:aggregate({
       sport: "SK-FTB",
       gender: "female",
       region: "BA",
       group_by: "age_bucket",
       only_active: true
     })
  2. Vráti agregát (anonymizovaný, k-anonymity guarantee)
```

Detail v [`examples/`](examples/).

## Implementačné poznámky

- Server postavený nad **MCP TypeScript SDK** alebo Python SDK
- Spoločná podstata cez shared library (autentifikácia, policy, logging)
- Každý server samostatný proces / pod
- Rate limiting per token cez Redis
- Audit log identický s REST

## Referencie

- [Model Context Protocol specifikácia](https://modelcontextprotocol.io)
- [`../api/README.md`](../api/README.md) — REST API ekvivalent
- [`../architecture/policy-engine.md`](../architecture/policy-engine.md)
