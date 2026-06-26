# Camila Recall

Pasta isolada da frente `Camila Recall` para publicacao independente do restante da `Camila 3_0`.

## O que esta aqui

- `recall_server.js`
  Servidor do painel e APIs do Recall.
- `public/`
  Dashboard web do Recall.
- `scripts/`
  Importacao e utilitarios operacionais do Recall.
- `migrations/`
  Migrations exclusivas do schema `recall`.
- `docs/`
  Documentacao funcional e tecnica do Recall.
- `outputs/`
  Saidas de importacao e arquivos gerados no MVP.

## Como subir so o Recall

1. Entre nesta pasta:
   `C:\Users\dsalb\OneDrive\Documentos\Camila 3_0\camila_recall`
2. Instale dependencias:
   `npm install`
3. Crie o `.env` a partir de `.env.example`
4. Inicie:
   `npm start`

## Publicacao propria

Se a ideia for publicar somente o Recall, esta e a unica pasta que precisa ser enviada.

Arquivos principais para deploy:

- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`
- `docker-stack-portainer.yml`
- `recall_server.js`
- `public/recall_dashboard.html`
- `package.json`
- `.env`

## Modos de deploy

### Opcao 1: Portainer com build da propria pasta

Use `docker-compose.yml` quando o Portainer ou servidor vai construir a imagem a partir desta pasta.

Vantagem:
- Menos atrito para publicar a pasta `camila_recall` sozinha.

Comando local equivalente:
- `docker compose up -d --build`

### Opcao 2: Portainer com imagem pronta

Use `docker-stack-portainer.yml` quando voce ja tiver publicado uma imagem e quiser apenas referenciá-la por `RECALL_IMAGE`.

Vantagem:
- Melhor para ambientes onde a imagem ja faz parte do pipeline de publicacao.

## Publicacao de imagem via GitHub

Este repositorio ja inclui o workflow:

- `.github/workflows/publish-image.yml`

Fluxo esperado:

1. Fazer o primeiro push do repositorio para o GitHub
2. Garantir que o GitHub Actions esteja habilitado
3. Fazer push na branch `main`
4. O GitHub Actions publicara a imagem em:
   `ghcr.io/<seu-usuario>/camila-recall:latest`

No Portainer, voce pode usar diretamente:

- `ghcr.io/<seu-usuario>/camila-recall:latest`

Se o pacote ficar privado no GHCR, o servidor/Portainer precisara estar autenticado no registry.

## Isolamento do Recall

Este pacote foi preparado para evitar cruzamento com o projeto Remarketing:

- schema padrao: `recall`
- inbox padrao do Chatwoot: `5`
- `RECALL_META_PHONE_NUMBER_ID` dedicado: `1185849817944465`
- envio real bloqueado se as credenciais dedicadas do Recall nao estiverem preenchidas

## Agente Recall MVP

O servidor da Recall agora suporta um agente inicial de atendimento na inbox `5`, com foco em:

- responder a `Quero informacoes`
- tratar `Nao reconheco`
- persuadir objeções simples de prevencao
- abrir handoff humano apenas quando o paciente confirmar interesse
- respeitar opt-out e numero errado

Variaveis principais:

- `RECALL_AGENT_ENABLED=true`
- `RECALL_AGENT_SENDER=camila_recall`
- `RECALL_AGENT_DELAY_MIN_MS=1200`
- `RECALL_AGENT_DELAY_MAX_MS=2800`
- `CHATWOOT_RECALL_LABEL_HANDOFF=recall_agendar`
- `CHATWOOT_RECALL_LABEL_IA_OFF=ia_off`
- `CHATWOOT_RECALL_LABEL_AGUARDANDO=aguardando_atendimento`
- `CHATWOOT_RECALL_LABEL_OPT_OUT=recall_opt_out`
- `CHATWOOT_RECALL_LABEL_WRONG_NUMBER=recall_numero_errado`
- `CHATWOOT_RECALL_LABEL_SEM_INTERESSE=recall_sem_interesse`

Quando houver aceite do paciente, a Recall:

- envia a mensagem de transferencia
- adiciona a label de handoff
- adiciona a label `aguardando_atendimento`
- adiciona `ia_off`
- grava `handoff_at` no lead

Para envio real, configure obrigatoriamente:

- `RECALL_META_WHATSAPP_TOKEN`
- `RECALL_META_PHONE_NUMBER_ID`

## Dominio e rotas

Dominio publico previsto:

`https://dashboard.oc332.com.br`

Rotas principais apos deploy:

- Painel: `https://dashboard.oc332.com.br/recall`
- Webhook Chatwoot: `https://dashboard.oc332.com.br/api/recall/chatwoot/webhook`

## Checklist de publicacao propria

1. Publicar apenas a pasta `camila_recall`
2. Criar `.env` a partir de `.env.example`
3. Preencher banco, Chatwoot e Meta dedicados do Recall
4. Escolher `docker-compose.yml` ou `docker-stack-portainer.yml`
5. Subir o servico
6. No Chatwoot inbox `5`, apontar o webhook `message_created` para:
   `https://dashboard.oc332.com.br/api/recall/chatwoot/webhook`

## Banco no servidor

Para deploy em servidor Docker, use o pooler do Supabase em vez do host direto IPv6.

Configuracao recomendada:

- `PGHOST=aws-1-sa-east-1.pooler.supabase.com`
- `PGPORT=5432`
- `PGDATABASE=postgres`
- `PGUSER=postgres.nndduotjbyunggamqnyh`
- `PGPASSWORD=<sua-senha>`

Se usar `db.nndduotjbyunggamqnyh.supabase.co`, o container pode falhar com erro de rede IPv6 como `ENETUNREACH`.
