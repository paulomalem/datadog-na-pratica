// Implementa OrderRepository (ver application/ports.js) sobre o PostgreSQL.
const toOrder = (row) => ({
  id: Number(row.id),
  customerId: row.customer_id,
  sku: row.sku,
  qty: row.qty,
  status: row.status,
  createdAt: row.created_at,
});

class PgOrderRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async save(order) {
    const { rows } = await this.pool.query(
      'INSERT INTO orders (customer_id, sku, qty, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [order.customerId, order.sku, order.qty, order.status]
    );
    return { ...order, id: Number(rows[0].id) };
  }

  async updateStatus(id, status) {
    await this.pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
  }

  async listRecent(limit) {
    const { rows } = await this.pool.query('SELECT * FROM orders ORDER BY id DESC LIMIT $1', [limit]);
    return rows.map(toOrder);
  }
}

module.exports = { PgOrderRepository };
