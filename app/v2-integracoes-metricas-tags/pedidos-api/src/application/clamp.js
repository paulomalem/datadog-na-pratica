// Limita um valor numérico ao intervalo [min, max]; valores inválidos viram min.
const clamp = (value, min, max) => Math.min(Math.max(Number(value) || min, min), max);

module.exports = { clamp };
