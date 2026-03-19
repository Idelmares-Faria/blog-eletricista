'use client'

import { useEffect, useState } from 'react'
import Marquee from '@/components/Marquee'
import ScrollReveal from '@/components/ScrollReveal'
import { PostCardVertical } from '@/components/PostCard'
import { showToast } from '@/components/Toast'

export default function NewsletterClient() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/posts?limit=3').then(r => r.json()).then(res => {
      if (res.success) setPosts(res.data)
    })
  }, [])

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (document.getElementById('nlName') as HTMLInputElement).value
    const email = (document.getElementById('nlEmail') as HTMLInputElement).value

    fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    }).then(r => {
      if (r.ok) { showToast('Inscrição realizada com sucesso! Bem-vindo(a) à newsletter.'); form.reset() }
      else throw new Error()
    }).catch(() => showToast('Erro ao realizar inscrição. Tente novamente.'))
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[300px] py-16 flex items-center justify-center text-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/hero-newsletter.png')" }}>
        <div className="relative z-[3] w-full max-w-[1200px] mx-auto px-6">
          <span className="inline-block bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] mb-4">Especialistas em Elétrica</span>
          <h1 className="font-serif text-[clamp(48px,10vw,80px)] leading-none mb-4 font-normal text-white">Conteúdo <em className="italic text-[var(--accent)]">Técnico</em> no seu email.</h1>
          <p className="text-lg text-gray-300">Junte-se a milhares de profissionais que recebem atualizações de normas e dicas práticas toda semana.</p>
        </div>
      </section>

      <Marquee />

      {/* Subscription */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-20 items-center py-10">
              <div>
                <span className="inline-block bg-[var(--accent-light)] text-[var(--accent)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] mb-4">Newsletter Premium</span>
                <h2 className="font-serif text-[clamp(40px,6vw,64px)] leading-tight mb-6">Acelere sua <em className="italic text-[var(--accent)]">carreira técnica</em> com conteúdo de elite.</h2>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed">Toda quarta-feira, Roberto Camargo compartilha normas NBR mastigadas, estudos de caso reais e dicas de campo que você não aprende em cursos comuns.</p>
              </div>
              <form onSubmit={handleSubscribe} className="bg-[var(--bg-card)] p-12 rounded-[32px] border border-[var(--border-color)] shadow-xl">
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nlName" className="text-[13px] font-bold uppercase text-[var(--text-muted)] tracking-[0.05em]">Nome completo</label>
                    <input type="text" id="nlName" placeholder="Como quer ser chamado?" required className="px-5 py-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] text-base outline-none transition-all focus:border-[var(--accent)] focus:shadow-[0_0_0_4px_var(--accent-light)]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nlEmail" className="text-[13px] font-bold uppercase text-[var(--text-muted)] tracking-[0.05em]">E-mail profissional</label>
                    <input type="email" id="nlEmail" placeholder="seu@email.com" required className="px-5 py-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] text-base outline-none transition-all focus:border-[var(--accent)] focus:shadow-[0_0_0_4px_var(--accent-light)]" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-bold text-base border-none cursor-pointer hover:bg-[var(--accent-hover)] transition-all">Garantir meu acesso gratuito</button>
                <p className="text-[13px] text-[var(--text-muted)] text-center mt-5">⚡ Seus dados estão protegidos. Spam é proibido aqui.</p>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-[60px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[28px] font-bold font-serif mb-8">O que você recebe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            {[
              { icon: '📈', title: 'Conteúdo técnico validado', desc: 'Receba artigos baseados em normas vigentes (NBR 5410, NR-10) e experiências reais de campo, validados por engenheiros.' },
              { icon: '📖', title: 'Material exclusivo', desc: 'Acesse checklists, guias técnicos e análises de casos reais que não publicamos no blog — só para assinantes.' },
              { icon: '🕐', title: 'Normas atualizadas', desc: 'Fique por dentro de atualizações nas normas técnicas e regulamentações antes que impactem seu trabalho.' },
              { icon: '💬', title: 'Comunidade técnica', desc: 'Faça parte de uma rede de eletricistas e engenheiros que trocam experiências e soluções práticas.' },
            ].map(b => (
              <ScrollReveal key={b.title}>
                <div className="bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border-color)] transition-all hover:-translate-y-1.5 hover:border-[var(--accent)] hover:shadow-md h-full">
                  <div className="w-14 h-14 bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center rounded-xl mb-6 text-2xl">{b.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{b.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{b.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      {posts.length > 0 && (
        <section className="py-[60px]">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-[28px] font-bold font-serif mb-10">Posts recentes do blog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((p: any) => <PostCardVertical key={p.slug} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
