# Prompts usados no curso

Pedidos feitos ao Claude (Claude Code) usando o **MCP do Datadog**. Os textos foram corrigidos para o repositório (ortografia e pontuação), mas a forma como foram pedidos é a mesma.

## Requisitos

- Claude Code instalado e o plugin do Datadog configurado com o MCP conectado (passo a passo na seção 19 do [COMANDOS.md](COMANDOS.md)).
- Extensão do Claude Code instalada no VS Code (veja a observação abaixo).
- Ambiente com dados: os prompts usam `env:dev` e os serviços `pedidos-api` e `estoque-api`. Troque pelos seus nomes se forem diferentes.
- Escrita do MCP habilitada, só para os prompts que criam notebooks (7, 8 e 9).

## Observações

**Instalar o Claude Code no VS Code**

1. Abra a aba de extensões (`Ctrl+Shift+X`), pesquise por **Claude Code** (publicada pela Anthropic) e clique em **Install**.
2. Abra o painel do Claude Code pelo ícone no canto superior direito do editor e faça o login.
3. A instalação do plugin do Datadog e do MCP continua como no [COMANDOS.md](COMANDOS.md); os comandos `/plugin` e `/mcp` também funcionam dentro do painel.

**Ativar a escrita do MCP (MCP Write Access)**

Um administrador da organização liga o **MCP Write Access** em *Organization Settings* no Datadog. Depois, reconecte o MCP (`/mcp`) ou abra uma sessão nova para as ferramentas de escrita aparecerem. Sem isso o Claude só **lê** dados.

> **Atenção:** a escrita permite que o Claude crie e altere itens reais na sua conta do Datadog. Use apenas em ambientes de POC e demonstração, como fazemos aqui. Em qualquer outro ambiente, ative com muito cuidado e revise o que ele vai criar.

## Dicas para escrever bons pedidos

- **Nomeie o MCP:** escreva "utilize o MCP do Datadog" para o Claude não responder de memória.
- **Dê o escopo:** serviço, ambiente e período (por exemplo, `estoque-api`, `env:dev`, última hora).
- **Diga o que quer receber:** uma query, uma regra, um JSON, um notebook.
- **Peça validação:** "teste" e "mostre o resultado".
- **Peça todas as hipóteses**, não só uma resposta: assim aparece também o que foi descartado.
- **Confira o resultado:** abra o que o Claude criou. Um gráfico vazio costuma indicar um nome de métrica errado.

---

## 1. Conexão e primeiros problemas

### Prompt 1: testar a conexão

```
O MCP do Datadog está funcional?
```

> Você também pode digitar `/mcp` no Claude Code e conferir o status do servidor do Datadog (deve aparecer como *connected*).

### Prompt 2: maiores problemas nos logs

```
Quero que utilize o MCP do Datadog para me trazer os maiores problemas referentes aos dois serviços (API): estoque e pedidos. Traga apenas logs que pareçam problemáticos.
```

---

## 2. Queries para o Log Explorer

### Prompt 3: erros e contagem

```
Utilize o MCP do Datadog.
Quero uma query para eu usar no Log Explorer que traga os erros do pedidos-api e também me informe quantos houve na última hora.
```

### Prompt 4: logs por operation e status

```
Utilize o MCP do Datadog.
Quero que crie uma query para eu usar no Log Explorer que traga os logs do pedidos-api da última hora, agrupados por operation e status.
```

---

## 3. Grok Parser

Os logs do `pedidos-api` saem estruturados (JSON) e os do `estoque-api` saem em texto puro. O Grok Parser é a regra que lê o texto e extrai os campos.

### Prompt 5: criar e testar a regra

```
Utilize o MCP do Datadog.
Busque 5 linhas reais de log do estoque-api e escreva uma regra de Grok Parser para o Datadog que extraia os campos: timestamp, nível, componente, trace_id (como dd.trace.id), request_id e a mensagem.
Teste a regra contra as linhas buscadas e me mostre o resultado esperado de cada uma.
```

---

## 4. Dashboard

### Prompt 6: dashboard de visão geral

```
Utilize o MCP do Datadog.

Crie um dashboard chamado 'Lab Loja Datadog - Visão geral' com:
(1) requests por segundo do pedidos-api e do estoque-api (série temporal),
(2) taxa de erro de cada serviço (query value, em %),
(3) latência p95 de cada serviço (série temporal),
(4) top 5 SKUs mais vendidos usando a métrica lab.stock.reservations com result:ok (top list),
(5) pedidos por status com lab.orders.created (série temporal empilhada),
(6) uma lista dos logs de erro dos dois serviços.
Use env:dev.
Gere o JSON desse dashboard para eu importar.

Crie o arquivo .json dentro da pasta datadog/dashboards do repositório.
```

> O Claude só gera o arquivo; você importa no Datadog (Dashboards > New Dashboard > Import dashboard JSON).

---

## 5. Notebooks

### Prompt 7: notebook de saúde da aplicação

```
Utilize o MCP do Datadog.
Quero que crie um notebook sobre o Lab Loja Datadog, referente à saúde da aplicação. Ele deve ter tópicos sobre a arquitetura (use o contexto do VS Code, a pasta repo/app e também o banco de dados) e gráficos de requests, erros e p95 dos serviços. Quero também uma célula com os logs de erro.
```

### Prompt 8: investigar um monitor que disparou

```
Utilize o MCP do Datadog.
Investigue o que aconteceu no monitor "Lab Loja - pedidos-api muitos logs de erro", com base em todas as métricas disponíveis, e evidencie todas as hipóteses dentro de um notebook.
```

### Prompt 9: runbook e postmortem

```
Utilize o MCP do Datadog.
Analise todos os eventos do monitor "Lab Loja - pedidos em andamento alto". Descreva um runbook de análise para futuros incidentes e, caso você encontre a solução, documente-a também em um postmortem.
```

> "Caso você encontre a solução" deixa o Claude livre para dizer que não encontrou uma, em vez de inventar.

---

## Onde usamos a escrita do MCP

No curso, a única parte que usa a escrita do MCP é a de **notebooks** (saúde, investigação, runbook e postmortem). Todo o resto é só leitura.
