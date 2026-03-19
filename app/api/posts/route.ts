import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const search = searchParams.get('q') || searchParams.get('search')
    const sort = (searchParams.get('sort') || 'desc').toLowerCase()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '6')))
    const offset = (page - 1) * limit
    const order = sort === 'asc' ? 'ASC' : 'DESC'

    let conditions: string[] = []
    let params: any[] = []
    let paramIdx = 1

    if (category) {
      conditions.push(`c.slug = $${paramIdx}`)
      params.push(category)
      paramIdx++
    }

    if (search) {
      const q = search.toLowerCase()
      conditions.push(`(LOWER(p.title) LIKE $${paramIdx} OR LOWER(p.excerpt) LIKE $${paramIdx})`)
      params.push(`%${q}%`)
      paramIdx++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const baseQuery = `
      SELECT
        p.id, p.slug, p.title, p.excerpt, p.author_name, p.author_avatar, p.author_bio,
        p.image, p.featured, p.read_time, p.date,
        c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
        ARRAY_AGG(DISTINCT t.name) as tags
      FROM posts p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      ${whereClause}
      GROUP BY p.id, c.id
      ORDER BY p.date ${order}
    `

    const countResult = await query(`SELECT COUNT(*) as total FROM (${baseQuery}) as counted`, params)
    const totalPosts = parseInt(countResult[0].total as string)
    const totalPages = Math.ceil(totalPosts / limit)

    const result = await query(
      `${baseQuery} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    )

    const posts = result.map((p: any) => ({
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
      tags: (p.tags || []).filter((t: string | null) => t !== null),
    }))

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page, limit, totalPosts, totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar posts' }, { status: 500 })
  }
}
