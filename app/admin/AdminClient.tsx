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

  const [adsTab, setAdsTab] = useState<'publicacao'|'proporcoes'|'analytics'>('publicacao')

  useEffect(() => {
    fetch('/api/admin/check').then(r => { if (r.ok) { setLoggedIn(true); loadData() } setLoading(false) }).catch(() => setLoading(false))
  }, [])

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
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 p-8 max-w-[1200px] mx-auto">
        {[
          { label: 'Newsletter', value: stats.subs, icon: '✉️' },
          { label: 'Contato', value: stats.contacts, icon: '💬' },
          { label: 'Posts', value: stats.posts, icon: '📝' },
          { label: 'Categorias', value: stats.categories, icon: '📂' },
          { label: 'Anúncios', value: stats.ads, icon: '📢' },
        ].map(s => (
          <div key={s.label} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[var(--accent)] transition-colors flex flex-col justify-between h-[100px]">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)] whitespace-nowrap truncate">{s.label}</div>
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
            {/* Sub-tabs */}
            <div className="flex gap-1 mb-6 border-b-2 border-[var(--border-color)]">
              {([
                { key: 'publicacao' as const, label: 'Publicacao', icon: '📢' },
                { key: 'proporcoes' as const, label: 'Proporcoes', icon: '📐' },
                { key: 'analytics' as const, label: 'Analytics', icon: '📊' },
              ]).map(t => (
                <button key={t.key} onClick={() => setAdsTab(t.key)} className={`px-5 py-3 text-sm font-semibold border-none bg-transparent cursor-pointer relative transition-colors flex items-center gap-2 ${adsTab === t.key ? 'text-[var(--accent)] after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>

            {/* ═══ PUBLICACAO SUB-TAB ═══ */}
            {adsTab === 'publicacao' && (
              <div>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Banners Ativos</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Gerencie os banners rotativos do blog. Cada visitante visualiza um banner aleatorio por espaco.</p>
                  </div>
                  <button onClick={() => setAdModal({})} className="text-[13px] font-bold bg-[var(--accent)] text-white px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-[var(--accent-hover)]">+ Novo Banner</button>
                </div>

                {/* Active Banners Grid */}
                {ads.filter(a => a.active).length === 0 ? (
                  <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-xl text-center py-16">
                    <div className="text-4xl mb-3">📢</div>
                    <div className="text-[var(--text-muted)] text-sm">Nenhum banner ativo. Crie seu primeiro banner clicando em &quot;+ Novo Banner&quot;.</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {ads.filter(a => a.active).map(a => {
                      const loc = AD_LOCATIONS.find(l => l.key === a.location)
                      const ctr = a.impressions > 0 ? ((a.clicks / a.impressions) * 100).toFixed(2) : '0.00'
                      return (
                        <div key={a.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:border-[var(--accent)] transition-colors">
                          {/* Banner Preview */}
                          {a.image_url ? (
                            <div className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex items-center justify-center p-3" style={{ minHeight: 80 }}>
                              <img src={a.image_url} alt={a.alt_text || a.name} className="max-w-full max-h-[100px] object-contain rounded" />
                            </div>
                          ) : a.html_code ? (
                            <div className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex items-center justify-center p-3 text-[11px] text-[var(--text-muted)] font-mono" style={{ minHeight: 80 }}>
                              &lt;HTML/AdSense&gt;
                            </div>
                          ) : null}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{a.name}</h4>
                                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{loc?.label || a.location}</p>
                              </div>
                              <button onClick={() => toggleAdActive(a)} className="text-[10px] font-bold px-2.5 py-1 rounded-full border-none cursor-pointer bg-[#dcfce7] text-[#16a34a] whitespace-nowrap ml-2">Ativo</button>
                            </div>
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
                              <span className="font-mono">{loc?.width}x{loc?.height}px</span>
                              <span>{a.impressions.toLocaleString()} imp.</span>
                              <span>{a.clicks.toLocaleString()} cliques</span>
                              <span className="font-bold text-[var(--accent)]">{ctr}% CTR</span>
                              <div className="flex-1" />
                              <button onClick={() => { setAdModal({ ad: a, location: loc }) }} className="text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer bg-transparent border-none">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button onClick={() => setConfirmModal({ text: `Remover banner "${a.name}"?`, onConfirm: () => { deleteItem('ad', a.id); setConfirmModal(null) } })} className="text-[var(--text-muted)] hover:text-[var(--tag-red-text)] cursor-pointer bg-transparent border-none">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Inactive Banners */}
                {ads.filter(a => !a.active).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] mb-3 uppercase tracking-[0.1em]">Inativos ({ads.filter(a => !a.active).length})</h3>
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                      <table className="admin-table">
                        <thead><tr><th>Nome</th><th>Localizacao</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                          {ads.filter(a => !a.active).map(a => {
                            const loc = AD_LOCATIONS.find(l => l.key === a.location)
                            return (
                              <tr key={a.id}>
                                <td>
                                  <div className="flex items-center gap-2">
                                    {a.image_url && <img src={a.image_url} alt="" className="w-10 h-7 object-cover rounded opacity-50" />}
                                    <span className="font-semibold text-[var(--text-muted)]">{a.name}</span>
                                  </div>
                                </td>
                                <td className="text-[12px] text-[var(--text-muted)]">{loc?.label || a.location}</td>
                                <td>
                                  <button onClick={() => toggleAdActive(a)} className="text-[11px] font-bold px-3 py-1 rounded-full border-none cursor-pointer bg-[var(--bg-primary)] text-[var(--text-muted)] hover:bg-[#dcfce7] hover:text-[#16a34a]">
                                    Ativar
                                  </button>
                                </td>
                                <td>
                                  <div className="flex gap-1">
                                    <button onClick={() => { setAdModal({ ad: a, location: loc }) }} className="bg-transparent border border-[var(--border-color)] text-[var(--text-muted)] px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)]">Editar</button>
                                    <button onClick={() => setConfirmModal({ text: `Remover banner "${a.name}"?`, onConfirm: () => { deleteItem('ad', a.id); setConfirmModal(null) } })} className="bg-transparent border border-[var(--border-color)] text-[var(--text-muted)] px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer hover:border-[var(--tag-red-text)] hover:text-[var(--tag-red-text)] hover:bg-[var(--tag-red-bg)]">Remover</button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Distribution by Location */}
                <div className="mt-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Distribuicao por Localizacao</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {AD_LOCATIONS.map(loc => {
                      const locAds = getAdsForLocation(loc.key)
                      const activeCount = locAds.filter(a => a.active).length
                      const color = PAGE_COLORS[loc.page] || '#666'
                      return (
                        <div key={loc.key} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:border-[var(--accent)] ${activeCount > 0 ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border-color)] bg-[var(--bg-primary)]'}`} onClick={() => setAdModal({ location: loc })}>
                          <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: color }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-[var(--text-primary)] truncate">{loc.label}</div>
                            <div className="text-[10px] text-[var(--text-muted)] font-mono">{loc.width}x{loc.height}px</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${activeCount > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>{activeCount}</div>
                            <div className="text-[9px] text-[var(--text-muted)]">banner{activeCount !== 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ PROPORCOES SUB-TAB ═══ */}
            {adsTab === 'proporcoes' && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Manual de Proporcoes</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Referencia completa com as dimensoes exatas de todos os espacos publicitarios disponiveis no blog.</p>
                </div>

                {['Homepage', 'Post', 'Categorias', 'Busca'].map(page => {
                  const locations = AD_LOCATIONS.filter(l => l.page === page)
                  const color = PAGE_COLORS[page] || '#666'

                  return (
                    <div key={page} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden mb-5">
                      <div className="flex items-center gap-3 p-5 border-b border-[var(--border-color)]">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <h3 className="text-base font-bold text-[var(--text-primary)]">{page}</h3>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono ml-1">/{page === 'Homepage' ? '' : page === 'Post' ? 'post/[slug]' : page.toLowerCase()}</span>
                      </div>
                      <div className="divide-y divide-[var(--border-color)]">
                        {locations.map(loc => {
                          const ratio = (loc.width / loc.height).toFixed(1)
                          return (
                            <div key={loc.key} className="p-5 flex gap-6 items-start">
                              {/* Visual preview */}
                              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                <div
                                  className="border-2 border-dashed rounded-lg flex items-center justify-center text-[10px] font-mono font-bold"
                                  style={{
                                    borderColor: color,
                                    color: color,
                                    backgroundColor: color + '10',
                                    width: Math.min(180, loc.width / 6),
                                    height: Math.max(30, loc.height / 3),
                                  }}
                                >
                                  {loc.width}x{loc.height}
                                </div>
                                <span className="text-[9px] text-[var(--text-muted)]">Preview proporcional</span>
                              </div>
                              {/* Details */}
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-[var(--text-primary)]">{loc.label}</h4>
                                <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">{loc.description}</p>
                                <div className="flex flex-wrap gap-3 mt-3">
                                  <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2">
                                    <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Largura</div>
                                    <div className="text-sm font-mono font-bold text-[var(--text-primary)]">{loc.width}px</div>
                                  </div>
                                  <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2">
                                    <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Altura</div>
                                    <div className="text-sm font-mono font-bold text-[var(--text-primary)]">{loc.height}px</div>
                                  </div>
                                  <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2">
                                    <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Proporcao</div>
                                    <div className="text-sm font-mono font-bold text-[var(--text-primary)]">{ratio}:1</div>
                                  </div>
                                  <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2">
                                    <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Tipo</div>
                                    <div className="text-sm font-bold text-[var(--text-primary)]">{loc.scalable ? 'Escalavel' : 'Fixo'}</div>
                                  </div>
                                </div>
                                {loc.scalable && (
                                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#2563eb]">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                    Este espaco multiplica conforme a quantidade de posts na pagina (1 a cada 6 posts).
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* Summary Table */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-[var(--border-color)]">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Tabela Resumo — Todas as Dimensoes</h3>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Pagina</th>
                        <th>Espaco</th>
                        <th>Largura</th>
                        <th>Altura</th>
                        <th>Proporcao</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {AD_LOCATIONS.map(loc => (
                        <tr key={loc.key}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PAGE_COLORS[loc.page] || '#666' }} />
                              <span className="text-[12px] font-semibold">{loc.page}</span>
                            </div>
                          </td>
                          <td className="text-[12px] font-semibold text-[var(--text-primary)]">{loc.label.split(' — ')[1]}</td>
                          <td className="font-mono text-sm">{loc.width}px</td>
                          <td className="font-mono text-sm">{loc.height}px</td>
                          <td className="font-mono text-sm">{(loc.width / loc.height).toFixed(1)}:1</td>
                          <td>
                            {loc.scalable
                              ? <span className="text-[10px] font-extrabold uppercase bg-[#dbeafe] text-[#2563eb] px-2 py-0.5 rounded-full">Escalavel</span>
                              : <span className="text-[10px] font-extrabold uppercase bg-[var(--bg-primary)] text-[var(--text-muted)] px-2 py-0.5 rounded-full">Fixo</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="mt-5 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                  <div className="flex items-center flex-wrap gap-5 text-[11px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Homepage</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Artigo</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Categorias</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" /> Busca</span>
                    <span className="ml-auto text-[10px]"><strong>Escalavel</strong> = multiplica automaticamente a cada 6 posts</span>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ANALYTICS SUB-TAB ═══ */}
            {adsTab === 'analytics' && (
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Analytics de Publicidade</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Metricas de desempenho dos banners: impressoes, cliques, CTR e distribuicao.</p>
                </div>

                {/* Global Stats */}
                {(() => {
                  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0)
                  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0)
                  const globalCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'
                  const activeCount = ads.filter(a => a.active).length
                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Total Impressoes', value: totalImpressions.toLocaleString(), color: '#3b82f6' },
                        { label: 'Total Cliques', value: totalClicks.toLocaleString(), color: '#10b981' },
                        { label: 'CTR Global', value: globalCtr + '%', color: '#f59e0b' },
                        { label: 'Banners Ativos', value: activeCount.toString(), color: '#8b5cf6' },
                      ].map(s => (
                        <div key={s.label} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
                          <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">{s.label}</div>
                          <div className="font-serif text-3xl" style={{ color: s.color }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {/* Per-Banner Performance Table */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden mb-6">
                  <div className="p-5 border-b border-[var(--border-color)]">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Desempenho por Banner</h3>
                  </div>
                  {ads.length === 0 ? (
                    <div className="text-center py-[60px] text-[var(--text-muted)] text-sm">Nenhum banner cadastrado.</div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Banner</th>
                          <th>Localizacao</th>
                          <th>Status</th>
                          <th>Impressoes</th>
                          <th>Cliques</th>
                          <th>CTR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...ads].sort((a, b) => b.impressions - a.impressions).map(a => {
                          const ctr = a.impressions > 0 ? ((a.clicks / a.impressions) * 100).toFixed(2) : '0.00'
                          const ctrNum = parseFloat(ctr)
                          const ctrColor = ctrNum >= 2 ? '#16a34a' : ctrNum >= 0.5 ? '#f59e0b' : 'var(--text-muted)'
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
                                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${a.active ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'}`}>
                                  {a.active ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                              <td className="text-sm text-[var(--text-secondary)] font-mono">{a.impressions.toLocaleString()}</td>
                              <td className="text-sm text-[var(--text-secondary)] font-mono">{a.clicks.toLocaleString()}</td>
                              <td className="text-sm font-bold font-mono" style={{ color: ctrColor }}>{ctr}%</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Per-Location Performance */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden mb-6">
                  <div className="p-5 border-b border-[var(--border-color)]">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Desempenho por Localizacao</h3>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Localizacao</th>
                        <th>Banners</th>
                        <th>Impressoes</th>
                        <th>Cliques</th>
                        <th>CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {AD_LOCATIONS.map(loc => {
                        const locAds = ads.filter(a => a.location === loc.key)
                        const imp = locAds.reduce((s, a) => s + a.impressions, 0)
                        const clk = locAds.reduce((s, a) => s + a.clicks, 0)
                        const ctr = imp > 0 ? ((clk / imp) * 100).toFixed(2) : '0.00'
                        const color = PAGE_COLORS[loc.page] || '#666'
                        return (
                          <tr key={loc.key}>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-[12px] font-semibold text-[var(--text-primary)]">{loc.label}</span>
                              </div>
                            </td>
                            <td className="text-sm text-[var(--text-secondary)]">{locAds.filter(a => a.active).length} / {locAds.length}</td>
                            <td className="text-sm text-[var(--text-secondary)] font-mono">{imp.toLocaleString()}</td>
                            <td className="text-sm text-[var(--text-secondary)] font-mono">{clk.toLocaleString()}</td>
                            <td className="text-sm text-[var(--accent)] font-bold font-mono">{ctr}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Distribution by Page */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Distribuicao por Pagina</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {['Homepage', 'Post', 'Categorias', 'Busca'].map(page => {
                      const pageAds = ads.filter(a => AD_LOCATIONS.find(l => l.key === a.location)?.page === page)
                      const imp = pageAds.reduce((s, a) => s + a.impressions, 0)
                      const clk = pageAds.reduce((s, a) => s + a.clicks, 0)
                      const ctr = imp > 0 ? ((clk / imp) * 100).toFixed(2) : '0.00'
                      const color = PAGE_COLORS[page] || '#666'
                      const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0)
                      const pct = totalImpressions > 0 ? ((imp / totalImpressions) * 100).toFixed(0) : '0'
                      return (
                        <div key={page} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm font-bold text-[var(--text-primary)]">{page}</span>
                          </div>
                          {/* Simple bar */}
                          <div className="w-full h-2 bg-[var(--border-color)] rounded-full mb-3 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ backgroundColor: color, width: pct + '%' }} />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <div className="text-[var(--text-muted)]">Impressoes</div>
                              <div className="font-mono font-bold text-[var(--text-primary)]">{imp.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-[var(--text-muted)]">Cliques</div>
                              <div className="font-mono font-bold text-[var(--text-primary)]">{clk.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-[var(--text-muted)]">CTR</div>
                              <div className="font-mono font-bold" style={{ color }}>{ctr}%</div>
                            </div>
                            <div>
                              <div className="text-[var(--text-muted)]">% do Total</div>
                              <div className="font-mono font-bold text-[var(--text-primary)]">{pct}%</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
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
