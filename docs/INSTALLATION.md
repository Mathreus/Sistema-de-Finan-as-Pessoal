# Instalação

## 1. Criar a planilha

A planilha deve ser uma Planilha Google nativa.

## 2. Criar o Apps Script

Na planilha:

```text
Extensões > Apps Script
```

## 3. Copiar os arquivos

Copie todos os arquivos de `src/` para o projeto Apps Script.

O arquivo `appsscript.json` deve substituir o manifesto do projeto.

## 4. Inicializar

Execute:

```javascript
setupSistema()
```

Autorize os acessos solicitados.

## 5. Publicar

```text
Implantar
> Nova implantação
> Aplicativo da Web
```

Para o cenário atual de casal:

- Executar como: proprietário
- Acesso: usuários autenticados permitidos pela conta Google

## 6. Nova versão

Após alterações:

```text
Implantar
> Gerenciar implantações
> Editar
> Nova versão
> Implantar
```

## CLASP

Para sincronização futura:

1. Instale Node.js.
2. Instale o clasp:

```bash
npm install -g @google/clasp
```

3. Copie:

```text
.clasp.json.example
```

para:

```text
.clasp.json
```

4. Informe o Script ID.
5. Faça login:

```bash
clasp login
```

6. Envie o código:

```bash
clasp push
```
