# Regras de Negócio

## Natureza

Um lançamento possui uma das naturezas:

- Receita
- Despesa
- Resultado

## Competência

Formato obrigatório:

```text
YYYY-MM
```

Exemplo:

```text
2026-09
```

A coluna deve permanecer como texto no Google Sheets.

## Parcelamento

O usuário informa o valor total.

Exemplo:

```text
R$ 1.200 / 6
```

O sistema distribui automaticamente o valor entre seis competências.

## Compartilhamento

Um gasto pode ser:

- individual;
- compartilhado 50/50;
- compartilhado em percentual personalizado.

O sistema registra quem efetuou o pagamento e calcula o acerto entre as partes.

## Exclusão de conta

Contas não são apagadas fisicamente.

A exclusão altera:

```text
ATIVO = NÃO
```

Isso preserva o histórico de lançamentos.

## Concorrência

Gravações usam `LockService` para reduzir risco de colisão entre usuários simultâneos.
