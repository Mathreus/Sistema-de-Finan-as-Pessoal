# Registro de Decisões

## ADR-001 — Google Sheets como banco do MVP

**Decisão:** utilizar Google Sheets.

**Motivo:** velocidade de desenvolvimento e facilidade de inspeção.

**Consequência:** não é a arquitetura definitiva para escala comercial.

## ADR-002 — Exclusão lógica do Plano de Contas

**Decisão:** `ATIVO = NÃO`.

**Motivo:** preservar referências históricas.

## ADR-003 — Competência como texto

**Decisão:** armazenar `YYYY-MM` como texto.

**Motivo:** impedir conversão automática do Sheets em data.

## ADR-004 — Lock de gravação

**Decisão:** usar `LockService.getScriptLock()`.

**Motivo:** permitir uso simultâneo com menor risco de colisão.
