# v3-apm-ddtrace: a aplicação com APM (SDK do Datadog)

A v2 instrumentada com o **dd-trace** (o SDK do Datadog).

Para comparar com a versão anterior: `diff -r app/v2-integracoes-metricas-tags app/v3-apm-ddtrace`

| O que muda | Onde |
|---|---|
| `tracing/` (novo): `dd.js` inicializa o dd-trace, `index.js` o exporta. Carregado **antes de qualquer outra biblioteca** | `*/src/infrastructure/tracing/`, primeira linha do `main.js` |
| `trace_id` nos logs: JSON no `pedidos-api`; texto `trace=<id>` no `estoque-api` (usado na aula de Grok) | `createLogger.js`, `LegacyLogger.js` |
| Tags customizadas também no **span** (`customer.id`, `operation`, `region`) | `createOrder.js` (`annotateSpan`) |
| `serviceName` vem de `DD_SERVICE`; `/health` informa o tracer | `config.js`, `healthRoutes.js` |
| Cenário de memória (`/scenarios/memory`) para o Continuous Profiler | `pedidos-api` |
| Dependência `dd-trace` | `package.json` |

## Como implantar

```bash
(cd kubernetes && ./deploy-v3.sh)
```
