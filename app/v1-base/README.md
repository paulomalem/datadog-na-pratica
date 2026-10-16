# v1-base: a aplicação, sem nada do Datadog

A loja funcionando: `loja-web` → `pedidos-api` → `estoque-api`, cada API com o seu PostgreSQL, e o `gerador-carga` fazendo requisições o tempo todo.

**Não há uma linha de Datadog aqui**: nem no código, nem nos manifests, nem nas variáveis de ambiente, nem nos labels. É de propósito. O Datadog Agent é instalado no cluster separadamente (pasta `datadog/`), e mesmo assim, só pelo ecossistema do Kubernetes, o Datadog já recebe métricas de infraestrutura, de containers e logs.


## Como rodar

- **No computador, sem Kubernetes:** `docker compose --profile load up -d --build` (nesta pasta).
- **No Kubernetes (Kind):** a partir da raiz do repositório, `./kubernetes/deploy-v1.sh` (os manifests ficam em `kubernetes/v1/`). Veja o README da raiz.

## O que tem aqui

| Pasta ou arquivo | Conteúdo |
|---|---|
| `loja-web/`, `pedidos-api/`, `estoque-api/`, `gerador-carga/` | Os 4 serviços |
| `docker-compose.yml` | Teste local, só nesta versão |

## Código das APIs (Clean Architecture)

```
src/
  main.js                  composition root: único lugar que liga todas as camadas
  config.js                configuração lida do ambiente
  domain/                  regras de negócio e erros de domínio (sem framework, sem banco)
  application/             casos de uso (um arquivo por caso) e as portas (ports.js)
  infrastructure/          adaptadores: postgres/, http/, logging/, context/
  interface/http/          Express: createApp, routes/, middlewares/, docs/ (Swagger)
test/                      testes dos casos de uso, sem banco e sem HTTP (npm test)
```

## Logs

- `pedidos-api`: JSON, com `service` e `request_id`.
- `estoque-api`: texto livre "legado", de propósito, para praticar o Grok Parser: `2026-10-08 14:17:09,073 INFO  [estoque] req=<request_id> mensagem`.

## Cenários e Swagger

As duas APIs têm Swagger em `/docs`. Os cenários (N+1, consulta lenta, erro, CPU) estão descritos no Swagger do `pedidos-api`.
