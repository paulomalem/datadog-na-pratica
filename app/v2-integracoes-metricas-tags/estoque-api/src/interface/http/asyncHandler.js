// Express 4 não captura rejeições de handlers async; este wrapper encaminha o erro para o errorHandler.
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = { asyncHandler };
