const { randomMovementRef } = require('../domain/catalog');

// Cenários para as aulas de APM, logs, monitores e SLO. Quase todos acionam o estoque-api.
function makeDiagnosticScenarios({ stock }) {
  return {
    slowQuery: ({ mode, ref = randomMovementRef() }) => stock.summarizeMovements({ ref, mode }),
    slowCall: ({ ms = 800 }) => stock.delay({ ms }),
    cpu: ({ ms = 300 }) => stock.burnCpu({ ms }),
    remoteError: ({ type = 'exception' }) => stock.fail({ type }),

    // Erro dentro do próprio pedidos-api
    localError: async () => {
      throw new Error('erro local simulado no pedidos-api');
    },
  };
}

module.exports = { makeDiagnosticScenarios };
