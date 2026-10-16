// Dados de exemplo do laboratório: catálogo de SKUs e identificadores aleatórios.

const SKUS = Array.from({ length: 20 }, (_, i) => `SKU-${String(i + 1).padStart(3, '0')}`);
const CUSTOMERS = 500;
const MOVEMENT_REFS = 5000;

const randomInt = (max) => Math.floor(Math.random() * max);

module.exports = {
  SKUS,
  randomSku: () => SKUS[randomInt(SKUS.length)],
  randomCustomerId: () => `cust-${randomInt(CUSTOMERS)}`,
  randomMovementRef: () => `REF-${String(randomInt(MOVEMENT_REFS) + 1).padStart(5, '0')}`,
};
