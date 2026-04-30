# Operations

> Prevádzka, monitoring, deployment, code style. Tento adresár sa naplní detailami v priebehu fázy 1 implementácie — aktuálne obsahuje princípy a TODO.

## Plánovaný obsah

```
operations/
├── README.md            ← ste tu
├── deployment.md        ← Kubernetes manifesty, Helm charts, CI/CD
├── monitoring.md        ← Prometheus, Grafana, Loki, alerting rules
├── security.md          ← Bezpečnostné prevádzkové pravidlá
├── disaster-recovery.md ← Backup, restore, RPO/RTO procesy
├── incident-response.md ← Runbooks pre incidenty
├── code-style.md        ← Konvencie, linter pravidlá, ADR pre kód
├── testing.md           ← Test stratégia, fixture management
└── runbooks/
    ├── ...              ← Runbook per typ incidentu
```

## Princípy prevádzky

1. **Cattle, not pets** — žiadne unique servery. Všetko v Kubernetes / Nomad.
2. **GitOps** — jediný zdroj pravdy je git, deploy cez ArgoCD / Flux.
3. **Observability first** — pred nasadením do produkcie musí mať každý service logy, metriky a tracing.
4. **Postmortems bez viny** — každý incident má post-mortem, žiadne pranierovanie.
5. **Žiadny SSH na produkčné nody** — všetko cez kubectl / API; SSH len ako break-glass.
6. **Capacity planning kvartálne** — load test pre 2× aktuálnu špičku.

## Plánované nasadenie

- **Primárny región:** Slovensko (datacenter v EÚ — predbežne dohoda s Slovenskom Digital alebo komerčným hosterom)
- **Sekundárny / DR:** EU-Central (Frankfurt alebo Dublin)
- **Multi-AZ** v rámci regiónu pre HA
- **Active-Passive** medzi regiónmi (failover do 2h)

## Monitoring stack (plánovaný)

| Komponent | Funkcia |
|---|---|
| **Prometheus** | Metriky (RED, USE) |
| **Grafana** | Dashboards |
| **Loki** | Logy s query |
| **Tempo / Jaeger** | Distributed tracing |
| **Alertmanager** | Alerty cez Slack, PagerDuty, e-mail |
| **Sentry** | Aplikačné chyby |

## SLO targets

| Service | SLO |
|---|---|
| API availability (čítanie) | 99.9 % rolling 30d |
| API availability (zápis) | 99.5 % rolling 30d |
| API latency p95 | < 200 ms |
| Auth latency p95 | < 100 ms |
| Webhook delivery | 99.5 % do 60s |
| Audit log write | 100 % (alebo žiadne API volanie nesmie prejsť) |

## Backup stratégia

- **MongoDB** — snapshot každú hodinu, replikový set across-AZ
- **Event store** — replikuje sa do read-only archívu
- **Audit log** — denný export do object storage s Object Lock
- **KMS kľúče** — escrowed cez Anthropic-style threshold scheme
- **Recovery testing** — kvartálne obnovenie zo zálohy v sandbox-e

## Plánované runbooky

V priebehu fázy 1 budeme pridávať runbooky pre:

- **Auth service down** — fallback, recovery
- **MongoDB primary failover**
- **ÚPVS výpadok** — degraded mode pre Identity Broker
- **Token compromise** — masívne revokácia
- **Data leak suspicion** — containment
- **DDoS** — mitigation
- **Bulk import failure** — rollback
- **Saga stuck** — manuálna intervencia

## Code style (predbežne)

- TypeScript strict mode
- Prettier + ESLint
- Conventional Commits
- Žiaden `any` bez komentára
- Test coverage minimum 80 %
- Code review povinný pre každý merge

Detail bude v [`code-style.md`](code-style.md) keď začneme implementáciu.
