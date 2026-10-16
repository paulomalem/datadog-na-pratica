const { ValidationError, StockUnavailableError, UpstreamError } = require('../../../domain/errors');

// Traduz erros de domínio para respostas HTTP. Qualquer outro erro vira 500.
function toHttpResponse(err) {
  if (err instanceof ValidationError) {
    return { status: 400, body: { error: err.message } };
  }
  if (err instanceof StockUnavailableError) {
    const { id, sku, qty, status } = err.order;
    return { status: 502, body: { orderId: id, sku, qty, status, error: 'estoque indisponível' } };
  }
  if (err instanceof UpstreamError) {
    return { status: 502, body: { error: err.message } };
  }
  return { status: 500, body: { error: err.message } };
}

// Registra cada erro uma única vez, com o nível conforme a gravidade
const errorHandler = ({ logger }) => (err, req, res, next) => {
  const { status, body } = toHttpResponse(err);
  const level = status >= 500 ? 'error' : 'warn';
  logger[level]({ err, ...err.logContext }, 'erro ao processar a requisição');
  res.status(status).json(body);
};

module.exports = { errorHandler };
