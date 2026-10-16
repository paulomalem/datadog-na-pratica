const { SkuNotFoundError } = require('../domain/errors');

// Consulta o saldo de um SKU.
function makeGetStock({ stock }) {
  return async function getStock(sku) {
    const item = await stock.findBySku(sku);
    if (!item) throw new SkuNotFoundError(sku);
    return item;
  };
}

// Consulta o saldo de vários SKUs de uma vez (evita o N+1 de quem chama).
function makeGetStockBatch({ stock }) {
  return async function getStockBatch(skus) {
    const items = await stock.findBySkus(skus);
    return Object.fromEntries(items.map((item) => [item.sku, item.qty]));
  };
}

module.exports = { makeGetStock, makeGetStockBatch };
