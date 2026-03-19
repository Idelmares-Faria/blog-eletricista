import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const result = await query(`
      SELECT c.id, c.author, c.content, c.date
      FROM comments c
      JOIN posts p ON c.post_id = p.id
      WHERE p.slug = $1
      ORDER BY c.date DESC
    `, [slug])

    return NextResponse.json({ success: true, data: result, total: result.length })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar comentários' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { author, email, content } = await request.json()

    if (!author || !author.trim()) {
      return NextResponse.json({ success: false, error: 'Nome é obrigatório' }, { status: 400 })
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Comentário não pode ser vazio' }, { status: 400 })
    }

    const postResult = await query('SELECT id FROM posts WHERE slug = $1', [slug])
    if (postResult.length === 0) {
      return NextResponse.json({ success: false, error: 'Post não encontrado' }, { status: 404 })
    }

    const postId = postResult[0].id
    const result = await query(
      `INSERT INTO comments (post_id, author, email, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, author, content, date`,
      [postId, author.trim(), email.trim(), content.trim()]
    )

    const newComment = result[0] as any
    return NextResponse.json({
      success: true,
      data: { id: newComment.id, postSlug: slug, author: newComment.author, content: newComment.content, date: newComment.date },
    }, { status: 201 })
  } catch (error) {
    console.error('Error posting comment:', error)
    return NextResponse.json({ success: false, error: 'Erro ao postar comentário' }, { status: 500 })
  }
}
