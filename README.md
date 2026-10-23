# Sigga++

Extensão para Google Chrome que adiciona atalhos e ajustes ao [SIGAA da UFC](https://si3.ufc.br/sigaa/), com foco no fluxo de trabalho do docente.

> **Status:** em desenvolvimento. A versão atual (`v0`) contém apenas a estrutura do projeto; as funcionalidades serão adicionadas nas próximas versões.

## Funcionalidades planejadas

- [ ] **Vínculo favorito:** marca um vínculo como favorito e o seleciona automaticamente no login.
- [ ] **Acesso direto ao Portal Docente:** pula a página inicial e abre o Portal do Docente.
- [ ] **Privacidade na lista de frequência:** oculta os indicadores de necessidades especiais ao lado do nome dos alunos.

## Requisitos

- [Node.js](https://nodejs.org/) 22.18 ou superior
- Google Chrome (ou outro navegador baseado em Chromium)

## Instalação

```bash
git clone <url-do-repositorio>
cd Sigga++
npm install
npm run build
```

Em seguida, carregue a extensão no navegador:

1. Acesse `chrome://extensions`.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta `dist/`.

## Desenvolvimento

| Comando             | Descrição                                          |
| ------------------- | -------------------------------------------------- |
| `npm run build`     | Gera a extensão em `dist/`                         |
| `npm run watch`     | Recompila automaticamente ao alterar `src/`        |
| `npm run typecheck` | Verifica os tipos com o compilador TypeScript      |

Depois de cada build, clique em **↻ Recarregar** no card da extensão em `chrome://extensions` e atualize a página do SIGAA.

O modo `watch` não copia `public/` de novo. Se alterar o `manifest.json`, rode `npm run build`.

### Estrutura do projeto

```
├── public/          # Arquivos estáticos copiados para dist/ (manifest.json, HTML)
├── src/             # Código-fonte TypeScript
├── build.ts         # Script de build (esbuild)
├── tsconfig.json
└── package.json
```

### Adicionando um novo script

1. Crie o arquivo em `src/<nome>.ts`.
2. Adicione `"src/<nome>.ts"` ao array `entryPoints` em `build.ts`.
3. Registre `<nome>.js` no `public/manifest.json` (por exemplo, em `content_scripts`).

Cada ponto de entrada é empacotado como um arquivo autocontido (IIFE), pois content scripts não suportam módulos ES.

## Tecnologias

- [TypeScript](https://www.typescriptlang.org/)
- [esbuild](https://esbuild.github.io/)
- [Chrome Extensions — Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)

## Autor

Bruno Mateus — [github.com/brunomateus](https://github.com/brunomateus)
