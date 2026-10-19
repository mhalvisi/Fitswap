import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const out = join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const name of ['index.html', 'styles.css', 'dados.js', 'app.js', 'sw.js', 'manifest.webmanifest']) {
  await cp(join(root, name), join(out, name));
}
await cp(join(root, 'icons'), join(out, 'icons'), { recursive: true });
await cp(join(root, 'catalogo'), join(out, 'catalogo'), { recursive: true });
// Mídias entram no build SOMENTE após liberação editorial.
// Em 1.1 o diretório é vazio; não há fotografias de terceiros distribuídas.
await cp(join(root, 'media'), join(out, 'media'), { recursive: true });
await writeFile(join(out, '.nojekyll'), '');
console.log('FitSwap pronto para publicação em dist/');
