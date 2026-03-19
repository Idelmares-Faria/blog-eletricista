import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSession, SESSION_DURATION_SECONDS } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    const adminUser = process.env.ADMIN_USER || 'admin'
    const adminPass = process.env.ADMIN_PASSWORD

    if (!adminPass) {
      return NextResponse.json({ success: false, error: 'Admin não configurado' }, { status: 500 })
    }

    if (username === adminUser && password === adminPass) {
      const token = createSession()
      const cookieStore = await cookies()
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_DURATION_SECONDS,
      })
      return NextResponse.json({ success: true, token })
    }

    return NextResponse.json({ success: false, error: 'Credenciais inválidas' }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro no login' }, { status: 500 })
  }
}
