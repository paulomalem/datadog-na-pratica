<div align="center">

# Datadog na Prática: Observabilidade Completa com Aplicação Real

### Material de apoio · Comandos práticos · Manifestos Kubernetes · Dashboards e Monitors

[![Udemy](https://img.shields.io/badge/Udemy-Acessar%20o%20Curso-A435F0?style=for-the-badge&logo=udemy&logoColor=white)](https://www.udemy.com/user/paulo-alem/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-paulomalem-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/paulomalem)
[![Datadog](https://img.shields.io/badge/Datadog-632CA6?style=for-the-badge&logo=datadog&logoColor=white)](https://www.datadoghq.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-000000?style=for-the-badge&logo=opentelemetry&logoColor=white)](https://opentelemetry.io)

</div>

---

## Sobre o curso

Este repositório contém todo o material prático do curso: os comandos utilizados em aula, os manifestos Kubernetes, a configuração do Datadog Agent, os dashboards e monitores em JSON e a aplicação que evoluímos ao longo das aulas.

A aplicação é o **Lab Loja Datadog**, uma loja simples feita para gerar dados de observabilidade: o site chama a API de pedidos, que chama a API de estoque, e cada API tem o seu banco PostgreSQL.

```
loja-web ──► pedidos-api ──► estoque-api
                │                │
           pedidos-db        estoque-db
```

O objetivo é que você possa reproduzir cada aula no seu próprio cluster Kind e sair sabendo monitorar uma aplicação de ponta a ponta no Datadog: infraestrutura, métricas, logs, APM, OpenTelemetry, dashboards, monitors e SLOs.

---

## Pré-requisitos

- Docker instalado e funcionando (com Compose)
- Git, Node, `kubectl`, Kind e Helm (as versões estão na seção 1 do [COMANDOS.md](COMANDOS.md))
- Uma conta Datadog (o período de teste gratuito serve)
- Cerca de 8 GB de RAM livres para o cluster
- Familiaridade básica com terminal. Não é necessário conhecimento prévio de Datadog

---

## Estrutura do repositório

| Pasta ou arquivo | Conteúdo |
|---|---|
| [`app/`](app) | As versões da aplicação (v1 a v5), cada uma com os 4 serviços, os Dockerfiles e, na v1, o Docker Compose |
| [`kubernetes/`](kubernetes) | Configuração do cluster Kind, os manifestos de cada versão (`v1/` a `v5/`) e os scripts `deploy-vN.sh` |
| [`db/`](db) | SQL de inicialização dos bancos (usado pelo Compose e pelo Kubernetes) e o SQL do usuário do Datadog |
| [`datadog/`](datadog) | Valores do Helm do Agent por fase do curso, dashboards e monitors em JSON |
| [`COMANDOS.md`](COMANDOS.md) | Todos os comandos usados em aula, agrupados por assunto |
| [`PROMPTS-CLAUDE.md`](PROMPTS-CLAUDE.md) | Os prompts usados com o Claude e o MCP do Datadog |
| [`arch.drawio`](arch.drawio) | Diagrama de arquitetura |
| [`.env.example`](.env.example) | Modelo do `.env` (só valores fictícios) |

Cada serviço da aplicação tem Swagger em `/docs` e segue Clean Architecture.

---

## Como usar

```bash
# 1. Clone o repositório
git clone https://github.com/paulomalem/datadog-na-pratica
cd datadog-na-pratica

# 2. Crie o seu .env e preencha DD_API_KEY e DD_SITE
cp .env.example .env

# 3. Suba a aplicação (Docker Compose, na v1)
cd app/v1-base
docker compose --profile load up -d --build
```

Depois abra `http://localhost:8080` (site), `http://localhost:8081/docs` (Swagger do `pedidos-api`) e `http://localhost:8082/docs` (Swagger do `estoque-api`).

Para rodar no Kubernetes (Kind), instalar o Agent e acompanhar cada aula, use o [COMANDOS.md](COMANDOS.md). Rode sempre os comandos a partir da **raiz do repositório**.

> A API Key do Datadog fica **só** no `.env`, que o `.gitignore` bloqueia. Nunca coloque a chave em arquivo versionado.

---

<div align="center">

**Paulo Mentone Alem** · Cloud & Solution Architect · Instrutor Técnico

[![LinkedIn](https://img.shields.io/badge/LinkedIn-paulomalem-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/paulomalem)
[![Website](https://img.shields.io/badge/Site-paulomalem.com.br-1A3ED7?style=flat-square&logo=google-chrome&logoColor=white)](https://paulomalem.com.br)
[![CKA](https://img.shields.io/badge/CKA-Certified_Kubernetes_Administrator-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://paulomalem.com.br)

</div>
