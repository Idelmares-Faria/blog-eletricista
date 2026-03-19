import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    let postsCount = 0, categoriesCount = 0, commentsCount = 0, communitySize = 0

    try { const r = await query('SELECT COUNT(*) FROM posts'); postsCount = parseInt(r[0].count as string) } catch {}
    try { const r = await query('SELECT COUNT(*) FROM categories'); categoriesCount = parseInt(r[0].count as string) } catch {}
    try { const r = await query('SELECT COUNT(*) FROM comments'); commentsCount = parseInt(r[0].count as string) } catch {}
    try { const r = await query('SELECT COUNT(*) FROM subscribers'); communitySize = parseInt(r[0].count as string) } catch {}

    return NextResponse.json({
      success: true,
      data: { posts: postsCount, categories: categoriesCount, comments: commentsCount, community: communitySize },
    })
  } catch (error) {
    return NextResponse.json({ success: true, data: { posts: 0, categories: 0, comments: 0, community: 0 } })
  }
}
