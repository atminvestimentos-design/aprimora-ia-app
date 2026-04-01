import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { RoteamentoData, FlowNode } from '../types'

export default function RoteamentoNode({ data, selected }: NodeProps<FlowNode>) {
  const d = data as RoteamentoData

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f97316, #fb923c)',
        border: `2px solid ${selected ? '#fff' : 'rgba(255,255,255,0.2)'}`,
        borderRadius: 8,
        padding: '12px',
        minWidth: 220,
        maxWidth: 280,
        color: '#fff',
        boxShadow: selected ? '0 0 12px rgba(249, 115, 22, 0.6)' : 'none',
      }}
    >
      {/* Input handle */}
      <Handle type="target" position={Position.Top} style={{ background: '#f97316' }} />

      {/* Title */}
      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>
        🔀 Roteamento
      </h4>

      {/* Routes preview */}
      {d.routes && d.routes.length > 0 ? (
        <div style={{ fontSize: '0.7rem', lineHeight: 1.4, marginBottom: 8 }}>
          {d.routes.map(route => (
            <div key={route.id} style={{ marginBottom: 4, color: 'rgba(255,255,255,0.9)' }}>
              <strong style={{ color: '#fff' }}>{route.label}:</strong>{' '}
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                {route.condition.length > 30 ? route.condition.slice(0, 30) + '...' : route.condition}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: '4px 0 8px 0' }}>
          Nenhuma rota configurada
        </p>
      )}

      {/* Output handles for each route */}
      {d.routes && d.routes.map((route, idx) => (
        <div key={route.id} style={{ position: 'relative', height: 8 }}>
          <Handle
            type="source"
            position={Position.Bottom}
            id={route.id}
            style={{
              bottom: -12 - idx * 20,
              background: '#fbbf24',
              width: 8,
              height: 8,
            }}
            title={route.label}
          />
        </div>
      ))}
    </div>
  )
}
