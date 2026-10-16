const { clamp } = require('./clamp');

// Relatório de pedidos com o saldo de estoque de cada SKU.
//   mode "n1":    uma chamada ao estoque-api por pedido (o clássico N+1)
//   mode "batch": uma única chamada com todos os SKUs
function makeBuildOrderReport({ orders, stock, logger }) {
  return async function buildOrderReport({ mode = 'batch', limit = 30 } = {}) {
    const recent = await orders.listRecent(clamp(limit, 1, 100));

    const stockBySku = mode === 'n1'
      ? await stockOneByOne(stock, recent)
      : await stock.getBatch([...new Set(recent.map((order) => order.sku))]);

    logger.info({ mode, orders: recent.length }, 'relatório de pedidos gerado');
    return { mode, orders: recent.length, stock: stockBySku };
  };
}

async function stockOneByOne(stock, recentOrders) {
  const stockBySku = {};
  for (const order of recentOrders) {
    const item = await stock.getBySku(order.sku);
    stockBySku[order.sku] = item.qty;
  }
  return stockBySku;
}

module.exports = { makeBuildOrderReport };
