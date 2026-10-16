const { OrderStatus, newOrder } = require('../domain/order');
const { StockUnavailableError } = require('../domain/errors');
const { randomCustomerId, randomSku } = require('../domain/catalog');

// Cria um pedido: grava no banco do pedidos-api e reserva o estoque no estoque-api.
function makeCreateOrder({ orders, stock, logger }) {
  return async function createOrder({ customerId = randomCustomerId(), sku = randomSku(), qty = 1 } = {}) {
    const order = await orders.save(newOrder({ customerId, sku, qty }));

    try {
      await stock.reserve({ orderId: order.id, sku: order.sku, qty: order.qty });
    } catch (cause) {
      await orders.updateStatus(order.id, OrderStatus.FAILED);
      throw new StockUnavailableError({ ...order, status: OrderStatus.FAILED }, { cause });
    }

    await orders.updateStatus(order.id, OrderStatus.CONFIRMED);
    logger.info({ order_id: order.id, sku: order.sku, qty: order.qty }, 'pedido confirmado');
    return { ...order, status: OrderStatus.CONFIRMED };
  };
}

module.exports = { makeCreateOrder };
