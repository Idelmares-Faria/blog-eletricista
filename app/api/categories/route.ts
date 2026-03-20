import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const rows = await query(`
      SELECT
        c.id, c.slug, c.name, c.color,
        COALESCE(c.image, (SELECT p2.image FROM posts p2 WHERE p2.category_id = c.id ORDER BY p2.date DESC LIMIT 1)) as image,
        (SELECT count(*) FROM posts p WHERE p.category_id = c.id) as count
      FROM categories c
      ORDER BY name ASC
    `)

    const data = rows.map((r: any) => ({
      slug: r.slug,
      name: r.name,
      color: r.color,
      image: r.image,
      postCount: parseInt(r.count as string) || 0,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar categorias' }, { status: 500 })
  }
}
