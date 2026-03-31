'use client'

import type { NodeProps } from '@xyflow/react'
import type { FlowNode, FinalizarData } from '../types'
import BaseNode from './BaseNode'

export default function FinalizarNode({ selected, data }: NodeProps<FlowNode>) {
  const d = data as FinalizarData
  return (
    <BaseNode
      selected={selected}
      color="#6b7280"
      gradient="linear-gradient(135deg, #4b5563, #6b7280)"
      label="Finalizar"
      icon={
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      }
      hideSourceHandle
    >
      <p style={{ fontSize: '0.72rem', color: d.farewell ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', margin: 0, fontStyle: d.farewell ? 'normal' : 'italic' }}>
        {d.farewell ? (d.farewell.length > 60 ? d.farewell.slice(0, 60) + '…' : d.farewell) : 'Mensagem de despedida...'}
      </p>
    </BaseNode>
  )
}
