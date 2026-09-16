# Segurança

## Dados que não devem ser versionados

Nunca envie ao GitHub:

- planilhas com movimentações financeiras;
- comprovantes;
- extratos;
- IDs de arquivos privados;
- tokens;
- senhas;
- chaves de API;
- credenciais OAuth;
- `.clasp.json` real.

## Banco de dados

O Google Sheets utilizado como banco de dados é externo ao repositório.

O código deve trabalhar apenas com o ID armazenado em `ScriptProperties`.

## Acesso ao Web App

Enquanto o projeto for utilizado por um casal, recomenda-se:

- executar o Web App como o proprietário;
- restringir o acesso a usuários autenticados;
- não compartilhar a planilha-base com terceiros sem necessidade.

## Evolução para produto

Antes de disponibilizar a aplicação publicamente, será necessário revisar:

- autenticação;
- segregação de dados por cliente;
- autorização;
- armazenamento;
- LGPD;
- logs;
- backups;
- política de retenção;
- termos de uso e privacidade.
