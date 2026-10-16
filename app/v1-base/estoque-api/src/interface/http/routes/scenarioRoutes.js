const { Router } = require('express');
const { asyncHandler } = require('../asyncHandler');

// Cenários para as aulas (consulta lenta, chamada demorada, CPU, falhas).
function scenarioRoutes({ scenarios }) {
  const router = Router();

  router.get('/movements/summary/:ref', asyncHandler(async (req, res) => {
    res.json(await scenarios.summarizeMovements({ ref: req.params.ref, mode: req.query.mode }));
  }));

  router.get('/delay', asyncHandler(async (req, res) => {
    res.json(await scenarios.delay({ ms: req.query.ms }));
  }));

  router.get('/cpu', asyncHandler(async (req, res) => {
    res.json(await scenarios.burnCpu({ ms: req.query.ms }));
  }));

  router.get('/fail', asyncHandler(async (req, res) => {
    res.json(await scenarios.fail({ type: req.query.type }));
  }));

  return router;
}

module.exports = { scenarioRoutes };
