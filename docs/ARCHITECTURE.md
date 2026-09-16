# Arquitetura

## Visão atual

```text
Navegador / Celular
        |
        v
Google Apps Script Web App
        |
        +--> Frontend
        |    - index.html
        |    - styles.html
        |    - scripts.html
        |
        +--> Backend
             - Code.gs
             - Database.gs
             - LancamentosService.gs
             - PlanoContasService.gs
             - DashboardService.gs
             - ExportService.gs
        |
        +--> Google Sheets
        |    - PESSOAS
        |    - FORMAS_PAGAMENTO
        |    - PLANO_CONTAS
        |    - LANCAMENTOS
        |    - PLANEJAMENTO
        |    - METAS
        |
        +--> Google Drive
             - anexos
             - exportações
```

## Concorrência

Toda inserção por `appendObjects_()` utiliza `LockService.getScriptLock()`.

Isso impede que duas execuções simultâneas calculem a mesma próxima linha.

## Limitações atuais

- banco baseado em planilha;
- identificação de usuários ainda simples;
- ausência de tenant/família;
- ausência de testes automatizados;
- frontend e backend acoplados ao Apps Script;
- deploy manual.

