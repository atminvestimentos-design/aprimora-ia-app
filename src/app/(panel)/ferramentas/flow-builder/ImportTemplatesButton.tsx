'use client'

import { useState } from 'react'
import { useActivityLogger } from '@/hooks/useActivityLogger'

export default function ImportTemplatesButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { log } = useActivityLogger()

  const handleImport = async () => {
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/flows/templates', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        // Log da atividade no dashboard
        await log({
          action: 'import-templates',
          tool: 'claude',
          tokens: 250, // Estimativa: POST + 3 inserts no banco
          description: 'Importou 3 templates (Briefing, Consultoria, Cobrança)'
        })

        setMessage('✅ Templates importados com sucesso!')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setMessage(`❌ ${data.message || 'Erro ao importar'}`)
      }
    } catch (err) {
      setMessage('❌ Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      <button
        onClick={handleImport}
        disabled={loading}
        style={{
          padding: '10px 20px',
          borderRadius: 8,
          background: loading ? 'rgba(255,255,255,0.08)' : 'rgba(6,200,216,0.15)',
          border: '1px solid rgba(6,200,216,0.3)',
          color: loading ? 'rgba(255,255,255,0.4)' : '#06C8D8',
          fontSize: '0.9rem',
          fontWeight: 700,
          cursor: loading ? 'default' : 'pointer',
          transition: 'all 0.15s',
          fontFamily: 'inherit',
        }}
      >
        {loading ? '⏳ Importando...' : '📦 Importar Templates'}
      </button>
      {message && (
        <p style={{ fontSize: '0.8rem', color: message.includes('✅') ? '#34d399' : '#ef4444', textAlign: 'right' }}>
          {message}
        </p>
      )}
    </div>
  )
}
