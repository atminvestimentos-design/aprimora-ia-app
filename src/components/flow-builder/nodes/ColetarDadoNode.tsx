'use client'

import type { NodeProps } from '@xyflow/react'
import type { FlowNode, ColetarDadoData } from '../types'
import BaseNode from './BaseNode'

export default function ColetarDadoNode({ selected, data }: NodeProps<FlowNode>) {
  const d = data as ColetarDadoData
  return (
    <BaseNode
      selected={selected}
      color="#d97706"
      gradient="linear-gradient(135deg, #d97706, #f59e0b)"
      label="Coletar Dado"
      icon={
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      }
    >
      <p style={{ fontSize: '0.72rem', color: d.variableName ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', margin: 0, fontStyle: d.variableName ? 'normal' : 'italic' }}>
        {d.variableName ? `Salvar em: {{${d.variableName}}}` : 'Nome da variável...'}
      </p>
      {d.question && (
        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
          {d.question.length > 50 ? d.question.slice(0, 50) + '…' : d.question}
        </p>
      )}
    </BaseNode>
  )
}
