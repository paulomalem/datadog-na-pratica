# Comandos usados

Todos os comandos usados no curso, agrupados por assunto. Rode tudo a partir da **raiz deste repositório**. Nas gravações usamos o **Git Bash**, no Windows.


---

## 1. Ferramentas e versões

```bash
git --version
docker --version
docker compose version
node --version
npm --version
kubectl version --client
kind --version
helm version --short

cat .env.example                     # só valores fictícios
cat .gitignore
```

## 2. Variáveis de ambiente (`.env`)

```bash
cp .env.example .env                 # preencha DD_API_KEY e DD_SITE (o site aparece na URL do Datadog, ex.: datadoghq.com)
set -a; . ./.env; set +a             # carrega DD_API_KEY e DD_SITE no terminal atual, sem exibir a chave
echo "site: $DD_SITE"; echo "chave carregada: ${#DD_API_KEY} caracteres"
```

O `set -a; . ./.env; set +a` vale só para o terminal em que foi rodado. Em um terminal novo, rode de novo.

## 3. Aplicação local (Docker Compose)

```bash
cd app/v1-base
docker compose --profile load up -d --build     # o profile "load" liga o gerador-carga
docker compose ps
docker compose logs pedidos-api estoque-api     # o mesmo request_id aparece nos dois
docker compose --profile load down -v           # encerra e libera as portas
cd ../..
```

Endereços: `http://localhost:8080` (site), `http://localhost:8081/docs` (Swagger do `pedidos-api`), `http://localhost:8082/docs` (Swagger do `estoque-api`).

## 4. Cluster Kind

> **Dois arquivos de cluster:**
>
> | Arquivo | Para que serve |
> |---|---|
> | `kubernetes/kind-config.yaml` | O cluster "vivo": ao longo do curso mudamos a quantidade de nós nele |
> | `kubernetes/kind-config-v5.yaml` | O cluster final (control-plane + 1 worker). A partir da equalização do ambiente, todos usam a mesma configuração |

```bash
# criar
kind create cluster --config kubernetes/kind-config.yaml          # o cluster "vivo", usado no começo do curso
kind create cluster --config kubernetes/kind-config-v5.yaml       # o cluster final: control-plane + 1 worker

# listar, conferir e escolher o contexto
kind get clusters
kubectl config get-contexts -o name
kubectl config use-context kind-lab-datadog
kubectl config current-context
kubectl cluster-info --context kind-lab-datadog
kubectl get nodes -o wide                       # NotReady por alguns segundos: repita até Ready
docker ps --format 'table {{.Names}}\t{{.Image}}'   # cada nó do Kind é um container

# apagar
kind delete cluster --name lab-datadog
```

## 5. Imagens e deploy da aplicação

Os scripts rodam **de dentro da pasta `kubernetes/`** e usam o contexto atual do `kubectl`.

```bash
cd kubernetes
cat deploy-v1.sh
./deploy-v1.sh          # v1: a aplicação, sem nada do Datadog
./deploy-v2.sh          # v2: métricas DogStatsD, tags e integração do Postgres
./deploy-v3.sh          # v3: APM com dd-trace
./deploy-v4.sh          # v4: estoque-api com OpenTelemetry
./deploy-v5.sh          # v5: versão final
cd ..
```

Reiniciar e acompanhar:

```bash
kubectl -n lab rollout restart deploy                         # todos os deployments do namespace
kubectl -n lab rollout restart deploy/pedidos-api
kubectl -n lab rollout status deploy/pedidos-api
```
## 6. Acessar a aplicação no cluster (port-forward)

Um comando por terminal; deixe aberto enquanto usar.

```bash
kubectl -n lab port-forward svc/loja-web 8080:8080
kubectl -n lab port-forward svc/pedidos-api 8081:3001
kubectl -n lab port-forward svc/estoque-api 8082:3002
curl http://127.0.0.1:8081/health                 # mostra também qual tracer está ligado
```

