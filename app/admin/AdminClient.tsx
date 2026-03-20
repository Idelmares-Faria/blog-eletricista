'use client'

import { useEffect, useState } from 'react'
import { AD_LOCATIONS, type AdLocation } from '@/lib/ad-locations'

function escapeHTML(str: string) {
  if (!str) return ''
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

interface Ad {
  id: number; name: string; location: string; image_url: string | null; link_url: string | null
  alt_text: string | null; html_code: string | null; active: boolean
  clicks: number; impressions: number; start_date: string | null; end_date: string | null
  created_at: string
}

const PAGE_COLORS: Record<string, string> = {
  Homepage: '#f59e0b',
  Post: '#3b82f6',
  Categorias: '#10b981',
  Busca: '#8b5cf6',
}

export default function AdminClient() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<'subscribers'|'contacts'|'ads'>('subscribers')
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [stats, setStats] = useState({ posts: 0, categories: 0, subs: 0, contacts: 0, ads: 0 })
  const [subsSearch, setSubsSearch] = useState('')
  const [contactsSearch, setContactsSearch] = useState('')
  const [confirmModal, setConfirmModal] = useState<{ text: string; onConfirm: () => void } | null>(null)
  const [adModal, setAdModal] = useState<{ ad?: Ad; location?: AdLocation } | null>(null)
  const [theme, setTheme] = useState('light')
  const [adsView, setAdsView] = useState<'map'|'list'>('map')

  useEffect(() => {
    const stored = localStorage.getItem('blogeletricista-theme')
    if (stored) { setTheme(stored); document.documentElement.setAttribute('data-theme', stored) }
    fetch('/api/admin/check').then(r => { if (r.ok) { setLoggedIn(true); loadData() } setLoading(false) }).catch(() => setLoading(false))
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('blogeletricista-theme', next)
  }

  function loadData() {
    fetch('/api/stats').then(r => r.json()).then(res => {
      if (res.success) setStats(s => ({ ...s, posts: res.data.posts, categories: res.data.categories }))
    })
    fetch('/api/admin/subscribers').then(r => r.json()).then(res => {
      if (res.success) { setSubscribers(res.data); setStats(s => ({ ...s, subs: res.total })) }
    })
    fetch('/api/admin/contacts').then(r => r.json()).then(res => {
      if (res.success) { setContacts(res.data); setStats(s => ({ ...s, contacts: res.total })) }
    })
    fetch('/api/admin/ads').then(r => r.json()).then(res => {
      if (res.success) { setAds(res.data); setStats(s => ({ ...s, ads: res.data.filter((a: Ad) => a.active).length })) }
    })
  }

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginError('')
    const form = e.currentTarget
    const username = (form.elements.namedItem('username') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(r => r.json()).then(res => {
      if (res.success) { setLoggedIn(true); loadData() }
      else setLoginError(res.error || 'Erro ao fazer login')
    }).catch(() => setLoginError('Erro de conexão'))
  }

  function handleLogout() {
    fetch('/api/admin/logout', { method: 'POST' }).finally(() => setLoggedIn(false))
  }

  function deleteItem(type: 'subscriber'|'contact'|'ad', id: number) {
    const endpoint = type === 'subscriber' ? `/api/admin/subscribers/${id}`
      : type === 'contact' ? `/api/admin/contacts/${id}`
      : `/api/admin/ads/${id}`
    fetch(endpoint, { method: 'DELETE' }).then(r => r.json()).then(res => {
      if (res.success) loadData()
    })
  }

  function saveAd(formData: Record<string, any>) {
    fetch('/api/admin/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then(r => r.json()).then(res => {
      if (res.success) { setAdModal(null); loadData() }
    })
  }

  function toggleAdActive(ad: Ad) {
    saveAd({ ...ad, active: !ad.active })
  }

  const filteredSubs = subscribers.filter(s =>
    (s.name || '').toLowerCase().includes(subsSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(subsSearch.toLowerCase())
  )
  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactsSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(contactsSearch.toLowerCase()) ||
    c.message.toLowerCase().includes(contactsSearch.toLowerCase())
  )

  function getAdsForLocation(locationKey: string) {
    return ads.filter(a => a.location === locationKey)
  }

  function getLocationLabel(key: string) {
    return AD_LOCATIONS.find(l => l.key === key)?.label || key
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]"><p className="text-[var(--text-muted)]">Carregando...</p></div>

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] relative overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] rounded-full pointer-events-none" />
        <div className="w-full max-w-[420px] p-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-lg relative z-10 mx-6">
          <div className="font-serif text-[28px] italic text-center mb-2 text-[var(--text-primary)]">Blog do Eletricista</div>
          <div className="text-center text-[13px] text-[var(--text-muted)] mb-9 uppercase tracking-[0.12em] font-bold">Painel Administrativo</div>
          {loginError && <div className="bg-[var(--tag-red-bg)] text-[var(--tag-red-text)] text-[13px] font-semibold px-4 py-2.5 rounded-lg mb-4">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">Usuário</label>
              <input name="username" type="text" placeholder="seu@email.com" required autoComplete="username" className="w-full px-4 py-3.5 border border-[var(--border-color)] rounded-[10px] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[15px] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]" />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">Senha</label>
              <input name="password" type="password" placeholder="Sua senha" required autoComplete="current-password" className="w-full px-4 py-3.5 border border-[var(--border-color)] rounded-[10px] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[15px] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]" />
            </div>
            <button type="submit" className="w-full py-3.5 bg-[var(--accent)] text-white rounded-[10px] font-bold text-[15px] border-none cursor-pointer mt-2 hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 transition-all">Entrar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Admin Navbar */}
      <nav className="h-16 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between px-8 sticky top-0 z-[100] backdrop-blur-[12px]">
        <div className="flex items-center gap-4">
          <a href="/" className="font-serif text-[22px] italic text-[var(--text-primary)]">Blog do Eletricista</a>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] bg-[var(--accent-light)] text-[var(--accent)] px-3 py-1 rounded-full">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)]">Tema</button>
          <button onClick={handleLogout} className="bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 hover:border-[var(--tag-red-text)] hover:text-[var(--tag-red-text)] hover:bg-[var(--tag-red-bg)]">Sair</button>
        </div>
      </nav>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 p-8 max-w-[1200px] mx-auto">
        {[
          { label: 'Assinantes Newsletter', value: stats.subs },
          { label: 'Mensagens de Contato', value: stats.contacts },
          { label: 'Posts Publicados', value: stats.posts },
          { label: 'Categorias', value: stats.categories },
          { label: 'Anúncios Ativos', value: stats.ads },
        ].map(s => (
          <div key={s.label} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 hover:border-[var(--accent)] transition-colors">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">{s.label}</div>
            <div className="font-serif text-4xl text-[var(--text-primary)]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-8 max-w-[1200px] mx-auto mb-6 border-b-2 border-[var(--border-color)]">
        {([
          { key: 'subscribers' as const, label: 'Assinantes' },
          { key: 'contacts' as const, label: 'Mensagens' },
          { key: 'ads' as const, label: 'Publicidade' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-6 py-3 text-sm font-semibold border-none bg-transparent cursor-pointer relative transition-colors ${tab === t.key ? 'text-[var(--accent)] after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-8 pb-[60px]">
        {/* ═══ SUBSCRIBERS TAB ═══ */}
        {tab === 'subscribers' && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] flex-wrap gap-3">
              <div className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                Assinantes da Newsletter
                <span className="text-xs font-bold bg-[var(--accent-light)] text-[var(--accent)] px-2.5 py-0.5 rounded-full">{filteredSubs.length}</span>
              </div>
              <input type="text" value={subsSearch} onChange={e => setSubsSearch(e.target.value)} placeholder="Buscar assinante..." className="px-3.5 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-[13px] outline-none w-[220px] focus:border-[var(--accent)]" />
            </div>
            {filteredSubs.length === 0 ? (
              <div className="text-center py-[60px] text-[var(--text-muted)] text-sm">Nenhum assinante encontrado.</div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Nome</th><th>Email</th><th>Data</th><th></th></tr></thead>
                <tbody>
                  {filteredSubs.map(s => (
                    <tr key={s.id}>
                      <td className="font-semibold text-[var(--text-primary)]">{s.name || 'Sem nome'}</td>
                      <td className="text-[13px] text-[var(--accent)]">{s.email}</td>
                      <td className="text-xs text-[var(--text-muted)] whitespace-nowrap">{formatDateTime(s.subscribed_at)}</td>
                      <td>
                        <button onClick={() => setConfirmModal({ text: 'Tem certeza que deseja remover este assinante?', onConfirm: () => { deleteItem('subscriber', s.id); setConfirmModal(null) } })} className="bg-transparent border border-[var(--border-color)] text-[var(--text-muted)] px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer hover:border-[var(--tag-red-text)] hover:text-[var(--tag-red-text)] hover:bg-[var(--tag-red-bg)]">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ═══ CONTACTS TAB ═══ */}
        {tab === 'contacts' && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] flex-wrap gap-3">
              <div className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                Mensagens de Contato
                <span className="text-xs font-bold bg-[var(--accent-light)] text-[var(--accent)] px-2.5 py-0.5 rounded-full">{filteredContacts.length}</span>
              </div>
              <input type="text" value={contactsSearch} onChange={e => setContactsSearch(e.target.value)} placeholder="Buscar mensagem..." className="px-3.5 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-[13px] outline-none w-[220px] focus:border-[var(--accent)]" />
            </div>
            {filteredContacts.length === 0 ? (
              <div className="text-center py-[60px] text-[var(--text-muted)] text-sm">Nenhuma mensagem encontrada.</div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Nome</th><th>Email</th><th>Mensagem</th><th>Data</th><th></th></tr></thead>
                <tbody>
                  {filteredContacts.map(c => (
                    <tr key={c.id}>
                      <td className="font-semibold text-[var(--text-primary)]">{c.name}</td>
                      <td className="text-[13px] text-[var(--accent)]">{c.email}</td>
                      <td className="max-w-[400px] leading-relaxed line-clamp-2">{c.message}</td>
                      <td className="text-xs text-[var(--text-muted)] whitespace-nowrap">{formatDateTime(c.created_at)}</td>
                      <td>
                        <button onClick={() => setConfirmModal({ text: 'Tem certeza que deseja remover esta mensagem?', onConfirm: () => { deleteItem('contact', c.id); setConfirmModal(null) } })} className="bg-transparent border border-[var(--border-color)] text-[var(--text-muted)] px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer hover:border-[var(--tag-red-text)] hover:text-[var(--tag-red-text)] hover:bg-[var(--tag-red-bg)]">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ═══ ADS TAB ═══ */}
        {tab === 'ads' && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Gerenciamento de Publicidade</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Gerencie os espaços publicitários do blog. Espaços escaláveis multiplicam conforme o volume de artigos.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAdsView('map')} className={`px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border transition-colors ${adsView === 'map' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent)]'}`}>
                  Mapa Visual
                </button>
                <button onClick={() => setAdsView('list')} className={`px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border transition-colors ${adsView === 'list' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent)]'}`}>
                  Lista
                </button>
              </div>
            </div>

            {/* ═══ MAP VIEW ═══ */}
            {adsView === 'map' && (
              <div className="flex flex-col gap-8">
                {['Homepage', 'Post', 'Categorias', 'Busca'].map(page => {
                  const locations = AD_LOCATIONS.filter(l => l.page === page)
                  const color = PAGE_COLORS[page] || '#666'

                  return (
                    <div key={page} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                      {/* Page Header */}
                      <div className="flex items-center gap-3 p-5 border-b border-[var(--border-color)]">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <h3 className="text-base font-bold text-[var(--text-primary)]">{page}</h3>
                        <span className="text-xs font-bold bg-[var(--bg-primary)] text-[var(--text-muted)] px-2.5 py-0.5 rounded-full">
                          {locations.length} espaço{locations.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Page Layout Mockup */}
                      <div className="p-5">
                        <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-4 max-w-[700px] mx-auto">
                          {/* Mini page mockup */}
                          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--border-color)]">
                            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                            <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                            <span className="text-[10px] text-[var(--text-muted)] ml-2 font-mono">/{page === 'Homepage' ? '' : page === 'Post' ? 'post/artigo' : page.toLowerCase()}</span>
                          </div>

                          {/* Navbar mockup */}
                          <div className="bg-[var(--bg-secondary)] rounded h-5 mb-3 flex items-center px-2">
                            <div className="w-16 h-2 bg-[var(--border-color)] rounded" />
                          </div>

                          {/* Content mockups per page */}
                          {page === 'Homepage' && (
                            <>
                              <div className="bg-[var(--bg-secondary)] rounded h-14 mb-3 flex items-center justify-center text-[10px] text-[var(--text-muted)]">Hero</div>
                              <div className="flex gap-2 mb-3">
                                {[1,2,3,4].map(i => <div key={i} className="flex-1 bg-[var(--bg-secondary)] rounded h-8 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Cat</div>)}
                              </div>
                              {renderAdSlot(locations.find(l => l.key === 'home_banner_1')!, color)}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                {[1,2,3].map(i => <div key={i} className="bg-[var(--bg-secondary)] rounded h-12 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Post</div>)}
                              </div>
                              {renderAdSlot(locations.find(l => l.key === 'home_banner_2')!, color)}
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="bg-[var(--bg-secondary)] rounded h-10 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Post</div>)}
                              </div>
                              {renderAdSlot(locations.find(l => l.key === 'home_between_posts')!, color)}
                              <div className="grid grid-cols-3 gap-2">
                                {[1,2,3].map(i => <div key={i} className="bg-[var(--bg-secondary)] rounded h-10 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Post</div>)}
                              </div>
                            </>
                          )}

                          {page === 'Post' && (
                            <div className="grid grid-cols-[1fr_120px] gap-3">
                              <div>
                                <div className="bg-[var(--bg-secondary)] rounded h-10 mb-2 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Header + Imagem</div>
                                <div className="bg-[var(--bg-secondary)] rounded h-24 mb-2 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Conteudo do Artigo</div>
                                {renderAdSlot(locations.find(l => l.key === 'post_after_content')!, color)}
                                <div className="bg-[var(--bg-secondary)] rounded h-10 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Autor + Comentarios</div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="text-[8px] text-[var(--text-muted)] font-bold text-center">SIDEBAR</div>
                                <div className="bg-[var(--bg-secondary)] rounded h-12 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Artigo</div>
                                {renderAdSlot(locations.find(l => l.key === 'post_sidebar')!, color)}
                                <div className="bg-[var(--bg-secondary)] rounded h-12 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Artigo</div>
                              </div>
                            </div>
                          )}

                          {page === 'Categorias' && (
                            <>
                              <div className="bg-[var(--bg-secondary)] rounded h-14 mb-3 flex items-center justify-center text-[10px] text-[var(--text-muted)]">Hero + Carrossel</div>
                              {renderAdSlot(locations.find(l => l.key === 'categorias_banner')!, color)}
                              <div className="bg-[var(--bg-secondary)] rounded h-8 mb-3 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Filtros</div>
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="bg-[var(--bg-secondary)] rounded h-10 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Post</div>)}
                              </div>
                              {renderAdSlot(locations.find(l => l.key === 'categorias_between_posts')!, color)}
                              <div className="grid grid-cols-3 gap-2">
                                {[1,2,3].map(i => <div key={i} className="bg-[var(--bg-secondary)] rounded h-10 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Post</div>)}
                              </div>
                            </>
                          )}

                          {page === 'Busca' && (
                            <>
                              <div className="bg-[var(--bg-secondary)] rounded h-14 mb-3 flex items-center justify-center text-[10px] text-[var(--text-muted)]">Campo de Busca</div>
                              {renderAdSlot(locations.find(l => l.key === 'busca_banner')!, color)}
                              <div className="grid grid-cols-3 gap-2">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="bg-[var(--bg-secondary)] rounded h-10 flex items-center justify-center text-[9px] text-[var(--text-muted)]">Resultado</div>)}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Location details cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                          {locations.map(loc => {
                            const locAds = getAdsForLocation(loc.key)
                            const hasAd = locAds.length > 0
                            const activeAds = locAds.filter(a => a.active)

                            return (
                              <div key={loc.key} className={`border rounded-xl p-4 transition-colors ${hasAd ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border-color)] bg-[var(--bg-primary)]'}`}>
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{loc.label}</h4>
                                    <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">{loc.description}</p>
                                  </div>
                                  {loc.scalable && (
                                    <span className="text-[9px] font-extrabold uppercase bg-[#dbeafe] text-[#2563eb] px-2 py-0.5 rounded-full whitespace-nowrap ml-2">Escalavel</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border-color)]">
                                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                    <span className="font-mono font-bold">{loc.width} x {loc.height}px</span>
                                  </div>
                                  <div className="flex-1" />
                                  {hasAd ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-[var(--accent)]">{activeAds.length} ativo{activeAds.length !== 1 ? 's' : ''}</span>
                                      <button onClick={() => setAdModal({ location: loc })} className="text-[11px] font-bold text-[var(--accent)] underline cursor-pointer bg-transparent border-none hover:text-[var(--accent-hover)]">+ Novo</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => setAdModal({ location: loc })} className="text-[11px] font-bold bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[var(--accent-hover)]">Vincular Anuncio</button>
                                  )}
                                </div>

                                {/* Ads linked to this location */}
                                {locAds.length > 0 && (
                                  <div className="mt-3 flex flex-col gap-2">
                                    {locAds.map(a => (
                                      <div key={a.id} className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-lg p-2 border border-[var(--border-color)]">
                                        {a.image_url && <img src={a.image_url} alt="" className="w-12 h-8 object-cover rounded" />}
                                        <div className="flex-1 min-w-0">
                                          <div className="text-[11px] font-semibold text-[var(--text-primary)] truncate">{a.name}</div>
                                          <div className="text-[10px] text-[var(--text-muted)]">{a.impressions} imp. / {a.clicks} cliques</div>
                                        </div>
                                        <button onClick={() => toggleAdActive(a)} className={`text-[9px] font-bold px-2 py-1 rounded-full border-none cursor-pointer ${a.active ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'}`}>
                                          {a.active ? 'ON' : 'OFF'}
                                        </button>
                                        <button onClick={() => setAdModal({ ad: a, location: loc })} className="text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer bg-transparent border-none">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </button>
                                        <button onClick={() => setConfirmModal({ text: `Remover anuncio "${a.name}"?`, onConfirm: () => { deleteItem('ad', a.id); setConfirmModal(null) } })} className="text-[var(--text-muted)] hover:text-[var(--tag-red-text)] cursor-pointer bg-transparent border-none">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ═══ LIST VIEW ═══ */}
            {adsView === 'list' && (
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
                  <div className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2.5">
                    Todos os Anuncios
                    <span className="text-xs font-bold bg-[var(--accent-light)] text-[var(--accent)] px-2.5 py-0.5 rounded-full">{ads.length}</span>
                  </div>
                  <button onClick={() => setAdModal({})} className="text-[13px] font-bold bg-[var(--accent)] text-white px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-[var(--accent-hover)]">+ Novo Anuncio</button>
                </div>
                {ads.length === 0 ? (
                  <div className="text-center py-[60px] text-[var(--text-muted)] text-sm">Nenhum anuncio cadastrado. Clique em &quot;+ Novo Anuncio&quot; ou use o Mapa Visual.</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Localização</th>
                        <th>Status</th>
                        <th>Impressões</th>
                        <th>Cliques</th>
                        <th>CTR</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ads.map(a => {
                        const ctr = a.impressions > 0 ? ((a.clicks / a.impressions) * 100).toFixed(2) : '0.00'
                        return (
                          <tr key={a.id}>
                            <td>
                              <div className="flex items-center gap-2">
                                {a.image_url && <img src={a.image_url} alt="" className="w-10 h-7 object-cover rounded" />}
                                <span className="font-semibold text-[var(--text-primary)]">{a.name}</span>
                              </div>
                            </td>
                            <td className="text-[12px] text-[var(--text-secondary)]">{getLocationLabel(a.location)}</td>
                            <td>
                              <button onClick={() => toggleAdActive(a)} className={`text-[11px] font-bold px-3 py-1 rounded-full border-none cursor-pointer ${a.active ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'}`}>
                                {a.active ? 'Ativo' : 'Inativo'}
                              </button>
                            </td>
                            <td className="text-sm text-[var(--text-secondary)] font-mono">{a.impressions.toLocaleString()}</td>
                            <td className="text-sm text-[var(--text-secondary)] font-mono">{a.clicks.toLocaleString()}</td>
                            <td className="text-sm text-[var(--accent)] font-bold font-mono">{ctr}%</td>
                            <td>
                              <div className="flex gap-1">
                                <button onClick={() => { const loc = AD_LOCATIONS.find(l => l.key === a.location); setAdModal({ ad: a, location: loc }) }} className="bg-transparent border border-[var(--border-color)] text-[var(--text-muted)] px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)]">Editar</button>
                                <button onClick={() => setConfirmModal({ text: `Remover anuncio "${a.name}"?`, onConfirm: () => { deleteItem('ad', a.id); setConfirmModal(null) } })} className="bg-transparent border border-[var(--border-color)] text-[var(--text-muted)] px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer hover:border-[var(--tag-red-text)] hover:text-[var(--tag-red-text)] hover:bg-[var(--tag-red-bg)]">Remover</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Resumo de dimensões */}
            <div className="mt-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Dimensões dos Espaços Publicitários</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {AD_LOCATIONS.map(loc => (
                  <div key={loc.key} className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
                    <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: PAGE_COLORS[loc.page] || '#666' }} />
                    <div>
                      <div className="text-[11px] font-bold text-[var(--text-primary)]">{loc.label.split(' — ')[1]}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">{loc.width} x {loc.height}px</div>
                    </div>
                    {loc.scalable && <span className="text-[8px] font-extrabold uppercase bg-[#dbeafe] text-[#2563eb] px-1.5 py-0.5 rounded-full ml-auto">ESC</span>}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#f59e0b]" /> Homepage</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#3b82f6]" /> Artigo</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#10b981]" /> Categorias</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#8b5cf6]" /> Busca</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#2563eb] text-[8px] font-extrabold">ESC</span> = Escalavel (multiplica com posts)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ AD FORM MODAL ═══ */}
      {adModal && (
        <div className="admin-modal-overlay is-visible" onClick={() => setAdModal(null)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 max-w-[560px] w-[95%] shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <AdForm
              ad={adModal.ad}
              location={adModal.location}
              onSave={saveAd}
              onCancel={() => setAdModal(null)}
            />
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="admin-modal-overlay is-visible" onClick={() => setConfirmModal(null)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 max-w-[400px] w-[90%] shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="text-lg font-bold text-[var(--text-primary)] mb-2">Confirmar exclusão</div>
            <div className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">{confirmModal.text}</div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmModal(null)} className="px-5 py-2.5 bg-transparent border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] text-sm font-semibold cursor-pointer hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">Cancelar</button>
              <button onClick={confirmModal.onConfirm} className="px-5 py-2.5 bg-[#ef4444] border-none rounded-lg text-white text-sm font-semibold cursor-pointer hover:bg-[#dc2626]">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function renderAdSlot(loc: AdLocation | undefined, color: string) {
    if (!loc) return null
    const locAds = getAdsForLocation(loc.key)
    const hasAd = locAds.some(a => a.active)

    return (
      <div
        className={`rounded my-2 flex items-center justify-center text-[9px] font-bold border-2 border-dashed cursor-pointer transition-all hover:opacity-80 ${hasAd ? 'border-solid' : ''}`}
        style={{
          borderColor: color,
          backgroundColor: hasAd ? color + '22' : 'transparent',
          color: color,
          height: Math.max(20, loc.height / 5),
        }}
        onClick={() => setAdModal({ location: loc })}
      >
        {loc.label.split(' — ')[1]} ({loc.width}x{loc.height})
        {loc.scalable && ' *'}
        {hasAd && ' ✓'}
      </div>
    )
  }
}

// ═══ AD FORM COMPONENT ═══
function AdForm({ ad, location, onSave, onCancel }: {
  ad?: Ad; location?: AdLocation
  onSave: (data: Record<string, any>) => void; onCancel: () => void
}) {
  const [name, setName] = useState(ad?.name || '')
  const [loc, setLoc] = useState(ad?.location || location?.key || '')
  const [imageUrl, setImageUrl] = useState(ad?.image_url || '')
  const [linkUrl, setLinkUrl] = useState(ad?.link_url || '')
  const [altText, setAltText] = useState(ad?.alt_text || '')
  const [htmlCode, setHtmlCode] = useState(ad?.html_code || '')
  const [active, setActive] = useState(ad?.active ?? true)
  const [startDate, setStartDate] = useState(ad?.start_date?.split('T')[0] || '')
  const [endDate, setEndDate] = useState(ad?.end_date?.split('T')[0] || '')
  const [mode, setMode] = useState<'image'|'html'>(ad?.html_code ? 'html' : 'image')

  const selectedLoc = AD_LOCATIONS.find(l => l.key === loc)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      id: ad?.id,
      name,
      location: loc,
      image_url: mode === 'image' ? imageUrl : null,
      link_url: mode === 'image' ? linkUrl : null,
      alt_text: mode === 'image' ? altText : null,
      html_code: mode === 'html' ? htmlCode : null,
      active,
      start_date: startDate || null,
      end_date: endDate || null,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{ad ? 'Editar Anuncio' : 'Novo Anuncio'}</h3>
      {selectedLoc && (
        <p className="text-[12px] text-[var(--text-muted)] mb-5">
          Localização: <strong>{selectedLoc.label}</strong> — Dimensões: <strong className="font-mono">{selectedLoc.width} x {selectedLoc.height}px</strong>
        </p>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1.5">Nome do Anuncio *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Banner Loja X" className="w-full px-3.5 py-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)]" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1.5">Localização *</label>
          <select value={loc} onChange={e => setLoc(e.target.value)} required className="w-full px-3.5 py-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)]">
            <option value="">Selecionar localização...</option>
            {AD_LOCATIONS.map(l => (
              <option key={l.key} value={l.key}>{l.label} ({l.width}x{l.height}px)</option>
            ))}
          </select>
        </div>

        {/* Mode toggle */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1.5">Tipo de Anuncio</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setMode('image')} className={`flex-1 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border transition-colors ${mode === 'image' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
              Imagem + Link
            </button>
            <button type="button" onClick={() => setMode('html')} className={`flex-1 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border transition-colors ${mode === 'html' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
              Codigo HTML (AdSense)
            </button>
          </div>
        </div>

        {mode === 'image' && (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1.5">URL da Imagem</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://exemplo.com/banner.jpg" className="w-full px-3.5 py-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)]" />
              {imageUrl && (
                <div className="mt-2 border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-primary)] p-2">
                  <img src={imageUrl} alt="Preview" className="w-full max-h-[120px] object-contain rounded" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1.5">URL de Destino (link)</label>
              <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://exemplo.com" className="w-full px-3.5 py-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1.5">Texto Alternativo</label>
              <input type="text" value={altText} onChange={e => setAltText(e.target.value)} placeholder="Descrição do banner" className="w-full px-3.5 py-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)]" />
            </div>
          </>
        )}

        {mode === 'html' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1.5">Codigo HTML</label>
            <textarea value={htmlCode} onChange={e => setHtmlCode(e.target.value)} rows={6} placeholder='<ins class="adsbygoogle" ...' className="w-full px-3.5 py-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] font-mono resize-y" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1.5">Data Inicio</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3.5 py-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)]" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1.5">Data Fim</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3.5 py-2.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)]" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Anuncio ativo</span>
        </label>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-[var(--border-color)]">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-transparent border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] text-sm font-semibold cursor-pointer hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">Cancelar</button>
        <button type="submit" className="px-5 py-2.5 bg-[var(--accent)] border-none rounded-lg text-white text-sm font-semibold cursor-pointer hover:bg-[var(--accent-hover)]">{ad ? 'Salvar' : 'Criar Anuncio'}</button>
      </div>
    </form>
  )
}
