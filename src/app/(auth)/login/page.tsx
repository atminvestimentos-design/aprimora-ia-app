'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type Tab = 'entrar' | 'cadastrar'

const features = [
  'Painel de leads em tempo real',
  'Configuração da IA de atendimento',
  'Relatórios e métricas do negócio',
  'Gerenciamento de automações',
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('entrar')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [regNome, setRegNome] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regSenha, setRegSenha] = useState('')
  const [regConf, setRegConf] = useState('')

  function switchTab(t: Tab) { setTab(t); setError(''); setSuccess('') }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginSenha })
    if (error) { setError('E-mail ou senha incorretos.'); setLoading(false); return }
    router.push('/dashboard')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (regSenha !== regConf) { setError('As senhas não coincidem.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email: regEmail, password: regSenha,
      options: { data: { nome_completo: regNome } }
    })
    if (error) {
      setError(error.message === 'User already registered' ? 'Este e-mail já está cadastrado.' : 'Erro ao criar conta. Tente novamente.')
      setLoading(false); return
    }
    setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
    setLoading(false)
  }

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: 'var(--font-poppins), sans-serif' }}>

      {/* ── ESQUERDA ── */}
      <div style={{
        background: 'linear-gradient(140deg, #060A10 0%, #0A0E1A 50%, #081224 100%)',
        flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start',
        padding: '64px', position: 'relative', overflow: 'hidden'
      }} className="hidden lg:flex">

        {/* Brilho topo-direito */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-20%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.14), transparent 65%)',
          pointerEvents: 'none'
        }} />
        {/* Brilho baixo-esquerdo */}
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,200,216,0.10), transparent 65%)',
          pointerEvents: 'none'
        }} />

        {/* Logo */}
        <div style={{ marginBottom: 56, position: 'relative', zIndex: 1 }}>
          <Image src="/logo.png" alt="Aprimora IA" width={260} height={66} style={{ height: 66, width: 'auto' }} />
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.2,
          marginBottom: 20, position: 'relative', zIndex: 1, color: '#fff'
        }}>
          Seu negócio no<br />
          <span style={{
            background: 'linear-gradient(90deg, #06C8D8, #2563EB)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>
            piloto automático.
          </span>
        </h1>

        {/* Descrição */}
        <p style={{
          fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.7, maxWidth: 400, position: 'relative', zIndex: 1
        }}>
          Acesse o painel da Aprimora IA e gerencie suas automações, leads e configurações de IA em um só lugar.
        </p>

        {/* Features */}
        <ul style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1, listStyle: 'none', padding: 0 }}>
          {features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'linear-gradient(135deg, #06C8D8, #2563EB)', flexShrink: 0, display: 'inline-block' }} />
              {f}
            </li>
          ))}
        </ul>
      </div>


      {/* ── DIREITA ── */}
      <div style={{
        background: '#F7F9FC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px'
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          {/* Logo mobile */}
          <div className="flex lg:hidden justify-center" style={{ marginBottom: 32 }}>
            <Image src="/logo.png" alt="Aprimora IA" width={180} height={48} style={{ height: 48, width: 'auto' }} />
          </div>

          <h2 style={{ fontSize: '2.1rem', fontWeight: 700, color: '#0A0E1A', marginBottom: 8 }}>
            {tab === 'entrar' ? 'Bem-vindo de volta' : 'Criar conta'}
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.45)', marginBottom: 36 }}>
            {tab === 'entrar' ? 'Entre com seus dados para acessar o painel.' : 'Preencha os dados para criar seu acesso.'}
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid rgba(0,0,0,0.08)', marginBottom: 30 }}>
            {(['entrar', 'cadastrar'] as Tab[]).map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{
                padding: '10px 22px', fontSize: '1rem', fontWeight: 600,
                color: tab === t ? '#06C8D8' : 'rgba(0,0,0,0.4)',
                cursor: 'pointer', border: 'none', background: 'none',
                fontFamily: 'inherit',
                borderBottom: `2px solid ${tab === t ? '#06C8D8' : 'transparent'}`,
                marginBottom: -2, transition: 'all 0.2s'
              }}>
                {t === 'entrar' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {/* Mensagens */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem', padding: '12px 16px', borderRadius: 10, marginBottom: 20 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', color: '#0e7490', fontSize: '0.875rem', padding: '12px 16px', borderRadius: 10, marginBottom: 20 }}>
              {success}
            </div>
          )}

          {/* Form Entrar */}
          {tab === 'entrar' && (
            <form onSubmit={handleLogin}>
              <Field label="E-mail">
                <input type="email" placeholder="seu@email.com" required value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Senha">
                <input type="password" placeholder="••••••••" required value={loginSenha}
                  onChange={e => setLoginSenha(e.target.value)} style={inputStyle} />
              </Field>
              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? 'Entrando...' : 'Entrar no painel'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(0,0,0,0.45)', marginTop: 20 }}>
                Não tem conta?{' '}
                <button type="button" onClick={() => switchTab('cadastrar')}
                  style={{ color: '#06C8D8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cadastre-se
                </button>
              </p>
            </form>
          )}

          {/* Form Cadastrar */}
          {tab === 'cadastrar' && (
            <form onSubmit={handleRegister}>
              <Field label="Nome completo">
                <input placeholder="Seu nome" required value={regNome}
                  onChange={e => setRegNome(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="E-mail">
                <input type="email" placeholder="seu@email.com" required value={regEmail}
                  onChange={e => setRegEmail(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Senha">
                <input type="password" placeholder="Mínimo 6 caracteres" minLength={6} required value={regSenha}
                  onChange={e => setRegSenha(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Confirmar senha">
                <input type="password" placeholder="Repita a senha" required value={regConf}
                  onChange={e => setRegConf(e.target.value)} style={inputStyle} />
              </Field>
              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? 'Criando conta...' : 'Criar minha conta'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(0,0,0,0.45)', marginTop: 20 }}>
                Já tem conta?{' '}
                <button type="button" onClick={() => switchTab('entrar')}
                  style={{ color: '#06C8D8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Entrar
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 18px',
  border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 10,
  fontSize: '1.05rem', fontFamily: 'inherit',
  color: '#0A0E1A', background: '#fff', outline: 'none',
}

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '15px', marginTop: 8,
  background: 'linear-gradient(135deg, #06C8D8, #2563EB)',
  color: '#fff', fontWeight: 700, fontSize: '1.1rem',
  border: 'none', borderRadius: 10, cursor: 'pointer',
  fontFamily: 'inherit', letterSpacing: '0.01em',
}
