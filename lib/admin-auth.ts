import { cookies } from 'next/headers'
import crypto from 'crypto'

// In-memory sessions (works for single-instance, for production consider a DB-backed solution)
const adminSessions = new Map<string, { expires: number }>()
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function createSession(): string {
  const token = generateToken()
  adminSessions.set(token, { expires: Date.now() + SESSION_DURATION })
  return token
}

export function deleteSession(token: string) {
  adminSessions.delete(token)
}

export function isValidSession(token: string | null): boolean {
  if (!token || !adminSessions.has(token)) return false
  const session = adminSessions.get(token)!
  if (Date.now() > session.expires) {
    adminSessions.delete(token)
    return false
  }
  return true
}

export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('admin_token')?.value || null
}

export async function requireAdmin(): Promise<{ authorized: boolean; token?: string }> {
  const token = await getAdminToken()
  if (!token || !isValidSession(token)) {
    return { authorized: false }
  }
  return { authorized: true, token }
}

export const SESSION_DURATION_SECONDS = SESSION_DURATION / 1000
