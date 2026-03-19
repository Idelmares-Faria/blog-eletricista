import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
    }

    const checkResult = await query('SELECT id FROM subscribers WHERE email = $1', [email])
    if (checkResult.length > 0) {
      return NextResponse.json({ success: false, error: 'Este email já está inscrito na newsletter' }, { status: 409 })
    }

    await query('INSERT INTO subscribers (name, email) VALUES ($1, $2)', [name ? name.trim() : null, email])

    return NextResponse.json({
      success: true,
      message: 'Inscrição realizada com sucesso! Você receberá nossas novidades em breve.',
    }, { status: 201 })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json({ success: false, error: 'Erro ao inscrever' }, { status: 500 })
  }
}
