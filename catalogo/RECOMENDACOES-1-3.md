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
