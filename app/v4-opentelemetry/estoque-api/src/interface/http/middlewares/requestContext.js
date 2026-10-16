// Define o request id da requisição (o do chamador, se vier) e registra o log de acesso.
const requestContextMiddleware = ({ requestContext, logger }) => (req, res, next) => {
  const requestId = req.headers['x-request-id'] || '-';
  const startedAt = Date.now();

  res.on('finish', () => {
    // O contexto assíncrono já se perdeu neste evento, então o request id vai explícito
    logger.info(`${req.method} ${req.path} status=${res.statusCode} tempo=${Date.now() - startedAt}ms`, { requestId });
  });

  requestContext.run({ requestId }, next);
};

module.exports = { requestContextMiddleware };
