'use client'

import { useEffect, useState } from 'react'
import Marquee from '@/components/Marquee'
import ScrollReveal from '@/components/ScrollReveal'
import { showToast } from '@/components/Toast'

export default function SobreClient() {
  const [stats, setStats] = useState({ posts: 0, categories: 0, community: 0 })

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(res => {
      if (res.success) setStats(res.data)
    })
  }, [])

  function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.querySelector('input[type="text"]') as HTMLInputElement).value
    const email = (form.querySelector('input[type="email"]') as HTMLInputElement).value
    const message = (form.querySelector('textarea') as HTMLTextAreaElement).value

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    }).then(r => r.json()).then(data => {
      if (data.success) { showToast('Mensagem enviada com sucesso!'); form.reset() }
      else showToast(data.error || 'Erro ao enviar.')
    }).catch(() => showToast('Erro ao enviar. Tente novamente.'))
  }

  return (
    <>
      {/* Hero */}
      <section className="hero-section relative min-h-[320px] py-16 flex items-center justify-center text-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/hero-sobre.png')" }}>
        <div className="relative z-[3] w-full max-w-[1200px] mx-auto px-6">
          <span className="inline-block bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] mb-4">Especialistas em Elétrica</span>
          <h1 className="font-serif text-[clamp(48px,10vw,80px)] leading-none mb-4 font-normal">SOBRE <em className="italic text-[var(--accent)]">NÓS</em></h1>
          <p className="text-lg text-gray-300">Compartilhando conhecimento técnico em elétrica desde 2020.</p>
        </div>
      </section>

      <Marquee />

      {/* Mission */}
      <section className="py-[60px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <ScrollReveal>
              <div className="bg-[var(--bg-card)] p-10 rounded-3xl border border-[var(--border-color)] flex flex-col">
                <div className="w-[60px] h-[60px] bg-[var(--accent-light)] flex items-center justify-center rounded-full text-2xl mb-6">⚡</div>
                <span className="text-xs font-extrabold uppercase text-[var(--accent)] tracking-[0.2em]">Nossa Missão</span>
                <h2 className="font-serif text-3xl mt-2">Democratizar o conhecimento técnico em <em className="italic text-[var(--accent)]">instalações elétricas</em>.</h2>
                <div className="w-10 h-1 bg-[var(--accent)] my-6 rounded" />
                <p className="text-[var(--text-secondary)] leading-relaxed">Acreditamos que todo eletricista merece acesso a conteúdo técnico de qualidade. O Blog do Eletricista nasceu para transformar normas complexas em ferramentas práticas para o seu dia a dia.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="bg-[var(--bg-card)] p-10 rounded-3xl border border-[var(--border-color)] flex flex-col">
                <div className="w-[60px] h-[60px] bg-[var(--accent-light)] flex items-center justify-center rounded-full text-2xl mb-6">🏆</div>
                <span className="text-xs font-extrabold uppercase text-[var(--accent)] tracking-[0.2em]">Nossa Visão</span>
                <h2 className="font-serif text-3xl mt-2">Ser a <em className="italic text-[var(--accent)]">referência #1</em> em conteúdo técnico no Brasil.</h2>
                <div className="w-10 h-1 bg-[var(--accent)] my-6 rounded" />
                <p className="text-[var(--text-secondary)] leading-relaxed">Queremos ser o porto seguro onde profissionais buscam informação técnica confiável, atualizada com as normas NBR e validada por quem realmente entende de campo.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-[60px]">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Artigos técnicos', value: stats.posts + '+' },
            { label: 'Comunidade', value: stats.community > 1000 ? (stats.community / 1000).toFixed(1) + 'K' : stats.community + '+' },
            { label: 'Anos de atuação', value: '4' },
            { label: 'Categorias', value: stats.categories + '+' },
          ].map(stat => (
            <ScrollReveal key={stat.label}>
              <div className="text-center p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] transition-all hover:scale-105 hover:border-[var(--accent)]">
                <span className="block text-[40px] font-extrabold font-serif text-[var(--accent)] mb-2">{stat.value}</span>
                <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-[0.05em]">{stat.label}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Author */}
      <section className="py-[60px] bg-[var(--bg-secondary)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-[60px] items-center bg-[var(--bg-card)] p-10 rounded-3xl border border-[var(--border-color)] shadow-md">
              <div className="relative">
                <img src="/images/roberto-camargo.png" alt="Roberto Camargo" className="w-full aspect-[4/5] object-cover rounded-2xl shadow-[20px_20px_0_var(--accent-light)]" />
                <div className="absolute -bottom-5 -right-5 bg-[var(--accent)] text-white p-4 rounded-xl flex items-center gap-3 shadow-md" style={{ animation: 'float 3s ease-in-out infinite' }}>
                  <span className="text-[32px] font-extrabold font-serif">25</span>
                  <span className="text-[10px] uppercase font-bold leading-tight">anos de<br/>experiência</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase text-[var(--accent)] tracking-[0.2em] mb-3 block">O Homem por trás do Blog</span>
                <h2 className="font-serif text-5xl mb-1">Roberto Camargo</h2>
                <span className="text-base text-[var(--text-muted)] font-medium mb-8 block">Engenheiro Eletricista e Mestre Instalador</span>
                <div className="text-[17px] leading-[1.8] text-[var(--text-secondary)] mb-10 space-y-4">
                  <p>Com mais de duas décadas dedicadas ao setor elétrico, Roberto Camargo transformou sua paixão por normas técnicas e segurança em uma missão de vida.</p>
                  <p>Fundou o <strong className="text-[var(--text-primary)]">Blog do Eletricista</strong> com um único objetivo: democratizar o acesso a informações técnicas de alta qualidade.</p>
                </div>
                <div className="flex flex-wrap gap-5">
                  {['⚡ Especialista NBR 5410 / 5419', '🏗️ Consultor de Projetos Industriais', '🎓 Mentor de centenas de profissionais'].map(cred => (
                    <div key={cred} className="flex items-center gap-2.5 bg-[var(--bg-secondary)] px-4 py-2.5 rounded-full text-[13px] font-semibold">{cred}</div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[60px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-10 bg-[var(--bg-card)] p-[60px] max-md:p-8 rounded-[32px] border-4 border-[var(--accent)] items-center relative overflow-hidden">
              <div className="absolute -top-5 -left-5 text-[120px] opacity-5">⚡</div>
              <div>
                <h2 className="font-serif text-[42px] max-md:text-3xl mb-5 leading-tight">Quer colaborar com o blog ou tirar uma dúvida técnica?</h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">Junte-se à nossa comunidade de elite. Roberto e seu time estão sempre em busca de novos talentos e discussões técnicas de alto nível.</p>
              </div>
              <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl shadow-sm">
                <form onSubmit={handleContact}>
                  <div className="mb-4"><input type="text" placeholder="Seu nome" required className="w-full px-5 py-3.5 border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] text-[15px] outline-none focus:border-[var(--accent)]" /></div>
                  <div className="mb-4"><input type="email" placeholder="Seu melhor email" required className="w-full px-5 py-3.5 border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] text-[15px] outline-none focus:border-[var(--accent)]" /></div>
                  <div className="mb-4"><textarea placeholder="Sua sugestão de tema ou dúvida" rows={3} className="w-full px-5 py-3.5 border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] text-[15px] outline-none resize-y focus:border-[var(--accent)]" /></div>
                  <button type="submit" className="w-full py-3.5 bg-[var(--accent)] text-white rounded-xl font-bold text-[15px] border-none cursor-pointer hover:bg-[var(--accent-hover)] transition-all">Enviar Mensagem</button>
                  <p className="text-[11px] text-[var(--text-muted)] text-center mt-4">Ao enviar, você concorda em receber novidades técnicas ocasionais.</p>
                </form>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
