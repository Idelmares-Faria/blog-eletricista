import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 })
    }
    await query('UPDATE ads SET clicks = clicks + 1 WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao registrar clique' }, { status: 500 })
  }
}
