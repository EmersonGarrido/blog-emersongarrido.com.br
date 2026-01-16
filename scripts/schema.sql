-- Schema para o blog emersongarrido.com.br
-- Banco de dados: Neon PostgreSQL

-- Tabela de Comentarios
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_slug VARCHAR(255) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_spam BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index para buscar comentarios por post
CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(is_approved);

-- Tabela de Likes
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  post_slug VARCHAR(255) NOT NULL,
  page_type VARCHAR(50) NOT NULL,
  visitor_id VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_slug, visitor_id)
);

-- Index para contar likes por post
CREATE INDEX IF NOT EXISTS idx_likes_post_slug ON likes(post_slug);

-- Tabela de Page Views / Analytics
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  post_slug VARCHAR(255),
  page_type VARCHAR(50) NOT NULL,
  visitor_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  country VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes para analytics
CREATE INDEX IF NOT EXISTS idx_page_views_post_slug ON page_views(post_slug);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_utm_source ON page_views(utm_source);

-- Tabela de Subscribers (Newsletter)
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index para subscribers
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
