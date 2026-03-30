import { createServerSupabaseClient } from '@/lib/supabase/server'

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
        <h1 className="text-3xl font-bold text-slate-900">
          Olá, {nome}! 👋
        </h1>
        <p className="text-slate-400 text-base mt-1.5">
          Bem-vindo ao painel da Aprimora IA. Veja o resumo do seu negócio.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className={`w-13 h-13 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4`}
              style={{ width: 52, height: 52 }}>
              {stat.icon}
            </div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1.5">{stat.label}</p>
            <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
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
          title="Config da IA"
          description="Personalize como a IA se apresenta, quais serviços oferece e como responde."
          href="/ia-config"
          gradient="from-violet-500 to-purple-600"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          }
        />
        <QuickCard
          title="Usuários"
          description="Gerencie quem tem acesso ao painel e defina as permissões de cada membro."
          href="/usuarios"
          gradient="from-emerald-500 to-teal-600"
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
    <a href={href} className="group bg-white rounded-2xl p-7 shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className={`rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-5`}
        style={{ width: 52, height: 52 }}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-400 text-base leading-relaxed">{description}</p>
      <div className="mt-5 flex items-center gap-1 text-base font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
        Acessar
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  )
}
