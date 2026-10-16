// Servidor mínimo (sem dependências) que entrega a página e injeta a URL do pedidos-api.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const PEDIDOS_API_URL = process.env.PEDIDOS_API_URL || 'http://localhost:8081';
const ESTOQUE_API_URL = process.env.ESTOQUE_API_URL || 'http://localhost:8082';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' };

http
  .createServer((req, res) => {
    const url = req.url.split('?')[0];
    if (url === '/config.js') {
      res.writeHead(200, { 'content-type': types['.js'] });
      return res.end(`window.APP_CONFIG = ${JSON.stringify({ pedidosApiUrl: PEDIDOS_API_URL, estoqueApiUrl: ESTOQUE_API_URL })};`);
    }
    if (url === '/health') return res.end('ok');
    const file = path.join(__dirname, 'public', url === '/' ? 'index.html' : path.normalize(url).replace(/^(\.\.[/\\])+/, ''));
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end('não encontrado'); }
      res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(JSON.stringify({ msg: 'loja-web no ar', port: PORT, pedidosApi: PEDIDOS_API_URL })));
