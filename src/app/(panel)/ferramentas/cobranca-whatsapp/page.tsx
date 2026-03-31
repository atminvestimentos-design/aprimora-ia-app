import Link from 'next/link'

const steps = [
  {
    number: 1,
    title: 'Conectar o WhatsApp',
    description: 'Acesse as configurações do WhatsApp e vincule seu número ao sistema.',
    href: '/configuracoes/whatsapp',
    linkLabel: 'Ir para Configurações → WhatsApp',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    borderActive: 'border-emerald-500/30',
    details: [
      'Clique em "Conectar WhatsApp" na tela de configurações',
      'Um QR Code será gerado automaticamente',
      'Abra o WhatsApp no seu celular',
      'Vá em Configurações → Dispositivos conectados → Conectar dispositivo',
      'Aponte a câmera para o QR Code na tela',
      'Aguarde a confirmação de conexão',
    ],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Cadastrar um Devedor',
    description: 'Adicione os dados do seu cliente na lista de devedores com o número de WhatsApp.',
    href: '/cobranca/devedores/novo',
    linkLabel: 'Ir para Devedores → Novo',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    borderActive: 'border-blue-500/30',
    details: [
      'Clique em "Novo Devedor" na tela de devedores',
      'Preencha o nome completo do cliente',
      'Informe o número de WhatsApp com DDD (ex: 11987654321)',
      'Adicione o valor da dívida e uma descrição',
      'Salve o cadastro',
    ],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Iniciar a Conversa no Chat',
    description: 'Acesse o chat, selecione o devedor e envie sua primeira mensagem de cobrança.',
    href: '/cobranca/chat',
    linkLabel: 'Ir para o Chat de Cobrança',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    borderActive: 'border-cyan-500/30',
    details: [
      'Acesse o menu "Chat" na seção Cobrança',
      'Selecione o devedor na lista à esquerda',
      'Digite sua mensagem de cobrança na caixa de texto',
      'Pressione Enter ou clique no botão enviar',
      'A mensagem chega diretamente no WhatsApp do cliente',
      'Quando o cliente responder, você verá aqui no chat',
    ],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
]

const tips = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Use o número com DDD e sem espaços ou caracteres especiais (ex: 11987654321)',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    text: 'Mantenha o celular conectado à internet para o WhatsApp funcionar',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Mensagens enviadas aparecem com ✓✓ quando confirmadas pelo WhatsApp',
  },
]

export default function CobrancaWhatsappPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628] min-h-screen">
      <div className="max-w-3xl mx-auto px-8 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/30 mb-8">
          <Link href="/ferramentas" className="hover:text-white/60 transition-colors">Ferramentas</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white/60">Cobrança via WhatsApp</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cobrança via WhatsApp</h1>
              <p className="text-white/40 text-sm mt-0.5">Como começar em 3 passos simples</p>
            </div>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            Siga o guia abaixo para configurar e começar a usar a ferramenta de cobrança.
            O processo leva menos de 5 minutos.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-5 mb-10">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              className={`relative rounded-2xl border ${step.borderActive} bg-white/[0.03] overflow-hidden`}
            >
              {/* Linha conectora */}
              {idx < steps.length - 1 && (
                <div className="absolute left-[2.35rem] top-full w-px h-5 bg-white/10 z-10" />
              )}

              <div className="p-6">
                {/* Header do step */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl ${step.iconBg} flex items-center justify-center ${step.iconColor}`}>
                      {step.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Passo {step.number}</span>
                    </div>
                    <h2 className="text-base font-bold text-white mb-1">{step.title}</h2>
                    <p className="text-white/40 text-sm">{step.description}</p>
                  </div>
                </div>

                {/* Detalhes */}
                <div className="ml-14 space-y-2 mb-5">
                  {step.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-white/30">{i + 1}</span>
                      </div>
                      <span className="text-white/50 text-sm leading-relaxed">{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Botão de ação */}
                <div className="ml-14">
                  <Link
                    href={step.href}
                    className={`inline-flex items-center gap-2 text-sm font-semibold ${step.iconColor} hover:opacity-80 transition-opacity`}
                  >
                    {step.linkLabel}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dicas */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-semibold text-white/60">Dicas importantes</span>
          </div>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-amber-400/60 flex-shrink-0 mt-0.5">{tip.icon}</span>
                <span className="text-white/40 text-sm leading-relaxed">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/ferramentas"
            className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Ferramentas
          </Link>
          <Link
            href="/configuracoes/whatsapp"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-colors"
          >
            Começar agora
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  )
}
