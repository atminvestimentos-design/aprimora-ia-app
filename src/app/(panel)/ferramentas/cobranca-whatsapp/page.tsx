'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const steps = [
  {
    id: 1,
    shortTitle: 'WhatsApp',
    heading: 'Conecte seu WhatsApp',
    description: 'Vincule seu número de WhatsApp ao sistema para enviar e receber mensagens diretamente pela plataforma.',
    accentColor: '#06C8D8',
    accentBg: 'rgba(6,200,216,0.1)',
    accentBorder: 'rgba(6,200,216,0.25)',
    details: [
      { label: 'Acesse as configurações', text: 'Clique no botão abaixo para ir à tela de configuração do WhatsApp.' },
      { label: 'Clique em "Conectar WhatsApp"', text: 'Um QR Code será gerado automaticamente na tela.' },
      { label: 'Abra o WhatsApp no celular', text: 'Vá em Configurações → Dispositivos conectados → Conectar dispositivo.' },
      { label: 'Escaneie o QR Code', text: 'Aponte a câmera para o código na tela e aguarde a confirmação de conexão.' },
    ],
    actionLabel: 'Ir para Configurações do WhatsApp',
    actionHref: '/configuracoes/whatsapp',
    tip: 'Mantenha o celular com internet ativa. Aguarde a mensagem "Conectado" antes de avançar.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 2,
    shortTitle: 'Devedor',
    heading: 'Cadastre um devedor',
    description: 'Adicione os dados do cliente que você quer cobrar. O número de WhatsApp é essencial para o envio das mensagens.',
    accentColor: '#2563EB',
    accentBg: 'rgba(37,99,235,0.1)',
    accentBorder: 'rgba(37,99,235,0.3)',
    details: [
      { label: 'Clique em "Novo Devedor"', text: 'Você será redirecionado para o formulário de cadastro.' },
      { label: 'Preencha os dados', text: 'Nome completo, número de WhatsApp com DDD (ex: 11987654321) e valor da dívida.' },
      { label: 'Salve o cadastro', text: 'O devedor aparecerá na lista e ficará disponível no chat.' },
    ],
    actionLabel: 'Ir para Novo Devedor',
    actionHref: '/cobranca/devedores/novo',
    tip: 'Use o número sem espaços, traços ou parênteses. Somente números com DDD (ex: 11987654321).',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    id: 3,
    shortTitle: 'Chat',
    heading: 'Comece a cobrar',
    description: 'Agora é só abrir o chat, selecionar o devedor e enviar sua mensagem. Ela chega direto no WhatsApp do cliente.',
    accentColor: '#06C8D8',
    accentBg: 'rgba(6,200,216,0.1)',
    accentBorder: 'rgba(6,200,216,0.25)',
    details: [
      { label: 'Selecione o devedor', text: 'Na lista à esquerda do chat, clique no devedor que você cadastrou.' },
      { label: 'Digite sua mensagem', text: 'Escreva o texto de cobrança na caixa no rodapé do chat.' },
      { label: 'Envie e acompanhe', text: 'Pressione Enter ou clique em enviar. Quando o cliente responder, a mensagem aparece aqui.' },
    ],
    actionLabel: 'Abrir o Chat de Cobrança',
    actionHref: '/cobranca/chat',
    tip: 'O ícone ✓✓ confirma que a mensagem chegou ao WhatsApp do cliente. Respostas aparecem automaticamente.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
]

