'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

type Tab = 'entrar' | 'cadastrar'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('entrar')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Entrar
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')

  // Cadastrar
  const [regNome, setRegNome] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regSenha, setRegSenha] = useState('')
  const [regConf, setRegConf] = useState('')

  function switchTab(t: Tab) {
    setTab(t)
    setError('')
    setSuccess('')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail, password: loginSenha
    })
    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (regSenha !== regConf) { setError('As senhas não coincidem.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regSenha,
      options: { data: { nome_completo: regNome } }
    })
    if (error) {
      setError(error.message === 'User already registered'
        ? 'Este e-mail já está cadastrado.'
        : 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }
    setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ESQUERDA */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-[#0A0E1A] relative overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />

        <a href="https://aprimoraia.com.br" className="mb-14 relative z-10">
          <Image src="/logo.png" alt="Aprimora IA" width={160} height={44} className="h-11 w-auto" />
        </a>

        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Seu negócio no<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              piloto automático.
            </span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-sm mb-10">
            Acesse o painel da Aprimora IA e gerencie suas automações, leads e configurações em um só lugar.
          </p>
          <ul className="space-y-4">
            {[
              'Painel de leads em tempo real',
              'Configuração da IA de atendimento',
              'Relatórios e métricas do negócio',
              'Gerenciamento de automações',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-white/60 text-sm">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* DIREITA */}
      <div className="flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Image src="/logo-dark.png" alt="Aprimora IA" width={140} height={38} className="h-10 w-auto" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {tab === 'entrar' ? 'Bem-vindo de volta' : 'Criar conta'}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {tab === 'entrar'
              ? 'Entre com seus dados para acessar o painel.'
              : 'Preencha os dados para criar seu acesso.'}
          </p>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            {(['entrar', 'cadastrar'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors capitalize ${
                  tab === t
                    ? 'border-cyan-500 text-cyan-500'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'entrar' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Form Entrar */}
          {tab === 'entrar' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">E-mail</Label>
                <Input className="mt-1.5" type="email" placeholder="seu@email.com" required
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Senha</Label>
                <Input className="mt-1.5" type="password" placeholder="••••••••" required
                  value={loginSenha} onChange={e => setLoginSenha(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold py-3 mt-2">
                {loading ? 'Entrando...' : 'Entrar no painel'}
              </Button>
              <p className="text-center text-sm text-slate-400 mt-3">
                Não tem conta?{' '}
                <button type="button" onClick={() => switchTab('cadastrar')}
                  className="text-cyan-500 font-semibold hover:underline">
                  Cadastre-se
                </button>
              </p>
            </form>
          )}

          {/* Form Cadastrar */}
          {tab === 'cadastrar' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nome completo</Label>
                <Input className="mt-1.5" placeholder="Seu nome" required
                  value={regNome} onChange={e => setRegNome(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">E-mail</Label>
                <Input className="mt-1.5" type="email" placeholder="seu@email.com" required
                  value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Senha</Label>
                <Input className="mt-1.5" type="password" placeholder="Mínimo 6 caracteres" minLength={6} required
                  value={regSenha} onChange={e => setRegSenha(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmar senha</Label>
                <Input className="mt-1.5" type="password" placeholder="Repita a senha" required
                  value={regConf} onChange={e => setRegConf(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold py-3 mt-2">
                {loading ? 'Criando conta...' : 'Criar minha conta'}
              </Button>
              <p className="text-center text-sm text-slate-400 mt-3">
                Já tem conta?{' '}
                <button type="button" onClick={() => switchTab('entrar')}
                  className="text-cyan-500 font-semibold hover:underline">
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
