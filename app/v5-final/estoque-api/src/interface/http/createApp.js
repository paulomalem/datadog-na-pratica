const express = require('express');
const { requestContextMiddleware } = require('./middlewares/requestContext');
const { errorHandler } = require('./middlewares/errorHandler');
const { healthRoutes } = require('./routes/healthRoutes');
const { docsRoutes } = require('./routes/docsRoutes');
const { stockRoutes } = require('./routes/stockRoutes');
const { scenarioRoutes } = require('./routes/scenarioRoutes');

// Monta a aplicação Express a partir dos casos de uso. Não conhece o banco de dados.
function createApp({ useCases, health, requestContext, logger }) {
  const app = express();

  app.use(requestContextMiddleware({ requestContext, logger }));
  app.use(express.json());

  app.use(healthRoutes(health));
  app.use(docsRoutes());
  app.use(stockRoutes(useCases));
  app.use(scenarioRoutes(useCases));

  app.use(errorHandler({ logger }));
  return app;
}

module.exports = { createApp };
