'use client'

import type { NodeProps } from '@xyflow/react'
import type { FlowNode } from '../types'
import BaseNode from './BaseNode'

export default function InicioNode({ selected }: NodeProps<FlowNode>) {
  return (
    <BaseNode
      selected={selected}
      color="#06C8D8"
      gradient="linear-gradient(135deg, #06C8D8, #0891b2)"
      label="Início"
      icon={
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      hideTargetHandle
    >
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
        Canal: WhatsApp
      </p>
    </BaseNode>
  )
}
