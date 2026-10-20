# FitSwap 1.2 — Expansão de musculação (beta)

## Entrega deste lote

- 62 → **89 equipamentos** (+27; máquinas, bancos, acessórios e treinamento funcional)
- 103 → **175 exercícios** (+72; todos com configurações completas e três etapas)
- 39 → **42 padrões de movimento** (+ flexão do ombro, extensão do punho e resistência à extensão do tronco)
- Mantidos os 17 grupos musculares, IDs antigos, favoritos e controles da academia
- Adicionados termos de busca comuns em português para mais de 20 equipamentos existentes

## Equipamentos adicionados

| Região | Aparelhos e acessórios |
| --- | --- |
| Costas | Puxada divergente; remada isolateral; remada com apoio peitoral |
| Peito | Chest press declinado; mergulho sentado na máquina; crucifixo inclinado na máquina |
| Ombros | Desenvolvimento independente; elevação frontal guiada |
| Braços | Tríceps acima da cabeça; rolo para antebraços |
| Pernas | Banco nórdico; panturrilha donkey; V-squat; abdutora em pé; leg press unilateral |
| Acessórios | Corda para polia; barra reta de cabo; triângulo de remada; tornozeleira de polia |
| Pesos livres | Anilha avulsa |
| Funcional | Bola medicinal; meia bola de equilíbrio; saco de areia; apoio para flexões |
| Core | Roda abdominal |
| Bancos | Banco declinado; banco abdominal declinado |

## Critérios editoriais e riscos

1. **Sem máquinas fictícias ou marcas inventadas:** categorias genéricas de equipamentos. Variações de fabricantes não são identificadas como modelos específicos.
2. **Sem imagens novas:** cada fotografia comercial deverá ser verificada e aprovada segundo `catalogo/GUIA-DE-CADASTRO.md`.
3. **Sem indicação terapêutica:** as instruções são explicações gerais para navegação do protótipo, sem recomendação de carga, volume ou execução individual.
4. **Substituições não são equivalências clínicas:** o algoritmo existente mostra primeiro o mesmo padrão e depois o mesmo músculo. Relações biomecânicas ainda requerem revisão de profissional de Educação Física antes de comercializar o app como orientador técnico.
5. **Acessórios contam como equipamentos:** uma combinação como `polia_baixa` + `v_handle` exige a presença de ambos quando o filtro "somente minha academia" está ativo.
6. **Fotos antigas continuam condicionadas** às licenças individuais; as três fotografias retidas não foram incluídas.

## Próxima iteração sugerida

- Validar nomenclatura, músculos e orientações com profissional de Educação Física e marcar cada exercício como revisado.
- Classificar substituições por amplitude, articulações, tipo de resistência e estabilidade, não apenas músculo e padrão.
- Ampliar de modo gradual, priorizando máquinas frequentes em academias brasileiras e novas imagens com uso comercial autorizado.

## Testes

Executar `npm test && npm run build`. O teste `tests/expansao12.test.mjs` bloqueia registros repetidos, referências inexistentes, equipamentos sem exercícios, configurações sem acessórios e descrições de execução vazias. Também executar navegação em navegador mobile antes da disponibilização pública.
