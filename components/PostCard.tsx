import Link from 'next/link'

interface Post {
  slug: string
  title: string
  excerpt: string
  image?: string
  date: string
  readTime?: string
  author: { name: string; avatar?: string }
  category: { slug: string; name: string; color?: string }
  tags?: string[]
  featured?: boolean
}

function formatDate(str: string) {
  const d = new Date(str)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function tagColorClass(color?: string) {
  const map: Record<string, string> = {
    yellow: 'bg-[var(--tag-yellow-bg)] text-[var(--tag-yellow-text)]',
    red: 'bg-[var(--tag-red-bg)] text-[var(--tag-red-text)]',
    blue: 'bg-[var(--tag-blue-bg)] text-[var(--tag-blue-text)]',
    green: 'bg-[var(--tag-green-bg)] text-[var(--tag-green-text)]',
    orange: 'bg-[var(--tag-orange-bg)] text-[var(--tag-orange-text)]',
  }
  return map[color || ''] || map.blue
}

export function PostCardVertical({ post }: { post: Post }) {
  return (
    <article className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 h-full transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)]">
      <Link href={`/post/${post.slug}`} className="aspect-video overflow-hidden rounded-lg mb-4 bg-[var(--bg-secondary)] block">
        {post.image ? (
          <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-600 hover:scale-[1.08]" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[13px] font-semibold">Sem Imagem</div>
        )}
      </Link>
      <div className="flex flex-col flex-1">
        <span className="text-[13px] font-semibold text-[var(--accent)] mb-2">
          {post.author.name} &bull; {formatDate(post.date)}
        </span>
        <Link href={`/post/${post.slug}`}>
          <h3 className="text-[19px] font-bold leading-tight mb-2.5 line-clamp-2">{post.title}</h3>
        </Link>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-hidden min-w-0 flex-1">
            {(post.tags || []).slice(0, 2).map(tag => (
              <span key={tag} className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase whitespace-nowrap ${tagColorClass(post.category.color)}`}>
                {tag}
              </span>
            ))}
          </div>
          <Link href={`/post/${post.slug}`} className="text-[13px] font-bold text-[var(--accent)] flex items-center gap-1 shrink-0 hover:underline">
            Ler mais
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </div>
    </article>
  )
}

export function PostCardFeatured({ post }: { post: Post }) {
  return (
    <article className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 h-full transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)]">
      <Link href={`/post/${post.slug}`} className="aspect-video overflow-hidden rounded-lg mb-4 bg-[var(--bg-secondary)] block">
        {post.image ? (
          <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-600 hover:scale-[1.08]" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[13px] font-semibold">Sem Imagem</div>
        )}
      </Link>
      <div className="flex flex-col flex-1">
        <span className="text-[13px] font-semibold text-[var(--accent)] mb-2">
          {post.author.name} &bull; {formatDate(post.date)}
        </span>
        <Link href={`/post/${post.slug}`}>
          <h3 className="text-[19px] font-bold leading-tight mb-2.5 line-clamp-2">{post.title}</h3>
        </Link>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-hidden min-w-0 flex-1">
            {(post.tags || []).slice(0, 2).map(tag => (
              <span key={tag} className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase whitespace-nowrap ${tagColorClass(post.category.color)}`}>
                {tag}
              </span>
            ))}
          </div>
          <Link href={`/post/${post.slug}`} className="text-[13px] font-bold text-[var(--accent)] flex items-center gap-1 shrink-0 hover:underline">
            Ler mais
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </div>
    </article>
  )
}

export function PostCardHorizontal({ post }: { post: Post }) {
  return (
    <article className="grid grid-cols-[200px_1fr] max-sm:grid-cols-1 gap-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)]">
      <Link href={`/post/${post.slug}`} className="aspect-video sm:aspect-auto sm:h-full overflow-hidden rounded-lg bg-[var(--bg-secondary)] block">
        {post.image ? (
          <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-600 hover:scale-[1.08]" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[13px] font-semibold">Sem Imagem</div>
        )}
      </Link>
      <div className="flex flex-col">
        <span className="text-[13px] font-semibold text-[var(--accent)] mb-2">
          {post.author.name} &bull; {formatDate(post.date)}
        </span>
        <Link href={`/post/${post.slug}`}>
          <h3 className="text-[19px] font-bold leading-tight mb-2.5 line-clamp-2">{post.title}</h3>
        </Link>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex gap-1.5 overflow-hidden min-w-0">
            {(post.tags || []).slice(0, 2).map(tag => (
              <span key={tag} className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase whitespace-nowrap ${tagColorClass(post.category.color)}`}>
                {tag}
              </span>
            ))}
          </div>
          <Link href={`/post/${post.slug}`} className="text-[13px] font-bold text-[var(--accent)] flex items-center gap-1 self-end pt-3 border-t border-[var(--border-color)] w-full justify-end hover:underline">
            Ler mais
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default PostCardVertical
