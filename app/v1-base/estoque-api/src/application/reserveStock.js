const { InsufficientStockError } = require('../domain/errors');
const { movementRefForOrder } = require('../domain/movement');

// Reserva estoque para um pedido: baixa o saldo e registra a movimentação.
function makeReserveStock({ stock, movements, failures, logger }) {
  return async function reserveStock({ orderId, sku, qty = 1 }) {
    failures.maybeFail();

    const balance = await stock.decrease(sku, qty);
    if (balance === null) {
      logger.warn(`estoque insuficiente order=${orderId} sku=${sku} qty=${qty}`);
      throw new InsufficientStockError(sku, qty);
    }

    await movements.record({
      sku,
      ref: movementRefForOrder(orderId),
      qty: -qty,
      note: `order ${orderId}`,
    });

    logger.info(`reservado order=${orderId} sku=${sku} qty=${qty} saldo=${balance}`);
    return { orderId, sku, qty, balance };
  };
}

module.exports = { makeReserveStock };
