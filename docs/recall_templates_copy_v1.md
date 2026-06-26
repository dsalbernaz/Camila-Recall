# Camila Recall - Templates e Copy V1

## Objetivo

Consolidar a primeira versao de copy para a frente de Recall, separando:

1. templates ancora para disparo ativo
2. mensagens livres para continuidade da conversa
3. respostas padrao para encerramentos e excecoes

## Diretrizes de tom

1. Tom humano, simples e util.
2. Sem cara de campanha agressiva.
3. Foco em retorno, revisao e organizacao de agenda.
4. CTA curto e facil de responder.
5. Evitar excesso de informacao no primeiro toque.

## Variaveis sugeridas

Usar no maximo:

1. `{{primeiro_nome}}`
2. `{{nome_clinica}}`

Fallback recomendado:

- se nao houver `primeiro_nome`, remover a saudacao nominal em vez de forcar placeholder ruim

## Templates ancora - V1

### 1. `recall_abertura_1`

Objetivo:

- iniciar contato
- contextualizar retorno
- abrir conversa para agendamento

Copy base:

```text
Oi, {{primeiro_nome}}! Aqui e da {{nome_clinica}}.

Vi que ja faz um tempinho desde seu ultimo atendimento com a gente e estamos organizando os retornos.

Se fizer sentido para voce, posso verificar um horario para sua revisao por aqui.
```

Versao mais curta:

```text
Oi, {{primeiro_nome}}! Aqui e da {{nome_clinica}}.

Estamos organizando os retornos de pacientes e vi que talvez ja seja um bom momento para sua revisao.

Se quiser, posso verificar um horario por aqui.
```

### 2. `recall_lembrete_2`

Objetivo:

- lembrar sem pressionar
- recuperar pacientes que viram e nao responderam

Copy base:

```text
Oi, {{primeiro_nome}}! Passando para reforcar seu retorno com a {{nome_clinica}}.

Se quiser, consigo te ajudar por aqui a verificar um horario de revisao.
```

Versao mais curta:

```text
Passando para lembrar do seu retorno com a {{nome_clinica}}, {{primeiro_nome}}.

Se quiser agendar sua revisao, posso verificar um horario por aqui.
```

### 3. `recall_ultimo_toque_3`

Objetivo:

- dar ultima chance de resposta
- encerrar com elegancia

Copy base:

```text
Oi, {{primeiro_nome}}! Esse e meu ultimo aviso por aqui sobre seu retorno na {{nome_clinica}}.

Se quiser agendar sua revisao, me responde com um "sim" e eu sigo com voce.
```

Versao mais curta:

```text
Esse e meu ultimo contato por aqui sobre seu retorno na {{nome_clinica}}, {{primeiro_nome}}.

Se quiser, me responde com "sim" que eu te ajudo com o agendamento.
```

## Mensagens livres - continuidade apos resposta

### 4. Interesse em agendar

Uso:

- quando o paciente responde positivamente

Copy base:

```text
Perfeito! Posso te ajudar com isso por aqui.

Voce costuma preferir horario durante a semana ou no sabado?
```

Variacao:

```text
Claro! Vamos organizar isso juntos.

Voce prefere ver horarios de semana ou de sabado?
```

### 5. Depois de informar horarios

Uso:

- quando a ferramenta retornar opcoes reais

Copy base:

```text
Tenho estes horarios disponiveis no momento:

[LISTA_DE_OPCOES]

Qual deles fica melhor para voce?
```

### 6. Ja agendei

Uso:

- quando o paciente informa que ja marcou

Copy base:

```text
Perfeito, obrigada por me avisar!

Que bom que voce ja conseguiu se organizar. Se precisar de qualquer coisa, e so me chamar por aqui.
```

### 7. Sem interesse agora

Uso:

- quando o paciente nao quer marcar neste momento, mas sem pedir bloqueio

Copy base:

```text
Sem problema, obrigada por me avisar.

Se mais para frente fizer sentido para voce retomar, e so chamar por aqui.
```

### 8. Retomar depois

Uso:

- quando o paciente sinaliza interesse futuro

Copy base:

```text
Claro, sem problema.

Vou deixar seu cadastro aqui e, quando fizer mais sentido para voce, a gente organiza com calma.
```

### 9. Opt-out

Uso:

- quando a pessoa pede para parar

Copy base:

```text
Perfeito, pode deixar.

Vou registrar por aqui para nao enviarmos novas mensagens.
```

### 10. Numero errado

Uso:

- quando a pessoa informa que nao e o paciente

Copy base:

```text
Entendi, obrigada por avisar.

Vou ajustar por aqui para evitar novos contatos indevidos.
```

### 11. Handoff humano

Uso:

- quando a conversa precisa sair da Camila para uma pessoa do time

Copy base:

```text
Perfeito. Vou encaminhar seu caso para o nosso time seguir com voce, tudo bem?
```

## Respostas de agendamento confirmado

### 12. Confirmacao de agendamento

Uso:

- apos o agendamento ser criado com sucesso

Copy base:

```text
Perfeito! Seu retorno ficou agendado para [DIA], [DATA], as [HORA].

Se precisar de qualquer ajuste, e so me chamar por aqui.
```

## Sugestoes de copy por segmento

### Clinica geral

Tom recomendado:

- revisao
- retorno
- acompanhamento

Palavras mais naturais:

- `revisao`
- `retorno`
- `atendimento`

### Ortodontia adimplente

Tom recomendado:

- acompanhamento
- revisao
- continuidade

Palavras mais naturais:

- `revisao`
- `acompanhamento`
- `retorno`

Observacao:

- na V1 eu manteria a mesma estrutura de template para ambos os segmentos
- a diferenciacao pode ficar mais no texto livre da Camila, se necessario

## Regras praticas para aprovacao Meta

1. Evitar claims promocionais desnecessarias.
2. Evitar tom de cobranca.
3. Evitar frases ambigas sobre urgencia clinica.
4. Manter texto simples, utilitario e contextual.

## Recomendacao de teste A/B futuro

Vale testar duas aberturas no template 1:

### Variante A - mais consultiva

```text
Oi, {{primeiro_nome}}! Aqui e da {{nome_clinica}}.

Vi que ja faz um tempo desde seu ultimo atendimento e estamos organizando os retornos.

Se fizer sentido para voce, posso verificar um horario para sua revisao por aqui.
```

### Variante B - mais direta

```text
Oi, {{primeiro_nome}}! Aqui e da {{nome_clinica}}.

Estou entrando em contato para te ajudar com seu retorno na clinica.

Se quiser, posso verificar um horario por aqui.
```

## Recomendacao final

Para subir rapido sem complicar:

1. aprovar 3 templates ancora
2. padronizar 6 mensagens livres operacionais
3. pilotar com uma coorte pequena
4. revisar taxa de resposta antes de abrir mais variacoes
