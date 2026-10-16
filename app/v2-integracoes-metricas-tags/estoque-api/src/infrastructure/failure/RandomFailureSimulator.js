const { SimulatedFailureError } = require('../../domain/errors');

// Implementa FailureSimulator: falha com a probabilidade configurada (ERROR_RATE).
class RandomFailureSimulator {
  constructor({ rate, random = Math.random }) {
    this.rate = rate;
    this.random = random;
  }

  maybeFail() {
    if (this.random() < this.rate) {
      throw new SimulatedFailureError('falha ao reservar estoque (erro simulado)');
    }
  }
}

module.exports = { RandomFailureSimulator };
