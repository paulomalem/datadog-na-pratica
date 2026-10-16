// Configuração lida do ambiente, num único lugar.
const env = process.env;

const toNumber = (value, fallback) => (value === undefined || value === '' ? fallback : Number(value));

module.exports = {
  serviceName: env.SERVICE_NAME || 'estoque-api',
  port: toNumber(env.PORT, 3002),
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
