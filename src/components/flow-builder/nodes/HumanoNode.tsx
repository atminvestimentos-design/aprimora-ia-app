'use client'

import type { NodeProps } from '@xyflow/react'
import type { FlowNode, HumanoData } from '../types'
import BaseNode from './BaseNode'

export default function HumanoNode({ selected, data }: NodeProps<FlowNode>) {
  const d = data as HumanoData
  return (
    <BaseNode
      selected={selected}
      color="#db2777"
      gradient="linear-gradient(135deg, #db2777, #ec4899)"
      label="Atendente"
      icon={
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      }
    >
      <p style={{ fontSize: '0.72rem', color: d.message ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', margin: 0, fontStyle: d.message ? 'normal' : 'italic' }}>
        {d.message ? (d.message.length > 60 ? d.message.slice(0, 60) + '…' : d.message) : 'Mensagem de transferência...'}
      </p>
    </BaseNode>
  )
}
