# game-review-frontend

Aplicação frontend React para gerenciamento e visualização de reviews de jogos, consumindo a [jogos-review-api](https://jogos-review-api-production-d522.up.railway.app) hospedada no Railway.

**Demo:** [jogos-review-frontend.vercel.app](https://jogos-review-frontend.vercel.app)

---

## Stack

- **Vite + React** — bundler e framework
- **Axios** — requisições HTTP com interceptor de autenticação
- **JWT** — autenticação stateless via header `Authorization: Bearer`
- **Vercel** — hospedagem com deploy contínuo
- **GitHub Actions** — pipeline de CI (lint + build + auditoria)

---

## Funcionalidades

- Listagem e busca de jogos com filtro por gênero e plataforma
- Visualização de reviews por jogo
- Cadastro e login de usuários
- Criação e edição de reviews (apenas o autor)
- Painel administrativo para gerenciar jogos (`ROLE_ADMIN`)

---

## Arquitetura e decisões técnicas

| Camada | Detalhe |
|---|---|
| Autenticação | JWT armazenado em `localStorage`, enviado via interceptor do Axios no header `Authorization: Bearer` |
| Autorização | Verificação de propriedade no cliente (`usuarioId`) + validação obrigatória no backend antes de `PUT /reviews/{id}` e `DELETE /reviews/{id}` |
| CORS | Configurado no backend (Spring Security) com origens explícitas — sem `*` em produção |
| Roles | Backend distingue `ROLE_ADMIN` (gerenciar jogos) e usuário autenticado (criar/editar reviews) |
| Headers de segurança | Configurados via `vercel.json` — `X-Frame-Options`, `HSTS`, `CSP`, `X-Content-Type-Options` |

> **Nota sobre `localStorage`:** A escolha é intencional para simplicidade. O risco XSS é conhecido — a melhoria planejada é migrar para cookie `HttpOnly; Secure; SameSite=Strict` com refresh token, o que exige coordenação com o backend.

---

## Pré-requisitos

- Node.js 20+
- npm 8+

---

## Instalação e execução local

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env

# 3. Rodar em desenvolvimento
npm run dev
```

### Variáveis de ambiente

Crie um `.env` na raiz:

```env
VITE_API_URL=https://jogos-review-api-production-d522.up.railway.app
```

> Variáveis prefixadas com `VITE_` são embutidas no bundle pelo Vite em build time. **Nunca coloque segredos sensíveis aqui.**

O `.env` está no `.gitignore` — nunca será commitado.

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção (gera `dist/`) |
| `npm run preview` | Serve o build localmente para validação |
| `npm run lint` | Executa ESLint |

---

## Contrato da API

Endpoint de listagem de reviews retorna, por item:

```json
{
  "id": 30,
  "nota": 9,
  "comentario": "Ótimo jogo!",
  "jogoId": 2,
  "usuarioId": 6,
  "nickname": "Felipe",
  "createdAt": "2026-05-14T05:27:59.528874"
}
```

O campo `usuarioId` é usado pelo frontend para exibir o botão **Editar** apenas para o autor da review. O backend valida novamente na requisição — o cliente não é confiável para autorização.

---

## CI com GitHub Actions

A cada `git push` na branch `main` o pipeline executa automaticamente:

```
lint → build → npm audit
```

Configurado em `.github/workflows/ci.yml`. A variável `VITE_API_URL` é lida via GitHub Secret para o build funcionar no pipeline.

---

## Deploy

O deploy é feito automaticamente pela Vercel a cada push na branch `main` após o pipeline do GitHub Actions.

### Headers de segurança

Configurados via `vercel.json`, aplicados em todas as rotas:

| Header | Valor |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer-when-downgrade` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | `default-src 'self'` + origens explícitas para Google Fonts e API |

---

## Segurança

### Implementado

- CORS com origens explícitas no backend (sem `*` em produção)
- JWT validado em cada requisição no backend via filtro Spring Security
- Autorização por role (`ROLE_ADMIN`) e por propriedade do recurso no backend
- Headers de segurança via `vercel.json`
- `.env` no `.gitignore`
- `npm audit` no pipeline de CI

### Melhorias futuras conhecidas

- **Cookie `HttpOnly` + refresh token** — eliminaria o risco XSS do `localStorage`. Exige mudanças coordenadas no backend (endpoint `/auth/refresh`, configuração de CORS com `credentials: true`)
- **Refresh automático antes do redirect em 401** — atualmente o interceptor redireciona para `/login` diretamente. Com refresh token implementado, tentaria renovar a sessão primeiro