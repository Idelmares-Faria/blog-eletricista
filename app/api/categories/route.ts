import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT c.id, c.slug, c.name, c.color,
        COUNT(p.id) as post_count,
        (SELECT p2.image FROM posts p2 WHERE p2.category_id = c.id ORDER BY p2.date DESC LIMIT 1) as latest_image
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY post_count DESC, c.name ASC
    `)

    const categories = result.map((r: any) => ({
      slug: r.slug, name: r.name, color: r.color,
      postCount: parseInt(r.post_count), image: r.latest_image,
    }))

    return NextResponse.json({ success: true, data: categories, total: categories.length })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar categorias' }, { status: 500 })
  }
}
