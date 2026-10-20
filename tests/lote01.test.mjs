import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const report=JSON.parse(await readFile(new URL('../catalogo/lote01-direitos.json',import.meta.url),'utf8'));
const sandbox={window:{}};
vm.runInNewContext(await readFile(new URL('../catalogo/midia.js',import.meta.url),'utf8'),sandbox);
const media=sandbox.window.FITSWAP_MEDIA;
const images=new Map(media.assets.map(a=>[a.id,a]));
test('lote 01 mantém as nove autorizações e segura as três imagens retidas',()=>{
  assert.equal(report.items.length,9);
  assert.equal(report.items.filter(item=>item.review_status==='eligible').length,6);
  assert.deepEqual(report.items.filter(item=>item.review_status==='held').map(item=>item.id),['FS-IMG-002','FS-IMG-004','FS-IMG-009']);
  for(const item of report.items){
    const id=item.id.toLowerCase();
    const registered=images.get(id);
    assert.equal(!!registered,item.review_status==='eligible',item.id+' publicação incompatível com revisão');
    if(!registered)continue;
    assert.equal(registered.path,item.thumbnail,item.id+' URL do arquivo mudou sem revisão');
    assert.equal(registered.license.sourceUrl,item.source,item.id+' origem inconsistente');
    assert.equal(registered.license.licenseUrl,item.license_url,item.id+' licença inconsistente');
    assert.equal(registered.license.author,item.creator,item.id+' autoria inconsistente');
    assert.equal(registered.status,'approved');
    assert.equal(registered.delivery,'external-preview');
    assert.equal(media.equipment[item.equipment_id]?.[0],id,item.id+' associação equivocada');
  }
});
test('não é permitido integrar mídia retida por engano',()=>{
  const heldIds=['fs-img-002','fs-img-004','fs-img-009'];
  for(const held of heldIds) assert.ok(!images.has(held),held);
  assert.equal(Object.values(media.equipment).flat().length,6);
});
