// Erros de domínio: dizem o que deu errado nas regras de negócio, sem saber nada de HTTP ou banco.

class SkuNotFoundError extends Error {
  constructor(sku) {
    super(`sku não encontrado: ${sku}`);
    this.name = 'SkuNotFoundError';
    this.sku = sku;
  }
}

class InsufficientStockError extends Error {
  constructor(sku, qty) {
    super(`estoque insuficiente para ${sku} (pedido de ${qty})`);
    this.name = 'InsufficientStockError';
    this.sku = sku;
    this.qty = qty;
  }
}

// Falha injetada de propósito, para gerar erros nas aulas
class SimulatedFailureError extends Error {
  constructor(message = 'falha simulada') {
    super(message);
    this.name = 'SimulatedFailureError';
  }
}

module.exports = { SkuNotFoundError, InsufficientStockError, SimulatedFailureError };
