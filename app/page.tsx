'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Marquee from '@/components/Marquee'
import { PostCardFeatured, PostCardHorizontal, PostCardVertical } from '@/components/PostCard'
import ScrollReveal from '@/components/ScrollReveal'

interface Post {
  slug: string; title: string; excerpt: string; image?: string; date: string;
  readTime?: string; author: { name: string; avatar?: string }
  category: { slug: string; name: string; color?: string }; tags?: string[]; featured?: boolean
}

interface Category { slug: string; name: string; color: string; postCount: number; image?: string }

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(res => {
      if (res.success) setCategories(res.data)
    })
    loadPosts(1)
  }, [])

  function loadPosts(p: number) {
    setLoading(true)
    fetch(`/api/posts?page=${p}&limit=6`).then(r => r.json()).then(res => {
      if (res.success) {
        setPosts(res.data)
        setPagination(res.pagination)
        setPage(p)
      }
      setLoading(false)
    })
  }

  const recentPosts = page === 1 ? posts.slice(0, 3) : []
  const allPosts = page === 1 ? posts.slice(3) : posts

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[400px] py-20 pb-5 bg-[var(--bg-primary)] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center z-[1] opacity-15" style={{ backgroundImage: "url('/images/hero-banner.png')" }} />
        <div className="relative z-[3] w-full max-w-[1200px] mx-auto px-6">
          <span className="inline-block bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] mb-4">
            Especialistas em Elétrica
          </span>
          <h1 className="font-serif text-[clamp(48px,10vw,100px)] leading-none mb-4 font-normal">
            Blog do <em className="italic text-[var(--accent)]">Eletricista</em>
          </h1>
        </div>
      </section>

      <Marquee />

      {/* Categories Preview */}
      <section className="py-[5px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[28px] font-bold font-serif">Principais Categorias</h2>
              <Link href="/categorias" className="text-[13px] font-extrabold text-[var(--accent)] flex items-center gap-1 uppercase tracking-[0.05em]">
                Ver todas
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            </div>
          </ScrollReveal>
          <div className="flex gap-8 overflow-x-auto pb-5 pt-2.5 lg:justify-center snap-x snap-mandatory">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/categorias?cat=${cat.slug}`} className="flex flex-col items-center gap-2.5 min-w-[160px] snap-start group">
                <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-[var(--accent)] p-[5px] bg-[var(--bg-card)] transition-all duration-400 group-hover:scale-110 group-hover:rotate-[5deg] group-hover:shadow-lg">
                  <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${cat.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80'})` }} />
                </div>
                <h3 className="text-lg font-extrabold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ad slot */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--text-muted)] text-[11px] uppercase my-6 h-[100px]">
          Espaço Publicitário
        </div>
      </div>

      {/* Recent Posts */}
      {page === 1 && recentPosts.length > 0 && (
        <section className="py-[60px]">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-[28px] font-bold font-serif mb-8">Posts recentes</h2>
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
              {recentPosts[0] && <PostCardFeatured post={recentPosts[0]} />}
              {recentPosts.length > 1 && (
                <div className="flex flex-col gap-6">
                  {recentPosts[1] && <PostCardHorizontal post={recentPosts[1]} />}
                  {recentPosts[2] && <PostCardHorizontal post={recentPosts[2]} />}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Ad slot */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--text-muted)] text-[11px] uppercase my-6 h-[100px]">
          Espaço Publicitário
        </div>
      </div>

      {/* All Posts */}
      <section className="py-[60px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[28px] font-bold font-serif mb-8">Todos os posts</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="skeleton h-[320px] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allPosts.map(post => <PostCardVertical key={post.slug} post={post} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-10">
              <button
                onClick={() => { loadPosts(page - 1); window.scrollTo(0, 0) }}
                disabled={!pagination.hasPrevPage}
                className="px-5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-semibold cursor-pointer transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => { loadPosts(p); window.scrollTo(0, 0) }}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                      p === page ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { loadPosts(page + 1); window.scrollTo(0, 0) }}
                disabled={!pagination.hasNextPage}
                className="px-5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-semibold cursor-pointer transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
