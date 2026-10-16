# Instalando o Datadog Agent no Kubernetes (Kind)

Este tutorial instala o **Datadog Agent** no cluster Kind do curso, usando o Helm. No fim, o Datadog passa a receber as métricas de infraestrutura, as métricas de containers e Kubernetes e os logs da aplicação, sem nenhuma mudança no código.

Versões testadas neste curso: chart do Helm `datadog-3.253.1`, Datadog Agent `7.84.1`, Kubernetes `1.35` (Kind).

## O que será instalado

| Peça | O que faz |
|---|---|
| Agent (um pod por nó, um DaemonSet) | Coleta métricas do nó e dos containers e lê os logs de cada container |
| Cluster Agent | Coleta o que é do cluster inteiro (por exemplo, o Orchestrator Explorer) |
| Operator (vem junto do chart) | Componente de apoio do próprio chart; não precisamos mexer nele |

## Antes de começar

1. **Um cluster Kind com a aplicação rodando** (veja o `README.md` da raiz e o `kubernetes/deploy-v1.sh`).
2. **`kubectl` e `helm` instalados.**
3. **Uma conta Datadog** (o trial serve), com uma **API Key** e o **site** da sua conta (o domínio da URL, por exemplo `datadoghq.com`).
4. **O arquivo `.env` na raiz do repositório**, com a sua chave. Ele nunca vai para o Git:

```bash
cp .env.example .env
# edite o .env: DD_API_KEY=<sua chave>   DD_SITE=<seu site>
```

## ⚠ Atenção ao cluster (leia antes de colar qualquer comando)

Todo comando abaixo usa a variável `CTX`, que diz **em qual cluster** o comando roda. Defina-a **uma vez**, no começo, com o nome do seu cluster Kind (o `name:` do `kubernetes/kind-config.yaml`, com o prefixo `kind-`):

```bash
export CTX=kind-lab-datadog
kubectl config get-contexts -o name          # confira que o contexto existe
```

Por que isso importa: se você misturar comandos de dois clusters (por exemplo, criar o secret em um e rodar o `helm` em outro), a instalação vai parar no lugar errado. Com `$CTX` em todos os comandos, o erro fica em um lugar só. Se você tem outros clusters (do trabalho, por exemplo) no seu `kubectl`, **nunca confie no "contexto atual"**.

## Passo 1: carregar a chave sem mostrá-la

```bash
set -a; . ./.env; set +a          # cria DD_API_KEY e DD_SITE no terminal, sem exibir os valores
echo "site: $DD_SITE"             # só o site; nunca imprima a chave
```

## Passo 2: namespace e secret com a API Key

A chave fica em um **Secret** do Kubernetes. Ela não vai dentro de nenhum arquivo do repositório.

```bash
kubectl --context $CTX create namespace datadog
kubectl --context $CTX -n datadog create secret generic datadog-secret --from-literal=api-key="$DD_API_KEY"
```

## Passo 3: repositório do chart

```bash
helm repo add datadog https://helm.datadoghq.com
helm repo update datadog
```

## Passo 4: entender o arquivo de valores

O Helm usa o arquivo `datadog/v1.yaml` para configurar o Agent. Abra-o e leia:

| Trecho | Para que serve |
|---|---|
| `apiKeyExistingSecret: datadog-secret` | Usa o Secret do passo 2, em vez de uma chave escrita no arquivo |
| `clusterName` | O nome do cluster que aparece no Datadog. **Troque pelo nome do seu cluster** (sem o `kind-`), para os dados de clusters diferentes não se misturarem |
| `tags: [env:dev]` | Marca tudo o que o Agent coleta com `env:dev` |
| `kubelet.tlsVerify: false` | O kubelet do Kind usa certificado autoassinado; sem isso o Agent não consegue ler as métricas do nó |
| `ignoreAutoConfig` (`etcd`, `kube_controller_manager`, `kube_scheduler`) | No Kind esses componentes do control-plane não expõem métricas como num cluster gerenciado; sem isso o `agent status` mostra três erros de inicialização que não são problema real |
| `logs.enabled` e `containerCollectAll` | Coleta os logs de todos os containers |
| `apm.portEnabled: true` | Deixa a porta de APM do Agent aberta, para quando a aplicação for instrumentada com APM |
| `agents.tolerations` | O control-plane do Kind tem um *taint*; sem a tolerância o Agent só rodaria nos workers (2 hosts em vez de 3) |