export default function CobrancaWhatsappPage() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()
  const step = steps[current]
  const isLast = current === steps.length - 1

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628] min-h-screen" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
      <div className="px-4 py-8 md:px-8 md:py-12" style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
          <Link href="/ferramentas" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', fontWeight: 500 }}
            className="hover:text-white/50 transition-colors">
            Ferramentas
          </Link>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(255,255,255,0.2)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Cobrança via WhatsApp</span>
        </div>

        {/* Título */}
        <div style={{ marginBottom: 44 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#06C8D8', marginBottom: 10 }}>
            GUIA DE CONFIGURAÇÃO
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, color: '#fff', marginBottom: 12 }}>
            Configure em{' '}
            <span style={{ background: 'linear-gradient(90deg, #06C8D8, #2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              3 passos simples
            </span>
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
            Siga o guia abaixo. O processo leva menos de 5 minutos.
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          {steps.map((s, idx) => {
            const done = idx < current
            const active = idx === current
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
                <button
                  onClick={() => idx < current ? setCurrent(idx) : undefined}
                  disabled={idx > current}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    cursor: idx < current ? 'pointer' : 'default', background: 'none', border: 'none', padding: 0,
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    background: done ? 'rgba(255,255,255,0.08)' : active ? s.accentBg : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${done ? 'rgba(255,255,255,0.2)' : active ? s.accentColor : 'rgba(255,255,255,0.1)'}`,
                    color: done ? 'rgba(255,255,255,0.5)' : active ? s.accentColor : 'rgba(255,255,255,0.2)',
                  }}>
                    {done ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{s.id}</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    color: active ? s.accentColor : done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)',
                    letterSpacing: '0.04em',
                  }}>
                    {s.shortTitle}
                  </span>
                </button>

                {idx < steps.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: '0 10px', marginBottom: 20,
                    background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: done ? '100%' : '0%',
                      background: 'linear-gradient(90deg, #06C8D8, #2563EB)',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Card do passo */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          border: `1px solid ${step.accentBorder}`,
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          {/* Header do card */}
          <div style={{
            padding: '28px 32px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 18,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: step.accentBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step.accentColor,
            }}>
              {step.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: step.accentColor, marginBottom: 4 }}>
                PASSO {step.id} DE {steps.length}
              </p>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: 0 }}>
                {step.heading}
              </h2>
            </div>
          </div>

          {/* Corpo */}
          <div style={{ padding: '28px 32px' }}>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28 }}>
              {step.description}
            </p>

            {/* Sub-passos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
              {step.details.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: step.accentBg,
                    border: `1px solid ${step.accentBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.accentColor, fontSize: '0.7rem', fontWeight: 800,
                    marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>
                      {d.label}
                    </p>
                    <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, margin: 0 }}>
                      {d.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Botão de ação */}
            <Link href={step.actionHref} target="_blank" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 10,
              background: step.accentBg,
              border: `1px solid ${step.accentBorder}`,
              color: step.accentColor,
              fontSize: '0.88rem', fontWeight: 700,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }} className="hover:opacity-75">
              {step.actionLabel}
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>

          {/* Dica */}
          <div style={{
            padding: '16px 32px',
            background: 'rgba(255,255,255,0.015)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: 'rgba(251,191,36,0.7)', flexShrink: 0, marginTop: 1 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, margin: 0 }}>
              {step.tip}
            </p>
          </div>
        </div>

        {/* Navegação */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {current > 0 ? (
            <button onClick={() => setCurrent(c => c - 1)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: 'inherit',
            }} className="hover:text-white/60 transition-colors">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
          ) : (
            <Link href="/ferramentas" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none',
            }} className="hover:text-white/60 transition-colors">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </Link>
          )}

          {isLast ? (
            <button onClick={() => router.push('/cobranca/chat')} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 10,
              background: 'linear-gradient(135deg, #06C8D8, #2563EB)',
              color: '#fff', fontSize: '0.92rem', fontWeight: 700,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.01em',
            }} className="hover:opacity-90 transition-opacity">
              Ir para o Chat
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button onClick={() => setCurrent(c => c + 1)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 10,
              background: `linear-gradient(135deg, ${step.accentColor}, #2563EB)`,
              color: '#fff', fontSize: '0.92rem', fontWeight: 700,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.01em',
            }} className="hover:opacity-90 transition-opacity">
              Próximo passo
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
