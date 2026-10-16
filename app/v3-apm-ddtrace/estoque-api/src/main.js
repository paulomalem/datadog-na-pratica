// Ponto de entrada e "composition root": é o único lugar que conhece todas as camadas e liga tudo.

// IMPORTANTE: o tracing precisa ser a primeira coisa carregada (antes de express, pg, axios...).
const tracing = require('./infrastructure/tracing');

const config = require('./config');
const requestContext = require('./infrastructure/context/requestContext');
const { LegacyLogger } = require('./infrastructure/logging/LegacyLogger');
const { createMetrics } = require('./infrastructure/metrics/createMetrics');
const { createPool } = require('./infrastructure/postgres/createPool');
const { PgStockRepository } = require('./infrastructure/postgres/PgStockRepository');
const { PgMovementRepository } = require('./infrastructure/postgres/PgMovementRepository');
const { RandomFailureSimulator } = require('./infrastructure/failure/RandomFailureSimulator');
const { makeGetStock, makeGetStockBatch } = require('./application/getStock');
const { makeReserveStock } = require('./application/reserveStock');
const { makeDiagnosticScenarios } = require('./application/diagnosticScenarios');
const { createApp } = require('./interface/http/createApp');

// Infraestrutura
const logger = new LegacyLogger({ tracing, requestContext });
const metrics = createMetrics({ config, logger });
const pool = createPool(config.database, logger);
const stock = new PgStockRepository(pool);
const movements = new PgMovementRepository(pool);
const failures = new RandomFailureSimulator({ rate: config.simulatedErrorRate });

// Casos de uso
const useCases = {
  getStock: makeGetStock({ stock }),
  getStockBatch: makeGetStockBatch({ stock }),
  reserveStock: makeReserveStock({ stock, movements, failures, logger, metrics }),
  scenarios: makeDiagnosticScenarios({ movements, logger }),
};

// Interface HTTP
const app = createApp({
  useCases,
  requestContext,
  logger,
  health: {
    serviceName: config.serviceName,
    tracerMode: tracing.mode,
    checkDatabase: () => pool.query('SELECT 1'),
  },
});

app.listen(config.port, () => {
  logger.info(`${config.serviceName} no ar port=${config.port} tracer=${tracing.mode}`);
});
