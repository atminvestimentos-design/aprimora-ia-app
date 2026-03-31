'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewFlowButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setLoading(true)
    try {
      const res = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Novo Fluxo' }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message ?? 'Erro ao criar fluxo.'); return }
      router.push(`/ferramentas/flow-builder/${data.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 22px', borderRadius: 10,
        background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #06C8D8, #2563EB)',
        color: loading ? 'rgba(255,255,255,0.4)' : '#fff',
        fontSize: '0.88rem', fontWeight: 700,
        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', flexShrink: 0,
      }}
    >
      {loading ? 'Criando...' : '+ Novo Fluxo'}
    </button>
  )
}
