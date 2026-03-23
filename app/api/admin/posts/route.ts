import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
}

export async function GET() {
  const { authorized } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const result = await query(`
      SELECT
        p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
        p.image, p.featured, p.read_time, p.date,
        c.slug as category_slug, c.name as category_name, c.color as category_color
      FROM posts p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.date DESC
    `)

    const posts = result.map((p: Record<string, unknown>) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: { name: p.author_name, avatar: p.author_avatar, bio: p.author_bio },
      category: { slug: p.category_slug, name: p.category_name, color: p.category_color },
      image: p.image,
      featured: p.featured,
      readTime: p.read_time,
      date: p.date,
    }))

    return NextResponse.json({ success: true, data: posts, total: posts.length })
  } catch (err) {
    console.error('Admin posts GET error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao buscar posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { authorized } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, slug, excerpt, content, author, category, image, featured, readTime, date, tags } = body

    // Validate required fields
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: title, slug, excerpt, content' },
        { status: 400 }
      )
    }

    if (excerpt.length > 155) {
      return NextResponse.json(
        { success: false, error: 'Excerpt deve ter no máximo 155 caracteres' },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existing = await query('SELECT id FROM posts WHERE slug = $1', [slug])
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Já existe um post com este slug' },
        { status: 409 }
      )
    }

    // Validate category
    if (!category?.slug) {
      return NextResponse.json(
        { success: false, error: 'Categoria é obrigatória (category.slug)' },
        { status: 400 }
      )
    }

    const categoryResult = await query('SELECT id FROM categories WHERE slug = $1', [category.slug])
    if (categoryResult.length === 0) {
      return NextResponse.json(
        { success: false, error: `Categoria não encontrada: ${category.slug}` },
        { status: 400 }
      )
    }
    const categoryId = categoryResult[0].id

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(content)

    // Insert post
    const postResult = await query(
      `INSERT INTO posts (slug, title, excerpt, content, author_name, author_avatar, author_bio,
        image, featured, read_time, date, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, slug, title, excerpt, image, featured, read_time, date`,
      [
        slug,
        title,
        excerpt,
        sanitizedContent,
        author?.name || 'Blog do Eletricista',
        author?.avatar || '/images/default-avatar.jpg',
        author?.bio || '',
        image || null,
        featured ?? false,
        readTime || null,
        date || new Date().toISOString(),
        categoryId,
      ]
    )

    const postId = postResult[0].id

    // Handle tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        // Insert tag if it doesn't exist, get its id
        const tagResult = await query(
          `INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id`,
          [tagName]
        )
        const tagId = tagResult[0].id

        // Link tag to post
        await query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [postId, tagId]
        )
      }
    }

    const post = {
      ...postResult[0],
      author: {
        name: author?.name || 'Blog do Eletricista',
        avatar: author?.avatar || '/images/default-avatar.jpg',
        bio: author?.bio || '',
      },
      category: { slug: category.slug, name: category.name, color: category.color },
      tags: tags || [],
    }

    return NextResponse.json({ success: true, data: post, message: 'Post criado com sucesso' }, { status: 201 })
  } catch (err) {
    console.error('Admin posts POST error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao criar post' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { authorized } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, title, slug, excerpt, content, author, category, image, featured, readTime, date, tags } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do post é obrigatório para atualização' },
        { status: 400 }
      )
    }

    // Check post exists
    const existingPost = await query('SELECT id FROM posts WHERE id = $1', [id])
    if (existingPost.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // If slug changed, check uniqueness
    if (slug) {
      const slugCheck = await query('SELECT id FROM posts WHERE slug = $1 AND id != $2', [slug, id])
      if (slugCheck.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Já existe outro post com este slug' },
          { status: 409 }
        )
      }
    }

    // Validate category if provided
    let categoryId: unknown = undefined
    if (category?.slug) {
      const categoryResult = await query('SELECT id FROM categories WHERE slug = $1', [category.slug])
      if (categoryResult.length === 0) {
        return NextResponse.json(
          { success: false, error: `Categoria não encontrada: ${category.slug}` },
          { status: 400 }
        )
      }
      categoryId = categoryResult[0].id
    }

    // Build dynamic update query
    const updates: string[] = []
    const params: unknown[] = []
    let paramIdx = 1

    if (title !== undefined) { updates.push(`title = $${paramIdx++}`); params.push(title) }
    if (slug !== undefined) { updates.push(`slug = $${paramIdx++}`); params.push(slug) }
    if (excerpt !== undefined) {
      if (excerpt.length > 155) {
        return NextResponse.json(
          { success: false, error: 'Excerpt deve ter no máximo 155 caracteres' },
          { status: 400 }
        )
      }
      updates.push(`excerpt = $${paramIdx++}`); params.push(excerpt)
    }
    if (content !== undefined) { updates.push(`content = $${paramIdx++}`); params.push(sanitizeHtml(content)) }
    if (author?.name !== undefined) { updates.push(`author_name = $${paramIdx++}`); params.push(author.name) }
    if (author?.avatar !== undefined) { updates.push(`author_avatar = $${paramIdx++}`); params.push(author.avatar) }
    if (author?.bio !== undefined) { updates.push(`author_bio = $${paramIdx++}`); params.push(author.bio) }
    if (image !== undefined) { updates.push(`image = $${paramIdx++}`); params.push(image) }
    if (featured !== undefined) { updates.push(`featured = $${paramIdx++}`); params.push(featured) }
    if (readTime !== undefined) { updates.push(`read_time = $${paramIdx++}`); params.push(readTime) }
    if (date !== undefined) { updates.push(`date = $${paramIdx++}`); params.push(date) }
    if (categoryId !== undefined) { updates.push(`category_id = $${paramIdx++}`); params.push(categoryId) }

    if (updates.length === 0 && (!tags || !Array.isArray(tags))) {
      return NextResponse.json(
        { success: false, error: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }

    if (updates.length > 0) {
      params.push(id)
      await query(
        `UPDATE posts SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
        params
      )
    }

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Remove existing tags
      await query('DELETE FROM post_tags WHERE post_id = $1', [id])

      // Add new tags
      for (const tagName of tags) {
        const tagResult = await query(
          `INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id`,
          [tagName]
        )
        const tagId = tagResult[0].id
        await query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, tagId]
        )
      }
    }

    return NextResponse.json({ success: true, message: 'Post atualizado com sucesso' })
  } catch (err) {
    console.error('Admin posts PUT error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar post' }, { status: 500 })
  }
}
