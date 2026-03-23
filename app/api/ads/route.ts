import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const location = request.nextUrl.searchParams.get('location')

    let sql = `SELECT id, name, location, image_url, link_url, alt_text, html_code
               FROM ads WHERE active = true`
    const params: unknown[] = []

    if (location) {
      sql += ` AND location = $1`
      params.push(location)
    }

    // Filter by date range
    sql += ` AND (start_date IS NULL OR start_date <= CURRENT_DATE)`
    sql += ` AND (end_date IS NULL OR end_date >= CURRENT_DATE)`
    sql += ` ORDER BY RANDOM() LIMIT 1`

    const rows = await query(sql, params)

    // Increment impression only for the single served ad
    if (rows.length > 0) {
      await query(
        `UPDATE ads SET impressions = impressions + 1 WHERE id = $1`,
        [rows[0].id]
      )
    }

    return NextResponse.json({ success: true, data: rows })
  } catch (err) {
    console.error('Ads GET error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao buscar anúncios' }, { status: 500 })
  }
}
