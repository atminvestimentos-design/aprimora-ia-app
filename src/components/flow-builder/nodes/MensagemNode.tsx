'use client'

import type { NodeProps } from '@xyflow/react'
import type { FlowNode, MensagemData } from '../types'
import BaseNode from './BaseNode'

export default function MensagemNode({ selected, data }: NodeProps<FlowNode>) {
  const d = data as MensagemData
  return (
    <BaseNode
      selected={selected}
      color="#2563EB"
      gradient="linear-gradient(135deg, #2563EB, #1d4ed8)"
      label="Mensagem"
      icon={
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      }
    >
      <p style={{ fontSize: '0.72rem', color: d.text ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', margin: 0, fontStyle: d.text ? 'normal' : 'italic' }}>
        {d.text ? (d.text.length > 60 ? d.text.slice(0, 60) + '…' : d.text) : 'Texto da mensagem...'}
      </p>
    </BaseNode>
  )
}
