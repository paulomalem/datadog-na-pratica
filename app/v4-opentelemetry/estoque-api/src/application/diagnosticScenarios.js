const crypto = require('node:crypto');
const { SimulatedFailureError } = require('../domain/errors');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const atMost = (value, max) => Math.min(Number(value), max);

// Cenários para as aulas de APM, logs, monitores, SLO e Profiler.
function makeDiagnosticScenarios({ movements, logger }) {
  return {
    // mode "slow": lower(ref) impede o uso do índice (varredura completa).
    // mode "fast": igualdade em ref usa o índice.
    async summarizeMovements({ ref, mode }) {
      const strategy = mode === 'fast' ? 'index' : 'scan';
      const summary = await movements.summarizeByRef(ref, strategy);
      return { ref, mode: mode === 'fast' ? 'fast' : 'slow', ...summary };
    },

    // Resposta demorada de propósito (chamada lenta entre serviços)
    async delay({ ms = 800 }) {
      const delayed = atMost(ms, 10_000);
      await sleep(delayed);
      logger.info(`resposta atrasada de propósito ms=${delayed}`);
      return { delayed };
    },

    // Consumo de CPU síncrono (alimenta o Continuous Profiler)
    async burnCpu({ ms = 300 }) {
      const busyMs = atMost(ms, 5_000);
      const end = Date.now() + busyMs;
      let rounds = 0;
      while (Date.now() < end) {
        crypto.pbkdf2Sync('lab', 'salt', 20_000, 64, 'sha512');
        rounds += 1;
      }
      return { busy_ms: busyMs, rounds };
    },

    // Falhas de propósito: exception (padrão) | timeout
    async fail({ type = 'exception' }) {
      if (type === 'timeout') {
        await sleep(15_000);
        return { ok: true };
      }
      throw new SimulatedFailureError('estoque inconsistente (exceção simulada)');
    },
  };
}

module.exports = { makeDiagnosticScenarios };
