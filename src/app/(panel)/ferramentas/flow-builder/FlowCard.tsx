'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Flow {
  id: string
  name: string
  description: string | null
  is_active: boolean
  updated_at: string
}

export default function FlowCard({ flow }: { flow: Flow }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Deletar o fluxo "${flow.name}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    try {
      await fetch(`/api/flows/${flow.id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <Link href={`/ferramentas/flow-builder/${flow.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '20px 24px',
          transition: 'border-color 0.15s, background 0.15s',
          cursor: 'pointer',
        }}
          className="hover:bg-white/[0.06] hover:border-white/20 transition-all"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0, paddingRight: 32 }}>
              {flow.name}
            </h3>
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
              padding: '2px 8px', borderRadius: 999,
              background: flow.is_active ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.05)',
              color: flow.is_active ? '#34d399' : 'rgba(255,255,255,0.3)',
              border: flow.is_active ? '1px solid rgba(5,150,105,0.3)' : '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}>
              {flow.is_active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          {flow.description && (
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, marginBottom: 12 }}>
              {flow.description}
            </p>
          )}
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            Atualizado em {new Date(flow.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </Link>

      {/* Delete button — overlaid top-right */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Deletar fluxo"
        style={{
          position: 'absolute', top: 14, right: 14,
          width: 28, height: 28, borderRadius: 7,
          background: 'rgba(239,68,68,0.0)',
          border: '1px solid transparent',
          color: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: deleting ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          zIndex: 1,
        }}
        className="hover:!bg-red-500/20 hover:!border-red-500/30 hover:!text-red-400"
      >
        {deleting ? (
          <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
        ) : (
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
    </div>
  )
}
