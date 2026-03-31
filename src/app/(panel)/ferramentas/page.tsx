import Link from 'next/link'

const tools = [
  {
    href: '/ferramentas/cobranca-whatsapp',
    title: 'Cobrança via WhatsApp',
    description: 'Automatize sua cobrança enviando mensagens diretamente pelo WhatsApp. Cadastre devedores, acompanhe conversas e gerencie negociações em um só lugar.',
    badge: 'Disponível',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/5',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    steps: ['Conectar WhatsApp', 'Cadastrar devedores', 'Conversar no chat'],
  },
]

const comingSoon = [
  {
    title: 'Agendamento Inteligente',
    description: 'Envie cobranças automáticas em horários estratégicos com base no perfil do devedor.',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Relatórios de Recuperação',
    description: 'Dashboards com taxa de resposta, tempo médio de pagamento e performance da cobrança.',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'IA de Negociação',
    description: 'Assistente inteligente que sugere propostas e responde dúvidas automaticamente.',
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
  },
]

export default function FerramentasPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628] min-h-screen">
      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Ferramentas</h1>
              <p className="text-white/40 text-sm">Recursos disponíveis para sua operação</p>
            </div>
          </div>
        </div>

        {/* Disponíveis */}
        <section className="mb-12">
          <p className="text-xs font-semibold text-white/20 uppercase tracking-widest mb-4">Disponíveis</p>
          <div className="grid grid-cols-1 gap-5">
            {tools.map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group relative rounded-2xl border bg-gradient-to-br ${tool.gradient} ${tool.borderColor} p-7 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 block`}
              >
                <div className="flex items-start gap-5">
                  {/* Ícone */}
                  <div className={`w-14 h-14 rounded-xl ${tool.iconBg} flex items-center justify-center flex-shrink-0 ${tool.iconColor}`}>
                    {tool.icon}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-bold text-white">{tool.title}</h2>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed mb-4">{tool.description}</p>

                    {/* Steps preview */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {tool.steps.map((step, i) => (
                        <span key={step} className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-white/10 text-white/40 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-white/40 text-xs">{step}</span>
                          {i < tool.steps.length - 1 && (
                            <svg className="w-3 h-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 text-white/20 group-hover:text-white/60 transition-colors mt-1">
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Em breve */}
        <section>
          <p className="text-xs font-semibold text-white/20 uppercase tracking-widest mb-4">Em breve</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {comingSoon.map(tool => (
              <div
                key={tool.title}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 opacity-60"
              >
                <div className={`w-12 h-12 rounded-xl ${tool.iconBg} flex items-center justify-center mb-4 ${tool.iconColor}`}>
                  {tool.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-white/70">{tool.title}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
                    Em breve
                  </span>
                </div>
                <p className="text-white/30 text-xs leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
