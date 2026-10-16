const { Router } = require('express');
const { asyncHandler } = require('../asyncHandler');

function ordersRoutes({ createOrder, listOrders, buildOrderReport }) {
  const router = Router();

  router.post('/', asyncHandler(async (req, res) => {
    const order = await createOrder(req.body || {});
    res.status(201).json({ orderId: order.id, sku: order.sku, qty: order.qty, status: order.status });
  }));

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await listOrders({ limit: req.query.limit }));
  }));

  // GET /orders/report?mode=n1|batch
  router.get('/report', asyncHandler(async (req, res) => {
    const mode = req.query.mode === 'n1' ? 'n1' : 'batch';
    res.json(await buildOrderReport({ mode, limit: req.query.limit }));
  }));

  return router;
}

module.exports = { ordersRoutes };
