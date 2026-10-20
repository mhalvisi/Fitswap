import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const app = await readFile(new URL('../app.js',import.meta.url),'utf8');
const documentation = await readFile(new URL('../catalogo/RECOMENDACOES-1-3.md',import.meta.url),'utf8');
test('aviso único definido em um só lugar e contextualizado nas duas rotas de busca',()=>{
  assert.equal(app.match(/const recommendationNotice\s*=/g)?.length,1);
  assert.equal(app.match(/\$\{recommendationNotice\(\)\}/g)?.length,2);
  assert.ok(app.includes('O FitSwap não substitui a avaliação e orientação de um profissional de Educação Física habilitado.'));
  assert.ok(app.includes('role="note"'));
});
test('avisos de treino não poluem cards, fotografias ou vídeos',()=>{
  const gallery=app.slice(app.indexOf('function mediaGallery('),app.indexOf('const commonEq'));
  assert.ok(!gallery.includes('recommendationNotice'));
  const cards=app.slice(app.indexOf('function exerciseCard('),app.indexOf('function renderHome('));
  assert.ok(!cards.includes('recommendationNotice'));
  assert.ok(documentation.includes('Não aparece em cada fotografia'));
});
test('diário é apenas planejamento, sem gerar prescrição no app',()=>{
  assert.ok(documentation.includes('exclusivamente preenchido pelo usuário'));
  assert.ok(!app.includes('gerarPlanoDeTreino'));
});
