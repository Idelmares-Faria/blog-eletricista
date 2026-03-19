import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const { authorized } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const result = await query('SELECT id, name, email, subscribed_at FROM subscribers ORDER BY subscribed_at DESC')
    return NextResponse.json({ success: true, data: result, total: result.length })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar assinantes' }, { status: 500 })
  }
}
