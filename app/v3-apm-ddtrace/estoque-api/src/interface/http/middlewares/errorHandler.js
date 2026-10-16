const { SkuNotFoundError, InsufficientStockError } = require('../../../domain/errors');

// Traduz erros de domínio para respostas HTTP. Qualquer outro erro vira 500.
function toHttpResponse(err) {
  if (err instanceof SkuNotFoundError) return { status: 404, body: { error: 'sku não encontrado' } };
  if (err instanceof InsufficientStockError) return { status: 409, body: { error: 'estoque insuficiente' } };
  return { status: 500, body: { error: err.message } };
}

const firstStackFrame = (err) => String(err.stack).split('\n')[1]?.trim();

const errorHandler = ({ logger }) => (err, req, res, next) => {
  const { status, body } = toHttpResponse(err);
  if (status >= 500) {
    logger.error(`erro: ${err.message} stack=${firstStackFrame(err)}`);
  }
  res.status(status).json(body);
};

module.exports = { errorHandler };
