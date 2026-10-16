const { Router } = require('express');
const { asyncHandler } = require('../asyncHandler');

// Cenários para as aulas (consulta lenta, chamada demorada, CPU, erros).
function scenarioRoutes({ scenarios }) {
  const router = Router();

  router.get('/slow-query', asyncHandler(async (req, res) => {
    const mode = req.query.mode === 'fast' ? 'fast' : 'slow';
    res.json(await scenarios.slowQuery({ mode, ref: req.query.ref }));
  }));

  router.get('/slow-call', asyncHandler(async (req, res) => {
    res.json(await scenarios.slowCall({ ms: req.query.ms }));
  }));

  router.get('/cpu', asyncHandler(async (req, res) => {
    res.json(await scenarios.cpu({ ms: req.query.ms }));
  }));

  router.get('/memory', asyncHandler(async (req, res) => {
    res.json(await scenarios.memory({ mb: req.query.mb, holdMs: req.query.hold_ms }));
  }));

  router.get('/error', asyncHandler(async (req, res) => {
    res.json(await scenarios.remoteError({ type: req.query.type }));
  }));

  router.get('/error-local', asyncHandler(async () => {
    await scenarios.localError();
  }));

  return router;
}

module.exports = { scenarioRoutes };
