import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.png':'image/png'};
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = resolve(root, '.' + decodeURIComponent(url.pathname), url.pathname.endsWith('/') ? 'index.html' : '');
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403).end('Acesso negado'); return;
    }
    if (!(await stat(path)).isFile()) {
      res.writeHead(404).end('Não encontrado'); return;
    }
    const content = await readFile(path);
    res.writeHead(200, {'content-type':mime[extname(path)] || 'application/octet-stream','cache-control':'no-cache'}).end(content);
  } catch {
    res.writeHead(404).end('Não encontrado');
  }
}).listen(port, '127.0.0.1', () => console.log(`FitSwap local: http://localhost:${port}/`));
