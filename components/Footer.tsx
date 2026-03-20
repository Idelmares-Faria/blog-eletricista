import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-[60px] pb-[30px] bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
          <div>
            <h3 className="font-serif text-[26px] flex items-center gap-2"><span>⚡</span>Blog do Eletricista</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-[300px] mt-3">
              Conteúdo técnico de qualidade sobre instalações elétricas, normas, segurança e manutenção para profissionais e entusiastas.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-4">Conteúdo</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-[var(--text-secondary)]">
              <Link href="/categorias?cat=instalacoes" className="hover:text-[var(--accent)]">Instalações</Link>
              <Link href="/categorias?cat=seguranca" className="hover:text-[var(--accent)]">Segurança</Link>
              <Link href="/categorias?cat=normas" className="hover:text-[var(--accent)]">Normas Técnicas</Link>
              <Link href="/categorias?cat=manutencao" className="hover:text-[var(--accent)]">Manutenção</Link>
              <Link href="/categorias?cat=materiais" className="hover:text-[var(--accent)]">Materiais</Link>
            </nav>
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-4">Blog</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-[var(--text-secondary)]">
              <Link href="/sobre" className="hover:text-[var(--accent)]">Sobre nós</Link>
              <Link href="/newsletter" className="hover:text-[var(--accent)]">Newsletter</Link>
              <Link href="/busca" className="hover:text-[var(--accent)]">Buscar</Link>
              <Link href="/categorias" className="hover:text-[var(--accent)]">Categorias</Link>
            </nav>
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-4">Redes Sociais</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-[var(--text-secondary)]">
              <span>Instagram</span>
              <span>YouTube</span>
              <span>LinkedIn</span>
              <span>WhatsApp</span>
            </nav>
          </div>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)] text-[13px] text-[var(--text-muted)]">
          <p>&copy; 2026 Blog do Eletricista</p>
          <nav className="flex gap-5">
            <span className="hover:text-[var(--accent)] cursor-pointer">Privacidade</span>
            <span className="hover:text-[var(--accent)] cursor-pointer">Termos</span>
          </nav>
        </div>
      </div>
    </footer>
  )
}
