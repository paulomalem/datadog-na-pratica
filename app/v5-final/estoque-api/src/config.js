// Configuração lida do ambiente, num único lugar.
const env = process.env;

const toNumber = (value, fallback) => (value === undefined || value === '' ? fallback : Number(value));

// env, service e version das métricas (os mesmos valores dos labels do Kubernetes)
const unifiedTags = (service) => ({ env: env.DD_ENV || 'dev', service: env.DD_SERVICE || service, version: env.DD_VERSION || '5.0.0' });

module.exports = {
  serviceName: env.DD_SERVICE || 'estoque-api',
  port: toNumber(env.PORT, 3002),
  // DogStatsD: o Agent do nó (DD_AGENT_HOST vem do manifest) na porta 8125
  dogstatsd: { host: env.DD_AGENT_HOST || '', port: toNumber(env.DD_DOGSTATSD_PORT, 8125) },
  unifiedTags: unifiedTags('estoque-api'),
  // Probabilidade de falha simulada ao reservar estoque (usada em monitores, Error Tracking e SLO)
  simulatedErrorRate: toNumber(env.ERROR_RATE, 0.03),
  database: {
    host: env.PGHOST || 'localhost',
    port: toNumber(env.PGPORT, 5432),
    user: env.PGUSER || 'stock',
    password: env.PGPASSWORD || 'stock',
    database: env.PGDATABASE || 'stock',
    max: 10,
  },
};
