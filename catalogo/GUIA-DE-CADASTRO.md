# Cadastro de mídia e modelos — FitSwap 1.1

## Regra obrigatória: primeiro licença, depois publicação

**Nenhuma fotografia de terceiros foi importada.** A interface usa ícones locais até a confirmação de uma licença aplicável a cada arquivo, inclusive quanto a pessoas, marcas e eventuais restrições comerciais.

### Catálogo canônico

- `dados.js`: tipos genéricos de equipamento e exercícios — IDs estáveis.
- `catalogo/modelos.js`: modelos concretos (fabricante + nome do modelo + ID do tipo existente); não confundir variação comercial com novo exercício.
- `catalogo/midia.js`: mapa de fotografias, etapas e créditos por ID canônico. `assets` registra cada arquivo; `equipment` e `exercises` são índices para as respectivas galerias.
- `media/`: arquivos WebP/AVIF/JPEG otimizados, somente com uso autorizado. **Não enviar material com licença pendente ao repositório.**

### Registro de uma mídia liberada

Exemplo ilustrativo de estrutura (não contém mídia):

```js
{
  id: 'leg45_imagem_01',
  kind: 'equipment',
  path: 'media/leg45-imagem-01.webp',
  alt: 'Máquina de leg press 45 graus vista de lado',
  status: 'approved',
  license: {
    licenseId: 'Pexels',
    licenseUrl: 'https://www.pexels.com/license/',
    sourceUrl: 'URL da página ESPECÍFICA da foto',
    author: 'Fotógrafo identificado',
    credit: 'Foto: autor / Pexels',
    checkedAt: '2026-10-19',
    approvedBy: 'Aprovador responsável',
    approvalNote: 'Conferidos direitos da foto, pessoas e marcas'
  }
}
```

Só adicionar ao mapa após o registro estar aprovado: `equipment: { leg45: ['leg45_imagem_01'] }`.

**Critérios técnicos:** foto legível, equipamento verificável e sem confusão de modelos; alt descritivo; dimensões otimizadas (preferencialmente 800–1200 px de largura, qualidade adequada); não fazer hotlink; conservar fonte, autor, licença e data da revisão. Atributos `licenseUrl` e `sourceUrl` devem iniciar com `https://`. O conteúdo deve estar hospedado dentro de `media/`.

### Modelos de fabricante (sem duplicar exercícios)

```js
{ id:'fabricante_modelo_id', equipmentId:'leg45', brand:'Fabricante confirmado', model:'Modelo confirmado', aliases:['Nome comercial'], sourceUrl:'https://...' }
```

Referência a `equipmentId` é obrigatória. Não cadastrar marca/modelo por semelhança da fotografia, sem comprovação. A pesquisa por equipamento passa a considerar nomes dos modelos quando houver registros.

### Etapas seguintes (bloqueadas até decisão de licença)

1. Escolher fontes de fotografias e aprovar condições de uso, inclusive uso comercial futuro.
2. Revisar um lote-piloto de 10 máquinas reais e respectivas fotos.
3. Adicionar autor, link e licença em cada entrada; executar `npm test`.
4. Publicar na branch principal somente após aceitação editorial e de direitos.
5. Depois: preparar importação de exercícios em lotes com fila de revisão; nunca copiar automaticamente imagens ou textos sem verificar direitos.

### Exceção controlada — lote 01
Nesta fase piloto, seis fontes específicas do Wikimedia Commons foram autorizadas e vinculadas por URL HTTPS de miniatura. A exceção é limitada aos caminhos do `catalogo/lote01-direitos.json`, com whitelist de domínio, conferência por teste e créditos no painel. Não usar hotlinks para novos lotes sem decisão editorial. As fotos **não funcionam offline** até migração para `media/` no próprio projeto.
