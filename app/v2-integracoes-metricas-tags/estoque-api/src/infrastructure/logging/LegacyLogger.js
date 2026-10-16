// Logger "legado" em texto livre, de propósito: é a matéria-prima da aula de Grok Parser.
//
// Formato:
//   2026-10-08 02:29:07,805 INFO  [estoque] req=<request_id> mensagem
class LegacyLogger {
  constructor({ requestContext, component = 'estoque', write = console.log }) {
    this.requestContext = requestContext;
    this.component = component;
    this.write = write;
  }

  info(message, options) { this.#log('INFO', message, options); }
  warn(message, options) { this.#log('WARN', message, options); }
  error(message, options) { this.#log('ERROR', message, options); }

  // options.requestId permite informar o id quando o contexto da requisição já se perdeu (ex.: evento "finish")
  #log(level, message, { requestId } = {}) {
    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '').replace('.', ',');
    const request = requestId || this.requestContext.requestId() || '-';
    this.write(`${timestamp} ${level.padEnd(5)} [${this.component}] req=${request} ${message}`);
  }
}

module.exports = { LegacyLogger };
