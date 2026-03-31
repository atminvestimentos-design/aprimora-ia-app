'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const steps = [
  {
    id: 1,
    title: 'Conectar WhatsApp',
    shortTitle: 'WhatsApp',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    ringColor: 'ring-emerald-500/40',
    activeBar: 'bg-emerald-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    heading: 'Conecte seu WhatsApp',
    description: 'Vincule seu número de WhatsApp ao sistema para poder enviar e receber mensagens diretamente pela plataforma.',
    details: [
      { label: 'Acesse as configurações', text: 'Clique no botão abaixo para ir às configurações do WhatsApp.' },
      { label: 'Clique em "Conectar WhatsApp"', text: 'Um QR Code será gerado automaticamente na tela.' },
      { label: 'Abra o WhatsApp no celular', text: 'Vá em Configurações → Dispositivos conectados → Conectar dispositivo.' },
      { label: 'Escaneie o QR Code', text: 'Aponte a câmera do celular para o código na tela e aguarde a confirmação.' },
    ],
    actionLabel: 'Ir para Configurações do WhatsApp',
    actionHref: '/configuracoes/whatsapp',
    tip: 'Mantenha o celular com internet ativa. Após escanear, aguarde a mensagem de "Conectado" antes de avançar.',
  },
  {
    id: 2,
    title: 'Cadastrar Devedor',
    shortTitle: 'Devedor',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    ringColor: 'ring-blue-500/40',
    activeBar: 'bg-blue-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    heading: 'Cadastre um devedor',
    description: 'Adicione os dados do cliente que você quer cobrar. O número de WhatsApp é essencial para o envio das mensagens.',
    details: [
      { label: 'Clique em "Novo Devedor"', text: 'Você será redirecionado para o formulário de cadastro.' },
      { label: 'Preencha os dados', text: 'Nome completo, número de WhatsApp com DDD (ex: 11987654321) e valor da dívida.' },
      { label: 'Salve o cadastro', text: 'O devedor aparecerá na lista e ficará disponível no chat.' },
    ],
    actionLabel: 'Ir para Novo Devedor',
    actionHref: '/cobranca/devedores/novo',
    tip: 'Use o número sem espaços, traços ou parênteses. Só números com DDD (ex: 11987654321).',
  },
  {
    id: 3,
    title: 'Iniciar Cobrança',
    shortTitle: 'Chat',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    ringColor: 'ring-cyan-500/40',
    activeBar: 'bg-cyan-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    heading: 'Comece a cobrar no chat',
    description: 'Agora é só abrir o chat, selecionar o devedor e enviar sua mensagem. Ela chega direto no WhatsApp do cliente.',
    details: [
      { label: 'Selecione o devedor', text: 'Na lista à esquerda do chat, clique no devedor que você acabou de cadastrar.' },
      { label: 'Digite sua mensagem', text: 'Escreva o texto de cobrança na caixa no rodapé do chat.' },
      { label: 'Envie e acompanhe', text: 'Pressione Enter ou clique em enviar. A mensagem chega no WhatsApp do cliente. Quando ele responder, aparece aqui.' },
    ],
    actionLabel: 'Abrir o Chat de Cobrança',
    actionHref: '/cobranca/chat',
    tip: 'O ícone ✓✓ confirma que a mensagem chegou ao WhatsApp do cliente. Respostas aparecem automaticamente.',
  },
]

export default function CobrancaWhatsappPage() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()
  const step = steps[current]
  const isLast = current === steps.length - 1

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/30 mb-8">
          <Link href="/ferramentas" className="hover:text-white/60 transition-colors">Ferramentas</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white/50">Cobrança via WhatsApp</span>
        </div>

        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center gap-0">
            {steps.map((s, idx) => {
              const done = idx < current
              const active = idx === current
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  {/* Círculo */}
                  <button
                    onClick={() => idx < current && setCurrent(idx)}
                    disabled={idx > current}
                    className={`flex flex-col items-center gap-1.5 group ${idx < current ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                      ${done ? 'bg-white/10 text-white/60 ring-2 ring-white/20' : ''}
                      ${active ? `${s.iconBg} ${s.iconColor} ring-2 ${s.ringColor}` : ''}
                      ${!done && !active ? 'bg-white/5 text-white/20' : ''}
                    `}>
                      {done ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold">{s.id}</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap transition-colors
                      ${active ? s.iconColor : done ? 'text-white/40' : 'text-white/20'}
                    `}>
                      {s.shortTitle}
                    </span>
                  </button>

                  {/* Linha conectora */}
                  {idx < steps.length - 1 && (
                    <div className="flex-1 h-px mx-3 mb-5 relative overflow-hidden rounded-full bg-white/10">
                      <div className={`absolute inset-y-0 left-0 transition-all duration-500 ${done ? 'w-full bg-white/30' : 'w-0'}`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Card do passo */}
        <div className={`rounded-2xl border ${step.ringColor.replace('ring-', 'border-').replace('/40', '/30')} bg-white/[0.03] overflow-hidden mb-6`}>
          {/* Cabeçalho */}
          <div className={`px-7 py-6 border-b border-white/5 flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center flex-shrink-0 ${step.iconColor}`}>
              {step.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-white/20 uppercase tracking-widest mb-0.5">Passo {step.id} de {steps.length}</p>
              <h2 className="text-xl font-bold text-white">{step.heading}</h2>
            </div>
          </div>

          {/* Corpo */}
          <div className="px-7 py-6">
            <p className="text-white/50 text-sm leading-relaxed mb-7">{step.description}</p>

            {/* Sub-passos */}
            <div className="space-y-4 mb-7">
              {step.details.map((d, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full ${step.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <span className={`text-[10px] font-bold ${step.iconColor}`}>{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-semibold">{d.label}</p>
                    <p className="text-white/40 text-sm mt-0.5">{d.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Botão de ação */}
            <Link
              href={step.actionHref}
              target="_blank"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors
                ${step.iconBg} ${step.iconColor} ${step.ringColor.replace('ring-', 'border-').replace('/40', '/30')}
                hover:opacity-80`}
            >
              {step.actionLabel}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>

          {/* Dica */}
          <div className="px-7 py-4 bg-white/[0.02] border-t border-white/5 flex items-start gap-3">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-white/35 text-xs leading-relaxed">{step.tip}</p>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between">
          {current > 0 ? (
            <button
              onClick={() => setCurrent(c => c - 1)}
              className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
          ) : (
            <Link href="/ferramentas" className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </Link>
          )}

          {isLast ? (
            <button
              onClick={() => router.push('/cobranca/chat')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
            >
              Ir para o Chat
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors
                ${step.iconBg} ${step.iconColor} border ${step.ringColor.replace('ring-', 'border-').replace('/40', '/30')}
                hover:opacity-80`}
            >
              Próximo passo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
