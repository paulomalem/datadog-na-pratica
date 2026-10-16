// Regras sobre a movimentação de estoque.

const REF_BUCKETS = 5000;

// Cada movimentação aponta para uma referência "REF-00001".."REF-05000".
// É a coluna de alta cardinalidade usada no cenário de consulta lenta.
function movementRefForOrder(orderId) {
  return `REF-${String((Number(orderId) % REF_BUCKETS) + 1).padStart(5, '0')}`;
}

module.exports = { movementRefForOrder };
