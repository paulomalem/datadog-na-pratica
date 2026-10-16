// v3: instrumentação com dd-trace (APM do Datadog).
// Este módulo precisa ser carregado ANTES de qualquer outra biblioteca (express, pg, axios...).
// DD_ENV, DD_SERVICE, DD_VERSION e DD_AGENT_HOST vêm do ambiente (manifests do Kubernetes).
module.exports = require('./dd');
