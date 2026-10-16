const test = require('node:test');
const assert = require('node:assert/strict');
const { makeReserveStock } = require('../src/application/reserveStock');
const { InsufficientStockError, SimulatedFailureError } = require('../src/domain/errors');

// Fakes das portas: o caso de uso roda sem banco e sem HTTP
function setup({ balance = 10, failure = null } = {}) {
  const calls = { recorded: [], logs: [] };
  const stock = { decrease: async () => balance };
  const movements = { record: async (movement) => calls.recorded.push(movement) };
  const failures = { maybeFail: () => { if (failure) throw failure; } };
  const logger = { info: (m) => calls.logs.push(['info', m]), warn: (m) => calls.logs.push(['warn', m]), error() {} };
  return { calls, reserveStock: makeReserveStock({ stock, movements, failures, logger }) };
}

test('reserva estoque, registra a movimentação e devolve o saldo', async () => {
  const { reserveStock, calls } = setup({ balance: 7 });

  const result = await reserveStock({ orderId: 41, sku: 'SKU-001', qty: 2 });

  assert.deepEqual(result, { orderId: 41, sku: 'SKU-001', qty: 2, balance: 7 });
  assert.equal(calls.recorded.length, 1);
  assert.equal(calls.recorded[0].qty, -2);
  assert.equal(calls.recorded[0].ref, 'REF-00042');
});

test('sem saldo suficiente: lança InsufficientStockError e não registra movimentação', async () => {
  const { reserveStock, calls } = setup({ balance: null });

  await assert.rejects(() => reserveStock({ orderId: 1, sku: 'SKU-002', qty: 5 }), InsufficientStockError);
  assert.equal(calls.recorded.length, 0);
});

test('falha simulada interrompe antes de mexer no estoque', async () => {
  const { reserveStock, calls } = setup({ failure: new SimulatedFailureError() });

  await assert.rejects(() => reserveStock({ orderId: 1, sku: 'SKU-003' }), SimulatedFailureError);
  assert.equal(calls.recorded.length, 0);
});