No Windows, prefira `127.0.0.1` a `localhost`: o `localhost` tenta IPv6 primeiro e fica mais lento.

## 7. Kubernetes no decorrer do curso

```bash
kubectl get ns
kubectl get pods -A -o wide
kubectl -n lab get pods,svc -o wide
kubectl -n lab get pods --show-labels
kubectl -n lab get deployment
kubectl get ds -A
kubectl describe node lab-datadog-worker
kubectl -n lab describe pod <nome-do-pod>
kubectl -n lab logs deploy/pedidos-api --tail=5
kubectl -n lab logs deploy/estoque-api --tail=5
kubectl -n lab get cm
kubectl -n lab edit cm orders-init
kubectl -n lab edit deployment estoque-api
kubectl top nodes
kubectl top pods -A
kubectl -n lab get secrets
```

## 8. Datadog Agent (Helm)

```bash
export CTX=kind-lab-datadog
kubectl config get-contexts -o name | grep "$CTX"           # confere que o contexto existe

# namespace e Secret com a API Key (a chave vem do .env)
kubectl --context $CTX create namespace datadog
kubectl --context $CTX -n datadog create secret generic datadog-secret --from-literal=api-key="$DD_API_KEY"
kubectl --context $CTX -n datadog get secret

# repositório do chart
helm repo add datadog https://helm.datadoghq.com
helm repo update datadog

# instalar ou atualizar (fixe a versão do chart para reproduzir o curso)
helm upgrade --install datadog datadog/datadog \
  --kube-context $CTX --namespace datadog \
  -f datadog/v5.yaml \
  --set datadog.site="$DD_SITE"

kubectl --context $CTX -n datadog rollout status daemonset/datadog
kubectl --context $CTX -n datadog get pods -o wide
```

A primeira instalação usa o arquivo base:

```bash
helm upgrade --install datadog datadog/datadog \
  --kube-context $CTX --namespace datadog \
  -f datadog/v1.yaml \
  --set datadog.site="$DD_SITE"
```

Arquivos de valores usados ao longo do curso (troque o `-f` do comando acima):

| Arquivo | O que liga |
|---|---|
| `datadog/v1.yaml` | Base: logs, porta de APM e a senha do Postgres |
| `datadog/v2-npm.yaml` | Network Performance Monitoring, com o Agent em um nó só |
| `datadog/v3-dogstatsd.yaml` | NPM + DogStatsD |
| `datadog/v3-ssi.yaml` | Single Step Instrumentation só no namespace `demo-python` (vai como **segundo** `-f`) |
| `datadog/v4-otel.yaml` | Receptor OTLP para o OpenTelemetry |
| `datadog/v5.yaml` | Versão final: logs, APM, DogStatsD, NPM e Postgres |

Histórico, rollback e remoção:

```bash
helm --kube-context $CTX history datadog -n datadog
helm --kube-context $CTX rollback datadog <revisão> -n datadog
helm uninstall datadog -n datadog --kube-context $CTX
kubectl --context $CTX delete namespace datadog
```

## 9. Diagnóstico do Agent

Esses comandos também ajudam a investigar problemas de configuração.

```bash
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent status
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent status | grep -E "API Key valid|Reliable|LogsSent"
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent status | grep -E "API Key valid|LogsSent|Traces received|Metric Packets|Instance ID: postgres"
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent health
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent health 2>&1 | grep -vE "\| (INFO|WARN|DEBUG) \|"      # só o resultado: Agent health: PASS
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent configcheck
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent configcheck | grep -E "^=== |Configuration provider"
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent check cpu
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent diagnose
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent diagnose 2>&1 | grep -vE "\| (INFO|WARN|DEBUG|ERROR) \|"   # só as verificações
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent flare --local          # pergunta se envia: responda não
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent tagger-list | grep "service:pedidos-api"
kubectl --context $CTX -n datadog logs ds/datadog -c agent --tail=20

# variáveis DD_* do Agent (sem mostrar a chave)
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- sh -c 'env | grep -E "^DD_(SITE|TAGS|CLUSTER_NAME|LOGS_ENABLED|KUBELET_TLS_VERIFY)=" | sort'

# arquivos do Agent (no Git Bash, MSYS_NO_PATHCONV=1 evita que o Windows reescreva /etc/...)
MSYS_NO_PATHCONV=1 kubectl --context $CTX -n datadog exec ds/datadog -c agent -- ls /etc/datadog-agent

# como o Agent escala: um pod por nó (DaemonSet) e o Cluster Agent
kubectl --context $CTX get nodes
kubectl --context $CTX -n datadog get ds,deploy
```

