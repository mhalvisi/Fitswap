# FitSwap 1.3 beta — opções de treino organizadas por padrão

Agora o FitSwap separa exercícios de mesmo padrão, padrões relacionados e demais movimentos para o mesmo músculo, sem afirmar equivalência biomecânica. Os casos exigem revisão por profissional de Educação Física. Documentação: `catalogo/RECOMENDACOES-1-3.md`.

## FitSwap 1.2 (beta) — expansão editorial da musculação

O catálogo foi ampliado de **62 para 89 tipos de equipamentos** e de **103 para 175 exercícios** (+27 aparelhos/acessórios e +72 movimentos). Os novos registros incluem identificação em português, termos de busca comuns, músculos, padrão de movimento, configurações completas de equipamentos, nível sugerido e três orientações de execução. Os 17 grupos musculares e os IDs existentes foram preservados para não quebrar favoritos e academias salvas.

**Limitações:** conteúdo de musculação em fase de curadoria; não equivale a prescrição individual, equivalência biomecânica validada, nem aprovação de um profissional de Educação Física. A apresentação de uma alternativa para o mesmo músculo não significa substituição de estímulo idêntico. Fotos continuam disponíveis apenas para os seis equipamentos licenciados do lote 01; os demais utilizam ícones até serem autorizadas imagens reais. Não foram adicionadas fotografias, marcas ou modelos comerciais novos nesta fase.

Consulte `catalogo/EXPANSAO-1-2.md` para escopo, instruções para continuar a curadoria e critérios editoriais.

## Catálogo fotográfico — lote 01 (visualização online)

Seis fotografias do Wikimedia Commons aparecem nos detalhes e cards dos equipamentos correspondentes; todas têm autoria, link da fonte, licença individual e status editorial aprovado. **Os arquivos não estão armazenados localmente**: nesta primeira integração, as miniaturas são carregadas diretamente de `https://thumb.wikimedia.org/`; por isso exigem internet e podem ficar indisponíveis se a fonte externa falhar. Ícones locais substituem imagens ausentes. Exercícios sem fotografia mantêm o estado de imagem em preparação.

Três arquivos aprovados condicionalmente continuam **não publicados**, pelos motivos específicos registrados em `catalogo/lote01-direitos.json`: FS-IMG-002 (subtipo), FS-IMG-004 (leg press sem subtipo validado) e FS-IMG-009 (pessoa ao fundo). A imagem de máquina Smith contém marca incidental; o FitSwap não é parceiro de fabricantes. Imagens sob CC BY-SA 4.0 exigem crédito, indicação de modificações e link para licença, exibidos na galeria. Os arquivos de imagem deverão ser incorporados localmente quando o ambiente de distribuição permitir transferência verificada, sem alterar as fontes e licenças aprovadas.

# FitSwap Mobile 1.1 (branch de desenvolvimento)

> **PARADA PARA APROVAÇÃO:** interface e infraestrutura de fotos preparadas, mas nenhuma fotografia externa foi importada ou publicada. A versão 1.0 em `main` permanece intacta. Ver `catalogo/GUIA-DE-CADASTRO.md`.

**Treine sem esperar.** Aplicativo web mobile para buscar exercícios por **músculo**, **equipamento** ou **exercício**, encontrar alternativas quando a máquina estiver ocupada e configurar os equipamentos da sua academia.

![Quatro telas do FitSwap Mobile](docs/preview.png)

## Recursos

- Navegação mobile com quatro abas: **Início**, **Explorar**, **Academia** e **Salvos**.
- Atalho flutuante **Trocar** e painel inferior com detalhes e substituições.
- **103 exercícios**, **62 tipos de equipamentos** e **17 grupos musculares** no catálogo demonstrativo inicial.
- Filtro de equipamentos disponíveis na sua academia e marcação manual de ocupação.
- Favoritos e configurações salvos no navegador (`localStorage`).
- PWA instalável pela tela inicial, após hospedagem em HTTPS; cache offline.
- Sem login, banco online, CDN nem dependências externas em tempo de execução.

> **Aviso:** A disponibilidade das máquinas é informada pelo usuário, sem integração em tempo real com redes de academias. A classificação das substituições é heurística e não garante equivalência biomecânica. Os exercícios e instruções requerem revisão de profissional habilitado antes do uso como orientação profissional.

## Executar no computador

É necessário **Node.js 20 ou superior**.

```bash
npm start
```

Abra `http://localhost:4173` no navegador. Não é necessário instalar bibliotecas (o projeto não possui dependências externas).

Para executar os testes e gerar a pasta de publicação:

```bash
npm test
npm run build
```

Os arquivos publicáveis serão gerados em `dist/`.

