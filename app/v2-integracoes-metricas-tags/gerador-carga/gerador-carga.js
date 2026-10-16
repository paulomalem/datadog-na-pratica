// Gerador de carga contínuo: mistura de chamadas normais e de cenários, em ritmo constante.
// RATE = requisições por segundo (padrão 2). TARGET = URL do pedidos-api.
const TARGET = process.env.TARGET || 'http://localhost:3001';
const RATE = Number(process.env.RATE || 2);
const randomRef = () => `REF-${String(Math.floor(Math.random() * 5000) + 1).padStart(5, '0')}`;

// [peso, método, caminho]
const MIX = [
  [60, 'POST', () => '/orders'],
  [14, 'GET', () => '/orders?limit=10'],
  [9, 'GET', () => '/orders/report?mode=batch'],
  [5, 'GET', () => '/orders/report?mode=n1'],
  [4, 'GET', () => `/scenarios/slow-query?mode=slow&ref=${randomRef()}`],
  [3, 'GET', () => `/scenarios/slow-query?mode=fast&ref=${randomRef()}`],
  [2, 'GET', () => '/scenarios/slow-call?ms=800'],
  [1, 'GET', () => '/scenarios/error?type=exception'],
  [1, 'GET', () => '/scenarios/cpu?ms=200'],
  [1, 'GET', () => '/scenarios/error-local'],
];
const total = MIX.reduce((s, m) => s + m[0], 0);

function choose() {
  let r = Math.random() * total;
  for (const m of MIX) { r -= m[0]; if (r <= 0) return m; }
  return MIX[0];
}

let sent = 0, failed = 0;
async function once() {
  const [, method, path] = choose();
  try {
    const res = await fetch(TARGET + path(), {
      method,
      headers: { 'content-type': 'application/json' },
      body: method === 'POST' ? JSON.stringify({}) : undefined,
      signal: AbortSignal.timeout(20000),
    });
    await res.arrayBuffer();
    if (res.status >= 500) failed++;
  } catch { failed++; }
  sent++;
}

console.log(JSON.stringify({ msg: 'gerador-carga iniciado', target: TARGET, rate: RATE }));
setInterval(once, 1000 / RATE);
setInterval(() => console.log(JSON.stringify({ msg: 'gerador-carga', sent, failed_5xx_or_net: failed })), 30000);