## Passo 5: instalar

```bash
helm upgrade --install datadog datadog/datadog \
  --kube-context $CTX --namespace datadog \
  -f datadog/v1.yaml \
  --set datadog.site="$DD_SITE"
```

O `--install` faz a mesma coisa para a primeira instalação e para atualizações. O `--set datadog.site` diz a que site do Datadog o Agent envia os dados (é o `DD_SITE` do `.env`).

Acompanhe até ficar pronto (cerca de 2 a 3 minutos):

```bash
kubectl --context $CTX -n datadog rollout status daemonset/datadog
kubectl --context $CTX -n datadog get pods -o wide
```

Você deve ver **um pod do Agent por nó** (3, com `3/3` containers prontos), mais o Cluster Agent e o Operator.

## Passo 6: verificar

**No terminal**, pergunte ao próprio Agent:

```bash
kubectl --context $CTX -n datadog exec ds/datadog -c agent -- agent status | grep -E "API Key valid|Reliable|LogsSent"
```

O esperado: `API Key valid` e a linha dos logs com `Sending compressed logs in HTTPS`.

**No Datadog** (a ingestão tem um atraso de alguns minutos):

- **Infrastructure > Infrastructure List:** os nós do cluster, com a tag `env:dev`.
- **Infrastructure > Containers:** os containers da aplicação (namespace `lab`).
- **Logs:** os logs da aplicação. Pesquise por `service:pedidos-api` e `service:estoque-api`, com o período em "Past 1 hour".

**O APM ainda aparece como "not running" no `agent status`.** É o esperado: o processo de APM só inicia quando chega o primeiro trace, e a aplicação ainda não está instrumentada.

## Não faça: o manifesto que a tela do Datadog gera

A tela de onboarding do Datadog para Kubernetes gera um manifesto (`DatadogAgent`, via Operator). Ele liga a instrumentação automática (`apm.instrumentation`) **sem restringir a nenhum namespace**, o que injeta um tracer em **todos** os pods do cluster. Isso mudaria a aplicação sem você saber. Por isso, neste curso, instalamos pelo Helm, com o arquivo de valores acima. A instrumentação automática é mostrada mais adiante, restrita a um namespace de demonstração.

## Atualizar ou voltar uma versão

```bash
helm --kube-context $CTX history datadog -n datadog          # revisões instaladas
helm --kube-context $CTX rollback datadog 1 -n datadog       # volta para a revisão 1 (o rollback cria uma nova revisão)
```

Um `helm repo update` seguido de `helm upgrade --install` pode trazer um chart (e um Agent) mais novos do que os do curso. Para reproduzir exatamente as versões testadas, fixe o chart:

```bash
helm upgrade --install datadog datadog/datadog --version 3.253.1 --kube-context $CTX --namespace datadog -f datadog/v1.yaml --set datadog.site="$DD_SITE"
```

## Desinstalar

```bash
helm uninstall datadog -n datadog --kube-context $CTX
kubectl --context $CTX delete namespace datadog
```

## Problemas comuns

| Sintoma | O que verificar |
|---|---|
| Os pods do Agent não iniciam | O Secret `datadog-secret` existe no namespace `datadog` **do mesmo cluster** do `helm`? (`kubectl --context $CTX -n datadog get secret`) |
| O `agent status` não mostra `API Key valid` | A chave do `.env` está correta e o `DD_SITE` é o site da sua conta? Para refazer o Secret, apague-o (`kubectl --context $CTX -n datadog delete secret datadog-secret`), crie de novo (passo 2) e reinicie: `kubectl --context $CTX -n datadog rollout restart daemonset/datadog` |
| Só 2 hosts aparecem em vez de 3 | A tolerância do control-plane (`agents.tolerations`) está no arquivo de valores? |
| O `agent status` mostra erros de `etcd`, `kube_controller_manager` ou `kube_scheduler` | O `ignoreAutoConfig` do arquivo de valores está sendo usado? |
| Não vejo logs no Datadog | Espere alguns minutos e use o período "Past 1 hour". Confira no `agent status` que `LogsSent` está crescendo e que o `service` da busca é o nome atual do serviço |
| Aparece uma instalação duplicada ou dados do cluster errado | Veja o `$CTX` e o `clusterName` do arquivo de valores; confirme com `helm list -A --kube-context $CTX` |
