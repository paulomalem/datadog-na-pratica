// Implementa MovementRepository (ver application/ports.js) sobre o PostgreSQL.
const SUMMARY_BY_INDEX = `
  SELECT count(*)::int AS movements, sum(qty)::int AS total
  FROM movements WHERE ref = $1`;

// lower(ref) impede o uso do índice idx_movements_ref: varredura completa de 2 milhões de linhas
const SUMMARY_BY_SCAN = `
  SELECT count(*)::int AS movements, sum(qty)::int AS total
  FROM movements WHERE lower(ref) = lower($1)`;

class PgMovementRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async record({ sku, ref, qty, note }) {
    await this.pool.query(
      'INSERT INTO movements (sku, ref, qty, note) VALUES ($1, $2, $3, $4)',
      [sku, ref, qty, note]
    );
  }

  async summarizeByRef(ref, strategy) {
    const sql = strategy === 'index' ? SUMMARY_BY_INDEX : SUMMARY_BY_SCAN;
    const { rows } = await this.pool.query(sql, [ref]);
    return rows[0];
  }
}

module.exports = { PgMovementRepository };
