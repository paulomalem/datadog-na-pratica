// v4 (estoque-api): instrumentação com OpenTelemetry (SDK Node), enviando por OTLP/HTTP ao Agent.
// Este módulo precisa ser carregado ANTES de qualquer outra biblioteca (express, pg...).
// OTEL_SERVICE_NAME, OTEL_RESOURCE_ATTRIBUTES e OTEL_EXPORTER_OTLP_ENDPOINT vêm do ambiente.
module.exports = require('./otel');
