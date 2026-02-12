# Rede Social Anonima de Trends/Fofocas

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │    Database     │
│   (Vercel)      │────▶│   (NestJS)      │────▶│   (PostgreSQL)  │
│   Next.js 14    │     │  Digital Ocean  │     │  Digital Ocean  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │   OpenAI API    │
                        │  (Geracao IA)   │
                        └─────────────────┘
```

---

## Stack Tecnologico

### Backend (NestJS + Digital Ocean)
- **Framework**: NestJS + TypeScript
- **ORM**: Prisma ou TypeORM
- **Auth**: JWT + Passport
- **API**: REST (ou GraphQL opcional)
- **Queue**: Bull (Redis) para jobs de geracao
- **Cache**: Redis
- **Server**: Digital Ocean Droplet ($12-24/mes)

### Frontend (Vercel)
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **State**: Zustand ou React Query
- **Deploy**: Vercel (free tier)

### Database
- **PostgreSQL** no Digital Ocean ($15/mes managed ou $6 no droplet)
- **Redis** para cache/queues ($0 se no mesmo droplet)

---

## Custos Mensais Estimados

| Item | Especificacao | Custo/mes |
|------|---------------|-----------|
| Digital Ocean Droplet | 2GB RAM, 2 vCPU | $18 |
| PostgreSQL Managed | 1GB (opcional) | $15 |
| Redis | No mesmo droplet | $0 |
| Vercel | Free tier | $0 |
| Dominio | .com.br | ~R$5/mes |
| OpenAI API | ~100k posts/mes | ~$15 |
| **Total** | | **~$35-50/mes** |

> Nota: Se usar PostgreSQL no mesmo droplet em vez de managed, cai para ~$20/mes

---

## Estrutura do Projeto

```
/projeto
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Login, registro, JWT
│   │   │   ├── users/       # Perfis, configuracoes
│   │   │   ├── posts/       # Posts, CRUD
│   │   │   ├── comments/    # Comentarios
│   │   │   ├── reactions/   # Likes, reacoes
│   │   │   ├── trending/    # Coleta de trends
│   │   │   ├── generator/   # Geracao IA
│   │   │   └── admin/       # Painel admin
│   │   ├── common/          # Guards, pipes, decorators
│   │   └── config/          # Configuracoes
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── frontend/                # Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/    # Rotas publicas
│   │   │   │   ├── page.tsx           # Feed
│   │   │   │   ├── post/[slug]/       # Post individual
│   │   │   │   ├── perfil/[username]/ # Perfil publico
│   │   │   │   ├── explorar/          # Explorar trends
│   │   │   │   └── [cidade]/          # Posts por cidade
│   │   │   ├── (auth)/      # Login/Registro
│   │   │   │   ├── login/
│   │   │   │   ├── registro/
│   │   │   │   └── esqueci-senha/
│   │   │   ├── (app)/       # Area logada
│   │   │   │   ├── feed/
│   │   │   │   ├── meu-perfil/
│   │   │   │   ├── configuracoes/
│   │   │   │   └── notificacoes/
│   │   │   └── admin/       # Painel admin
│   │   ├── components/
│   │   ├── lib/
│   │   └── hooks/
│   └── package.json
│
└── docs/
```

---

## Schema do Banco (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USUARIOS ====================

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  username      String    @unique
  displayName   String?
  bio           String?
  avatarUrl     String?

  // Auth
  passwordHash  String?
  isAnonymous   Boolean   @default(false)
  fingerprint   String?   // Para usuarios anonimos

  // Perfil
  city          String?
  state         String?

  // Status
  role          Role      @default(USER)
  isVerified    Boolean   @default(false)
  isBanned      Boolean   @default(false)

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastSeenAt    DateTime?

  // Relations
  posts         Post[]
  comments      Comment[]
  reactions     Reaction[]
  followers     Follow[]  @relation("following")
  following     Follow[]  @relation("followers")

  @@index([username])
  @@index([city, state])
}

enum Role {
  USER
  MODERATOR
  ADMIN
}

model Follow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower    User     @relation("followers", fields: [followerId], references: [id])
  following   User     @relation("following", fields: [followingId], references: [id])

  @@unique([followerId, followingId])
}

// ==================== POSTS ====================

model Post {
  id              String    @id @default(cuid())
  slug            String    @unique
  content         String

  // Metadata
  category        Category  @default(GERAL)
  city            String?
  state           String?
  sourceTrend     String?   // Trend original

  // AI
  isAiGenerated   Boolean   @default(false)
  isEdited        Boolean   @default(false)
  aiPromptUsed    String?

  // Stats (denormalized for performance)
  viewsCount      Int       @default(0)
  likesCount      Int       @default(0)
  commentsCount   Int       @default(0)
  sharesCount     Int       @default(0)

  // SEO
  metaTitle       String?
  metaDescription String?

  // Status
  status          PostStatus @default(DRAFT)
  publishedAt     DateTime?

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  authorId        String?
  author          User?     @relation(fields: [authorId], references: [id])
  comments        Comment[]
  reactions       Reaction[]

  @@index([slug])
  @@index([category])
  @@index([city, state])
  @@index([publishedAt])
  @@index([status, publishedAt])
}

enum Category {
  CELEBRIDADES
  POLITICA
  ESPORTES
  CIDADE
  VIRAL
  GERAL
}

enum PostStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  ARCHIVED
  DELETED
}

// ==================== INTERACOES ====================

model Comment {
  id          String   @id @default(cuid())
  content     String

  // Stats
  likesCount  Int      @default(0)

  // Status
  isApproved  Boolean  @default(true)
  isSpam      Boolean  @default(false)

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  postId      String
  post        Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])

  // Reply
  parentId    String?
  parent      Comment? @relation("replies", fields: [parentId], references: [id])
  replies     Comment[] @relation("replies")

  @@index([postId])
  @@index([authorId])
}

model Reaction {
  id        String       @id @default(cuid())
  type      ReactionType @default(LIKE)
  createdAt DateTime     @default(now())

  postId    String
  post      Post         @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User         @relation(fields: [userId], references: [id])

  @@unique([postId, userId, type])
  @@index([postId])
}

enum ReactionType {
  LIKE
  HAHA
  WOW
  SAD
  ANGRY
}

// ==================== TRENDS ====================

model TrendingTopic {
  id        String   @id @default(cuid())
  topic     String
  source    String   // twitter, google, tiktok
  volume    Int?
  region    String?  // BR, SP, RJ
  fetchedAt DateTime @default(now())
  usedAt    DateTime?

  @@index([source, fetchedAt])
}

// ==================== ANALYTICS ====================

model PageView {
  id        String   @id @default(cuid())
  postId    String?
  path      String

  // Visitor
  visitorId String?
  userId    String?
  ipAddress String?
  userAgent String?
  referrer  String?

  // UTM
  utmSource   String?
  utmMedium   String?
  utmCampaign String?

  // Geo
  country   String?
  city      String?

  createdAt DateTime @default(now())

  @@index([postId])
  @@index([createdAt])
}

// ==================== ADMIN ====================

model GenerationJob {
  id          String   @id @default(cuid())
  status      JobStatus @default(PENDING)
  category    Category
  count       Int      // Quantos posts gerar
  prompt      String?

  // Results
  postsCreated Int     @default(0)
  errors       String?

  // Timestamps
  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?

  @@index([status])
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

---

## Funcionalidades

### Publicas (Sem Login)
- [x] Ver feed de posts
- [x] Ver post individual
- [x] Ver perfil de usuario
- [x] Buscar posts
- [x] Filtrar por cidade/categoria
- [x] Ver trends

### Usuario Registrado
- [x] Criar conta (email ou anonimo)
- [x] Login/Logout
- [x] Editar perfil
- [x] Criar posts
- [x] Comentar
- [x] Reagir (like, etc)
- [x] Seguir usuarios
- [x] Notificacoes

### Usuario Anonimo (Sem Registro)
- [x] Navegar como anonimo
- [x] Username gerado automatico
- [x] Pode comentar (apos X visualizacoes)
- [x] Pode reagir
- [x] Fingerprint para persistir sessao

### Admin
- [x] Dashboard com metricas
- [x] Gerenciar posts
- [x] Moderar comentarios
- [x] Banir usuarios
- [x] Configurar geracao IA
- [x] Ver trends coletados
- [x] Agendar publicacoes

---

## APIs do Backend

### Auth
```
POST   /auth/register        # Criar conta
POST   /auth/login           # Login
POST   /auth/logout          # Logout
POST   /auth/refresh         # Refresh token
POST   /auth/anonymous       # Criar sessao anonima
POST   /auth/forgot-password # Esqueci senha
POST   /auth/reset-password  # Reset senha
```

### Users
```
GET    /users/:username      # Perfil publico
GET    /users/:id/posts      # Posts do usuario
GET    /users/:id/followers  # Seguidores
GET    /users/:id/following  # Seguindo
POST   /users/:id/follow     # Seguir
DELETE /users/:id/follow     # Deixar de seguir
PATCH  /users/me             # Atualizar meu perfil
```

### Posts
```
GET    /posts                # Listar (com filtros)
GET    /posts/:slug          # Post individual
POST   /posts                # Criar post
PATCH  /posts/:id            # Editar post
DELETE /posts/:id            # Deletar post
POST   /posts/:id/react      # Reagir
GET    /posts/:id/comments   # Comentarios
POST   /posts/:id/comments   # Comentar
```

### Trending
```
GET    /trending             # Trends atuais
GET    /trending/history     # Historico
```

### Admin
```
GET    /admin/dashboard      # Metricas
GET    /admin/posts          # Todos os posts
PATCH  /admin/posts/:id      # Moderar post
GET    /admin/users          # Usuarios
PATCH  /admin/users/:id      # Moderar usuario
POST   /admin/generate       # Gerar posts com IA
GET    /admin/jobs           # Jobs de geracao
```

---

## Fluxo de Geracao de Conteudo

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Cron Job   │───▶│  Fetch       │───▶│   Salvar     │
│  (1x/hora)   │    │  Trends      │    │   no DB      │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Publicar   │◀───│  Review      │◀───│   Gerar      │
│   (auto ou   │    │  (opcional)  │    │   com IA     │
│   manual)    │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Cron Jobs (Bull Queue)
1. **FetchTrendsJob** - A cada 1h, coleta trends
2. **GeneratePostsJob** - A cada 30min, gera posts
3. **PublishPostsJob** - A cada 15min, publica pendentes
4. **UpdateStatsJob** - A cada 5min, atualiza contadores

---

## SEO

### Rotas Otimizadas
```
/                           # Home - Feed principal
/explorar                   # Explorar trends
/post/[slug]                # Post individual (SEO)
/c/[categoria]              # Categoria
/l/[cidade]                 # Cidade
/l/[cidade]/[categoria]     # Cidade + Categoria
/u/[username]               # Perfil usuario
```

### Meta Tags (Next.js)
```tsx
// app/post/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  return {
    title: post.metaTitle || post.content.slice(0, 60),
    description: post.metaDescription || post.content.slice(0, 160),
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.publishedAt,
    }
  }
}
```

### Sitemap Dinamico
```tsx
// app/sitemap.ts
export default async function sitemap() {
  const posts = await getAllPublishedPosts()
  return posts.map(post => ({
    url: `https://site.com/post/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))
}
```

---

## Deploy

### Backend (Digital Ocean)

```bash
# Criar Droplet
# Ubuntu 22.04, 2GB RAM, 2 vCPU ($18/mes)

# Instalar dependencias
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs postgresql redis-server nginx

# Configurar PostgreSQL
sudo -u postgres createuser appuser
sudo -u postgres createdb appdb -O appuser

# Configurar PM2
npm install -g pm2
pm2 start dist/main.js --name api
pm2 startup
pm2 save

# Nginx reverse proxy
# /etc/nginx/sites-available/api
server {
    listen 80;
    server_name api.seusite.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# SSL com Certbot
apt install certbot python3-certbot-nginx
certbot --nginx -d api.seusite.com
```

### Frontend (Vercel)
```bash
# Conectar repo GitHub
# Configurar variaveis de ambiente:
# - NEXT_PUBLIC_API_URL=https://api.seusite.com
# - Deploy automatico no push
```

---

## Cronograma

### Semana 1: Setup
- [ ] Criar repo backend (NestJS)
- [ ] Criar repo frontend (Next.js)
- [ ] Configurar Droplet Digital Ocean
- [ ] Setup PostgreSQL + Redis
- [ ] Deploy inicial

### Semana 2: Auth + Users
- [ ] Modulo auth (registro, login, JWT)
- [ ] Modulo users (perfil, CRUD)
- [ ] Frontend: login, registro, perfil
- [ ] Usuario anonimo (fingerprint)

### Semana 3: Posts + Feed
- [ ] Modulo posts (CRUD)
- [ ] Modulo comments
- [ ] Modulo reactions
- [ ] Frontend: feed, post, comentarios

### Semana 4: Geracao IA
- [ ] Integracao OpenAI
- [ ] Coleta de trends
- [ ] Queue de geracao (Bull)
- [ ] Painel admin para geracao

### Semana 5: Polish + SEO
- [ ] SEO (meta tags, sitemap)
- [ ] Performance (cache, lazy load)
- [ ] Testes
- [ ] Producao

---

## Decisoes Pendentes

- [ ] Nome da plataforma?
- [ ] Dominio?
- [ ] Identidade visual (cores, logo)?
- [ ] Permitir usuarios criarem posts ou so IA?
- [ ] Sistema de verificacao de usuarios?
- [ ] Monetizacao futura (ads, premium)?
