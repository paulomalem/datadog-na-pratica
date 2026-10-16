const { clamp } = require('./clamp');

// Lista os pedidos mais recentes.
function makeListOrders({ orders }) {
  return async function listOrders({ limit = 20 } = {}) {
    return orders.listRecent(clamp(limit, 1, 200));
  };
}

module.exports = { makeListOrders };
