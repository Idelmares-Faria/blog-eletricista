import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const result = await query(`
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
    `, [slug])

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Post não encontrado' }, { status: 404 })
    }

    const p = result[0] as any
    const post = {
      id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content,
      author: { name: p.author_name, avatar: p.author_avatar, bio: p.author_bio },
      category: { slug: p.category_slug, name: p.category_name, color: p.category_color },
      image: p.image, featured: p.featured, readTime: p.read_time, date: p.date,
      tags: (p.tags || []).filter((t: string | null) => t !== null),
    }

    // Related posts
    let relatedResult = await query(`
      SELECT p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
        p.image, p.featured, p.read_time, p.date,
        c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
        ARRAY_AGG(DISTINCT t.name) as tags
      FROM posts p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE c.slug = $1 AND p.slug != $2
      GROUP BY p.id, c.id
      ORDER BY p.date DESC LIMIT 6
    `, [p.category_slug, slug])

    if (relatedResult.length === 0) {
      relatedResult = await query(`
        SELECT p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
          p.image, p.featured, p.read_time, p.date,
          c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
          ARRAY_AGG(DISTINCT t.name) as tags
        FROM posts p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.slug != $1
        GROUP BY p.id, c.id
        ORDER BY p.date DESC LIMIT 6
      `, [slug])
    }

    const related = relatedResult.map((r: any) => ({
      id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt,
      author: { name: r.author_name, avatar: r.author_avatar, bio: r.author_bio },
      category: { slug: r.category_slug, name: r.category_name, color: r.category_color },
      image: r.image, featured: r.featured, readTime: r.read_time, date: r.date,
      tags: (r.tags || []).filter((t: string | null) => t !== null),
    }))

    return NextResponse.json({ success: true, data: post, related })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar post' }, { status: 500 })
  }
}
