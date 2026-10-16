const { Router } = require('express');
const swaggerUi = require('swagger-ui-express');
const spec = require('../docs/openapi');

// Swagger UI em /docs e o spec em /openapi.json (usados nas demonstrações).
function docsRoutes() {
  const router = Router();
  router.get('/openapi.json', (req, res) => res.json(spec));
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: `${spec.info.title} | Lab Loja Datadog` }));
  return router;
}

module.exports = { docsRoutes };