Provocar e corrigir erros de propósito:

```bash
# chave inválida
kubectl --context $CTX -n datadog create secret generic datadog-secret --from-literal=api-key=invalida --dry-run=client -o yaml | kubectl --context $CTX apply -f -
kubectl --context $CTX -n datadog rollout restart daemonset/datadog
# corrigir: recriar o Secret com a chave do .env
kubectl --context $CTX -n datadog create secret generic datadog-secret --from-literal=api-key="$DD_API_KEY" --dry-run=client -o yaml | kubectl --context $CTX apply -f -
kubectl --context $CTX -n datadog rollout restart daemonset/datadog

# site errado (e voltar com helm rollback)
helm upgrade datadog datadog/datadog --kube-context $CTX -n datadog -f datadog/v1.yaml --set datadog.site=datadoghq.eu
helm --kube-context $CTX history datadog -n datadog
helm --kube-context $CTX rollback datadog <revisão-anterior> -n datadog
```

## 10. Integração com o PostgreSQL

```bash
# usuários do banco (o usuário datadog aparece depois da integração)
kubectl -n lab exec deploy/pedidos-db -- psql -U orders -d orders -c "\du"
kubectl -n lab exec deploy/estoque-db  -- psql -U stock  -d stock  -c "\du"

# o SQL do usuário de monitoramento entra nos ConfigMaps (rodar na raiz do repo)
cat db/orders/datadog.sql
kubectl -n lab create configmap orders-init --from-file=init.sql=db/orders/init.sql --from-file=datadog.sql=db/orders/datadog.sql --dry-run=client -o yaml | kubectl apply -f -
kubectl -n lab create configmap stock-init  --from-file=init.sql=db/stock/init.sql  --from-file=datadog.sql=db/stock/datadog.sql  --dry-run=client -o yaml | kubectl apply -f -

# a senha do usuário datadog para o Agent (o arquivo de valores lê este Secret)
kubectl -n datadog create secret generic postgres-monitoring --from-literal=password=datadog_lab

# recriar os bancos para o SQL rodar (os dados de exemplo são recarregados)
kubectl -n lab rollout restart deploy/pedidos-db deploy/estoque-db

# a annotation do Autodiscovery no pod
kubectl -n lab get pod -l app=pedidos-db -o jsonpath='{.items[0].metadata.annotations}'; echo

# o check no Agent
kubectl -n datadog exec ds/datadog -c agent -- agent configcheck | grep -B1 -A3 "postgres check"
kubectl -n datadog exec ds/datadog -c agent -- agent status | grep -A8 "postgres ("
```

## 11. Network Performance Monitoring (Kind com mais de um worker)

No Kind os nós dividem o mesmo kernel e só **um** System Probe funciona por vez: o Agent fica em um nó só, e o outro worker sai de cena.

```bash
export NPM_NODE=lab-datadog-worker2      # o worker onde o Agent (e o NPM) vai rodar
export OUT_NODE=lab-datadog-worker       # o outro worker

kubectl taint node $OUT_NODE npm=off:NoSchedule
kubectl drain $OUT_NODE --ignore-daemonsets --delete-emptydir-data
kubectl label node $NPM_NODE datadog-npm=true
kubectl describe node $NPM_NODE | grep -A5 Labels
helm upgrade --install datadog datadog/datadog --kube-context $CTX -n datadog -f datadog/v2-npm.yaml --set datadog.site="$DD_SITE"

# o System Probe coletando
kubectl -n datadog logs ds/datadog -c system-probe | grep -E "error creating|enabling network|tracer loaded|Finished connections" | cut -c1-200

# desfazer
kubectl label node $NPM_NODE datadog-npm-
kubectl taint node $OUT_NODE npm=off:NoSchedule-
kubectl uncordon $OUT_NODE
```

