import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const q = (new URL(request.url).searchParams.get('q') || '').toLowerCase().trim()

    if (!q) {
      return NextResponse.json({ success: true, data: [], total: 0 })
    }

    let result
    try {
      result = await query(`
        SELECT p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
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
      `, [q, `%${q}%`])
    } catch {
      result = await query(`
        SELECT p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
          p.image, p.featured, p.read_time, p.date,
          c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
          ARRAY_AGG(DISTINCT t.name) as tags
        FROM posts p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE LOWER(p.title) LIKE $1 OR LOWER(p.excerpt) LIKE $1 OR LOWER(c.name) LIKE $1 OR LOWER(t.name) LIKE $1
        GROUP BY p.id, c.id
        ORDER BY p.date DESC
      `, [`%${q}%`])
    }

    const posts = result.map((p: any) => ({
      id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt,
      author: { name: p.author_name, avatar: p.author_avatar, bio: p.author_bio },
      category: { slug: p.category_slug, name: p.category_name, color: p.category_color },
      image: p.image, featured: p.featured, readTime: p.read_time, date: p.date,
      tags: (p.tags || []).filter((t: string | null) => t !== null),
    }))

    return NextResponse.json({ success: true, data: posts, total: posts.length, query: q })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json({ success: false, error: 'Erro na busca' }, { status: 500 })
  }
}
