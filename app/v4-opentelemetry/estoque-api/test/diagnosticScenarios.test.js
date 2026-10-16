const test = require('node:test');
const assert = require('node:assert/strict');
const { makeDiagnosticScenarios } = require('../src/application/diagnosticScenarios');
const { SimulatedFailureError } = require('../src/domain/errors');

const logger = { info() {}, warn() {}, error() {} };

test('modo slow usa a estratégia de varredura; fast usa o índice', async () => {
  const strategies = [];
  const movements = { summarizeByRef: async (ref, strategy) => { strategies.push(strategy); return { movements: 1, total: 2 }; } };
  const scenarios = makeDiagnosticScenarios({ movements, logger });

  const slow = await scenarios.summarizeMovements({ ref: 'REF-00001', mode: 'slow' });
  const fast = await scenarios.summarizeMovements({ ref: 'REF-00001', mode: 'fast' });

  assert.deepEqual(strategies, ['scan', 'index']);
  assert.equal(slow.mode, 'slow');
  assert.equal(fast.mode, 'fast');
});

test('fail do tipo exception lança SimulatedFailureError', async () => {
  const scenarios = makeDiagnosticScenarios({ movements: {}, logger });
  await assert.rejects(() => scenarios.fail({ type: 'exception' }), SimulatedFailureError);
});

test('delay limita o tempo máximo a 10 segundos', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const scenarios = makeDiagnosticScenarios({ movements: {}, logger });

  const pending = scenarios.delay({ ms: 999_999 });
  t.mock.timers.tick(10_000);

  assert.deepEqual(await pending, { delayed: 10_000 });
});
