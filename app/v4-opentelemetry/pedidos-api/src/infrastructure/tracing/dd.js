// Instrumentação com dd-trace. DD_ENV, DD_SERVICE, DD_VERSION e DD_AGENT_HOST vêm do ambiente.
const tracer = require('dd-trace').init({
  logInjection: true,
});

module.exports = {
  mode: 'dd',
  tracer,
  currentTraceId: () => {
    const span = tracer.scope().active();
    return span ? span.context().toTraceId() : null;
  },
  // Tags customizadas no span ativo
  annotate: (tags) => {
    const span = tracer.scope().active();
    if (span) span.addTags(tags);
  },
};
