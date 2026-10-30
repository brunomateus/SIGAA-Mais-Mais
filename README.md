# Sigga++

Extensão para Google Chrome que adiciona atalhos e ajustes ao [SIGAA da UFC](https://si3.ufc.br/sigaa/), com foco no fluxo de trabalho do docente.

> **Status:** em desenvolvimento.

## Funcionalidades

- [x] **Vínculo favorito:** marca um vínculo como favorito e o seleciona automaticamente no login.
- [x] **Acesso direto ao Portal Docente:** após o login, pula a página inicial e abre o Portal do Docente.
- [x] **Atalhos para a chamada:** a partir da página da turma, abre a chamada de hoje ou o calendário, pulando a seleção de subturma quando há apenas uma.
- [x] **Remoção de tópicos de aula em lote:** na tela Conteúdo Programado, remove vários tópicos de aula de uma vez, com uma única atualização da página.
- [x] **Colar notas da planilha:** na tela Lançar Notas, preenche as notas copiadas da sua planilha (Google Sheets, Excel, LibreOffice), para você revisar e salvar.
- [x] **Privacidade na lista de frequência:** oculta os indicadores de necessidades especiais ao lado do nome dos alunos.

## Uso

### Vínculo favorito

1. Faça login no SIGAA. No primeiro acesso, ao escolher um vínculo, a extensão pede confirmação para salvá-lo como favorito. A navegação só continua após a confirmação; ao cancelar, você permanece na tela de seleção.
2. Nos próximos logins, o vínculo favorito é selecionado automaticamente. Ao entrar em um vínculo, uma tela de carregamento ("Entrando como …") indica a transição; se o SIGAA não responder em 10 segundos, ela é removida e a tela de seleção volta a ficar disponível.
3. Para trocar o favorito, use o botão **★ Favorito** exibido ao lado de cada vínculo.
4. Pelo ícone da extensão na barra do navegador, é possível:
   - **Usar vínculo único automaticamente:** em vez de um favorito fixo, entra direto quando houver apenas um vínculo.
   - **Limpar favorito:** volta ao comportamento do primeiro acesso.

Vínculos ativos e inativos (já encerrados) são tratados da mesma forma.

### Acesso direto ao Portal Docente

Logo após a escolha do vínculo, ao chegar à página inicial do SIGAA (`paginaInicial.do`), a extensão abre o Portal do Docente automaticamente, exibindo "Abrindo Portal do Docente…" durante a transição.

- O redirecionamento só acontece se a página inicial oferecer o link para o Portal do Docente, ou seja, para usuários com acesso a ele.
- Ele ocorre apenas uma vez por login: se depois você voltar à página inicial (por exemplo, pelo menu **Módulos**), ela abre normalmente.
- O redirecionamento depende da passagem pela tela de seleção de vínculos nesta aba.

### Atalhos para a chamada

Na página de uma turma virtual, dois botões aparecem acima das notícias e dos tópicos:

- **Chamada de hoje:** abre direto a lista de alunos da data de hoje. Se hoje não for data de aula da turma, o calendário de chamada é exibido com um aviso. Se a chamada de hoje já tiver sido registrada, ela é aberta para edição.
- **Chamada em outra data:** abre o calendário de chamada para escolher a data.

Quando a turma tem uma única subturma, a seleção de subturma é feita automaticamente, inclusive ao usar o menu **Alunos → Lançar Frequência**. Com mais de uma, a seleção aparece normalmente e, depois da escolha, o caminho continua até o destino escolhido.

### Remoção de tópicos de aula em lote

Na tela **Conteúdo Programado** da turma virtual, a tabela de tópicos de aula ganha uma coluna de seleção. Ao marcar o primeiro tópico, aparece logo abaixo da tabela uma barra com o botão **Remover selecionados (N)**, que some quando nenhum tópico está marcado. A barra fica fixa no rodapé da tela enquanto a tabela está visível, então o botão está sempre à mão, mesmo para os últimos tópicos da lista:

- Marque os tópicos um a um, todos de uma vez pela caixa do cabeçalho, ou um intervalo com **Shift+clique** (clique no primeiro e, com Shift, no último).
- Ao clicar no botão, um diálogo lista os tópicos selecionados e avisa que a remoção não pode ser desfeita e que os materiais vinculados a eles (arquivos, tarefas, fóruns…) também são removidos.
- Confirmada a remoção, o progresso é exibido ("Removendo 3 de 12…"). O botão **Parar** termina a remoção em andamento e não inicia as seguintes.
- A página é atualizada uma única vez, no final, com um aviso do resultado. Se alguma remoção falhar (por exemplo, sessão expirada), as seguintes não são feitas, e o aviso informa quantos tópicos foram removidos e em qual houve a falha.

As remoções são feitas em segundo plano, com as mesmas requisições da lixeira de cada linha; o motivo dessa escolha está em [docs/adr/0001](docs/adr/0001-remocao-em-lote-por-requisicoes-em-segundo-plano.md).

### Colar notas da planilha

Na tela **Lançar Notas** da turma, o botão **Colar notas da planilha** aparece acima da tabela de alunos:

1. Na sua planilha, selecione a coluna de matrículas e as colunas de notas, de preferência com a linha de títulos, e copie (Ctrl+C). As colunas podem estar em qualquer ordem e a planilha pode ter outras colunas, como o nome.
2. Cole na caixa do diálogo (Ctrl+V) e clique em **Continuar**. A coluna de matrículas é encontrada sozinha.
3. Confira a coluna da planilha escolhida para cada unidade e para a avaliação final. Títulos como "Unid. 1", "U1", "N1", "Nota 1" e "AF" já vêm associados. A prévia mostra cada nota que vai mudar ("7,0 → 8,0") e o que fica de fora: valores inválidos, matrículas que não estão na turma, matrículas repetidas na planilha e alunos sem linha na planilha.
4. Clique em **Preencher**. Os campos alterados ficam destacados em amarelo, e um aviso acima da tabela resume o resultado.
5. Revise e clique em **Salvar** no SIGAA. A extensão não salva nada nem usa o botão **Finalizar (Consolidar)**. Antes de salvar, **Desfazer preenchimento** devolve os valores anteriores.

Regras do preenchimento:

- O aluno é identificado pela matrícula. Uma matrícula repetida na planilha não é usada.
- As notas aceitam vírgula ou ponto e são **truncadas** em uma casa decimal (7,39 vira 7,3). Texto, valores negativos ou acima de 10 não são preenchidos.
- Célula vazia não apaga a nota que já está no SIGAA.
- A nota da avaliação final só é preenchida para quem, depois das notas das unidades, o SIGAA coloca em avaliação final.
- As notas copiadas são lidas apenas no navegador e não são guardadas pela extensão.

### Privacidade na lista de frequência

Na tela de lançamento de frequência da turma virtual, os ícones e textos de necessidades especiais exibidos ao lado do nome dos alunos (ex.: "(Deficiência física)") ficam ocultos. Assim, a chamada pode ser feita com a tela projetada sem expor essa informação.

A ocultação vem ativada por padrão. Para ver os indicadores (por exemplo, ao planejar adaptações de atividades), desmarque **Ocultar indicadores de necessidades especiais** no popup da extensão. A mudança vale imediatamente, inclusive em uma lista de frequência já aberta.

## Requisitos

- [Node.js](https://nodejs.org/) 22.18 ou superior
- Google Chrome (ou outro navegador baseado em Chromium)

## Instalação

```bash
git clone https://github.com/brunomateus/SIGAA-Mais-Mais.git
cd SIGAA-Mais-Mais
npm install
npm run build
```

Em seguida, carregue a extensão no navegador:

1. Acesse `chrome://extensions`.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta `dist/`.

## Desenvolvimento

| Comando                | Descrição                                     |
| ---------------------- | --------------------------------------------- |
| `npm run build`        | Gera a extensão em `dist/`                    |
| `npm run watch`        | Recompila automaticamente ao alterar `src/`   |
| `npm test`             | Executa os testes (Vitest + jsdom)            |
| `npm run test:watch`   | Executa os testes em modo observação          |
| `npm run typecheck`    | Verifica os tipos com o compilador TypeScript |
| `npm run format`       | Formata o código com o Prettier               |
| `npm run format:check` | Verifica a formatação sem alterar arquivos    |

Depois de cada build, clique em **↻ Recarregar** no card da extensão em `chrome://extensions` e atualize a página do SIGAA.

O modo `watch` não copia `public/` de novo. Se alterar o `manifest.json`, rode `npm run build`.

### Estrutura do projeto

```
├── public/                # Arquivos estáticos copiados para dist/ (manifest.json, popup.html, CSS)
├── src/
│   ├── entradas/          # Pontos de entrada: montam as dependências reais (chrome.storage, DOM)
│   ├── comum/             # Módulos compartilhados: armazenamento, preferências, diálogo, transição, utilitários
│   ├── vinculos/          # Tela de seleção de vínculos
│   ├── portal/            # Acesso direto ao Portal Docente
│   ├── chamada/           # Atalhos para a chamada na turma virtual
│   ├── topicos/           # Remoção de tópicos de aula em lote
│   ├── notas/             # Colar notas da planilha
│   ├── frequencia/        # Privacidade na lista de frequência
│   └── popup/             # Popup da extensão
├── test/                  # Testes, espelhando a estrutura de src/
│   ├── fakes/             # Implementações falsas das dependências externas
│   └── suporte/           # Utilitários de teste (telas do SIGAA simuladas, <dialog> no jsdom)
├── docs/adr/              # Registros de decisões de arquitetura
├── build.ts               # Script de build (esbuild)
├── vitest.config.ts
└── tsconfig.json
```

### Adicionando um novo script

1. Implemente a funcionalidade em `src/<funcionalidade>/`, recebendo as dependências externas (armazenamento, documento, diálogos) por construtor ou parâmetro.
2. Crie o ponto de entrada em `src/entradas/<nome>.ts`, que monta as dependências reais e inicia a funcionalidade.
3. Adicione `"src/entradas/<nome>.ts"` ao array `entryPoints` em `build.ts`.
4. Registre `<nome>.js` no `public/manifest.json` (por exemplo, em `content_scripts`).
5. Escreva os testes em `test/<funcionalidade>/`, usando os fakes de `test/fakes/`.

Cada ponto de entrada é empacotado como um arquivo autocontido (IIFE), pois content scripts não suportam módulos ES.

Ajustes puramente visuais dispensam TypeScript: crie o arquivo em `public/<nome>.css` e registre-o no campo `css` de um content script do manifest, como em `frequencia.css`. O Chrome aplica o estilo antes da renderização da página.

## Sugestões e problemas

As issues do repositório são abertas apenas por formulário:

- [**Sugerir funcionalidade**](https://github.com/brunomateus/SIGAA-Mais-Mais/issues/new?template=funcionalidade.yml): descreva o problema que você enfrenta no SIGAA, como a extensão poderia ajudar e o seu perfil de uso (docente, discente etc.).
- [**Relatar problema**](https://github.com/brunomateus/SIGAA-Mais-Mais/issues/new?template=bug.yml): informe a funcionalidade afetada, os passos para reproduzir e as versões da extensão e do navegador.

Antes de abrir, verifique se já não existe uma [issue parecida](https://github.com/brunomateus/SIGAA-Mais-Mais/issues); se existir, apoie-a com um 👍.

> Não inclua dados pessoais de alunos ou servidores (nomes, matrículas, notas) nas issues nem nas capturas de tela.

## Tecnologias

- [TypeScript](https://www.typescriptlang.org/)
- [esbuild](https://esbuild.github.io/)
- [Vitest](https://vitest.dev/) + [jsdom](https://github.com/jsdom/jsdom)
- [Prettier](https://prettier.io/)
- [Chrome Extensions — Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE).

## Autor

Bruno Mateus — [github.com/brunomateus](https://github.com/brunomateus)
