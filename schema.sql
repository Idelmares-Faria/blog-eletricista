-- ═══════════════════════════════════════════
--  SCHEMA - Blog do Eletricista
-- ═══════════════════════════════════════════

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) NOT NULL,
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_avatar VARCHAR(500),
  author_bio TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  image VARCHAR(500),
  featured BOOLEAN DEFAULT FALSE,
  read_time VARCHAR(50),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Post_tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(100) NOT NULL,
  image_url VARCHAR(1000),
  link_url VARCHAR(1000),
  alt_text VARCHAR(500),
  html_code TEXT,
  active BOOLEAN DEFAULT TRUE,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
