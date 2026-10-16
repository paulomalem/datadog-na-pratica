// Logs estruturados em JSON (pino). request_id e trace_id entram sozinhos em todo log.
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

function createLogger({ config, tracing, requestContext }) {
  return pino({
    base: { service: config.serviceName, env: config.environment, version: config.version },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: { level: (label) => ({ level: label }) },
    serializers: { err: serializeError },
    mixin() {
      const requestId = requestContext.requestId();
      const traceId = tracing.currentTraceId();
      return {
        ...(requestId ? { request_id: requestId } : {}),
        ...(traceId ? { trace_id: traceId } : {}),
      };
    },
  });
}

module.exports = { createLogger };
