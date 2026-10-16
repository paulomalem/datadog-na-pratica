const { Router } = require('express');
const { asyncHandler } = require('../asyncHandler');

function healthRoutes({ checkDatabase, serviceName, tracerMode }) {
  const router = Router();

  router.get('/health', asyncHandler(async (req, res) => {
    await checkDatabase();
    res.json({ status: 'ok', service: serviceName, tracer: tracerMode });
  }));

  return router;
}

module.exports = { healthRoutes };
