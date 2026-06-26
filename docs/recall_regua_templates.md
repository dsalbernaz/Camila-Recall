# Camila Recall - Proposta Inicial de Regua e Templates

## Objetivo

Definir uma primeira versao operacional da regua de Recall para a Camila, aproveitando o aprendizado do remarketing, mas com uma logica mais conservadora e mais orientada a utilidade.

No Recall, o paciente ja teve relacao previa com a clinica. Isso permite um tom mais direto e util, mas nao justifica uma cadencia agressiva. O foco deve ser:

1. Reativar pacientes elegiveis para revisao/retorno.
2. Abrir conversa para agendamento com o menor atrito possivel.
3. Encerrar cedo quando nao houver resposta.
4. Preservar reputacao do canal e evitar insistencia desnecessaria.

## Contexto atual validado

Com base no MVP de Recall executado em `2026-06-25`:

- Base total avaliada: `2501`
- Elegiveis finais: `1045`
- Clinica geral: `900`
- Ortodontia adimplente: `145`

Distribuicao por coorte:

- `6-12m`: `371`
- `1-2a`: `257`
- `2-3a`: `225`
- `3a+`: `192`

Leitura operacional:

- O Recall tende a ter volume relevante e perene.
- A coorte de tempo desde ultimo atendimento importa para priorizacao e tom.
- Vale separar o conceito de `entrar na base` do conceito de `entrar em disparo agora`.

## Principios da regua

1. Poucos templates ancora.
2. Conversa livre somente depois de resposta do paciente.
3. CTA simples: confirmar interesse em agendar revisao/avaliacao.
4. Saida limpa para `nao tenho interesse`, `ja agendei`, `numero errado` e `parar mensagens`.
5. Priorizar utilidade e contexto clinico, nao promocao.
6. Segmentar a prioridade por coorte, mas nao necessariamente multiplicar templates por segmento logo no inicio.

## Regua proposta - V1

### Estrutura

Proposta inicial de 3 toques por paciente:

1. `D0` - Template ancora 1
2. `D5` - Template ancora 2
3. `D14` - Template ancora 3

Se nao houver resposta apos o terceiro toque:

- encerrar jornada como `sem_resposta`
- aplicar cooldown longo antes de nova tentativa

Cooldown sugerido:

- `90 dias` para nova entrada automatica

### Por que 3 toques

Para Recall, 3 toques parecem um bom equilibrio entre:

- cobertura minima de contato
- menor risco de cansar a base
- simplicidade operacional

Quatro ou mais toques so fariam sentido depois de medir:

- taxa de resposta por etapa
- taxa de opt-out
- taxa de agendamento por etapa

## Disparos e gatilhos

### Gatilho de entrada na regua

O paciente entra na regua quando:

1. esta elegivel pela regra de negocio do Recall
2. nao possui agendamento atual
3. possui telefone valido
4. nao esta em opt-out
5. nao esta em conversa ativa
6. nao recebeu Recall recentemente dentro do cooldown

### Gatilhos de pausa

Pausar imediatamente os proximos disparos quando ocorrer qualquer um dos eventos:

1. resposta do paciente
2. agendamento criado
3. handoff humano iniciado
4. opt-out
5. identificacao de numero invalido

### Gatilhos de encerramento

Encerrar a jornada quando:

1. houve agendamento
2. houve opt-out
3. paciente informou que nao deseja retornar
4. todos os toques foram enviados sem resposta
5. lead ficou inelegivel por regra superveniente

### Gatilhos de reentrada

Permitir nova entrada automatica apenas quando:

1. a jornada anterior terminou como `sem_resposta`
2. passaram ao menos `90 dias`
3. o paciente segue elegivel
4. nao ha agendamento futuro

## Segmentacao recomendada

### Segmento operacional

Usar desde o inicio:

1. `clinica_geral`
2. `ortodontia_adimplente`

### Segmento de prioridade

Usar para ordenacao de fila e eventualmente ajuste de copy:

1. `3a+`
2. `2-3a`
3. `1-2a`
4. `6-12m`

Recomendacao:

- nao criar 8-10 templates diferentes logo de cara
- comecar com copy-base unica e, se necessario, apenas 1 variacao por segmento clinico

## Templates necessarios - V1

### 1. Template ancora 1 - abertura utilitaria

Objetivo:

- reabrir contato
- contextualizar que e um retorno/revisao
- pedir resposta simples

Slug sugerido:

- `recall_abertura_1`

Exemplo de intencao:

"Oi, [nome]. Aqui e a equipe da [clinica]. Vimos que ja faz um tempo desde seu ultimo atendimento e estamos organizando os retornos. Se fizer sentido para voce, posso te ajudar a verificar um horario para revisao."

### 2. Template ancora 2 - lembrete leve

Objetivo:

- recuperar quem viu e nao respondeu
- manter tom leve e pouco invasivo

Slug sugerido:

- `recall_lembrete_2`

Exemplo de intencao:

