import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-serif text-6xl mb-4">404</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-8">Página não encontrada</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-bold hover:bg-[var(--accent-hover)] transition-all">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
