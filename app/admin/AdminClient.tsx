'use client'

import { useEffect, useState } from 'react'

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

export default function AdminClient() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<'subscribers'|'contacts'>('subscribers')
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [stats, setStats] = useState({ posts: 0, categories: 0, subs: 0, contacts: 0 })
  const [subsSearch, setSubsSearch] = useState('')
  const [contactsSearch, setContactsSearch] = useState('')
  const [confirmModal, setConfirmModal] = useState<{ text: string; onConfirm: () => void } | null>(null)
  const [theme, setTheme] = useState('light')

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

  function deleteItem(type: 'subscriber'|'contact', id: number) {
    const endpoint = type === 'subscriber' ? `/api/admin/subscribers/${id}` : `/api/admin/contacts/${id}`
    fetch(endpoint, { method: 'DELETE' }).then(r => r.json()).then(res => {
      if (res.success) loadData()
    })
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
              <input name="username" type="text" placeholder="admin" required autoComplete="username" className="w-full px-4 py-3.5 border border-[var(--border-color)] rounded-[10px] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[15px] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]" />
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 p-8 max-w-[1200px] mx-auto">
        {[
          { label: 'Assinantes Newsletter', value: stats.subs },
          { label: 'Mensagens de Contato', value: stats.contacts },
          { label: 'Posts Publicados', value: stats.posts },
          { label: 'Categorias', value: stats.categories },
        ].map(s => (
          <div key={s.label} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 hover:border-[var(--accent)] transition-colors">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">{s.label}</div>
            <div className="font-serif text-4xl text-[var(--text-primary)]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-8 max-w-[1200px] mx-auto mb-6 border-b-2 border-[var(--border-color)]">
        {(['subscribers', 'contacts'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 text-sm font-semibold border-none bg-transparent cursor-pointer relative transition-colors ${tab === t ? 'text-[var(--accent)] after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
            {t === 'subscribers' ? 'Assinantes' : 'Mensagens'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-8 pb-[60px]">
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
      </div>

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