"Passando para reforcar seu retorno com a [clinica], [nome]. Se quiser, posso verificar opcoes de horario por aqui."

### 3. Template ancora 3 - ultimo toque

Objetivo:

- dar uma ultima oportunidade
- sinalizar encerramento sem pressao

Slug sugerido:

- `recall_ultimo_toque_3`

Exemplo de intencao:

"Esse e meu ultimo aviso por aqui sobre seu retorno na [clinica], [nome]. Se quiser agendar sua revisao, me responde com um 'sim' que eu sigo com voce."

## Templates de continuidade apos resposta

Esses nao precisam necessariamente ser template Meta. Em geral podem ser mensagens livres dentro da janela aberta.

### 4. Resposta positiva

Uso:

- paciente respondeu com interesse

Objetivo:

- levar para oferta de horarios ou coleta de preferencia

Slug logico:

- `recall_reply_positivo`

### 5. Ja agendei

Uso:

- paciente informa que ja marcou

Objetivo:

- agradecer
- encerrar
- opcionalmente reconciliar base

Slug logico:

- `recall_reply_ja_agendado`

### 6. Nao tenho interesse agora

Uso:

- paciente nao quer no momento

Objetivo:

- encerrar sem atrito
- opcionalmente registrar motivo

Slug logico:

- `recall_reply_sem_interesse`

### 7. Pedir para parar mensagens

Uso:

- opt-out explicito

Objetivo:

- confirmar remocao
- bloquear novas tentativas

Slug logico:

- `recall_reply_opt_out`

### 8. Numero errado / paciente nao e essa pessoa

Uso:

- higienizacao de base

Objetivo:

- desculpar
- marcar telefone como invalido ou dissociado

Slug logico:

- `recall_reply_numero_errado`

## Inventario minimo de templates

### Templates Meta aprovados

Idealmente subir primeiro:

1. `recall_abertura_1`
2. `recall_lembrete_2`
3. `recall_ultimo_toque_3`

### Mensagens livres operacionais

Preparar roteiros para:

1. interesse em agendar
2. preferencia de horario
3. ja agendado
4. sem interesse
5. opt-out
6. numero errado
7. handoff humano

## Variaveis que os templates vao precisar

Minimo recomendado:

1. `primeiro_nome`
2. `nome_clinica`

Variaveis opcionais para fase seguinte:

1. `tipo_retorno` como `revisao`, `avaliacao`, `retorno`
2. `dentista_responsavel`
3. `faixa_tempo_sem_atendimento`

Recomendacao:

- na V1, evitar templates com muitas variaveis
- quanto menos variavel, mais facil aprovar e operar

## Estados sugeridos para o Recall

Para nao misturar tudo com a semantica de remarketing, a jornada de Recall pode trabalhar com estados claros:

1. `importado`
2. `elegivel`
3. `em_regua`
4. `janela_aberta`
5. `em_atendimento_humano`
6. `agendado`
7. `sem_resposta`
8. `opt_out`
9. `inelegivel`

## Eventos sugeridos para auditoria

1. `recall_importado`
2. `recall_elegivel`
3. `recall_jornada_gerada`
4. `recall_template_criado`
5. `recall_template_enviado`
6. `recall_respondeu`
7. `recall_agendamento_sinalizado`
8. `recall_agendamento_confirmado`
9. `recall_opt_out`
10. `recall_numero_invalido`
11. `recall_handoff_humano`
12. `recall_encerrado_sem_resposta`

## Priorizacao operacional recomendada

### Onda 1

Colocar em disparo primeiro:

1. coorte `3a+`
2. coorte `2-3a`

Motivo:

- maior chance de haver pacientes realmente afastados
- universo menor para validar copy, respostas e fluxo

### Onda 2

Expandir para:

1. `1-2a`
2. `6-12m`

## Hipoteses que vale validar cedo

1. `3a+` responde melhor a um texto mais consultivo do que a um texto neutro.
2. `clinica_geral` e `ortodontia_adimplente` podem exigir aberturas ligeiramente diferentes.
3. O melhor CTA talvez seja "posso verificar horarios?" e nao "deseja agendar?".
4. O segundo toque pode recuperar boa parte da conversao, tornando o terceiro apenas um fechamento.

## Recomendacao pratica de implementacao

Se formos seguir um caminho enxuto, a proxima etapa pode ser:

1. criar schema inicial `recall_leads`, `recall_journey` e `recall_events`
2. importar o `recall_eligible.csv` para banco
3. cadastrar 3 templates ancora
4. gerar jornada apenas para uma coorte piloto
5. medir resposta antes de sofisticar a copy

## Decisoes recomendadas para a proxima iteracao

Precisamos fechar em seguida:

1. se o Recall usara 3 ou 4 toques
2. se `clinica_geral` e `ortodontia_adimplente` terao copy separada ja na V1
3. se o CTA principal sera `responder sim` ou `informar melhor horario`
4. se vamos pilotar primeiro so com `3a+`
