'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toggleTheme } from './ThemeProvider'

const NAV_LINKS = [
  { href: '/', label: 'Blog' },
  { href: '/categorias', label: 'Categorias' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/newsletter', label: 'Newsletter' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      fetch('/api/admin/check').then(r => {
        setIsAdmin(r.ok)
      }).catch(() => setIsAdmin(false))
    } else {
      setIsAdmin(false)
    }
  }, [pathname])

  function handleLogout() {
    fetch('/api/admin/logout', { method: 'POST' }).finally(() => {
      setIsAdmin(false)
      router.push('/admin')
    })
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && searchRef.current?.value.trim()) {
      router.push('/busca?q=' + encodeURIComponent(searchRef.current.value.trim()))
      setSearchOpen(false)
    }
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className="sticky top-0 z-[1000] h-[72px] bg-[rgba(var(--bg-primary-rgb),0.85)] backdrop-blur-[12px] border-b border-[var(--border-color)]">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-full">
          <Link href="/" className="font-serif text-[26px] italic text-[var(--text-primary)] flex items-center gap-2">
            <span>⚡</span>
            Blog do Eletricista
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-2 items-center">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] font-medium px-4 py-2 rounded-lg transition-colors hover:text-[var(--accent)] hover:bg-[var(--accent-light)] ${
                  isActive(link.href) ? 'text-[var(--accent)] relative after:content-[""] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[var(--accent)] after:shadow-[0_0_10px_var(--accent)]' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Search */}
            <div className="relative flex items-center mr-3">
              <button
                onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 100) }}
                className="bg-transparent text-[var(--text-primary)] border-none cursor-pointer p-1 flex"
                aria-label="Buscar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <input
                ref={searchRef}
                type="search"
                placeholder="Buscar..."
                onKeyDown={handleSearch}
                className={`border-none bg-transparent text-[var(--text-primary)] text-sm outline-none transition-all duration-300 ${
                  searchOpen ? 'w-40 px-3 border-b border-[var(--border-color)]' : 'w-0 p-0'
                }`}
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="bg-[var(--toggle-bg)] text-[var(--toggle-text)] px-3.5 py-2 rounded-[20px] text-sm font-semibold cursor-pointer flex items-center gap-2"
              aria-label="Alternar tema"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            </button>

            {/* Admin Logout */}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] px-3.5 py-2 rounded-[20px] text-sm font-semibold cursor-pointer flex items-center gap-1.5 hover:border-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sair
              </button>
            )}
          </nav>

          {/* Hamburger */}
          <button
            className="flex md:hidden flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`w-6 h-0.5 bg-[var(--text-primary)] transition-all ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`w-6 h-0.5 bg-[var(--text-primary)] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-[var(--text-primary)] transition-all ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-[72px] bg-[var(--bg-primary)] z-[999] flex flex-col p-6 gap-2 md:hidden">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-lg font-medium px-4 py-3 rounded-lg ${isActive(link.href) ? 'text-[var(--accent)] bg-[var(--accent-light)]' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/busca"
            onClick={() => setMenuOpen(false)}
            className="text-lg font-medium px-4 py-3 rounded-lg"
          >
            Buscar
          </Link>
          <button
            onClick={() => { toggleTheme(); setMenuOpen(false) }}
            className="mt-4 bg-[var(--toggle-bg)] text-[var(--toggle-text)] px-4 py-3 rounded-xl text-sm font-semibold"
          >
            Alternar Tema
          </button>
          {isAdmin && (
            <button
              onClick={() => { handleLogout(); setMenuOpen(false) }}
              className="mt-2 bg-transparent border border-[var(--border-color)] text-red-500 px-4 py-3 rounded-xl text-sm font-semibold"
            >
              Sair
            </button>
          )}
        </div>
      )}
    </>
  )
}