## Colocar no GitHub

### Método 1 — pelo próprio site (sem terminal)

1. Entre em [github.com/new](https://github.com/new) e crie o repositório **`fitswap`**, preferencialmente **Public** para um site compartilhável no plano gratuito.
2. Descompacte o ZIP do projeto. No repositório, escolha **Add file → Upload files**.
3. Envie **todos os arquivos e pastas da raiz** deste projeto. Importante: `index.html` precisa ficar **na raiz do repositório**, e a pasta `.github/workflows` precisa ser preservada.
4. Confirme em **Commit changes**. Se o navegador ocultar a pasta `.github`, use o método com Git abaixo para não perder o fluxo automático.
5. Vá a **Settings → Pages → Build and deployment → Source** e selecione **GitHub Actions**.
6. Em **Actions**, acompanhe a execução `Publicar FitSwap no GitHub Pages`. Se necessário, execute via **Run workflow**.
7. Após o sucesso, acesse `https://SEU_USUARIO.github.io/fitswap/` (substitua pelo seu usuário e pelo nome real do repositório).

### Método 2 — com Git (recomendado)

Crie primeiro um repositório **vazio** chamado `fitswap` no GitHub (sem README, licença ou `.gitignore` automáticos), entre no diretório descompactado e execute:

```bash
git init
git branch -M main
git add .
git commit -m "feat: FitSwap Mobile 1.0"
git remote add origin https://github.com/SEU_USUARIO/fitswap.git
git push -u origin main
```

Substitua `SEU_USUARIO` pelo nome da sua conta. Configure **Settings → Pages → Source → GitHub Actions** caso ainda não esteja selecionado. Pode ser necessário autenticar no GitHub por navegador/credencial.

> **Atenção:** o arquivo `.github/workflows/pages.yml` é necessário para a publicação automática. Não envie apenas `index.html`: o aplicativo depende também de `styles.css`, `dados.js`, `app.js`, `sw.js`, `manifest.webmanifest` e `icons/`.

## Publicação automática

O workflow `.github/workflows/pages.yml` executa a cada envio de código à branch `main`:

1. verifica sintaxe e integridade de referências do catálogo (`npm test`);
2. prepara o site estático em `dist/` (`npm run build`);
3. publica o conteúdo em **GitHub Pages**.

O projeto utiliza caminhos relativos, compatíveis com o endereço do repositório (`/fitswap/`). Para criar uma nova versão, altere os arquivos, faça commit e envie à branch `main`.

## Organização dos arquivos

```text
fitswap/
├── .github/workflows/pages.yml   # Publicação automática no Pages
├── icons/                        # Ícones PWA
├── docs/preview.png              # Prévia das telas
├── scripts/build.mjs             # Gera o site publicável
├── scripts/serve.mjs             # Servidor de desenvolvimento
├── tests/catalog.test.mjs        # Validação do catálogo
├── index.html                    # Estrutura principal
├── styles.css                    # UI/UX mobile
├── app.js                        # Interatividade, filtros e substituições
├── dados.js                      # Equipamentos, exercícios e músculos
├── sw.js                         # Cache offline
├── manifest.webmanifest          # Metadados de instalação
├── package.json                  # Comandos de execução e testes
└── README.md
```

## Informações importantes

- **Protótipo PWA:** não é aplicativo nativo compilado em Swift/Kotlin.
- **Privacidade:** as marcações e favoritos ficam apenas no navegador do dispositivo.
- **Dados e conteúdo:** o catálogo é demonstrativo; nomes e instruções precisam de revisão editorial/técnica antes de eventual exploração comercial.
- **Licenciamento:** nenhum arquivo `LICENSE` foi adicionado automaticamente; a titularidade e a licença para terceiros devem ser definidas antes da abertura de contribuições ou redistribuição.


## Novidades na versão 1.1 (em revisão)

- Cards, detalhes e galeria preparados para mostrar **imagens autorizadas** com alt text, autoria e link para a fonte.
- Registro `catalogo/midia.js` com bloqueio por status `approved`, licença verificável e URLs de fonte e licença.
- Cadastro `catalogo/modelos.js` para marcas e modelos verificados sem duplicar os exercícios.
- Galeria informa explicitamente quando a foto ainda não existe; não há conteúdo visual externo não autorizado.
- Arquivos em `media/` serão empacotados para publicação somente quando houver autorização editorial.
- Testes novos evitam mídia sem registro de direitos e validam referências e padrões de nomes.
- A expansão de exercícios (1.2) e substituições aprimoradas (1.3) **ainda não foram implementadas**, pois aguardamos a escolha de fontes e aprovação de uso.
