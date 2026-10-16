const { Router } = require('express');
const { asyncHandler } = require('../asyncHandler');

function stockRoutes({ getStock, getStockBatch, reserveStock }) {
  const router = Router();

  // GET /stock?skus=SKU-001,SKU-002  (consulta em lote)
  router.get('/stock', asyncHandler(async (req, res) => {
    const skus = String(req.query.skus || '').split(',').filter(Boolean);
    res.json(await getStockBatch(skus));
  }));

  router.get('/stock/:sku', asyncHandler(async (req, res) => {
    res.json(await getStock(req.params.sku));
  }));

  router.post('/reserve', asyncHandler(async (req, res) => {
    res.json(await reserveStock(req.body || {}));
  }));

  return router;
}

module.exports = { stockRoutes };
