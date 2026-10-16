const { ValidationError } = require('./errors');

const OrderStatus = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
});

// Cria um pedido novo (ainda sem id), validando as regras de negócio.
function newOrder({ customerId, sku, qty }) {
  if (!customerId) throw new ValidationError('customerId é obrigatório');
  if (!sku) throw new ValidationError('sku é obrigatório');
  if (!Number.isInteger(qty) || qty < 1) throw new ValidationError('qty deve ser um inteiro positivo');

  return { customerId, sku, qty, status: OrderStatus.PENDING };
}

module.exports = { OrderStatus, newOrder };
