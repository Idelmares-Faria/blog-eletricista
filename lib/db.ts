import { neon } from '@neondatabase/serverless'

let _sql: ReturnType<typeof neon> | null = null

function getSql() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!)
  }
  return _sql
}

export async function query(text: string, params: unknown[] = []) {
  const sql = getSql()
  const result = await sql.query(text, params)
  return result as unknown as Record<string, unknown>[]
}

export function getDb() {
  return getSql()
}
