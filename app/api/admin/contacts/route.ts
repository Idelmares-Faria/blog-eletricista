import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const { authorized } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const result = await query('SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC')
    return NextResponse.json({ success: true, data: result, total: result.length })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar mensagens' }, { status: 500 })
  }
}
