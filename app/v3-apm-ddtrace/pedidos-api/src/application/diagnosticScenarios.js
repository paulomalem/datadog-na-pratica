const { randomMovementRef } = require('../domain/catalog');

// Cenários para as aulas de APM, logs, monitores e SLO. Quase todos acionam o estoque-api.
function makeDiagnosticScenarios({ stock }) {
  return {
    slowQuery: ({ mode, ref = randomMovementRef() }) => stock.summarizeMovements({ ref, mode }),
    slowCall: ({ ms = 800 }) => stock.delay({ ms }),
    cpu: ({ ms = 300 }) => stock.burnCpu({ ms }),
    remoteError: ({ type = 'exception' }) => stock.fail({ type }),

    // Memória no próprio pedidos-api: aloca objetos, segura por um tempo e libera (aparece no profile de heap)
    memory: async ({ mb = 50, holdMs = 15000 }) => {
      const size = Math.min(Math.max(Number(mb) || 50, 1), 300);
      const hold = Math.min(Math.max(Number(holdMs) || 15000, 1000), 60000);
      const held = [];
      for (let i = 0; i < size * 8000; i += 1) held.push({ id: i, label: `item-${i}-${Math.random().toString(36).slice(2)}`, payload: new Array(8).fill(i) });
      await new Promise((resolve) => setTimeout(resolve, hold));
      return { mb: size, held_objects: held.length, hold_ms: hold };
    },

    // Erro dentro do próprio pedidos-api
    localError: async () => {
      throw new Error('erro local simulado no pedidos-api');
    },
  };
}

module.exports = { makeDiagnosticScenarios };
