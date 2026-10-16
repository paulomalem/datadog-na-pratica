// Contratos (portas) que a camada de aplicação espera da infraestrutura.
// A infraestrutura implementa; os casos de uso só conhecem estas formas.
// Este arquivo é só documentação (JSDoc), não executa nada.

/**
 * @typedef {Object} Order
 * @property {number} [id]
 * @property {string} customerId
 * @property {string} sku
 * @property {number} qty
 * @property {'pending' | 'confirmed' | 'failed'} status
 * @property {Date} [createdAt]
 */

/**
 * @typedef {Object} OrderRepository
 * @property {(order: Order) => Promise<Order>} save                          devolve o pedido com id
 * @property {(id: number, status: string) => Promise<void>} updateStatus
 * @property {(limit: number) => Promise<Order[]>} listRecent
 */

/**
 * Cliente do serviço de estoque (estoque-api).
 * @typedef {Object} StockGateway
 * @property {(r: {orderId: number, sku: string, qty: number}) => Promise<unknown>} reserve
 * @property {(sku: string) => Promise<{sku: string, qty: number}>} getBySku
 * @property {(skus: string[]) => Promise<Record<string, number>>} getBatch
 * @property {(r: {ref?: string, mode: 'slow' | 'fast'}) => Promise<unknown>} summarizeMovements
 * @property {(r: {ms?: number}) => Promise<unknown>} delay
 * @property {(r: {ms?: number}) => Promise<unknown>} burnCpu
 * @property {(r: {type?: string}) => Promise<unknown>} fail
 */

/**
 * Logger no estilo do pino: logger.info({ campo }, 'mensagem').
 * @typedef {Object} Logger
 * @property {(fields: object, message?: string) => void} info
 * @property {(fields: object, message?: string) => void} warn
 * @property {(fields: object, message?: string) => void} error
 */

module.exports = {};
