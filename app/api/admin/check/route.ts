import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const { authorized } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
  }
  return NextResponse.json({ success: true })
}
