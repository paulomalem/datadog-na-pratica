// Implementa StockRepository (ver application/ports.js) sobre o PostgreSQL.
class PgStockRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findBySku(sku) {
    const { rows } = await this.pool.query('SELECT sku, qty FROM stock WHERE sku = $1', [sku]);
    return rows[0] || null;
  }

  async findBySkus(skus) {
    const { rows } = await this.pool.query('SELECT sku, qty FROM stock WHERE sku = ANY($1)', [skus]);
    return rows;
  }

  // Baixa o saldo só se houver estoque. Retorna o novo saldo, ou null se não houver.
  async decrease(sku, qty) {
    const { rows } = await this.pool.query(
      'UPDATE stock SET qty = qty - $1 WHERE sku = $2 AND qty >= $1 RETURNING qty',
      [qty, sku]
    );
    return rows.length ? rows[0].qty : null;
  }
}

module.exports = { PgStockRepository };
