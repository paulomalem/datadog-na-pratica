// Configuração lida do ambiente, num único lugar.
const env = process.env;

const toNumber = (value, fallback) => (value === undefined || value === '' ? fallback : Number(value));

// env, service e version das métricas (os mesmos valores dos labels do Kubernetes)
const unifiedTags = (service) => ({ env: env.DD_ENV || 'dev', service: env.DD_SERVICE || service, version: env.DD_VERSION || '3.0.0' });

module.exports = {
  serviceName: env.DD_SERVICE || 'pedidos-api',
  environment: env.DD_ENV || 'dev',
  version: env.DD_VERSION || '3.0.0',
  port: toNumber(env.PORT, 3001),
  // Região de exemplo, usada como tag customizada nos logs
  region: env.REGION || 'local',
  // DogStatsD: o Agent do nó (DD_AGENT_HOST vem do manifest) na porta 8125
  dogstatsd: { host: env.DD_AGENT_HOST || '', port: toNumber(env.DD_DOGSTATSD_PORT, 8125) },
  unifiedTags: unifiedTags('pedidos-api'),
  stockService: {
    baseUrl: env.ESTOQUE_API_URL || 'http://localhost:3002',
    timeoutMs: 10_000,
  },
  database: {
    host: env.PGHOST || 'localhost',
    port: toNumber(env.PGPORT, 5432),
    user: env.PGUSER || 'orders',
    password: env.PGPASSWORD || 'orders',
    database: env.PGDATABASE || 'orders',
    max: 10,
  },
};
