const out = document.getElementById('out');
const base = window.APP_CONFIG.pedidosApiUrl;

document.querySelectorAll('button[data-call]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const [method, path] = btn.dataset.call.split(' ');
    out.textContent = `${method} ${path} ...`;
    const started = performance.now();
    try {
      const res = await fetch(base + path, {
        method,
        headers: { 'content-type': 'application/json' },
        body: method === 'POST' ? JSON.stringify({}) : undefined,
      });
      const body = await res.text();
      out.textContent = `${method} ${path}\nstatus ${res.status} em ${Math.round(performance.now() - started)} ms\n\n${body}`;
    } catch (err) {
      out.textContent = `${method} ${path}\nfalhou: ${err.message}`;
    }
  });
});

// Erro de JavaScript proposital (para aparecer como erro no RUM)
document.getElementById('js-error').addEventListener('click', () => {
  const cart = undefined;
  out.textContent = String(cart.items.length);
});

// Links do Swagger (rodapé)
document.getElementById('docs-pedidos').href = `${window.APP_CONFIG.pedidosApiUrl}/docs`;
document.getElementById('docs-estoque').href = `${window.APP_CONFIG.estoqueApiUrl}/docs`;
