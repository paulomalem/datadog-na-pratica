// Métricas que não fazem nada: usadas nos testes e quando o caso de uso não recebe um cliente.
module.exports = {
  nullMetrics: {
    increment() {},
    gauge() {},
    distribution() {},
  },
};
