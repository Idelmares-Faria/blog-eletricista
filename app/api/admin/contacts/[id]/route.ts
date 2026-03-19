import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    await query('DELETE FROM contact_messages WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao remover mensagem' }, { status: 500 })
  }
}
