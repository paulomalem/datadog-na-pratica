// Ponto de entrada e "composition root": é o único lugar que conhece todas as camadas e liga tudo.

const config = require('./config');
const requestContext = require('./infrastructure/context/requestContext');
const { createLogger } = require('./infrastructure/logging/createLogger');
const { createMetrics } = require('./infrastructure/metrics/createMetrics');
const { createPool } = require('./infrastructure/postgres/createPool');
const { PgOrderRepository } = require('./infrastructure/postgres/PgOrderRepository');
const { HttpStockGateway } = require('./infrastructure/http/HttpStockGateway');
const { makeCreateOrder } = require('./application/createOrder');
const { makeListOrders } = require('./application/listOrders');
const { makeBuildOrderReport } = require('./application/buildOrderReport');
const { makeDiagnosticScenarios } = require('./application/diagnosticScenarios');
const { createApp } = require('./interface/http/createApp');

// Infraestrutura
const logger = createLogger({ config, requestContext });
const metrics = createMetrics({ config, logger });
const pool = createPool(config.database, logger);
const orders = new PgOrderRepository(pool);
const stock = new HttpStockGateway({ ...config.stockService, requestContext });

// Casos de uso
const useCases = {
  createOrder: makeCreateOrder({ orders, stock, logger, metrics, region: config.region }),
  listOrders: makeListOrders({ orders }),
  buildOrderReport: makeBuildOrderReport({ orders, stock, logger }),
  scenarios: makeDiagnosticScenarios({ stock }),
};

// Interface HTTP
const app = createApp({
  useCases,
  requestContext,
  logger,
  health: {
    serviceName: config.serviceName,
    checkDatabase: () => pool.query('SELECT 1'),
  },
});

app.listen(config.port, () => {
  logger.info({ port: config.port }, `${config.serviceName} no ar`);
});
