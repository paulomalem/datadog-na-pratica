// Documentação OpenAPI (Swagger) do pedidos-api. Serve de roteiro para as demonstrações.

const queryParam = (name, description, schema, example) => ({
  name, in: 'query', description, required: false, schema, ...(example !== undefined ? { example } : {}),
});

const json = (description, example) => ({
  description,
  content: { 'application/json': { example } },
});

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'pedidos-api',
    version: '1.0.0',
    description: [
      'API de **pedidos** da Lab Loja Datadog.',
      '',
      'Recebe o pedido do cliente (vindo do `loja-web`), grava no seu próprio banco (`pedidos-db`) e pede a reserva',
      'do estoque ao `estoque-api`. É o primeiro serviço do caminho: `loja-web` → **pedidos-api** → `estoque-api` → `estoque-db`.',
      '',
      'A seção **Cenários** reúne chamadas feitas de propósito para gerar situações reais de observabilidade:',
      'lentidão, N+1, erros e consumo de CPU.',
    ].join('\n'),
  },
  tags: [
    { name: 'Pedidos', description: 'Fluxo normal da loja' },
    { name: 'Cenários', description: 'Situações provocadas de propósito para as demonstrações' },
    { name: 'Saúde', description: 'Verificação de que o serviço e o banco respondem' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Saúde'],
        summary: 'Verifica o serviço e o banco',
        responses: { 200: json('Serviço saudável', { status: 'ok', service: 'pedidos-api' }) },
      },
    },
    '/orders': {
      post: {
        tags: ['Pedidos'],
        summary: 'Cria um pedido',
        description: 'Grava o pedido no `pedidos-db` e reserva o estoque no `estoque-api`. Sem corpo, gera um cliente e um SKU de exemplo. Cerca de 3% das reservas falham de propósito.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customerId: { type: 'string', example: 'cust-42' },
                  sku: { type: 'string', example: 'SKU-007' },
                  qty: { type: 'integer', minimum: 1, example: 2 },
                },
              },
            },
          },
        },
        responses: {
          201: json('Pedido confirmado', { orderId: 123, sku: 'SKU-007', qty: 2, status: 'confirmed' }),
          400: json('Dados inválidos', { error: 'qty deve ser um inteiro positivo' }),
          502: json('Estoque indisponível (o pedido fica com status failed)', { orderId: 124, sku: 'SKU-007', qty: 2, status: 'failed', error: 'estoque indisponível' }),
        },
      },
      get: {
        tags: ['Pedidos'],
        summary: 'Lista os pedidos mais recentes',
        parameters: [queryParam('limit', 'Quantidade de pedidos (1 a 200)', { type: 'integer', default: 20 })],
        responses: { 200: json('Lista de pedidos', [{ id: 123, customerId: 'cust-42', sku: 'SKU-007', qty: 2, status: 'confirmed' }]) },
      },
    },
    '/orders/report': {
      get: {
        tags: ['Cenários'],
        summary: 'Relatório com o saldo de estoque (cenário N+1)',
        description: 'Compare os dois modos no APM: `n1` faz **uma chamada ao estoque-api por pedido** (o clássico N+1); `batch` faz **uma só chamada** com todos os SKUs.',
        parameters: [
          queryParam('mode', 'n1 = uma chamada por pedido; batch = uma chamada só', { type: 'string', enum: ['n1', 'batch'], default: 'batch' }),
          queryParam('limit', 'Quantidade de pedidos no relatório (1 a 100)', { type: 'integer', default: 30 }),
        ],
        responses: { 200: json('Relatório', { mode: 'n1', orders: 30, stock: { 'SKU-007': 999990 } }) },
      },
    },
    '/scenarios/slow-query': {
      get: {
        tags: ['Cenários'],
        summary: 'Consulta lenta no banco (com e sem índice)',
        description: 'Consulta uma tabela de 2 milhões de linhas no `estoque-db`. Em `slow` a consulta usa `lower(ref)` e não aproveita o índice (varredura completa); em `fast` usa o índice.',
        parameters: [
          queryParam('mode', 'slow = sem índice; fast = com índice', { type: 'string', enum: ['slow', 'fast'], default: 'slow' }),
          queryParam('ref', 'Referência da movimentação (REF-00001 a REF-05000). Sem valor, sorteia uma.', { type: 'string' }, 'REF-00123'),
        ],
        responses: { 200: json('Resumo das movimentações', { ref: 'REF-00123', mode: 'slow', movements: 400, total: 1200 }) },
      },
    },
    '/scenarios/slow-call': {
      get: {
        tags: ['Cenários'],
        summary: 'Chamada demorada entre serviços',
        description: 'O `estoque-api` demora de propósito para responder. Mostra a lentidão de um serviço dependente no trace.',
        parameters: [queryParam('ms', 'Atraso em milissegundos (máximo 10000)', { type: 'integer', default: 800 })],
        responses: { 200: json('Resposta atrasada', { delayed: 800 }) },
      },
    },
    '/scenarios/cpu': {
      get: {
        tags: ['Cenários'],
        summary: 'Consumo de CPU no estoque-api',
        description: 'Ocupa a CPU do `estoque-api` por um tempo. Serve para o Continuous Profiler.',
        parameters: [queryParam('ms', 'Tempo ocupando a CPU em milissegundos (máximo 5000)', { type: 'integer', default: 300 })],
        responses: { 200: json('Trabalho concluído', { busy_ms: 300, rounds: 30 }) },
      },
    },
    '/scenarios/error': {
      get: {
        tags: ['Cenários'],
        summary: 'Erro no estoque-api (exceção)',
        description: 'Provoca uma exceção no `estoque-api`. O `pedidos-api` responde 502. Alimenta o Error Tracking e os monitores.',
        parameters: [queryParam('type', 'exception lança uma exceção; timeout espera 15 segundos', { type: 'string', enum: ['exception', 'timeout'], default: 'exception' })],
        responses: { 502: json('Falha no serviço dependente', { error: 'falha ao chamar o estoque-api: Request failed with status code 500' }) },
      },
    },
    '/scenarios/error-local': {
      get: {
        tags: ['Cenários'],
        summary: 'Erro no próprio pedidos-api',
        description: 'Lança uma exceção dentro do `pedidos-api` (responde 500).',
        responses: { 500: json('Erro interno', { error: 'erro local simulado no pedidos-api' }) },
      },
    },
  },
};
