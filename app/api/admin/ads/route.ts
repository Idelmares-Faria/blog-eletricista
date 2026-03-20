import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const { authorized } = await requireAdmin()
  if (!authorized) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

  try {
    const rows = await query(
      `SELECT * FROM ads ORDER BY created_at DESC`
    )
    return NextResponse.json({ success: true, data: rows, total: rows.length })
  } catch (err) {
    console.error('Admin ads GET error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao buscar anúncios' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { authorized } = await requireAdmin()
  if (!authorized) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { id, name, location, image_url, link_url, alt_text, html_code, active, start_date, end_date } = body

    if (!name || !location) {
      return NextResponse.json({ success: false, error: 'Nome e localização são obrigatórios' }, { status: 400 })
    }

    if (id) {
      // Update
      await query(
        `UPDATE ads SET name=$1, location=$2, image_url=$3, link_url=$4, alt_text=$5,
         html_code=$6, active=$7, start_date=$8, end_date=$9, updated_at=NOW() WHERE id=$10`,
        [name, location, image_url || null, link_url || null, alt_text || null,
         html_code || null, active ?? true, start_date || null, end_date || null, id]
      )
      return NextResponse.json({ success: true, message: 'Anúncio atualizado' })
    } else {
      // Create
      const rows = await query(
        `INSERT INTO ads (name, location, image_url, link_url, alt_text, html_code, active, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [name, location, image_url || null, link_url || null, alt_text || null,
         html_code || null, active ?? true, start_date || null, end_date || null]
      )
      return NextResponse.json({ success: true, data: rows[0], message: 'Anúncio criado' })
    }
  } catch (err) {
    console.error('Admin ads POST error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao salvar anúncio' }, { status: 500 })
  }
}