No cluster final (`kind-config-v5.yaml`, um worker só), nada disso é necessário: o NPM funciona direto com o `datadog/v5.yaml`. Para pular esta etapa, recrie o cluster com a versão final.

## 12. Métricas customizadas (DogStatsD)

```bash
cat app/v2-integracoes-metricas-tags/pedidos-api/src/infrastructure/metrics/createMetrics.js
kubectl -n datadog exec ds/datadog -c agent -- agent status | grep -A12 "^DogStatsD" | grep -E "Metric Packets|Udp Packets"
```

## 13. Tags

```bash
kubectl -n lab get pods --show-labels
kubectl -n datadog exec ds/datadog -c agent -- agent tagger-list | grep "service:pedidos-api" | head -2

# uma tag nova por annotation de pod
kubectl -n lab patch deploy pedidos-api -p '{"spec":{"template":{"metadata":{"annotations":{"ad.datadoghq.com/tags":"{\"team\":\"checkout\"}"}}}}}'
kubectl -n datadog exec ds/datadog -c agent -- agent tagger-list | grep -c "team:checkout"
# remover a tag
kubectl -n lab patch deploy pedidos-api --type=json -p '[{"op":"remove","path":"/spec/template/metadata/annotations/ad.datadoghq.com~1tags"}]'
```

## 14. APM

```bash
cat app/v3-apm-ddtrace/pedidos-api/src/infrastructure/tracing/dd.js
head -5 app/v3-apm-ddtrace/pedidos-api/src/main.js              # o tracing é carregado antes de tudo
grep -n "annotateSpan" app/v3-apm-ddtrace/pedidos-api/src/application/createOrder.js
kubectl -n datadog exec ds/datadog -c agent -- agent status | grep -A25 "^APM Agent" | grep -E "Status|Receiver|Traces received"

# Continuous Profiler (só com dd-trace)
kubectl -n lab set env deploy/pedidos-api DD_PROFILING_ENABLED=true
kubectl -n lab set env deploy/pedidos-api DD_PROFILING_ENABLED-          # desligar
```

## 15. Auto-instrumentação (Single Step Instrumentation) com Python

```bash
helm upgrade --install datadog datadog/datadog --kube-context $CTX -n datadog -f datadog/v3-dogstatsd.yaml -f datadog/v3-ssi.yaml --set datadog.site="$DD_SITE"
kubectl -n datadog rollout status deploy/datadog-cluster-agent

kubectl apply -f kubernetes/v3/ssi-python/demo-python.yaml
kubectl -n demo-python get pods
kubectl -n demo-python rollout restart deploy/demo-python          # pods criados antes do SSI precisam ser recriados

# o que foi injetado
kubectl -n demo-python get pod -o jsonpath='{.items[0].spec.initContainers[*].name}'; echo
kubectl -n demo-python exec deploy/demo-python -c demo-python -- python -c "import ddtrace; print('ddtrace', ddtrace.__version__)"

# tráfego no serviço Python
kubectl -n demo-python port-forward svc/demo-python 8083:5000
curl -v http://127.0.0.1:8083/
curl -v http://127.0.0.1:8083/slow

# remover
kubectl delete namespace demo-python
```

## 16. OpenTelemetry

Enviando ao Agent:

```bash
helm upgrade --install datadog datadog/datadog --kube-context $CTX -n datadog -f datadog/v4-otel.yaml --set datadog.site="$DD_SITE"
kubectl -n datadog exec ds/datadog -c agent -- agent status | grep -A4 "^OTLP"       # Status: Enabled
(cd kubernetes && ./deploy-v4.sh)
```

