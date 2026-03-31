import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

const stats = [
  {
    label: 'Leads este mês',
    value: '—',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #06b6d4, #2563EB)',
  },
  {
    label: 'Conversas ativas',
    value: '—',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  },
  {
    label: 'Taxa de resposta',
    value: '—',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #059669, #14b8a6)',
  },
  {
    label: 'Automações ativas',
    value: '—',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
  },
]

const quickCards = [
  {
    title: 'Leads',
    description: 'Veja os contatos que chegaram pelo chat e acompanhe cada oportunidade.',
    href: '/leads',
    gradient: 'linear-gradient(135deg, #06C8D8, #2563EB)',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Chat Cobrança',
    description: 'Monitore conversas de cobrança e envie mensagens diretamente pelo WhatsApp.',
    href: '/cobranca/chat',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'Devedores',
    description: 'Gerencie sua carteira de devedores e acompanhe o status de cada cobrança.',
    href: '/cobranca/devedores',
    gradient: 'linear-gradient(135deg, #059669, #14b8a6)',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
]

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const nome = user?.user_metadata?.nome_completo?.split(' ')[0] || 'por aqui'

  return (
    <div className="px-4 py-8 md:px-10 md:py-12" style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 44 }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#06C8D8', marginBottom: 10 }}>
          PAINEL PRINCIPAL
        </p>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 10 }}>
          Olá,{' '}
          <span style={{ background: 'linear-gradient(90deg, #06C8D8, #2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {nome}!
          </span>
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
          Bem-vindo ao painel da Aprimora IA. Veja o resumo do seu negócio.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 24,
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 12,
              background: stat.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', marginBottom: 18,
            }}>
              {stat.icon}
            </div>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick cards */}
      <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>
        ACESSO RÁPIDO
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickCards.map(card => (
          <Link key={card.href} href={card.href} style={{ textDecoration: 'none', display: 'block' }}
            className="group">
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 18, padding: 28,
              transition: 'border-color 0.2s, background 0.2s',
            }} className="group-hover:bg-white/[0.06] group-hover:border-white/20 transition-all">
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: card.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', marginBottom: 20,
              }}>
                {card.icon}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: 20 }}>
                {card.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)' }}
                className="group-hover:text-white/50 transition-colors">
                Acessar
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
