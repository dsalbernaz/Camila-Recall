# Camila Recall MVP - Onda 1

## Objetivo

Entregar o menor recorte operacional do Recall:

1. Ler a planilha exportada do sistema.
2. Aplicar a regra MVP de elegibilidade.
3. Normalizar telefones.
4. Gerar uma base pronta para importacao operacional.
5. Produzir um relatorio auditavel com contagens e motivos.

Esta onda ainda nao implementa AdonisJS, inbox, webhook, agente, handoff ou painel.
Ela existe para validar com rapidez a regra de negocio e o universo real da operacao.

## Regra MVP consolidada

Um paciente entra no Recall quando atende a todos os criterios abaixo:

1. Pertence a um grupo elegivel:
   - Clinica geral: `L = Den. Responsavel` em um destes valores:
     - `Giuliano Ferreira Queiroz`
     - `Gustavo Moraes Prado`
     - `Taina Ribeiro De Moraes`
     - `Ana Clara Rezeck De Moura`
     - `Gustavo Cesar Dias Bevilaqua`
     - `Nao informado`
   - Ou ortodontia adimplente:
     - `L` fora da lista acima
     - `M = Sit.Financ.` igual a `ADIMPLENTE`

2. `Q = Ult.Atend` preenchido e com mais de 6 meses em relacao a data de execucao.
3. `R = Agendado` vazio.
4. `J = Telefone` com ao menos um numero valido apos normalizacao.

## Saidas desta onda

O script gera:

- `recall_eligible.csv`: base pronta para uso operacional.
- `recall_excluded.csv`: auditoria dos excluidos com motivo.
- `recall_summary.json`: resumo estatistico da execucao.

## Uso

```powershell
node scripts/recall_generate_mvp_import.js "C:\Users\dsalb\Downloads\Orthodontic - Sistema (35).xlsx"
```

Com data de corte explicita:

```powershell
node scripts/recall_generate_mvp_import.js "C:\Users\dsalb\Downloads\Orthodontic - Sistema (35).xlsx" --as-of=2026-06-25
```

## O que fica para a Onda 2

- Tabela `recall_leads`
- Importacao para Postgres
- Dedupe persistente
- Estados iniciais da frente
- Allowlist de disparo
- Primeiro dispatcher simples
