# v5-final: a versão final da aplicação

A v3 de volta (o **dd-trace**, SDK do Datadog, nas **duas** APIs), com tudo ligado. É a versão usada do tópico "Ambiente final e Datadog com Claude Code" até o fim do curso.

Para ver o que muda em relação à v3: `diff -r app/v3-apm-ddtrace app/v5-final` (só a versão padrão, `5.0.0`).

| Onde | O que tem |
|---|---|
| `app/v5-final/` | As 4 aplicações, iguais à v3: dd-trace, `trace_id` nos logs, tags customizadas nos spans e logs, métricas DogStatsD, cenários (inclusive `/scenarios/memory`) |
| `kubernetes/v5/` | Imagens `:v5`, versão `5.0.0`; nas APIs, `DD_PROFILING_ENABLED=true` e `DD_RUNTIME_METRICS_ENABLED=true` |
| `kubernetes/kind-config-v5.yaml` | Cluster `lab-datadog` com control-plane + 1 worker (o Agent roda só no worker) |
| `datadog/v5.yaml` | Agent completo (logs, APM, DogStatsD, NPM e Postgres), num arquivo só |

## Como subir do zero

```bash
kind create cluster --config kubernetes/kind-config-v5.yaml
(cd kubernetes && ./deploy-v5.sh)
# depois: namespace datadog, Secrets datadog-secret e postgres-monitoring, e o helm com datadog/v5.yaml (veja datadog/README.md)
```
