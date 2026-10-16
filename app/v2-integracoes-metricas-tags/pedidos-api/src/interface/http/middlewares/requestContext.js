const { randomUUID } = require('node:crypto');

// Define o request id (o do chamador, se vier, ou um novo), devolve no header e registra o log de acesso.
const requestContextMiddleware = ({ requestContext, logger }) => (req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startedAt = Date.now();
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    // O contexto assíncrono já se perdeu neste evento, então o request id vai explícito
    logger.info(
      { request_id: requestId, method: req.method, path: req.path, status: res.statusCode, duration_ms: Date.now() - startedAt },
      'requisição concluída'
    );
  });

  requestContext.run({ requestId }, next);
};

module.exports = { requestContextMiddleware };
