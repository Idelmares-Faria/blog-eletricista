export default function Marquee() {
  const items = [
    { tag: 'Novo', text: 'NBR 5410: entenda a norma que regula instalações' },
    { tag: 'Destaque', text: 'Como dimensionar o quadro de distribuição' },
    { tag: 'Dica', text: 'Aterramento elétrico: o que é e como fazer' },
    { tag: 'Segurança', text: 'SPDA para raios: como funciona' },
    { tag: 'Guia', text: 'Fio ou cabo elétrico: qual usar?' },
  ]

  const doubled = [...items, ...items]

  return (
    <div className="overflow-hidden whitespace-nowrap bg-[var(--bg-card)] border-y-2 border-[var(--accent)] py-2 flex relative z-10" aria-hidden="true">
      <div className="inline-flex gap-20 items-center uppercase hover:[animation-play-state:paused]" style={{ animation: 'marquee 60s linear infinite' }}>
        {doubled.map((item, i) => (
          <span key={i} className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2.5">
            <span className="text-[var(--accent)] font-extrabold uppercase text-[10px] border-[1.5px] border-[var(--accent)] px-2 py-0.5 rounded">
              {item.tag}
            </span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  )
}
