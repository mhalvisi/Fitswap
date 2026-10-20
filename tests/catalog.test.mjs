import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(await readFile(new URL('../dados.js', import.meta.url), 'utf8'), context);
const { FITSWAP_DATA: db } = context.window;

const uniqueIds = (list, label) => {
  assert.ok(Array.isArray(list) && list.length > 0, `Catálogo vazio: ${label}`);
  assert.equal(new Set(list.map(item => item.id)).size, list.length, `IDs duplicados: ${label}`);
};

test('catálogo mantém as quatro coleções de base', () => {
  uniqueIds(db.muscles, 'músculos');
  uniqueIds(db.patterns, 'padrões');
  uniqueIds(db.equipment, 'equipamentos');
  uniqueIds(db.exercises, 'exercícios');
  assert.ok(db.muscles.length >= 17);
  assert.ok(db.equipment.length >= 62);
  assert.ok(db.exercises.length >= 103);
});

test('todos os exercícios possuem relações válidas de músculos e padrões', () => {
  const muscles = new Set(db.muscles.map(m => m.id));
  const patterns = new Set(db.patterns.map(p => p.id));
  for (const exercise of db.exercises) {
    assert.ok(exercise.name && exercise.id, 'Exercício sem nome ou ID');
    assert.ok(Array.isArray(exercise.primary) && exercise.primary.length > 0, `Sem músculo principal: ${exercise.id}`);
    for (const id of [...exercise.primary, ...(exercise.secondary || [])]) {
      assert.ok(muscles.has(id), `${exercise.id} referencia músculo inexistente: ${id}`);
    }
    assert.ok(patterns.has(exercise.pattern), `${exercise.id} referencia padrão inexistente: ${exercise.pattern}`);
  }
});

test('todas as configurações utilizam equipamentos cadastrados', () => {
  const equipment = new Set(db.equipment.map(e => e.id));
  for (const exercise of db.exercises) {
    assert.ok(Array.isArray(exercise.setups) && exercise.setups.length > 0, `Sem equipamento: ${exercise.id}`);
    for (const setup of exercise.setups) {
      assert.ok(Array.isArray(setup) && setup.length > 0, `Configuração vazia: ${exercise.id}`);
      for (const id of setup) {
        assert.ok(equipment.has(id), `${exercise.id} utiliza equipamento inexistente: ${id}`);
      }
    }
  }
});

test('todo exercício possui instruções de execução', () => {
  for (const exercise of db.exercises) {
    assert.ok(Array.isArray(exercise.steps) && exercise.steps.length > 0, `Sem instruções: ${exercise.id}`);
  }
});
