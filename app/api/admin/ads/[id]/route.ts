import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin()
  if (!authorized) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

  try {
    const { id } = await params
    await query('DELETE FROM ads WHERE id = $1', [id])
    return NextResponse.json({ success: true, message: 'Anúncio removido' })
  } catch (err) {
    console.error('Admin ads DELETE error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao remover anúncio' }, { status: 500 })
  }
}
