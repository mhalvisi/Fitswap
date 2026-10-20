# FitSwap 1.3 beta — classificação conservadora de alternativas

**Aviso:** o algoritmo organiza exercícios por padrões cadastrados, mas não comprova equivalência biomecânica, não substitui prescrição individual e não identifica contraindicações.

## Regras de ordenação

1. Prioriza mesmo músculo principal e mesmo padrão cadastrado; isso não garante estímulo idêntico.
2. Depois mostra padrões relacionados (lista editorial de padrões em catalogo/substituicoes.js).
3. Por fim, mostra movimentos do mesmo músculo em grupo distinto, rotulados como **não são substituições diretas**.
4. Exclui exercícios que dependam de máquinas ocupadas, kits incompletos e kits idênticos aos originais.
5. Se a academia está cadastrada, prioriza opções com equipamentos presentes nela; com filtro ativo, exige todos os acessórios.
6. Sinaliza quando uma opção é de nível avançado.

## Limites e validação pendente

- Exige avaliação por profissional de Educação Física antes de utilizar as sugestões como equivalências biomecânicas validadas.
- O app não mede amplitude, curva de resistência, lesões, limitações ou adequação individual.
- As marcações de ocupação são manuais; não há monitoramento de aparelhos em tempo real.
- Executar npm test e npm run build; validar no celular a classificação e filtros em Supino reto e Leg press.

## Decisão de produto — 20/10/2026

- Aviso **contextual**: aparece na busca rápida de alternativas e na tela de comparação (uma vez por tela, sem duplicação simultânea). Não aparece em cada fotografia nem em cada vídeo.
- Texto: "As opções exibidas são referências informativas, não uma prescrição ou garantia de equivalência entre exercícios. O FitSwap não substitui a avaliação e orientação de um profissional de Educação Física habilitado."
- Não incluir prescrição automática, treinos personalizados, cálculo de carga, série, repetições ou progressão.
- **Possibilidade futura**: diário de treino exclusivamente preenchido pelo usuário, sem sugestão automática de volume, séries ou carga; exigir controles de privacidade, exclusão e exportação antes de lançar.
- Os créditos/atribuição das imagens continuam nos detalhes porque atendem obrigação distinta do aviso sobre exercícios.
