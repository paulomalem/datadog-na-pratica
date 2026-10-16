const test = require('node:test');
const assert = require('node:assert/strict');
const { makeBuildOrderReport } = require('../src/application/buildOrderReport');

// Conta quantas chamadas ao estoque cada modo faz: é a prova do N+1
function setup(skus) {
  const calls = { bySku: 0, batch: 0 };
  const orders = { listRecent: async () => skus.map((sku, i) => ({ id: i + 1, sku, qty: 1 })) };
  const stock = {
    getBySku: async (sku) => { calls.bySku += 1; return { sku, qty: 10 }; },
    getBatch: async (list) => { calls.batch += 1; return Object.fromEntries(list.map((sku) => [sku, 10])); },
  };
  const logger = { info() {}, warn() {}, error() {} };
  return { calls, buildOrderReport: makeBuildOrderReport({ orders, stock, logger }) };
}

test('mode n1 faz uma chamada ao estoque por pedido', async () => {
  const { buildOrderReport, calls } = setup(['SKU-001', 'SKU-001', 'SKU-002', 'SKU-003']);

  const report = await buildOrderReport({ mode: 'n1' });

  assert.equal(calls.bySku, 4);
  assert.equal(calls.batch, 0);
  assert.equal(report.orders, 4);
});

test('mode batch faz uma única chamada, com SKUs sem repetição', async () => {
  const { buildOrderReport, calls } = setup(['SKU-001', 'SKU-001', 'SKU-002', 'SKU-003']);

  const report = await buildOrderReport({ mode: 'batch' });

  assert.equal(calls.batch, 1);
  assert.equal(calls.bySku, 0);
  assert.deepEqual(Object.keys(report.stock).sort(), ['SKU-001', 'SKU-002', 'SKU-003']);
});
