// Contexto da requisição atual (request id), disponível em qualquer camada sem passar parâmetros.
const { AsyncLocalStorage } = require('node:async_hooks');

const storage = new AsyncLocalStorage();

module.exports = {
  run: (context, fn) => storage.run(context, fn),
  requestId: () => storage.getStore()?.requestId,
};
