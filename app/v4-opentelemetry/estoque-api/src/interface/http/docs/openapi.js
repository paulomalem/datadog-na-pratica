// Documentação OpenAPI (Swagger) do estoque-api. Serve de roteiro para as demonstrações.

const queryParam = (name, description, schema, example) => ({
  name, in: 'query', description, required: false, schema, ...(example !== undefined ? { example } : {}),
});

const pathParam = (name, description, example) => ({
  name, in: 'path', description, required: true, schema: { type: 'string' }, example,
});

const json = (description, example) => ({
  description,
  content: { 'application/json': { example } },
});

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'estoque-api',
    version: '1.0.0',
    description: [
      'API de **estoque** da Lab Loja Datadog.',
      '',
      'Controla o saldo de cada SKU e registra as movimentações no seu próprio banco (`estoque-db`).',
      'É chamada pelo `pedidos-api` para reservar o estoque de um pedido: `loja-web` → `pedidos-api` → **estoque-api** → `estoque-db`.',
      '',
      'Os logs deste serviço são escritos em **texto livre**, de propósito, no estilo de sistemas legados.',
      'É a matéria-prima da aula de Grok Parser.',
    ].join('\n'),
  },
  tags: [
    { name: 'Estoque', description: 'Saldo e reservas' },
    { name: 'Cenários', description: 'Situações provocadas de propósito para as demonstrações' },
    { name: 'Saúde', description: 'Verificação de que o serviço e o banco respondem' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Saúde'],
        summary: 'Verifica o serviço e o banco',
        responses: { 200: json('Serviço saudável', { status: 'ok', service: 'estoque-api', tracer: 'otel' }) },
      },
    },
    '/stock/{sku}': {
      get: {
        tags: ['Estoque'],
        summary: 'Saldo de um SKU',
        parameters: [pathParam('sku', 'Código do produto (SKU-001 a SKU-020)', 'SKU-007')],
        responses: {
          200: json('Saldo do SKU', { sku: 'SKU-007', qty: 999990 }),
          404: json('SKU não encontrado', { error: 'sku não encontrado' }),
        },
      },
    },
    '/stock': {
      get: {
        tags: ['Estoque'],
        summary: 'Saldo de vários SKUs de uma vez',
        description: 'A alternativa ao N+1: uma chamada só para vários SKUs.',
        parameters: [queryParam('skus', 'SKUs separados por vírgula', { type: 'string' }, 'SKU-001,SKU-002,SKU-003')],
        responses: { 200: json('Saldos por SKU', { 'SKU-001': 1000000, 'SKU-002': 999998 }) },
      },
    },
    '/reserve': {
      post: {
        tags: ['Estoque'],
        summary: 'Reserva estoque para um pedido',
        description: 'Baixa o saldo e registra a movimentação. Cerca de 3% das chamadas falham de propósito (erro simulado).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId', 'sku'],
                properties: {
                  orderId: { type: 'integer', example: 123 },
                  sku: { type: 'string', example: 'SKU-007' },
                  qty: { type: 'integer', minimum: 1, default: 1, example: 2 },
                },
              },
            },
          },
        },
        responses: {
          200: json('Reserva feita', { orderId: 123, sku: 'SKU-007', qty: 2, balance: 999988 }),
          409: json('Estoque insuficiente', { error: 'estoque insuficiente' }),
          500: json('Falha (inclui o erro simulado)', { error: 'falha ao reservar estoque (erro simulado)' }),
        },
      },
    },
    '/movements/summary/{ref}': {
      get: {
        tags: ['Cenários'],
        summary: 'Resumo de movimentações (consulta lenta ou rápida)',
        description: 'Consulta uma tabela de 2 milhões de linhas. Em `slow` usa `lower(ref)` e não aproveita o índice (varredura completa); em `fast` usa o índice.',
        parameters: [
          pathParam('ref', 'Referência da movimentação (REF-00001 a REF-05000)', 'REF-00123'),
          queryParam('mode', 'slow = sem índice; fast = com índice', { type: 'string', enum: ['slow', 'fast'], default: 'slow' }),
        ],
        responses: { 200: json('Resumo', { ref: 'REF-00123', mode: 'slow', movements: 400, total: 1200 }) },
      },
    },
    '/delay': {
      get: {
        tags: ['Cenários'],
        summary: 'Resposta demorada',
        parameters: [queryParam('ms', 'Atraso em milissegundos (máximo 10000)', { type: 'integer', default: 800 })],
        responses: { 200: json('Resposta atrasada', { delayed: 800 }) },
      },
    },
    '/cpu': {
      get: {
        tags: ['Cenários'],
        summary: 'Consumo de CPU',
        description: 'Ocupa a CPU por um tempo. Serve para o Continuous Profiler.',
        parameters: [queryParam('ms', 'Tempo ocupando a CPU em milissegundos (máximo 5000)', { type: 'integer', default: 300 })],
        responses: { 200: json('Trabalho concluído', { busy_ms: 300, rounds: 30 }) },
      },
    },
    '/fail': {
      get: {
        tags: ['Cenários'],
        summary: 'Falha provocada',
        description: 'Lança uma exceção (responde 500) ou espera 15 segundos. Alimenta o Error Tracking e os monitores.',
        parameters: [queryParam('type', 'exception lança uma exceção; timeout espera 15 segundos', { type: 'string', enum: ['exception', 'timeout'], default: 'exception' })],
        responses: { 500: json('Erro simulado', { error: 'estoque inconsistente (exceção simulada)' }) },
      },
    },
  },
};
