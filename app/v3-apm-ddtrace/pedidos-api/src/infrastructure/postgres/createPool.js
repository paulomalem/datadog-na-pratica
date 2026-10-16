const { Pool } = require('pg');

function createPool(databaseConfig, logger) {
  const pool = new Pool(databaseConfig);
  pool.on('error', (err) => logger.error({ err }, 'erro no pool do postgres'));
  return pool;
}

module.exports = { createPool };
