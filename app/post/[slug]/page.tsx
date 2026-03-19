import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import PostPageClient from './PostPageClient'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const result = await query(`
    SELECT p.id, p.slug, p.title, p.excerpt, p.content, p.author_name, p.author_avatar, p.author_bio,
      p.image, p.featured, p.read_time, p.date,
      c.id as category_id, c.slug as category_slug, c.name as category_name, c.color as category_color,
      ARRAY_AGG(DISTINCT t.name) as tags
    FROM posts p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.slug = $1
    GROUP BY p.id, c.id
  `, [slug])

  if (result.length === 0) return null

  const p = result[0] as any
  return {
    id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content,
    author: { name: p.author_name, avatar: p.author_avatar, bio: p.author_bio },
    category: { slug: p.category_slug, name: p.category_name, color: p.category_color },
    image: p.image, featured: p.featured, readTime: p.read_time, date: p.date,
    tags: (p.tags || []).filter((t: string | null) => t !== null),
  }
}

async function getRelated(categorySlug: string, currentSlug: string) {
  let result = await query(`
    SELECT p.slug, p.title, p.excerpt, p.image, p.read_time, p.date,
      p.author_name, c.slug as category_slug, c.name as category_name, c.color as category_color
    FROM posts p JOIN categories c ON p.category_id = c.id
    WHERE c.slug = $1 AND p.slug != $2
    ORDER BY p.date DESC LIMIT 6
  `, [categorySlug, currentSlug])

  if (result.length === 0) {
    result = await query(`
      SELECT p.slug, p.title, p.excerpt, p.image, p.read_time, p.date,
        p.author_name, c.slug as category_slug, c.name as category_name, c.color as category_color
      FROM posts p JOIN categories c ON p.category_id = c.id
      WHERE p.slug != $1
      ORDER BY p.date DESC LIMIT 6
    `, [currentSlug])
  }

  return result.map((r: any) => ({
    slug: r.slug, title: r.title, excerpt: r.excerpt, image: r.image,
    readTime: r.read_time, date: r.date, authorName: r.author_name,
    category: { slug: r.category_slug, name: r.category_name, color: r.category_color },
  }))
}

export async function generateStaticParams() {
  try {
    const posts = await query('SELECT slug FROM posts')
    return posts.map((p: any) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post não encontrado' }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title + ' — Blog do Eletricista',
      description: post.excerpt,
      images: post.image ? [post.image] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const related = await getRelated(post.category.slug, slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    author: { '@type': 'Person', name: post.author.name },
    publisher: { '@type': 'Organization', name: 'Blog do Eletricista' },
    datePublished: post.date,
    mainEntityOfPage: { '@type': 'WebPage' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PostPageClient post={post} related={related} />
    </>
  )
}
