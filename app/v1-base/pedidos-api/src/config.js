// Configuração lida do ambiente, num único lugar.
const env = process.env;

const toNumber = (value, fallback) => (value === undefined || value === '' ? fallback : Number(value));

module.exports = {
  serviceName: env.SERVICE_NAME || 'pedidos-api',
  port: toNumber(env.PORT, 3001),
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
