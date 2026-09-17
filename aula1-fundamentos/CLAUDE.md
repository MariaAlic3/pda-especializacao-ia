# aula1-fundamentos

## O que é este projeto

Campo de treino da Aula 1 (Fundamentos) da Especialização em IA da PDA.
Projeto Node pequeno com funções utilitárias em `src/` e testes em `tests/`.

## Stack

- Node.js v22.14.0
- Módulos ESM (usa `import`/`export`) — confirmado pelo `"type": "module"` no package.json
- Test runner: nativo do Node (`node --test`, módulo `node:test`) — sem Jest/Vitest

## Comandos

- Rodar os testes: `npm test`
- Rodar os testes em watch: `npm run test:watch`

## Regras

- Os arquivos em `tests/` são a especificação. **Nunca edite testes** pra fazê-los passar.
- Sempre rode `npm test` depois de qualquer alteração de código e só considere a tarefa concluída se todos os testes passarem.
- Use `const` em vez de `let` sempre que possível; evite `==`, use sempre `===`; mensagens de erro em português.

## Como eu quero trabalhar com você

- Antes de editar, explique em 1–2 frases o que vai mudar e por quê.
- Mudanças pequenas e focadas. Uma tarefa por vez.
- Se não tiver certeza sobre uma API ou lib, consulte a documentação (MCP context7) em vez de chutar.
- Prefira commits pequenos com mensagens curtas e no imperativo.