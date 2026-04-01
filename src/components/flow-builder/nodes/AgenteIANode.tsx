'use client'

import type { NodeProps } from '@xyflow/react'
import type { FlowNode, AgenteIAData } from '../types'
import BaseNode from './BaseNode'

export default function AgenteIANode({ selected, data }: NodeProps<FlowNode>) {
  const d = data as AgenteIAData
  return (
    <BaseNode
      selected={selected}
      color="#7c3aed"
      gradient="linear-gradient(135deg, #7c3aed, #a855f7)"
      label={d.name || 'Agente IA'}
      icon={
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
        </svg>
      }
    >
      <p style={{ fontSize: '0.72rem', color: d.prompt ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', margin: 0, fontStyle: d.prompt ? 'normal' : 'italic' }}>
        {d.prompt ? (d.prompt.length > 60 ? d.prompt.slice(0, 60) + '…' : d.prompt) : 'Prompt do agente...'}
      </p>
      {d.persona && (
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {d.persona}
        </p>
      )}
    </BaseNode>
  )
}
