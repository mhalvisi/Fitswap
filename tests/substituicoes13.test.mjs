import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const window = {};
vm.runInNewContext(await readFile(new URL('../catalogo/substituicoes.js', import.meta.url), 'utf8'), {window});
const R = window.FITSWAP_SUBSTITUICOES;
const ex = (id, pattern, primary, setups, options={}) => ({
  id, name:id, pattern, primary, setups, kind:options.kind||'Composto', level:options.level||'Todos'
});
const target = ex('orig','empurrar_horizontal',['peito'],[['smith','banco_reto']]);
const items = [target,
  ex('same','empurrar_horizontal',['peito'],[['halter','banco_reto']]),
  ex('related','empurrar_inclinado',['peito'],[['halter','banco_incl']]),
  ex('onlyMuscle','aducao_peito',['peito'],[['peck']]),
  ex('wrongPrimary','empurrar_horizontal',['ombro_ant'],[['halter']]),
  ex('blocked','empurrar_horizontal',['peito'],[['chest']]),
  ex('sameKit','empurrar_horizontal',['peito'],[['smith','banco_reto']]),
  ex('missingAttachment','empurrar_horizontal',['peito'],[['polia_alta','v_handle']])
];
const busy = new Set(['smith','chest','v_handle']);
const available = kit => kit.every(id => !busy.has(id));
test('classifica padrão idêntico, relacionado e mesmo músculo sem chamar tudo de equivalente',()=>{
  assert.equal(R.classify(target,items[1]).tier,0);
  assert.equal(R.classify(target,items[2]).tier,1);
  assert.equal(R.classify(target,items[3]).tier,2);
  assert.equal(R.classify(target,items[4]),null);
  assert.match(R.classify(target,items[3]).label,/não é substituição direta/);
});
test('exclui máquinas ocupadas, combinações sem acessório e kit original',()=>{
  const rows=R.getAlternatives({target,exercises:items,isKitAvailable:available});
  assert.deepEqual(Array.from(rows.map(x=>x.ex.id)),['same','related','onlyMuscle']);
  assert.ok(rows.every(x=>x.kit.every(id=>!busy.has(id))));
});
test('filtro de academia considera todos acessórios e equipamentos combinados',()=>{
  const gym = new Set(['halter','banco_reto','banco_incl']);
  const result=R.getAlternatives({target,exercises:items,isKitAvailable:kit=>kit.every(id=>gym.has(id)),gym});
  assert.deepEqual(Array.from(result.map(x=>x.ex.id)),['same','related']);
});
test('prefere uma configuração presente na academia mesmo que venha após outra',()=>{
  const alt=ex('varios','empurrar_horizontal',['peito'],[['chest_conv'],['halter','banco_reto']]);
  const out=R.getAlternatives({target,exercises:[target,alt],isKitAvailable:()=>true,gym:new Set(['halter','banco_reto'])});
  assert.deepEqual(Array.from(out[0].kit),['halter','banco_reto']);
});
test('aviso de nível avançado e ordem conservadora, sem alterar as entradas',()=>{
  const expert=ex('advanced','empurrar_horizontal',['peito'],[['paralelas']],{level:'Avançado'});
  const original=JSON.stringify(items);
  const rows=R.getAlternatives({target,exercises:[...items,expert],isKitAvailable:available});
  assert.equal(rows.find(x=>x.ex.id==='advanced').extraLevelWarning,true);
  assert.equal(rows[0].tier,0);
  assert.equal(rows.at(-1).tier,2);
  assert.equal(JSON.stringify(items),original);
});
test('não retorna recomendação sem origem, catálogo ou função de disponibilidade',()=>{
  assert.equal(R.getAlternatives({target:null,exercises:items,isKitAvailable:available}).length,0);
  assert.equal(R.getAlternatives({target,exercises:items}).length,0);
});
