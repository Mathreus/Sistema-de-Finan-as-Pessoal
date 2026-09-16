# Evolução para SaaS

O projeto atual é adequado como MVP e aplicação doméstica.

Para escala comercial, a arquitetura deve evoluir.

## Modelo futuro sugerido

```text
USUARIO
   |
   v
FAMILIA / HOUSEHOLD
   |
   +--> MEMBROS
   +--> CONTAS
   +--> CARTOES
   +--> LANCAMENTOS
   +--> ORCAMENTOS
   +--> METAS
```

## Stack possível

- Frontend: React / Next.js
- Backend: API própria ou funções serverless
- Banco: PostgreSQL
- Auth: Google / e-mail
- Pagamentos: Stripe, Mercado Pago ou Asaas
- Storage: objeto privado
- Observabilidade: logs e alertas

## Antes da comercialização

Revisar:

- isolamento de clientes;
- autorização;
- backup;
- auditoria;
- LGPD;
- segurança;
- cobrança;
- disponibilidade;
- suporte;
- política de exclusão de dados.
