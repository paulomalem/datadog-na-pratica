// Logs estruturados em JSON (pino). O request_id entra sozinho em todo log.
const pino = require('pino');

// O erro do axios traz config/request/response enormes; guardamos só o essencial
function serializeError(err) {
  return {
    type: err.name,
    message: err.message,
    stack: err.stack,
    ...(err.upstreamStatus ? { upstream_status: err.upstreamStatus } : {}),
    ...(err.cause ? { cause: err.cause.message } : {}),
  };
}

function createLogger({ config, requestContext }) {
  return pino({
    base: { service: config.serviceName },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: { level: (label) => ({ level: label }) },
    serializers: { err: serializeError },
    mixin() {
      const requestId = requestContext.requestId();
      return requestId ? { request_id: requestId } : {};
    },
  });
}

module.exports = { createLogger };
