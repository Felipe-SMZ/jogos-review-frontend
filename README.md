# game-review-frontend

Aplicação frontend React (Vite) para gerenciamento de reviews de jogos.

Este README reúne instruções específicas para execução local, build, deploy e recomendações de segurança antes de colocar em produção.

**Arquivos importantes**
- **`src/context/AuthContext.jsx`**: parsing/armazenamento do JWT e estado de autenticação.
- **`src/services/api.js`**: instância do `axios` e interceptors (adiciona `Authorization`).
- **`src/components/ReviewCard.jsx`**: lógica de exibição/edição de reviews e verificação de propriedade.

**Resumo técnico**: Vite + React, `axios` para API, token JWT guardado em `localStorage` (veja seção Segurança).

**Requisitos**
- Node.js 18+ recomendado
- npm 8+ (ou yarn/pnpm)

**Instalação**

```bash
npm install
```

**Variáveis de ambiente**
- Crie um arquivo `.env` na raiz ou defina variáveis no ambiente de execução:

- `VITE_API_URL` — URL base da API (ex.: `https://api.example.com`)

Exemplo `.env`:

```text
VITE_API_URL=https://api.example.com
```

OBS: variáveis `VITE_` são embutidas no bundle pelo Vite — não coloque segredos sensíveis aqui.

**Scripts úteis**
- `npm run dev` — ambiente de desenvolvimento com HMR
- `npm run build` — build de produção (gera `dist/`)
- `npm run preview` — serve o build localmente
- `npm run lint` — rodar ESLint

```bash
npm run dev
npm run build
npm run preview
```

**Como testar o fluxo de reviews (manual)**
1. Rode `npm run dev`.
2. Acesse a aplicação e faça login (rota `/login`). O token recebido é armazenado em `localStorage`.
3. Navegue até um jogo e verifique a lista de reviews. Se sua conta for autora de uma review (campo `usuarioId` retornado pela API igual a `user.id` do token), o botão **Editar** será exibido.

**Contrato mínimo da API (observações importantes)**
- Endpoint listado de reviews deve retornar, para cada review, pelo menos: `id`, `nota`, `comentario`, `jogoId`, `usuarioId` e `nickname`.
- Exemplo de resposta (por item):

```json
{
	"id": 30,
	"nota": 9,
	"comentario": "Ótimo jogo!",
	"jogoId": 2,
	"usuarioId": 6,
	"nickname": "Sebastian",
	"createdAt": "2026-05-14T05:27:59.528874"
}
```

**Segurança — pontos críticos e recomendações**
- Armazenamento atual do token: `localStorage` (arquivo: [src/context/AuthContext.jsx](src/context/AuthContext.jsx#L1)).
	- Risco: `localStorage` é vulnerável a XSS. Recomendação forte: mover para cookie `HttpOnly; Secure; SameSite=Strict` e implementar refresh token no backend.
- Validação/Autorização: não confie no client. O backend deve checar sempre se o usuário autenticado é o dono da review antes de permitir `PUT /reviews/{id}` ou `DELETE /reviews/{id}`.
- CSP e headers: configurar `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` no servidor estático (Nginx/Cloudflare).
- Evitar `dangerouslySetInnerHTML`. Se necessário, sanitize strings server-side.

**Deploy recomendado (exemplo: build estático + Nginx)**

1. Buildar:

```bash
npm run build
```

2. Copiar `dist/` para servidor e configurar Nginx com headers de segurança e gzip. Exemplo mínimo de bloco Nginx:

```nginx
server {
	listen 80;
	server_name example.com;
	root /var/www/game-review-frontend/dist;

	add_header X-Frame-Options "DENY";
	add_header X-Content-Type-Options "nosniff";
	add_header Referrer-Policy "no-referrer-when-downgrade";
	add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

	location / {
		try_files $uri $uri/ /index.html;
	}
}
```

Se usar cookies `HttpOnly` para sessão, configure CORS e `SameSite` adequadamente no backend.

**CI / Pipeline sugerido (GitHub Actions)**

```yaml
name: CI
on: [push]
jobs:
	build:
		runs-on: ubuntu-latest
		steps:
			- uses: actions/checkout@v4
			- name: Use Node.js
				uses: actions/setup-node@v4
				with:
					node-version: 18
			- run: npm ci
			- run: npm run lint
			- run: npm run build
			- run: npm audit --audit-level=moderate
```

**Auditoria de dependências**
- Execute localmente antes do deploy:

```bash
npm ci
npm audit --production
```

Trave versões com `package-lock.json` com o fluxo `npm ci` no CI.

**Observações específicas do repositório**
- `src/services/api.js` implementa um interceptor que remove token de `localStorage` e redireciona para `/login` em 401 — isso é aceitável, mas preferível tentar refresh antes de redirecionar.
- `src/components/ReviewCard.jsx` já faz checagem robusta de propriedade (`usuarioId`, email, nickname). Garanta que o backend sempre retorne `usuarioId` (ou `usuario` com `id`) no DTO — já presente em implementações típicas.

**Checklist de pré-deploy (resumido)**
- [ ] Backend: garantir validação e autorização server-side (403 quando não for dono).
- [ ] Implementar refresh token + cookies HttpOnly (ou justificar armazenamento em localStorage).
- [ ] Gerar lockfile e rodar `npm audit` no CI.
- [ ] Configurar headers de segurança no servidor estático.
- [ ] Testes: smoke tests na staging.

Se quiser, eu posso:
- gerar um patch exemplo para trocar o fluxo de token para cookie (frontend + instruções backend),
- gerar arquivo de configuração Nginx mais completo com CSP,
- criar o workflow do GitHub Actions completo com deploy para um serviço (Netlify, Vercel, S3+CloudFront).

---
