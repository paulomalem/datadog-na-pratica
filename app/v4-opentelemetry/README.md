# v4-opentelemetry: um serviço com OpenTelemetry, outro com o SDK do Datadog

A v3, mas o `estoque-api` troca o dd-trace pelo **OpenTelemetry** (SDK Node, exportação OTLP). O `pedidos-api` continua com dd-trace. Mostra as duas instrumentações num mesmo trace. Depois desta versão, voltamos para o dd-trace.

Para comparar com a versão anterior: `diff -r app/v3-apm-ddtrace app/v4-opentelemetry`

| O que muda | Onde |
|---|---|
| `otel.js` (SDK do OpenTelemetry + exportador OTLP/HTTP) no lugar do `dd.js` | `estoque-api/src/infrastructure/tracing/` |
| Dependências `@opentelemetry/*` no lugar do `dd-trace` | `estoque-api/package.json` |
| `OTEL_SERVICE_NAME`, `OTEL_RESOURCE_ATTRIBUTES`, `OTEL_EXPORTER_OTLP_ENDPOINT` (o Agent do nó, porta 4318) | `kubernetes/v4/estoque-api.yaml` |

O Agent precisa do receptor OTLP aberto (`datadog/v4-otel.yaml`). O Collector está em `kubernetes/v4/collector/`.

**Atenção ao `trace_id` nos logs do `estoque-api`:** com OpenTelemetry ele sai em hexadecimal (32 caracteres), e o Datadog espera o formato decimal do dd-trace. A correlação automática entre log e trace do `estoque-api` vale só na v3.

## Atenção: o nome da operação muda (`express.request` vira `http.server.request` e depois `opentelemetry_instrumentation_http.server`)

Ao trocar o tracer do `estoque-api`, o span de entrada do serviço passa a ter outro nome, e as métricas de APM mudam junto:

| Caminho | Operação (span de entrada) | Métricas de requests e erros |
|---|---|---|
| dd-trace (v3) | `express.request` | `trace.express.request.hits` e `trace.express.request.errors` |
| OpenTelemetry → **Agent** | `http.server.request` | `trace.http.server.request.hits` e `trace.http.server.request.errors` |
| OpenTelemetry → **Collector** com Datadog Connector | `opentelemetry_instrumentation_http.server` | `trace.opentelemetry_instrumentation_http.server.hits` e `.errors` |

O que isso causa:

- Na página do serviço (**APM > Services > `estoque-api`**), os gráficos de **Requests** e **Errors** mostram a operação selecionada. Depois da troca, o seletor **Operation** continua em `express.request`, que não recebe mais dados, e os gráficos aparecem vazios. Troque para a operação do seu caminho (`http.server.request` com o Agent, `opentelemetry_instrumentation_http.server` com o Collector). Os dados estão chegando.
- Dashboards, monitores e SLOs que usam `trace.express.request.*` do `estoque-api` ficam sem dados e precisam apontar para `trace.http.server.request.*`.
- O **`pedidos-api` não é afetado**: ele continua com dd-trace e com a operação `express.request`.

## Como implantar

```bash
(cd kubernetes && ./deploy-v4.sh)
```

## O Collector não substitui tudo o que o Agent faz

Quando o `estoque-api` envia ao Collector (`kubernetes/v4/collector/`), para a página do serviço ter Requests e Errors o Collector precisa do **Datadog Connector** (`connectors: datadog/connector` e um pipeline `metrics` que o recebe). Sem ele, os spans chegam, mas as métricas de APM não. Os spans que passam pelo Collector também chegam sem as tags de infraestrutura que o Agent acrescenta (como `pod_name`).

Documentação: https://docs.datadoghq.com/opentelemetry/setup/collector_exporter/datadog_exporter/
