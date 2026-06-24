# game-review-frontend

Frontend React para catalogar jogos e gerenciar reviews de usuários, consumindo a API [jogos-review-api](https://jogos-review-api.onrender.com).

**Demo:** [jogos-review-frontend.vercel.app](https://jogos-review-frontend.vercel.app)
**API de referência:** [jogos-review-api.onrender.com](https://jogos-review-api.onrender.com)

---

## Funcionalidades

- Listagem de jogos com filtro por gênero e plataforma
- Visualização de detalhes do jogo e reviews associadas
- Cadastro, login e autenticação via JWT
- Criação, edição e remoção de reviews pelo autor
- Painel administrativo para gerenciar jogos (`ROLE_ADMIN`)
- Importação de jogos via IGDB com pré-preenchimento de metadados

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Vite + React |
| HTTP / Auth | Axios com interceptor JWT |
| Estilização | Tailwind CSS |
| Hospedagem | Vercel (deploy contínuo) |
| CI | GitHub Actions (lint → build → audit) |

---

## Início rápido

**Pré-requisitos:** Node.js 20+ e npm 8+

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env e defina VITE_API_URL (veja seção abaixo)

# 3. Iniciar em desenvolvimento
npm run dev
```

### Variáveis de ambiente

Crie `.env` na raiz — ele deve permanecer no `.gitignore`:

```env
VITE_API_URL=https://jogos-review-api-production-d522.up.railway.app
```

> Variáveis com prefixo `VITE_` são substituídas em build time pelo Vite, portanto não devem conter segredos sensíveis. No CI, defina `VITE_API_URL` como secret do ambiente de build.

### Scripts disponíveis

| Comando | Quando usar |
|---|---|
| `npm run dev` | Desenvolvimento local com HMR |
| `npm run build` | Gerar build de produção em `dist/` |
| `npm run preview` | Testar o build gerado localmente |
| `npm run lint` | Verificar erros de lint antes de commitar |

---

## Arquitetura

### Autenticação e autorização

O JWT é armazenado em `localStorage` e anexado automaticamente a cada requisição via interceptor do Axios no header `Authorization: Bearer <token>`.

O controle de acesso visual é feito no cliente com base no usuário autenticado e no papel (`ROLE_ADMIN`), mas **toda operação protegida é validada obrigatoriamente no backend**.

> **Nota:** o uso de `localStorage` é intencional para simplicidade. O risco de XSS é conhecido; a evolução planejada é migrar para cookie `HttpOnly; Secure; SameSite=Strict`, com suporte coordenado no backend.

### Contrato de jogos

```json
{
  "nome": "The Witcher 3",
  "genero": "RPG",
  "plataformas": ["PC", "PLAYSTATION_5"],
  "imageUrl": "https://...",
  "summary": "Resumo do jogo",
  "rating": 92.5
}
```

- `plataformas` é tratado como coleção no create/update e na leitura
- Duplicados são removidos antes do envio
- O filtro de listagem usa `plataforma` (singular) como query param

### Contrato de reviews

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

`usuarioId` controla a exibição das ações de edição e remoção no cliente; a autorização final é sempre aplicada no backend.

### Importação via IGDB

1. Busca jogos externos pela IGDB
2. Apresenta capa, nota, resumo e plataformas para revisão
3. Mapeia plataformas da IGDB para os enums aceitos pelo backend
4. Pré-seleciona automaticamente plataformas reconhecidas
5. Envia `plataformas: string[]` ao confirmar

---

## CI/CD

### Pipeline (GitHub Actions)

A cada push na branch principal:

```
lint → build → npm audit
```

Configuração em `.github/workflows/ci.yml`.

### Deploy (Vercel)

Deploy automático após push na branch configurada. Os headers de segurança são definidos em `vercel.json`:

| Header | Valor |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer-when-downgrade` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | `default-src 'self'` com origens explícitas |

---

## Segurança

### Implementado

- JWT enviado automaticamente via interceptor do Axios
- Controle de acesso por autenticação e papel de usuário
- Headers de segurança via `vercel.json`
- `.env` fora do versionamento
- `npm audit` no pipeline de CI
- CORS configurado no backend com origens explícitas (sem `*` em produção)

### Melhorias planejadas

- [ ] Migrar para cookie `HttpOnly` com refresh token
- [ ] Refresh automático de sessão antes de redirecionar em caso de `401`
- [ ] Ampliar testes automatizados nos fluxos críticos do frontend
