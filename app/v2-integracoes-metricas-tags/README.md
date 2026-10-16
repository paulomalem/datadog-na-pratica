# v2-integracoes-metricas-tags: integração do Postgres, métricas e tags

A v1 mais a integração do Postgres, métricas customizadas e tags. **Ainda sem tracer**: o APM só entra na v3.

Para comparar com a versão anterior: `diff -r app/v1-base app/v2-integracoes-metricas-tags`

| O que muda | Onde |
|---|---|
| Métricas customizadas com DogStatsD (`hot-shots`): `lab.orders.created`, `lab.orders.processing_ms`, `lab.orders.in_flight`, `lab.stock.reservations`, `lab.stock.reserve_ms` | `*/src/infrastructure/metrics/`, `createOrder.js`, `reserveStock.js`, `config.js`, `main.js`, `package.json` |
| Labels de Unified Service Tagging (`tags.datadoghq.com/env`, `service`, `version`) e `DD_ENV`, `DD_SERVICE`, `DD_VERSION`, `DD_AGENT_HOST` | `kubernetes/v2/*.yaml` (compare com `kubernetes/v1/`) |
| Tags customizadas nos logs do `pedidos-api`: `customer_id` (fictício), `operation`, `region` | `pedidos-api/src/application/createOrder.js` |
| Usuário `datadog` e annotation de Autodiscovery nos 2 PostgreSQL | `db/*/datadog.sql`, `kubernetes/v2/*-db.yaml` |

Sem `DD_AGENT_HOST` (Docker Compose, por exemplo) o cliente de métricas vira "mock" e nada é enviado.

## Como implantar

```bash
(cd kubernetes && ./deploy-v2.sh)
```

O Agent precisa estar com o DogStatsD aberto (`datadog/v3-dogstatsd.yaml`).

## Métricas customizadas desta versão

São 5 métricas, enviadas por **DogStatsD** (UDP, porta 8125 do Agent do nó). Todas levam as tags `env`, `service` e `version`.

| Métrica | Tipo | O que mede | Tags extras | Onde está no código |
|---|---|---|---|
| `lab.orders.created` | count | Pedidos finalizados, por resultado | `status` (`confirmed` ou `failed`) | `pedidos-api/src/application/createOrder.js` |
| `lab.orders.processing_ms` | distribution | Tempo para criar o pedido (banco + estoque), em ms | `status` | `createOrder.js` |
| `lab.orders.in_flight` | gauge | Pedidos em andamento neste instante | nenhuma | `createOrder.js` |
| `lab.stock.reservations` | count | Reservas de estoque, por SKU e resultado | `sku`, `result` (`ok`, `insufficient` ou `error`) | `estoque-api/src/application/reserveStock.js` |
| `lab.stock.reserve_ms` | distribution | Tempo da reserva no estoque, em ms | `result` | `reserveStock.js` |

As métricas ficam no bloco `finally` dos casos de uso, então saem **sempre**, com sucesso ou com erro.

### Queries para o Metrics Explorer

Cole cada query em **Metrics > Explorer** (no campo de consulta, no modo de texto).

**Pedidos (`lab.orders.created`)**

| Pergunta | Query |
|---|---|
| Quantidade de pedidos por status | `sum:lab.orders.created{env:dev} by {status}.as_count()` |
| Pedidos por minuto | `sum:lab.orders.created{*}.as_count().rollup(sum, 60)` |
| Taxa de falha (%) | `a = sum:lab.orders.created{status:failed}.as_count()` e `b = sum:lab.orders.created{*}.as_count()`; fórmula: `a / b * 100` |

**Tempo de processamento do pedido (`lab.orders.processing_ms`)**

| Pergunta | Query |
|---|---|
| Pedido que falha é mais rápido ou mais lento? | `lab.orders.processing_ms{*} by {status}` |
| Pior caso de processamento de pedidos (em ms) | `max:lab.orders.processing_ms{*}` |

**Pedidos em andamento (`lab.orders.in_flight`)**

| Pergunta | Query |
|---|---|
| O serviço enfileira? | `max:lab.orders.in_flight{*}` |
| Pico por minuto | `max:lab.orders.in_flight{*}.rollup(max, 60)` |

**Reservas de estoque (`lab.stock.reservations`)**

| Pergunta | Query |
|---|---|
| Reservas por resultado | `sum:lab.stock.reservations{*} by {result}.as_count()` |
| Quais são os 5 SKUs mais vendidos? | `top(sum:lab.stock.reservations{result:ok} by {sku}.as_count(), 5, 'sum', 'desc')` |
| Erros no estoque (cerca de 3% das reservas são programadas para falhar) | `sum:lab.stock.reservations{result:error}.as_count()` |

**Tempo da reserva (`lab.stock.reserve_ms`)**

| Pergunta | Query |
|---|---|
| O estoque está lento? | `lab.stock.reserve_ms{*} by {result}` |
