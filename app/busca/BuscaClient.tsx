'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PostCardVertical } from '@/components/PostCard'

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [posts, setPosts] = useState<any[]>([])
  const [searched, setSearched] = useState(!!initialQuery)
  const [loading, setLoading] = useState(false)

  const search = useCallback((q: string) => {
    if (!q.trim()) { setPosts([]); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.json()).then(res => {
      setPosts(res.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))

    const url = new URL(window.location.href)
    url.searchParams.set('q', q)
    history.replaceState(null, '', url)
  }, [])

  useEffect(() => {
    if (initialQuery) search(initialQuery)
  }, [initialQuery, search])

  useEffect(() => {
    const timer = setTimeout(() => { if (query) search(query) }, 400)
    return () => clearTimeout(timer)
  }, [query, search])

  const popularTags = [
    { label: 'Instalação Elétrica', query: 'instalação elétrica' },
    { label: 'NBR 5410', query: 'NBR 5410' },
    { label: 'Segurança', query: 'segurança' },
    { label: 'Aterramento', query: 'aterramento' },
    { label: 'Disjuntor', query: 'disjuntor' },
    { label: 'Quadro de Distribuição', query: 'quadro distribuição' },
  ]

  return (
    <>
      {/* Search Hero */}
      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl mb-8">Buscar no blog</h1>
          <form onSubmit={e => { e.preventDefault(); search(query) }} className="relative">
            <div className="flex items-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-md">
              <svg className="ml-4 text-[var(--text-muted)]" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar artigos, categorias, temas..."
                autoFocus
                className="flex-1 px-4 py-4 bg-transparent text-[var(--text-primary)] text-base outline-none border-none"
              />
              <button type="submit" className="px-6 py-3 bg-[var(--accent)] text-white font-bold text-sm border-none cursor-pointer rounded-lg m-1.5 hover:bg-[var(--accent-hover)]">Buscar</button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-[60px]">
        <div className="max-w-[1200px] mx-auto px-6">
          {searched && !loading && posts.length > 0 && (
            <p className="text-[var(--text-secondary)] mb-8">{posts.length} resultado{posts.length > 1 ? 's' : ''} para &ldquo;{query}&rdquo;</p>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="skeleton h-[320px] rounded-xl" />)}
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((p: any) => <PostCardVertical key={p.slug} post={p} />)}
            </div>
          )}

          {searched && !loading && posts.length === 0 && (
            <div className="text-center py-20">
              <svg className="mx-auto mb-6 text-[var(--text-muted)]" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              <h2 className="text-2xl font-bold mb-3">Nenhum resultado encontrado</h2>
              <p className="text-[var(--text-secondary)]">Tente buscar por outros termos ou explore nossas categorias.</p>
            </div>
          )}

          {!searched && (
            <div className="text-center py-20">
              <svg className="mx-auto mb-6 text-[var(--text-muted)]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p className="text-[var(--text-secondary)] mb-6">Digite algo para buscar artigos, categorias e temas do blog.</p>
              <div>
                <span className="text-[var(--text-muted)] text-sm font-semibold block mb-3">Buscas populares:</span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {popularTags.map(t => (
                    <button key={t.query} onClick={() => { setQuery(t.query); search(t.query) }} className="text-[11px] font-bold px-3 py-1.5 rounded-full uppercase bg-[var(--tag-blue-bg)] text-[var(--tag-blue-text)] border-none cursor-pointer hover:opacity-80">
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default function BuscaClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <SearchContent />
    </Suspense>
  )
}
