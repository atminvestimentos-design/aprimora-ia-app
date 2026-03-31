'use client'

import type { NodeProps } from '@xyflow/react'
import type { FlowNode, CondicaoData } from '../types'
import BaseNode from './BaseNode'

export default function CondicaoNode({ selected, data }: NodeProps<FlowNode>) {
  const d = data as CondicaoData
  const operatorLabel = { '==': '=', '!=': '≠', 'contains': 'contém' }[d.operator] ?? d.operator
  return (
    <div style={{ position: 'relative' }}>
      <BaseNode
        selected={selected}
        color="#059669"
        gradient="linear-gradient(135deg, #059669, #14b8a6)"
        label="Condição"
        icon={
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        dualSourceHandles
      >
        <p style={{ fontSize: '0.72rem', color: d.variable ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', margin: 0, fontStyle: d.variable ? 'normal' : 'italic' }}>
          {d.variable ? `{{${d.variable}}} ${operatorLabel} "${d.value}"` : 'Configurar condição...'}
        </p>
        {/* Labels for handles */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#059669', letterSpacing: '0.08em' }}>SIM</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.08em' }}>NÃO</span>
        </div>
      </BaseNode>
    </div>
  )
}
