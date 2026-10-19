import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const sandbox = { window: {} };
for (const file of ['dados.js', 'catalogo/midia.js', 'catalogo/modelos.js']) {
  vm.runInNewContext(await readFile(new URL(file, root), 'utf8'), sandbox);
}
const catalog = sandbox.window.FITSWAP_DATA;
const media = sandbox.window.FITSWAP_MEDIA;
const models = sandbox.window.FITSWAP_MODELS;
const allEquip = new Set(catalog.equipment.map(e => e.id));
const allEx = new Set(catalog.exercises.map(e => e.id));
const validPath = /^media\/[a-z0-9][a-z0-9/_-]*\.(webp|avif|png|jpe?g)$/i;
const https = s => typeof s === 'string' && /^https:\/\/[^\s/]+/.test(s);
const nonempty = s => typeof s === 'string' && s.trim().length > 0;

test('somente arquivos aprovados e documentados podem entrar na mídia publicada', async () => {
  assert.equal(media.schemaVersion, '1.1.0');
  assert.ok(Array.isArray(media.assets));
  assert.equal(new Set(media.assets.map(a => a.id)).size, media.assets.length);
  const assets = new Map(media.assets.map(a => [a.id, a]));
  for (const a of media.assets) {
    assert.ok(nonempty(a.id) && ['equipment','exercise'].includes(a.kind), 'tipo de mídia inválido');
    assert.equal(a.status, 'approved', `mídia não aprovada no pacote: ${a.id}`);
    assert.match(a.path, validPath, `${a.id}: mídia não local ou tipo inadequado`);
    assert.ok(nonempty(a.alt), `${a.id}: texto alternativo ausente`);
    assert.ok(a.license && nonempty(a.license.licenseId), `${a.id}: licença sem identificação`);
    assert.ok(https(a.license.licenseUrl) && https(a.license.sourceUrl), `${a.id}: URLs de direitos incorretas`);
    assert.ok(nonempty(a.license.author) && nonempty(a.license.credit), `${a.id}: autoria/crédito ausente`);
    assert.match(a.license.checkedAt, /^\d{4}-\d{2}-\d{2}$/, `${a.id}: data de revisão ausente`);
    assert.ok(nonempty(a.license.approvedBy) && nonempty(a.license.approvalNote), `${a.id}: aprovação ausente`);
    const file = resolve(new URL('../', import.meta.url).pathname, a.path);
    assert.ok((await stat(file)).isFile(), `${a.id}: arquivo de imagem não encontrado`);
    assert.ok((await stat(file)).size <= 2 * 1024 * 1024, `${a.id}: arquivo de imagem muito grande`);
  }
  const referenced = new Set();
  for (const [kind, group, ids] of [
    ['equipment', media.equipment, allEquip], ['exercise', media.exercises, allEx]
  ]) {
    for (const [entity, imageIds] of Object.entries(group)) {
      assert.ok(ids.has(entity), `${kind}: ID inexistente: ${entity}`);
      assert.ok(Array.isArray(imageIds), `${kind}/${entity}: a galeria deve ser uma lista`);
      for (const id of imageIds) {
        assert.ok(assets.has(id), `mídia referenciada mas não cadastrada: ${id}`);
        assert.equal(assets.get(id).kind, kind, `tipo incorreto: ${id}`);
        referenced.add(id);
      }
    }
  }
  for (const a of media.assets) assert.ok(referenced.has(a.id), `mídia sem vínculo: ${a.id}`);
  // Proteção contra publicação acidental: todo arquivo na pasta media/ deve constar como aprovado.
  async function walk(folder) {
    const entries = await readdir(folder, { withFileTypes: true });
    const acc = [];
    for (const e of entries) {
      const rel = join(folder, e.name);
      acc.push(...(e.isDirectory() ? await walk(rel) : [rel]));
    }
    return acc;
  }
  for (const file of await walk(new URL('../media/', import.meta.url).pathname)) {
    if (file.endsWith('.gitkeep')) continue;
    const relative = `media/${file.split('/media/').at(-1)}`;
    assert.ok(media.assets.some(a => a.path === relative), `foto sem liberação colocada em media/: ${relative}`);
  }
});

test('modelos específicos possuem família e referência verificável', () => {
  assert.ok(Array.isArray(models));
  assert.equal(models.length, new Set(models.map(m => m.id)).size, 'IDs de modelos duplicados');
  for (const m of models) {
    assert.ok(nonempty(m.id) && nonempty(m.brand) && nonempty(m.model), 'modelo incompleto');
    assert.ok(allEquip.has(m.equipmentId), `modelo sem família válida: ${m.id}`);
    assert.ok(Array.isArray(m.aliases), 'aliases de modelo devem ser lista');
    assert.ok(https(m.sourceUrl), 'o modelo requer fonte verificável');
  }
});
