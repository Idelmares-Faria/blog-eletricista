import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminToken, deleteSession } from '@/lib/admin-auth'

export async function POST() {
  const token = await getAdminToken()
  if (token) deleteSession(token)
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  return NextResponse.json({ success: true })
}
