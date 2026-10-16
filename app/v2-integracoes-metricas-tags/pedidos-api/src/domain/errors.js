// Erros de domínio: dizem o que deu errado nas regras de negócio, sem saber nada de HTTP ou banco.

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

// O pedido foi gravado, mas o estoque não pôde ser reservado
class StockUnavailableError extends Error {
  constructor(order, { cause } = {}) {
    super(`estoque indisponível para o pedido ${order.id} (${order.sku})`, { cause });
    this.name = 'StockUnavailableError';
    this.order = order;
    this.logContext = { order_id: order.id, sku: order.sku };
  }
}

// Falha ao falar com outro serviço (estoque-api)
class UpstreamError extends Error {
  constructor(message, { cause, status } = {}) {
    super(message, { cause });
    this.name = 'UpstreamError';
    this.upstreamStatus = status;
  }
}

module.exports = { ValidationError, StockUnavailableError, UpstreamError };
