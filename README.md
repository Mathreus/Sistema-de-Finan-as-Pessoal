# Sistema de Controle das Finanças Pessoais

Aplicação web responsiva para controle financeiro pessoal e compartilhado, construída em Google Apps Script com Google Sheets como banco de dados e Google Drive para armazenamento de anexos e exportações.

> Status atual: **MVP em desenvolvimento**

## Objetivo

Reduzir a burocracia do controle financeiro cotidiano e permitir que duas pessoas registrem, acompanhem e planejem suas finanças em um único ambiente.

O projeto começou como uma solução de uso pessoal para casal, mas a arquitetura e o roadmap já consideram uma possível evolução futura para perfis Individual, Casal e Família.

## Funcionalidades atuais

- Dashboard mensal.
- KPIs de receitas, despesas, resultado e limite disponível.
- Evolução mensal.
- Comparação financeira por pessoa.
- Registro de receitas, despesas e resultados.
- Plano de contas configurável.
- Pesquisa por conta e forma de pagamento.
- Gastos compartilhados.
- Divisão 50/50 ou personalizada.
- Controle de quem pagou.
- Cálculo de acerto entre o casal.
- Parcelamentos automáticos.
- Diário financeiro.
- Filtros.
- Exclusão de lançamentos.
- Anexos no Google Drive.
- Exportação para Excel.
- Planejamento mensal.
- Controle de concorrência com `LockService`.

## Stack

- Google Apps Script
- Google Sheets
- Google Drive
- HTML
- CSS
- JavaScript
- Google Charts

## Estrutura do repositório

```text
financas-a-dois/
├── src/
│   ├── Code.gs
│   ├── Database.gs
│   ├── LancamentosService.gs
│   ├── PlanoContasService.gs
│   ├── DashboardService.gs
│   ├── ExportService.gs
│   ├── index.html
│   ├── styles.html
│   ├── scripts.html
│   └── appsscript.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── BUSINESS_RULES.md
│   ├── DATA_MODEL.md
│   ├── DECISIONS.md
│   ├── INSTALLATION.md
│   ├── PRODUCT.md
│   ├── ROADMAP.md
│   └── SAAS_MIGRATION.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── .clasp.json.example
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

## Instalação rápida

Veja [docs/INSTALLATION.md](docs/INSTALLATION.md).

## Segurança

Nunca inclua no repositório:

- dados financeiros reais;
- IDs privados de planilhas;
- arquivos de comprovantes;
- credenciais;
- tokens;
- `.clasp.json` real;
- chaves de API.

Veja [SECURITY.md](SECURITY.md).

## Próximas evoluções

Entre as funcionalidades planejadas:

- cartões e faturas;
- fechamento e vencimento;
- despesas recorrentes;
- orçamento por categoria;
- metas;
- patrimônio;
- sincronização automática do dashboard;
- edição de lançamentos;
- exclusão de parcelamento completo;
- projeção financeira de 12 meses;
- arquitetura multiusuário/multifamília.

Veja [docs/ROADMAP.md](docs/ROADMAP.md).

## Licença

Este projeto é privado e proprietário. Nenhuma licença open source foi atribuída neste momento.
