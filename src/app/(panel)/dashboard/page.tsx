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
    color: 'from-cyan-500 to-blue-500',
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
    color: 'from-violet-500 to-purple-500',
  },
  {
    label: 'Taxa de resposta',
    value: '—',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-500',
  },
  {
    label: 'Automações ativas',
    value: '—',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'from-orange-500 to-amber-500',
  },
]

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const nome = user?.user_metadata?.nome_completo?.split(' ')[0] || 'por aqui'

  return (
    <div className="p-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">
          Olá, {nome}! 👋
        </h1>
        <p className="text-white/40 text-base mt-1.5">
          Bem-vindo ao painel da Aprimora IA. Veja o resumo do seu negócio.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className={`w-13 h-13 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}
              style={{ width: 52, height: 52 }}>
              {stat.icon}
            </div>
            <p className="text-white/40 text-sm font-semibold uppercase tracking-wider mb-1.5">{stat.label}</p>
            <p className="text-4xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Cards de acesso rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <QuickCard
          title="Leads"
          description="Veja os contatos que chegaram pelo chat e acompanhe cada oportunidade."
          href="/leads"
          gradient="from-cyan-500 to-blue-600"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <QuickCard
          title="Chat Cobrança"
          description="Monitore conversas de cobrança e envie mensagens diretamente pelo WhatsApp."
          href="/cobranca/chat"
          gradient="from-violet-500 to-purple-600"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
        <QuickCard
          title="Devedores"
          description="Gerencie sua carteira de devedores e acompanhe o status de cada cobrança."
          href="/cobranca/devedores"
          gradient="from-emerald-500 to-teal-600"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>
    </div>
  )
}

function QuickCard({
  title, description, href, gradient, icon
}: {
  title: string
  description: string
  href: string
  gradient: string
  icon: React.ReactNode
}) {
  return (
    <Link href={href} className="group bg-white/5 rounded-2xl p-7 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-0.5">
      <div className={`rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-5`}
        style={{ width: 52, height: 52 }}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-white/40 text-base leading-relaxed">{description}</p>
      <div className="mt-5 flex items-center gap-1 text-base font-semibold text-white/30 group-hover:text-white/60 transition-colors">
        Acessar
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
