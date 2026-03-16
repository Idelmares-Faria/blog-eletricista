# Setup Blog do Eletricista com Neon PostgreSQL

## 1. Instalar dependências

```bash
npm install
```

Isso instalará:
- `express` - servidor web
- `pg` - driver PostgreSQL
- `dotenv` - variáveis de ambiente

## 2. Criar schema no Neon

Copie todo o conteúdo do arquivo `schema.sql` e execute no Neon SQL Editor:

1. Acesse seu projeto no Neon (https://console.neon.tech)
2. Vá para **SQL Editor**
3. Cole o conteúdo de `schema.sql`
4. Execute

Isso criará as tabelas:
- `categories` - categorias de posts
- `posts` - artigos do blog
- `tags` - tags dos posts
- `post_tags` - relacionamento post ↔ tag
- `comments` - comentários dos posts
- `subscribers` - emails inscritos na newsletter

## 3. Migrar dados dos JSONs

Execute o script de migração:

```bash
node migrate.js
```

Este script:
- Lê os dados de `data/posts.json`
- Lê os dados de `data/comments.json`
- Popula o banco de dados Neon
- Cria as relações entre posts, categorias e tags

Você verá na saída:
```
✅ 8 categories inserted
✅ 14 posts inserted
✅ 20 tags inserted
✅ Posts linked to tags
✅ 6 comments inserted

✨ Migration completed successfully!
```

## 4. Rodar o servidor localmente

```bash
npm start
```

ou com nodemon (recarrega automaticamente):

```bash
npm install -g nodemon
nodemon server.js
```

Acesse em http://localhost:3457

## 5. Próximos passos

- [ ] Renomear pasta `portal-ativmax` → `blog-eletricista`
- [ ] Inicializar repositório Git
- [ ] Criar repo no GitHub
- [ ] Configurar Vercel
- [ ] Apontar domínio (blogdoeletricista.com.br) para Vercel

## API Endpoints

### Posts
- `GET /api/posts` - lista com pagination, filtros
- `GET /api/posts/:slug` - artigo completo
- `GET /api/search?q=termo` - buscar

### Categories
- `GET /api/categories` - lista de categorias

### Comments
- `GET /api/posts/:slug/comments` - comentários do post
- `POST /api/posts/:slug/comments` - adicionar comentário

### Newsletter
- `POST /api/newsletter` - inscrever email

## Variáveis de Ambiente

Crie um arquivo `.env` com:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
PORT=3457
NODE_ENV=development
```

(Copie de `.env.example` e preencha)

## Troubleshooting

**"Connection refused"**
- Verifique se a DATABASE_URL está correta
- Certifique-se que você está no Neon Free Tier com a região São Paulo

**"Relation does not exist"**
- Execute o `schema.sql` completo no Neon SQL Editor
- Aguarde alguns segundos antes de rodar migrate.js

**"Pode usar JSON novamente?"**
- Não. O código foi totalmente migrado para PostgreSQL.
- Mas os arquivos JSON ainda estão em `data/` para backup.
