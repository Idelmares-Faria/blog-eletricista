'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Marquee from '@/components/Marquee'
import { PostCardVertical } from '@/components/PostCard'

interface Post {
  slug: string; title: string; excerpt: string; image?: string; date: string;
  author: { name: string }; category: { slug: string; name: string; color?: string }; tags?: string[]
}

interface Category { slug: string; name: string; color: string; postCount: number }

function CategoriesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialCat = searchParams.get('cat') || ''

  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState(initialCat)
  const [sort, setSort] = useState('desc')
  const [subject, setSubject] = useState('')
  const [heroTitle, setHeroTitle] = useState(initialCat ? '' : 'CATEGORIAS')

  const loadPosts = useCallback((p: number) => {
    let url = `/api/posts?page=${p}&limit=9`
    if (category) url += `&category=${encodeURIComponent(category)}`
    if (sort) url += `&sort=${sort}`
    if (subject) url += `&q=${encodeURIComponent(subject)}`

    fetch(url).then(r => r.json()).then(res => {
      if (res.success) {
        setPosts(res.data)
        setPagination(res.pagination)
        setPage(p)
      }
    })
  }, [category, sort, subject])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(res => {
      if (res.success) {
        setCategories(res.data)
        if (initialCat) {
          const found = res.data.find((c: Category) => c.slug === initialCat)
          if (found) setHeroTitle(found.name.toUpperCase())
        }
      }
    })
  }, [initialCat])

  useEffect(() => { loadPosts(1) }, [loadPosts])

  function clearFilters() {
    setCategory('')
    setSort('desc')
    setSubject('')
    setHeroTitle('CATEGORIAS')
    router.replace('/categorias')
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[300px] py-16 flex items-center justify-center text-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/hero-categorias.png')" }}>
        <div className="relative z-[3] w-full max-w-[1200px] mx-auto px-6">
          <span className="inline-block bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] mb-4">
            Especialistas em Elétrica
          </span>
          <h1 className="font-serif text-[clamp(48px,10vw,80px)] leading-none mb-4 font-normal text-white">
            {heroTitle ? heroTitle.split('').map((c, i) => i >= heroTitle.length - 4 ? <em key={i} className="italic text-[var(--accent)]">{c}</em> : c) : 'CATEGORIAS'}
          </h1>
          <p className="text-lg text-gray-300">Explore nosso conhecimento técnico sobre instalações elétricas, segurança e normas NBR.</p>
        </div>
      </section>

      <Marquee />

      {/* Filters */}
      <section className="py-[60px] pb-0">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-6 items-end shadow-sm">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">Categoria</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm outline-none transition-all focus:border-[var(--accent)]">
                <option value="">Todas as categorias</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">Data</label>
              <select value={sort} onChange={e => setSort(e.target.value)} className="px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm outline-none transition-all focus:border-[var(--accent)]">
                <option value="desc">Mais recentes</option>
                <option value="asc">Mais antigos</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">Assunto</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: NBR 5410, Aterramento..." className="px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm outline-none transition-all focus:border-[var(--accent)]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => loadPosts(1)} className="h-12 flex items-center justify-center gap-2 rounded-lg text-sm font-bold cursor-pointer border-none bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Filtrar
              </button>
              <button onClick={clearFilters} className="h-12 flex items-center justify-center gap-2 rounded-lg text-sm font-bold cursor-pointer border border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
                Limpar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-[60px] pt-5">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[28px] font-bold font-serif mb-8">
            {category ? categories.find(c => c.slug === category)?.name || 'Posts' : 'Todos os posts'}
          </h2>
          {posts.length === 0 ? (
            <div className="py-10 text-center text-[var(--text-muted)]">Nenhum post encontrado com esses filtros.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => <PostCardVertical key={post.slug} post={post} />)}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-10">
              <button onClick={() => { loadPosts(page - 1); window.scrollTo(0, 0) }} disabled={!pagination.hasPrevPage} className="px-5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--accent)] hover:text-[var(--accent)]">Anterior</button>
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => { loadPosts(p); window.scrollTo(0, 0) }} className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold ${p === page ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}>{p}</button>
                ))}
              </div>
              <button onClick={() => { loadPosts(page + 1); window.scrollTo(0, 0) }} disabled={!pagination.hasNextPage} className="px-5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--accent)] hover:text-[var(--accent)]">Próximo</button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default function CategoriasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <CategoriesContent />
    </Suspense>
  )
}
