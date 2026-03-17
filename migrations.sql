-- Migrações do banco de dados
-- Execute no painel Neon (SQL Editor) ou via psql

-- 1. Adicionar coluna name na tabela subscribers
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- 2. Criar tabela de mensagens de contato
CREATE TABLE IF NOT EXISTS contact_messages (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  email     VARCHAR(255) NOT NULL,
  message   TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
