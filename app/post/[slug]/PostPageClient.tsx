'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { showToast } from '@/components/Toast'

interface Post {
  id: number; slug: string; title: string; excerpt: string; content: string
  author: { name: string; avatar?: string; bio?: string }
  category: { slug: string; name: string; color?: string }
  image?: string; featured?: boolean; readTime?: string; date: string; tags?: string[]
}

interface Related {
  slug: string; title: string; excerpt: string; image?: string
  readTime?: string; date: string; authorName: string
  category: { slug: string; name: string; color?: string }
}

interface Comment {
  id: number; author: string; content: string; date: string
}

function formatDate(str: string) {
  const d = new Date(str)
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
}

function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') return html
  const FORBIDDEN_TAGS = ['script','iframe','object','embed','form','input','button','style','link','meta','base','noscript','template']
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  FORBIDDEN_TAGS.forEach(tag => doc.querySelectorAll(tag).forEach(el => el.remove()))
  doc.body.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) el.removeAttribute(attr.name)
      else if ((attr.name === 'href' || attr.name === 'src' || attr.name === 'action') && /^\s*javascript:/i.test(attr.value))
        el.removeAttribute(attr.name)
    })
  })
  return doc.body.innerHTML
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

function initialsAvatar(name: string) {
  const initials = getInitials(name)
  const colors = ['#f59e0b','#3b82f6','#10b981','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const color = colors[Math.abs(hash) % colors.length]
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${color}"/><text x="50%" y="50%" dy=".1em" fill="white" font-family="sans-serif" font-size="32" font-weight="600" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`)}`
}

export default function PostPageClient({ post, related }: { post: Post; related: Related[] }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetch(`/api/posts/${post.slug}/comments`).then(r => r.json()).then(res => {
      if (res.success) setComments(res.data)
    })

    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [post.slug])

  function handleComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value

    fetch(`/api/posts/${post.slug}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: name, email, content }),
    })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        setComments(prev => [{ id: res.data.id, author: name, content, date: new Date().toISOString() }, ...prev])
        form.reset()
      } else {
        showToast(res.error || 'Erro ao publicar comentário')
      }
    })
    .catch(() => showToast('Erro ao publicar comentário. Tente novamente.'))
  }

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <>
      {/* Reading Progress */}
      <div className="reading-progress" style={{ width: `${progress}%` }} />

      {/* Breadcrumb */}
      <nav className="py-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]" aria-label="Navegação">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-2 text-[13px]">
          <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--accent)]">Home</Link>
          <span className="text-[var(--border-color)]">/</span>
          <Link href={`/categorias?cat=${post.category.slug}`} className="text-[var(--text-muted)] hover:text-[var(--accent)]">{post.category.name}</Link>
          <span className="text-[var(--border-color)]">/</span>
          <span className="text-[var(--text-primary)] font-medium">{post.title}</span>
        </div>
      </nav>

      {/* Post Header */}
      <section className="py-12 pb-8">
        <div className="max-w-[800px] mx-auto text-center px-6">
          <div className="mb-4">
            <span className="bg-[var(--accent-light)] text-[var(--accent)] text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-[0.08em] inline-block">
              {post.category.name}
            </span>
          </div>
          <h1 className="font-serif text-[clamp(32px,6vw,56px)] leading-[1.2] mb-8 font-normal text-[var(--text-primary)]">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 py-5 border-y border-[var(--border-color)] flex-wrap">
            <div className="flex items-center gap-3">
              <img src={post.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80'} alt="Avatar" className="w-11 h-11 rounded-full object-cover border-2 border-[var(--accent)]" />
              <div className="text-left">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{post.author.name}</div>
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                  <time>{formatDate(post.date)}</time>
                  <span className="opacity-40">•</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { navigator.clipboard.writeText(pageUrl); showToast('Link copiado!') }} className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer transition-all hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]" aria-label="Copiar link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener" className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] transition-all hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + pageUrl)}`} target="_blank" rel="noopener" className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] transition-all hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.image && (
        <div className="mb-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <img src={post.image} alt={post.title} className="w-full max-h-[520px] object-cover rounded-xl shadow-md" />
          </div>
        </div>
      )}

      {/* Post Layout: Content + Sidebar */}
      <div className="max-w-[1280px] mx-auto px-6 pb-[60px] grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">
        <div className="min-w-0">
          {/* Article Content */}
          <article className="mb-[60px]">
            <div className="post-content__inner" dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }} />
          </article>

          {/* Author Box */}
          <section className="bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-8 mb-12">
            <div className="flex items-start gap-6 max-sm:flex-col">
              <img src={post.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&q=80'} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-[3px] border-[var(--accent)] shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)] block mb-1.5">Sobre o autor</span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{post.author.name}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{post.author.bio}</p>
              </div>
            </div>
          </section>

          {/* Comments */}
          <section className="mt-[60px] pt-12 border-t-2 border-[var(--border-color)]">
            <h2 className="text-2xl font-bold mb-8 text-[var(--text-primary)] flex items-center gap-3">
              Comentários
              <span className="bg-[var(--accent-light)] text-[var(--accent)] text-[13px] px-3 py-1 rounded-full font-bold">
                ({comments.length})
              </span>
            </h2>

            <form onSubmit={handleComment} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-8 mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input name="name" type="text" placeholder="Seu nome" required className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none transition-colors focus:border-[var(--accent)]" />
                <input name="email" type="email" placeholder="Seu email" required className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none transition-colors focus:border-[var(--accent)]" />
              </div>
              <textarea name="content" placeholder="Escreva seu comentário..." rows={4} required className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none resize-y min-h-[120px] mb-5 transition-colors focus:border-[var(--accent)]" />
              <button type="submit" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-bold cursor-pointer border-none bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all hover:-translate-y-0.5">
                Publicar comentário
              </button>
            </form>

            {comments.length > 0 && (
              <div className="flex flex-col gap-5 mt-8">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl transition-colors hover:border-[var(--accent)]">
                    <img src={initialsAvatar(c.author)} alt="Avatar" className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-[var(--border-color)]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2 gap-3">
                        <strong className="text-[15px] font-bold text-[var(--text-primary)]">{c.author}</strong>
                        <time className="text-xs text-[var(--text-muted)] whitespace-nowrap">{formatDate(c.date)}</time>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-[96px]">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)] mb-6 pb-3 border-b-2 border-[var(--border-color)]">
              Recomendados
            </h3>
            <div className="flex flex-col gap-8">
              {related.map((r, i) => (
                <article key={r.slug} className="flex flex-col gap-3 transition-transform hover:-translate-y-1 pb-6 border-b border-[var(--border-color)] last:border-b-0 last:pb-0">
                  {r.image && (
                    <Link href={`/post/${r.slug}`} className="aspect-video overflow-hidden rounded-lg block border border-[var(--border-color)]">
                      <img src={r.image} alt={r.title} className="w-full h-full object-cover transition-transform hover:scale-105" loading="lazy" />
                    </Link>
                  )}
                  <Link href={`/post/${r.slug}`} className="text-[15px] font-bold text-[var(--text-primary)] leading-snug hover:text-[var(--accent)]">
                    {r.title}
                  </Link>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">{r.excerpt}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">{formatDate(r.date)}</span>
                    <Link href={`/post/${r.slug}`} className="text-xs font-bold text-[var(--accent)] flex items-center gap-1 hover:underline">
                      Ler mais
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
