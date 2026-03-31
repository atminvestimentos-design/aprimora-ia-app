import Link from 'next/link'

const tools = [
  {
    href: '/ferramentas/cobranca-whatsapp',
    title: 'Cobrança via WhatsApp',
    description: 'Automatize sua cobrança enviando mensagens diretamente pelo WhatsApp. Cadastre devedores, acompanhe conversas e gerencie negociações em um só lugar.',
    badge: 'Disponível',
    steps: ['Conectar WhatsApp', 'Cadastrar devedores', 'Conversar no chat'],
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
]

const comingSoon = [
  {
    title: 'Agendamento Inteligente',
    description: 'Envie cobranças automáticas em horários estratégicos com base no perfil do devedor.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Relatórios de Recuperação',
    description: 'Dashboards com taxa de resposta, tempo médio de pagamento e performance da cobrança.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'IA de Negociação',
    description: 'Assistente inteligente que sugere propostas e responde dúvidas automaticamente.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
  },
]

export default function FerramentasPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628] min-h-screen" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-12">

        {/* Header */}
        <div className="mb-12">
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#06C8D8', marginBottom: 12 }}>
            RECURSOS DA PLATAFORMA
          </p>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.15, color: '#fff', marginBottom: 16 }}>
            Ferramentas para{' '}
            <span style={{ background: 'linear-gradient(90deg, #06C8D8, #2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              seu negócio
            </span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 520 }}>
            Escolha uma ferramenta e siga o guia de configuração. Em minutos você estará operando.
          </p>
        </div>

        {/* Disponíveis */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 20 }}>
            DISPONÍVEIS AGORA
          </p>

          {tools.map(tool => (
            <Link key={tool.href} href={tool.href} style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(6,200,216,0.08) 0%, rgba(37,99,235,0.05) 100%)',
                border: '1px solid rgba(6,200,216,0.2)',
                borderRadius: 20,
                padding: '32px 36px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 24,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
                className="hover:border-cyan-400/40"
              >
                {/* Ícone */}
                <div style={{
                  width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(6,200,216,0.15), rgba(37,99,235,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#06C8D8',
                }}>
                  {tool.icon}
                </div>

                {/* Texto */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{tool.title}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                      padding: '3px 10px', borderRadius: 999,
                      background: 'rgba(6,200,216,0.12)', color: '#06C8D8',
                      border: '1px solid rgba(6,200,216,0.25)',
                      textTransform: 'uppercase',
                    }}>
                      {tool.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 20, maxWidth: 560 }}>
                    {tool.description}
                  </p>

                  {/* Steps */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {tool.steps.map((step, i) => (
                      <span key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.07)',
                          color: 'rgba(255,255,255,0.35)',
                          fontSize: 10, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>{i + 1}</span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{step}</span>
                        {i < tool.steps.length - 1 && (
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(255,255,255,0.15)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Seta */}
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: 4 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Em breve */}
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 20 }}>
            EM BREVE
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comingSoon.map(tool => (
              <div key={tool.title} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: '24px',
                opacity: 0.55,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.3)', marginBottom: 16,
                }}>
                  {tool.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{tool.title}</span>
                </div>
                <span style={{
                  display: 'inline-block', fontSize: '0.6rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: 10,
                }}>Em breve</span>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, margin: 0 }}>
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
