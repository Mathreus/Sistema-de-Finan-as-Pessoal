# Modelo de Dados

## PESSOAS

| Campo | Uso |
|---|---|
| ID | Identificador |
| NOME | Nome exibido |
| ATIVO | SIM/NÃO |

## FORMAS_PAGAMENTO

| Campo | Uso |
|---|---|
| ID | Identificador |
| NOME | Nome |
| TIPO | PIX, CARTAO_CREDITO etc. |
| TITULAR | Futuro uso |
| DIA_FECHAMENTO | Futuro uso |
| DIA_VENCIMENTO | Futuro uso |
| ATIVO | SIM/NÃO |

## PLANO_CONTAS

| Campo | Uso |
|---|---|
| ID | Identificador |
| CLASSIFICACAO | Receita, Despesa ou Resultado |
| TIPO_CONTA | Ex.: Despesa fixa |
| GRUPO | Ex.: Alimentação |
| SUBGRUPO | Ex.: Mercado |
| CONTA | Ex.: Supermercado |
| PESSOA_PADRAO | Opcional |
| COMPARTILHAVEL | SIM/NÃO |
| ATIVO | SIM/NÃO |

## LANCAMENTOS

Tabela transacional principal.

A competência é armazenada como texto no formato `YYYY-MM`.

Lançamentos parcelados compartilham o mesmo `ID_PARCELAMENTO`.

## PLANEJAMENTO

Mantém receita estimada, meta de investimento e reserva por competência.

## METAS

Estrutura criada para evolução futura.
