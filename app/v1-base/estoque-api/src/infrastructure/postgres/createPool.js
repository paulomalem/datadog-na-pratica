const { Pool } = require('pg');

function createPool(databaseConfig, logger) {
  const pool = new Pool(databaseConfig);
  pool.on('error', (err) => logger.error(`erro no pool do postgres: ${err.message}`));
  return pool;
}

module.exports = { createPool };
