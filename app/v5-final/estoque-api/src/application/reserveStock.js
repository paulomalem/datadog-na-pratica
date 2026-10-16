const { InsufficientStockError } = require('../domain/errors');
const { movementRefForOrder } = require('../domain/movement');
const { nullMetrics } = require('./nullMetrics');

// Reserva estoque para um pedido: baixa o saldo e registra a movimentação.
// Métricas: reservas por SKU e resultado, e o tempo da reserva.
function makeReserveStock({ stock, movements, failures, logger, metrics = nullMetrics }) {
  return async function reserveStock({ orderId, sku, qty = 1 }) {
    const startedAt = Date.now();
    let result = 'error';

    try {
      failures.maybeFail();

      const balance = await stock.decrease(sku, qty);
      if (balance === null) {
        result = 'insufficient';
        logger.warn(`estoque insuficiente order=${orderId} sku=${sku} qty=${qty}`);
        throw new InsufficientStockError(sku, qty);
      }

      await movements.record({
        sku,
        ref: movementRefForOrder(orderId),
        qty: -qty,
        note: `order ${orderId}`,
      });

      result = 'ok';
      logger.info(`reservado order=${orderId} sku=${sku} qty=${qty} saldo=${balance}`);
      return { orderId, sku, qty, balance };
    } finally {
      metrics.increment('lab.stock.reservations', { sku, result });
      metrics.distribution('lab.stock.reserve_ms', Date.now() - startedAt, { result });
    }
  };
}

module.exports = { makeReserveStock };
