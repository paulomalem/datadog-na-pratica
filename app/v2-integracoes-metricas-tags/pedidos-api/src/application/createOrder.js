const { OrderStatus, newOrder } = require('../domain/order');
const { StockUnavailableError } = require('../domain/errors');
const { randomCustomerId, randomSku } = require('../domain/catalog');
const { nullMetrics } = require('./nullMetrics');

// Cria um pedido: grava no banco do pedidos-api e reserva o estoque no estoque-api.
// Métricas: pedidos criados, tempo de processamento e pedidos em andamento.
function makeCreateOrder({ orders, stock, logger, metrics = nullMetrics, region = 'local' }) {
  let inFlight = 0;

  return async function createOrder({ customerId = randomCustomerId(), sku = randomSku(), qty = 1 } = {}) {
    const startedAt = Date.now();
    let status = OrderStatus.FAILED;
    inFlight += 1;
    metrics.gauge('lab.orders.in_flight', inFlight);

    try {
      const order = await orders.save(newOrder({ customerId, sku, qty }));

      try {
        await stock.reserve({ orderId: order.id, sku: order.sku, qty: order.qty });
      } catch (cause) {
        await orders.updateStatus(order.id, OrderStatus.FAILED);
        throw new StockUnavailableError({ ...order, status: OrderStatus.FAILED }, { cause });
      }

      await orders.updateStatus(order.id, OrderStatus.CONFIRMED);
      status = OrderStatus.CONFIRMED;

      // Tags customizadas nos logs: customer_id (dado fictício), operation e region
      logger.info(
        { order_id: order.id, sku: order.sku, qty: order.qty, customer_id: customerId, operation: 'create_order', region },
        'pedido confirmado'
      );
      return { ...order, status: OrderStatus.CONFIRMED };
    } finally {
      inFlight -= 1;
      metrics.gauge('lab.orders.in_flight', inFlight);
      metrics.increment('lab.orders.created', { status });
      metrics.distribution('lab.orders.processing_ms', Date.now() - startedAt, { status });
    }
  };
}

module.exports = { makeCreateOrder };
