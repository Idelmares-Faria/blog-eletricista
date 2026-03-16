const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting migration...');

    // Read JSON data
    const postsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'posts.json'), 'utf-8'));
    const commentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'comments.json'), 'utf-8'));

    // 1. Insert categories first
    console.log('📁 Inserting categories...');
    const categoriesMap = {};
    const uniqueCategories = [...new Map(postsData.map(p => [p.category.slug, p.category])).values()];

    for (const cat of uniqueCategories) {
      const result = await client.query(
        'INSERT INTO categories (slug, name, color) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name = $2 RETURNING id',
        [cat.slug, cat.name, cat.color]
      );
      categoriesMap[cat.slug] = result.rows[0].id;
    }
    console.log(`✅ ${uniqueCategories.length} categories inserted`);

    // 2. Insert posts
    console.log('📝 Inserting posts...');
    const postsMap = {};

    for (const post of postsData) {
      const categoryId = categoriesMap[post.category.slug];
      const result = await client.query(
        `INSERT INTO posts (
          slug, title, excerpt, content, author_name, author_avatar, author_bio,
          category_id, image, featured, read_time, date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (slug) DO UPDATE SET
          title = $2, excerpt = $3, content = $4, featured = $10
        RETURNING id`,
        [
          post.slug,
          post.title,
          post.excerpt,
          post.content,
          post.author.name,
          post.author.avatar,
          post.author.bio,
          categoryId,
          post.image,
          post.featured,
          post.readTime,
          post.date
        ]
      );
      postsMap[post.slug] = result.rows[0].id;
    }
    console.log(`✅ ${postsData.length} posts inserted`);

    // 3. Insert tags and post_tags
    console.log('🏷️  Inserting tags...');
    const tagsMap = {};
    const allTags = new Set();

    postsData.forEach(p => p.tags.forEach(t => allTags.add(t)));

    for (const tagName of allTags) {
      const result = await client.query(
        'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id',
        [tagName]
      );
      tagsMap[tagName] = result.rows[0].id;
    }
    console.log(`✅ ${allTags.size} tags inserted`);

    // Link posts to tags
    console.log('🔗 Linking posts to tags...');
    for (const post of postsData) {
      const postId = postsMap[post.slug];
      for (const tagName of post.tags) {
        const tagId = tagsMap[tagName];
        await client.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [postId, tagId]
        );
      }
    }
    console.log(`✅ Posts linked to tags`);

    // 4. Insert comments
    console.log('💬 Inserting comments...');
    for (const comment of commentsData) {
      const postId = postsMap[comment.postSlug];
      if (postId) {
        await client.query(
          `INSERT INTO comments (post_id, author, email, content, date)
           VALUES ($1, $2, $3, $4, $5)`,
          [postId, comment.author, comment.email, comment.content, comment.date]
        );
      }
    }
    console.log(`✅ ${commentsData.length} comments inserted`);

    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
    await pool.end();
  }
}

migrate();
