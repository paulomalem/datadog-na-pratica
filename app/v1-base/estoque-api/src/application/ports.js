// Contratos (portas) que a camada de aplicação espera da infraestrutura.
// A infraestrutura implementa; os casos de uso só conhecem estas formas.
// Este arquivo é só documentação (JSDoc), não executa nada.

/**
 * @typedef {Object} StockRepository
 * @property {(sku: string) => Promise<{sku: string, qty: number} | null>} findBySku
 * @property {(skus: string[]) => Promise<Array<{sku: string, qty: number}>>} findBySkus
 * @property {(sku: string, qty: number) => Promise<number | null>} decrease  novo saldo, ou null se não houver estoque
 */

/**
 * @typedef {Object} MovementRepository
 * @property {(movement: {sku: string, ref: string, qty: number, note: string}) => Promise<void>} record
 * @property {(ref: string, strategy: 'index' | 'scan') => Promise<{movements: number, total: number}>} summarizeByRef
 */

/**
 * @typedef {Object} FailureSimulator
 * @property {() => void} maybeFail  lança SimulatedFailureError com certa probabilidade
 */

/**
 * @typedef {Object} Logger
 * @property {(message: string) => void} info
 * @property {(message: string) => void} warn
 * @property {(message: string) => void} error
 */

module.exports = {};
