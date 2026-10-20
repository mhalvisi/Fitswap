import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const ctx={window:{}};
vm.runInNewContext(await readFile(new URL('../dados.js',import.meta.url),'utf8'),ctx);
const d=ctx.window.FITSWAP_DATA;
const equipment=new Map(d.equipment.map(x=>[x.id,x]));
const exercises=new Map(d.exercises.map(x=>[x.id,x]));
const muscles=new Set(d.muscles.map(x=>x.id));
const patterns=new Set(d.patterns.map(x=>x.id));
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const knownNewEquipment=['pulldown_divergent','row_iso','row_chest','chest_decline','dip_press','incline_fly_machine','shoulder_iso','front_machine','triceps_overhead_machine','forearm_roller','nordic_bench','calf_donkey','v_squat','glute_abduction_stand','leg_press_uni','rope_triceps','straight_handle','v_handle','ankle_strap','weight_plate','medicine_ball','ab_wheel','decline_bench','ab_bench','bosu','sandbag','pushup_handles'];

test('expansão 1.2: pelo menos 89 equipamentos e 175 exercícios sem duplicatas',()=>{
  assert.equal(d.version,'1.2.0-beta.1');
  assert.equal(d.equipment.length,89);
  assert.equal(d.exercises.length,175);
  assert.equal(d.patterns.length,42);
  assert.equal(d.muscles.length,17);
  assert.equal(equipment.size,d.equipment.length);
  assert.equal(exercises.size,d.exercises.length);
  const eqNames=d.equipment.map(x=>normalize(x.name));
  const exNames=d.exercises.map(x=>normalize(x.name));
  assert.equal(new Set(eqNames).size,eqNames.length,'Equipamentos com nomes duplicados');
  assert.equal(new Set(exNames).size,exNames.length,'Exercícios com nomes duplicados');
});

test('todos os aparelhos novos possuem descrição, apelidos e exercício vinculado',()=>{
  assert.equal(knownNewEquipment.length,27);
  for(const id of knownNewEquipment){
    const e=equipment.get(id);
    assert.ok(e,`Falta aparelho ${id}`);
    assert.ok(e.description.length>=30,`${id}: descrição insuficiente`);
    assert.ok(e.aliases.length>=2,`${id}: termos de busca insuficientes`);
    assert.ok(exercises.size>0);
    assert.ok([...exercises.values()].some(ex=>ex.setups.some(kit=>kit.includes(id))),`${id}: não possui exercícios associados`);
  }
});

test('exercícios têm instruções úteis, relações existentes e configurações sem duplicações',()=>{
  for(const [index,x] of d.exercises.entries()){
    assert.ok(x.steps.length>=3,`${x.id}: instruções insuficientes`);
    for(const step of x.steps)assert.ok(typeof step==='string'&&step.trim().length>=(index>=103?15:10),`${x.id}: instrução incompleta`);
    assert.equal(new Set(x.steps).size,x.steps.length,`${x.id}: etapas duplicadas`);
    assert.ok(patterns.has(x.pattern),`${x.id}: padrão desconhecido`);
    assert.ok(['Todos','Intermediário','Avançado'].includes(x.level),`${x.id}: nível inválido`);
    for(const m of [...x.primary,...x.secondary])assert.ok(muscles.has(m),`${x.id}: músculo não cadastrado: ${m}`);
    assert.ok(x.setups.length>=1,`${x.id}: falta conjunto de aparelhos`);
    const sigs=[];
    for(const kit of x.setups){
      assert.ok(kit.length>=1,`${x.id}: conjunto vazio`);
      assert.equal(new Set(kit).size,kit.length,`${x.id}: equipamento repetido em um conjunto`);
      for(const id of kit)assert.ok(equipment.has(id),`${x.id}: equipamento ausente: ${id}`);
      sigs.push([...kit].sort().join('+'));
    }
    assert.equal(new Set(sigs).size,sigs.length,`${x.id}: conjuntos redundantes`);
  }
});

test('acessórios de polia são explicitamente exigidos pelos exercícios vinculados',()=>{
  const configs={
    rosca_martelo_corda:['polia_baixa','rope_triceps'],
    triceps_frances_corda:['polia_alta','rope_triceps'],
    remada_baixa_triangulo:['row_seated','v_handle'],
    coice_polia_tornozeleira:['polia_baixa','ankle_strap'],
    triceps_polia_barra_reta:['polia_alta','straight_handle'],
    rosca_inversa_polia:['polia_baixa','straight_handle']
  };
  for(const [id,equipmentIds] of Object.entries(configs)){
    const ex=exercises.get(id);assert.ok(ex,id);
    assert.ok(ex.setups.some(kit=>equipmentIds.every(k=>kit.includes(k))),`${id}: acessórios incompletos`);
  }
});
