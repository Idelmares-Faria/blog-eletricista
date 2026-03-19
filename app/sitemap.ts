import { MetadataRoute } from 'next'
import { query } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog-eletricista.vercel.app'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/categorias`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/sobre`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/newsletter`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/busca`, changeFrequency: 'weekly', priority: 0.6 },
  ]

  try {
    const posts = await query('SELECT slug, date FROM posts ORDER BY date DESC')
    const categories = await query('SELECT slug FROM categories')

    const postPages: MetadataRoute.Sitemap = posts.map((p: any) => ({
      url: `${baseUrl}/post/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }))

    const categoryPages: MetadataRoute.Sitemap = categories.map((c: any) => ({
      url: `${baseUrl}/categoria/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...postPages, ...categoryPages]
  } catch {
    return staticPages
  }
}
