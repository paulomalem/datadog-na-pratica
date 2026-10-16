// Logger "legado" em texto livre, de propósito: é a matéria-prima da aula de Grok Parser.
//
// Formato:
//   2026-10-08 02:29:07,805 INFO  [estoque] trace=<trace_id> req=<request_id> mensagem
class LegacyLogger {
  constructor({ tracing, requestContext, component = 'estoque', write = console.log }) {
    this.tracing = tracing;
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
    const trace = this.tracing.currentTraceId() || '-';
    const request = requestId || this.requestContext.requestId() || '-';
    this.write(`${timestamp} ${level.padEnd(5)} [${this.component}] trace=${trace} req=${request} ${message}`);
  }
}

module.exports = { LegacyLogger };
