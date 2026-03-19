import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Nome é obrigatório' }, { status: 400 })
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Mensagem é obrigatória' }, { status: 400 })
    }

    await query('INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)', [name.trim(), email.trim(), message.trim()])

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
    }, { status: 201 })
  } catch (error) {
    console.error('Error saving contact message:', error)
    return NextResponse.json({ success: false, error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