Enviando ao OpenTelemetry Collector:

```bash
# a API Key para o Collector, no namespace lab
kubectl --context $CTX -n lab create secret generic datadog-secret --from-literal=api-key="$DD_API_KEY"
kubectl --context $CTX -n lab get secret datadog-secret

kubectl apply -f kubernetes/v4/collector/otel-collector.yaml
kubectl -n lab rollout status deploy/otel-collector
kubectl apply -f kubernetes/v4/estoque-api.yaml               # com OTEL_EXPORTER_OTLP_ENDPOINT apontando para o Collector
kubectl -n lab logs deploy/otel-collector --tail=20
kubectl -n lab logs deploy/otel-collector | grep -iE "API key validation|Everything is ready|connector|error"

# alterar a configuração do Collector e aplicar
kubectl -n lab edit configmap otel-collector-config
kubectl -n lab rollout restart deployment/otel-collector

# remover o Collector
kubectl delete -f kubernetes/v4/collector/otel-collector.yaml
kubectl -n lab delete secret datadog-secret
```

## 17. Cenários para gerar dados

Com o port-forward do `pedidos-api`

```bash
curl -X POST http://127.0.0.1:8081/orders -H 'content-type: application/json' -d '{}'     # um pedido
curl "http://127.0.0.1:8081/scenarios/slow-call?ms=800"                                    # chamada lenta entre as APIs
curl "http://127.0.0.1:8081/scenarios/slow-query?mode=slow&ref=REF-00123"                  # consulta lenta (sem índice)
curl "http://127.0.0.1:8081/scenarios/slow-query?mode=fast&ref=REF-00123"                  # a mesma consulta, com índice
curl "http://127.0.0.1:8081/orders/report?mode=n1"                                         # N+1
curl "http://127.0.0.1:8081/orders/report?mode=batch"                                      # uma chamada só
curl "http://127.0.0.1:8081/scenarios/error?type=exception"                                # erro no estoque-api (502)
curl "http://127.0.0.1:8081/scenarios/error-local"                                         # erro no próprio pedidos-api (500)
curl "http://127.0.0.1:8081/scenarios/cpu?ms=1000"                                         # CPU no estoque-api
curl "http://127.0.0.1:8081/scenarios/memory?mb=100&hold_ms=20000"                         # memória no pedidos-api
curl -s -D - -o /dev/null "http://127.0.0.1:8081/scenarios/slow-call?ms=777" | grep -i x-request-id

# repetir um cenário várias vezes
for i in 1 2 3 4 5; do curl -s "http://127.0.0.1:8081/scenarios/error?type=exception" > /dev/null; curl -s "http://127.0.0.1:8081/scenarios/error-local" > /dev/null; done
```


## 18. Synthetic Monitoring

Nossa aplicação roda localmente e não está exposta à internet, então o Datadog não consegue alcançá-la. Por isso, os testes usam uma API pública de exemplo:

```bash
curl -v https://httpbin.org/status/200
```

## 19. Claude Code com o MCP do Datadog

No terminal:

```bash
claude                                   # abre o Claude Code
claude plugin list                       # plugins instalados
claude mcp list                          # servidores MCP e status
claude plugin uninstall datadog@claude-plugins-official
```

Dentro do Claude Code:

```
/plugin install datadog@claude-plugins-official
/ddsetup             # escolher o site e fazer o login no navegador (OAuth)
/ddtoolsets          # escolher os grupos de ferramentas
/reload-plugins
/mcp                 # conferir se o Datadog está "connected"
```

Para as ferramentas de **escrita** (criar dashboards, monitores etc.), um administrador liga o **MCP Write Access** em Organization Settings, e depois é preciso reconectar.

## 20. Limpeza

```bash
helm uninstall datadog -n datadog --kube-context $CTX
kind delete cluster --name lab-datadog
docker compose --profile load down -v          # se o Compose estiver de pé (dentro de app/v1-base)
```
