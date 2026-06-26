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

## Isolamento do Recall

Este pacote foi preparado para evitar cruzamento com o projeto Remarketing:

- schema padrao: `recall`
- inbox padrao do Chatwoot: `5`
- `RECALL_META_PHONE_NUMBER_ID` dedicado: `1185849817944465`
- envio real bloqueado se as credenciais dedicadas do Recall nao estiverem preenchidas

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
