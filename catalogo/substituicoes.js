/* FitSwap 1.3 beta — classificação conservadora de opções de treino.
 * NÃO presume equivalência biomecânica ou prescrição individual.
 * Sem rede/storage/DOM; regras testáveis com catálogos sintéticos.
 */
(function (global) {
  'use strict';
  const relatedGroups = [
    ['empurrar_horizontal', 'empurrar_inclinado'],
    ['remar_horizontal', 'remar_alto'],
    ['agachar', 'agachar_guiado', 'empurrar_pernas', 'agachar_unilateral'],
    ['dobrar_quadril', 'levantar_carga'],
    ['flexao_cotovelo', 'flexao_cotovelo_neutra', 'flexao_cotovelo_pronada'],
    ['flexao_plantar', 'flexao_plantar_sentada'],
    ['extensao_quadril', 'extensao_quadril_isolada']
  ];
  const related = new Map();
  for (const group of relatedGroups) for (const pattern of group) {
    related.set(pattern, new Set(group.filter(other => other !== pattern)));
  }
  const labels = Object.freeze([
    'Mesmo padrão cadastrado',
    'Padrão relacionado · exige avaliação',
    'Mesmo músculo · não é substituição direta'
  ]);
  const signature = kit => [...kit].sort().join('+');
  const compareKits = (a, b, gym) => {
    const known = gym && gym.size > 0;
    const aKnown = known && a.every(id => gym.has(id));
    const bKnown = known && b.every(id => gym.has(id));
    return Number(bKnown) - Number(aKnown) || a.length - b.length ||
      signature(a).localeCompare(signature(b));
  };
  function classify(original, candidate) {
    if (!original || !candidate || original.id === candidate.id) return null;
    if (!Array.isArray(original.primary) || !Array.isArray(candidate.primary)) return null;
    const overlapping = candidate.primary.filter(id => original.primary.includes(id));
    if (!overlapping.length) return null;
    const tier = candidate.pattern === original.pattern ? 0 :
      related.get(original.pattern)?.has(candidate.pattern) ? 1 : 2;
    return { tier, overlap: overlapping.length, label: labels[tier], samePattern: tier === 0 };
  }
  function getAlternatives({ target, exercises, isKitAvailable, gym = new Set() }) {
    if (!target || !Array.isArray(target.setups) || !Array.isArray(exercises)) return [];
    if (typeof isKitAvailable !== 'function') return [];
    const originalKits = new Set(target.setups.map(signature));
    const output = [];
    for (const candidate of exercises) {
      const rank = classify(target, candidate);
      if (!rank || !Array.isArray(candidate.setups)) continue;
      const kits = candidate.setups.filter(kit => Array.isArray(kit) && kit.length > 0 &&
        !originalKits.has(signature(kit)) && isKitAvailable(kit));
      if (!kits.length) continue;
      const kit = [...kits].sort((a,b) => compareKits(a,b,gym))[0];
      const inGym = gym.size > 0 && kit.every(id => gym.has(id));
      const extraLevelWarning = target.level !== 'Avançado' && candidate.level === 'Avançado';
      const score = (3 - rank.tier) * 1000 + rank.overlap * 20 +
        (candidate.kind === target.kind ? 12 : 0) + (inGym ? 8 : 0) -
        (extraLevelWarning ? 20 : 0) - kit.length;
      output.push({ ex:candidate, kit, ...rank, score, inGym, extraLevelWarning });
    }
    return output.sort((a,b) => b.score-a.score ||
      String(a.ex.name).localeCompare(String(b.ex.name), 'pt-BR'));
  }
  global.FITSWAP_SUBSTITUICOES = Object.freeze({ classify, getAlternatives, labels });
})(window);
