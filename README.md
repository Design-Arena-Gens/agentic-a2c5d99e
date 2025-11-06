# Agentic Finance Blog Automator

Web app/API para automatizar posts no Blogger a partir de texto, link ou áudio (via n8n + Telegram).

## Recursos
- Entrada: texto, URL ou URL de áudio (ex: arquivo do Telegram).
- Transcrição (Whisper), resumo em PT-BR focado em finanças, imagem gerada por IA.
- Montagem do post com imagem no topo e HTML abaixo.
- Publicação direta no Blogger (OAuth2 refresh token).

## Variáveis de ambiente
Copie `.env.example` para `.env.local` (local) e para Vercel Environment Variables em Production:

- `OPENAI_API_KEY` (obrigatório)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `BLOGGER_BLOG_ID` (para publicar)
- `DEFAULT_LANGUAGE` (opcional)
- `FALLBACK_IMAGE_SEED` (opcional)

## Execução local
```bash
npm install
npm run dev
```

## Endpoint principal
`POST /api/process`

Body JSON:
```json
{
  "sourceType": "text | link | audio",
  "text": "...",
  "link": "https://...",
  "audioUrl": "https://...",
  "publish": true
}
```

Resposta:
```json
{
  "title": "...",
  "html": "<div>...</div>",
  "tags": ["..."],
  "imageUrl": "data:image/..." | "https://...",
  "blogger": { ... }
}
```

## Integração n8n (exemplo simples)
- Telegram Trigger → condicional por tipo (mensagem de texto, link detectado, voz)
- ramos:
  - Texto: enviar `POST` para `https://SEU_APP/api/process` com `{ sourceType: "text", text, publish: true }`
  - Link: `POST` com `{ sourceType: "link", link, publish: true }`
  - Voz: primeiro obter URL do arquivo (Telegram), então `POST` com `{ sourceType: "audio", audioUrl, publish: true }`
- Usar retorno para logs ou confirmar ao usuário.

## Observações
- Se geração de imagem falhar, é usado um placeholder do Picsum com seed.
- Se variáveis do Blogger não estiverem configuradas, `publish: true` retornará erro no campo `blogger`, mas o HTML e a imagem são retornados normalmente.
