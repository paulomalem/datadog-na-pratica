// Instrumentação com OpenTelemetry (SDK Node), enviando por OTLP/HTTP.
// OTEL_SERVICE_NAME e OTEL_EXPORTER_OTLP_ENDPOINT vêm do ambiente.
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { trace } = require('@opentelemetry/api');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});
sdk.start();

process.on('SIGTERM', () => sdk.shutdown().finally(() => process.exit(0)));

module.exports = {
  mode: 'otel',
  currentTraceId: () => {
    const span = trace.getActiveSpan();
    return span ? span.spanContext().traceId : null;
  },
};
