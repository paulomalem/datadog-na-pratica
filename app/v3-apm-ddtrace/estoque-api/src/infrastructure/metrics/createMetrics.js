// Métricas customizadas via DogStatsD (hot-shots). O Agent do nó recebe por UDP na porta 8125.
// Sem DD_AGENT_HOST (por exemplo, rodando fora do Kubernetes) o cliente vira "mock": nada é enviado.
const StatsD = require('hot-shots');

function createMetrics({ config, logger }) {
  const { host, port } = config.dogstatsd;
  const client = new StatsD({
    host: host || undefined,
    port,
    mock: !host,
    // env, service e version (Unified Service Tagging): sem isto as métricas chegam sem essas tags
    globalTags: config.unifiedTags,
    errorHandler: (err) => logger.warn(`dogstatsd: ${err.message}`),
  });

  // tags como objeto: { sku: 'SKU-001' } vira "sku:SKU-001"
  return {
    increment: (name, tags) => client.increment(name, 1, tags),
    gauge: (name, value, tags) => client.gauge(name, value, tags),
    distribution: (name, value, tags) => client.distribution(name, value, tags),
  };
}

module.exports = { createMetrics };
