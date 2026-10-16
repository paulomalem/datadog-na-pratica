const test = require('node:test');
const assert = require('node:assert/strict');
const { makeCreateOrder } = require('../src/application/createOrder');
const { StockUnavailableError, ValidationError } = require('../src/domain/errors');

// Fakes das portas: o caso de uso roda sem banco e sem HTTP
function setup({ reserveFails = false } = {}) {
  const statuses = [];
  const orders = {
    save: async (order) => ({ ...order, id: 7 }),
    updateStatus: async (id, status) => statuses.push([id, status]),
  };
  const stock = {
    reserve: async () => { if (reserveFails) throw new Error('estoque-api fora do ar'); },
  };
  const logger = { info() {}, warn() {}, error() {} };
  return { statuses, createOrder: makeCreateOrder({ orders, stock, logger }) };
}

test('pedido com estoque reservado termina confirmado', async () => {
  const { createOrder, statuses } = setup();

  const order = await createOrder({ customerId: 'cust-1', sku: 'SKU-001', qty: 2 });

  assert.equal(order.id, 7);
  assert.equal(order.status, 'confirmed');
  assert.deepEqual(statuses, [[7, 'confirmed']]);
});

test('falha na reserva marca o pedido como failed e lança StockUnavailableError', async () => {
  const { createOrder, statuses } = setup({ reserveFails: true });

  await assert.rejects(
    () => createOrder({ customerId: 'cust-1', sku: 'SKU-001', qty: 1 }),
    (err) => err instanceof StockUnavailableError && err.order.status === 'failed' && err.cause.message === 'estoque-api fora do ar'
  );
  assert.deepEqual(statuses, [[7, 'failed']]);
});

test('sem dados, gera cliente e SKU de exemplo (uso nas demos)', async () => {
  const { createOrder } = setup();
  const order = await createOrder();
  assert.match(order.sku, /^SKU-\d{3}$/);
  assert.equal(order.qty, 1);
});

test('quantidade inválida é rejeitada antes de gravar', async () => {
  const { createOrder, statuses } = setup();
  await assert.rejects(() => createOrder({ sku: 'SKU-001', qty: 0 }), ValidationError);
  assert.deepEqual(statuses, []);
});
