const express = require('express');
const compression = require('compression');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3457;

// PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with cache headers
const isDev = process.env.NODE_ENV !== 'production';
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  index: 'index.html',
  setHeaders: function (res, filePath) {
    if (filePath.endsWith('.html') || isDev) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// ═══════════════════════════════════════════
//  API ROUTES
// ═══════════════════════════════════════════

// GET /api/posts — list with pagination, category filter, search
app.get('/api/posts', async (req, res) => {
  try {
    let query = `
      SELECT
        p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
        p.image, p.featured, p.read_time, p.date,
        c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
        ARRAY_AGG(DISTINCT t.name) as tags
      FROM posts p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
    `;

    const params = [];
    const conditions = [];

    // Category filter
    const category = req.query.category;
    if (category) {
      conditions.push(`c.slug = $${params.length + 1}`);
      params.push(category);
    }

    // Search filter
    const search = req.query.search;
    if (search) {
      const q = search.toLowerCase();
      conditions.push(`(LOWER(p.title) LIKE $${params.length + 1} OR LOWER(p.excerpt) LIKE $${params.length + 1})`);
      params.push(`%${q}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY p.id, c.id ORDER BY p.date DESC`;

    // Get total before pagination
    const countResult = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as counted`, params);
    const totalPosts = parseInt(countResult.rows[0].total);

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 6));
    const totalPages = Math.ceil(totalPosts / limit);
    const offset = (page - 1) * limit;

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Format response to match client expectations
    const postsWithoutContent = result.rows.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: {
        name: p.author_name,
        avatar: p.author_avatar,
        bio: p.author_bio
      },
      category: {
        slug: p.category_slug,
        name: p.category_name,
        color: p.category_color
      },
      image: p.image,
      featured: p.featured,
      readTime: p.read_time,
      date: p.date,
      tags: p.tags.filter(t => t !== null)
    }));

    res.json({
      success: true,
      data: postsWithoutContent,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar posts' });
  }
});

// GET /api/posts/:slug — single post with full content
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(`
      SELECT
        p.id, p.slug, p.title, p.excerpt, p.content, p.author_name, p.author_avatar, p.author_bio,
        p.image, p.featured, p.read_time, p.date,
        c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
        ARRAY_AGG(DISTINCT t.name) as tags
      FROM posts p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.slug = $1
      GROUP BY p.id, c.id
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post não encontrado' });
    }

    const p = result.rows[0];
    const post = {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      author: {
        name: p.author_name,
        avatar: p.author_avatar,
        bio: p.author_bio
      },
      category: {
        slug: p.category_slug,
        name: p.category_name,
        color: p.category_color
      },
      image: p.image,
      featured: p.featured,
      readTime: p.read_time,
      date: p.date,
      tags: p.tags.filter(t => t !== null)
    };

    // Find related posts (same category first, fallback to any recent posts)
    let relatedResult = await pool.query(`
      SELECT
        p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
        p.image, p.featured, p.read_time, p.date,
        c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
        ARRAY_AGG(DISTINCT t.name) as tags
      FROM posts p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE c.slug = $1 AND p.slug != $2
      GROUP BY p.id, c.id
      ORDER BY p.date DESC
      LIMIT 3
    `, [p.category_slug, slug]);

    // Fallback: if no same-category posts, fetch any recent posts
    if (relatedResult.rows.length === 0) {
      relatedResult = await pool.query(`
        SELECT
          p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
          p.image, p.featured, p.read_time, p.date,
          c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
          ARRAY_AGG(DISTINCT t.name) as tags
        FROM posts p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.slug != $1
        GROUP BY p.id, c.id
        ORDER BY p.date DESC
        LIMIT 3
      `, [slug]);
    }

    const related = relatedResult.rows.map(r => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      author: {
        name: r.author_name,
        avatar: r.author_avatar,
        bio: r.author_bio
      },
      category: {
        slug: r.category_slug,
        name: r.category_name,
        color: r.category_color
      },
      image: r.image,
      featured: r.featured,
      readTime: r.read_time,
      date: r.date,
      tags: r.tags.filter(t => t !== null)
    }));

    res.json({
      success: true,
      data: post,
      related
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar post' });
  }
});

// GET /api/categories — list all categories with post counts and latest image
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id, c.slug, c.name, c.color,
        COUNT(p.id) as post_count,
        (SELECT p2.image FROM posts p2 WHERE p2.category_id = c.id ORDER BY p2.date DESC LIMIT 1) as latest_image
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY post_count DESC, c.name ASC
    `);

    const categories = result.rows.map(r => ({
      slug: r.slug,
      name: r.name,
      color: r.color,
      postCount: parseInt(r.post_count),
      image: r.latest_image
    }));

    res.json({
      success: true,
      data: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar categorias' });
  }
});

// POST /api/newsletter — subscribe email
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
      return res.status(400).json({ success: false, error: 'Email inválido' });
    }

    const checkResult = await pool.query(
      'SELECT id FROM subscribers WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Este email já está inscrito na newsletter' });
    }

    await pool.query(
      'INSERT INTO subscribers (email) VALUES ($1)',
      [email]
    );

    res.status(201).json({
      success: true,
      message: 'Inscrição realizada com sucesso! Você receberá nossas novidades em breve.'
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ success: false, error: 'Erro ao inscrever' });
  }
});

// POST /api/posts/:slug/comments — add comment
app.post('/api/posts/:slug/comments', async (req, res) => {
  try {
    const { author, email, content } = req.body;
    const { slug } = req.params;

    // Validate
    if (!author || !author.trim()) {
      return res.status(400).json({ success: false, error: 'Nome é obrigatório' });
    }
    if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
      return res.status(400).json({ success: false, error: 'Email inválido' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Comentário não pode ser vazio' });
    }

    // Check post exists
    const postResult = await pool.query('SELECT id FROM posts WHERE slug = $1', [slug]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post não encontrado' });
    }

    const postId = postResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO comments (post_id, author, email, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, author, email, content, date`,
      [postId, author.trim(), email.trim(), content.trim()]
    );

    const newComment = result.rows[0];
    res.status(201).json({
      success: true,
      data: {
        id: newComment.id,
        postSlug: slug,
        author: newComment.author,
        email: newComment.email,
        content: newComment.content,
        date: newComment.date
      }
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ success: false, error: 'Erro ao postar comentário' });
  }
});

