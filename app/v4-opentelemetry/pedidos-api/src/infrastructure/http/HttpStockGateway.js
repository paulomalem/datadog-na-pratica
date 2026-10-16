// Implementa StockGateway (ver application/ports.js): cliente HTTP do estoque-api.
const axios = require('axios');
const { UpstreamError } = require('../../domain/errors');

class HttpStockGateway {
  #http;
  #requestContext;

  constructor({ baseUrl, timeoutMs, requestContext }) {
    this.#http = axios.create({ baseURL: baseUrl, timeout: timeoutMs });
    this.#requestContext = requestContext;
  }

  reserve({ orderId, sku, qty }) {
    return this.#send({ method: 'post', url: '/reserve', data: { orderId, sku, qty } });
  }

  getBySku(sku) {
    return this.#send({ method: 'get', url: `/stock/${sku}` });
  }

  getBatch(skus) {
    return this.#send({ method: 'get', url: '/stock', params: { skus: skus.join(',') } });
  }

  summarizeMovements({ ref, mode }) {
    return this.#send({ method: 'get', url: `/movements/summary/${ref}`, params: { mode } });
  }

  delay({ ms }) {
    return this.#send({ method: 'get', url: '/delay', params: { ms } });
  }

  burnCpu({ ms }) {
    return this.#send({ method: 'get', url: '/cpu', params: { ms } });
  }

  fail({ type }) {
    return this.#send({ method: 'get', url: '/fail', params: { type } });
  }

  // Envia a requisição propagando o request id e converte falhas em UpstreamError
  async #send(request) {
    const requestId = this.#requestContext.requestId();
    try {
      const { data } = await this.#http.request({
        ...request,
        headers: requestId ? { 'x-request-id': requestId } : {},
      });
      return data;
    } catch (err) {
      throw new UpstreamError(`falha ao chamar o estoque-api: ${err.message}`, {
        cause: err,
        status: err.response?.status,
      });
    }
  }
}

module.exports = { HttpStockGateway };
