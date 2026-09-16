# Contribuindo

## Fluxo recomendado

1. Nunca desenvolver diretamente em `main`.
2. Criar uma branch.
3. Implementar e testar.
4. Abrir Pull Request.
5. Revisar impacto no banco e nas regras de negócio.
6. Fazer merge após validação.

## Padrão de branches

```text
feature/nome-da-funcionalidade
fix/nome-do-problema
refactor/nome-do-refactor
docs/nome-da-documentacao
```

Exemplos:

```text
feature/cartoes-faturas
fix/competencia-dashboard
feature/sincronizacao-automatica
```

## Commits

Padrão sugerido:

```text
feat: adiciona cadastro de cartões
fix: corrige filtro de competência
refactor: separa serviço de dashboard
docs: atualiza modelo de dados
```

## Antes do merge

Validar:

- desktop;
- celular;
- lançamento de receita;
- lançamento de despesa;
- parcelamento;
- gasto compartilhado;
- dashboard;
- diário;
- concorrência de gravação.