// GET /api/posts/:slug/comments — get comments for a post
app.get('/api/posts/:slug/comments', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(`
      SELECT c.id, c.author, c.email, c.content, c.date
      FROM comments c
      JOIN posts p ON c.post_id = p.id
      WHERE p.slug = $1
      ORDER BY c.date DESC
    `, [slug]);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar comentários' });
  }
});

// GET /api/search — search posts
app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();

    if (!q) {
      return res.json({ success: true, data: [], total: 0 });
    }

    // Try full-text search first, fallback to LIKE
    let result;
    try {
      result = await pool.query(`
        SELECT
          p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
          p.image, p.featured, p.read_time, p.date,
          c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
          ARRAY_AGG(DISTINCT t.name) as tags,
          ts_rank(to_tsvector('portuguese', COALESCE(p.title,'') || ' ' || COALESCE(p.excerpt,'') || ' ' || COALESCE(p.content,'')), plainto_tsquery('portuguese', $1)) as rank
        FROM posts p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE
          to_tsvector('portuguese', COALESCE(p.title,'') || ' ' || COALESCE(p.excerpt,'') || ' ' || COALESCE(p.content,'')) @@ plainto_tsquery('portuguese', $1)
          OR LOWER(c.name) LIKE $2
          OR LOWER(t.name) LIKE $2
        GROUP BY p.id, c.id
        ORDER BY rank DESC, p.date DESC
      `, [q, `%${q}%`]);
    } catch (ftsError) {
      // Fallback to LIKE search if full-text search fails
      result = await pool.query(`
        SELECT
          p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
          p.image, p.featured, p.read_time, p.date,
          c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
          ARRAY_AGG(DISTINCT t.name) as tags
        FROM posts p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE
          LOWER(p.title) LIKE $1
          OR LOWER(p.excerpt) LIKE $1
          OR LOWER(c.name) LIKE $1
          OR LOWER(t.name) LIKE $1
        GROUP BY p.id, c.id
        ORDER BY p.date DESC
      `, [`%${q}%`]);
    }

    const posts = result.rows.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: {
        name: p.author_name,
        avatar: p.author_avatar,
        bio: p.author_bio
      },
      category: {
        slug: p.category_slug,
        name: p.category_name,
        color: p.category_color
      },
      image: p.image,
      featured: p.featured,
      readTime: p.read_time,
      date: p.date,
      tags: p.tags.filter(t => t !== null)
    }));

    res.json({
      success: true,
      data: posts,
      total: posts.length,
      query: req.query.q
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ success: false, error: 'Erro na busca' });
  }
});

// ═══════════════════════════════════════════
//  HTML PAGE ROUTES
// ═══════════════════════════════════════════

function sendHTML(res, filename) {
  const fp = path.join(__dirname, filename);
  const fs = require('fs');
  if (fs.existsSync(fp)) {
    res.sendFile(fp);
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
}

app.get('/', (req, res) => {
  sendHTML(res, 'index.html');
});

app.get('/post/:slug', (req, res) => {
  sendHTML(res, 'post.html');
});

app.get('/categorias', (req, res) => {
  sendHTML(res, 'category.html');
});

app.get('/categoria/:slug', (req, res) => {
  sendHTML(res, 'category.html');
});

app.get('/sobre', (req, res) => {
  sendHTML(res, 'about.html');
});

app.get('/newsletter', (req, res) => {
  sendHTML(res, 'newsletter.html');
});

app.get('/busca', (req, res) => {
  sendHTML(res, 'search.html');
});

app.get('/buscar', (req, res) => {
  sendHTML(res, 'search.html');
});

// ═══════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`✨ Blog do Eletricista server running at http://localhost:${PORT}`);
  console.log(`📦 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'Neon'}`);
});
