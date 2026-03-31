'use client'

import { BLOCK_PALETTE_ITEMS } from './types'

export default function BlockPalette() {
  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: '#060d1f',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          BLOCOS
        </p>
      </div>

      {/* Draggable items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', margin: '0 4px 8px', letterSpacing: '0.05em' }}>
          Arraste para o canvas
        </p>
        {BLOCK_PALETTE_ITEMS.map(item => (
          <div
            key={item.type}
            draggable
            onDragStart={e => {
              e.dataTransfer.setData('application/reactflow-type', item.type)
              e.dataTransfer.effectAllowed = 'move'
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 10px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.03)',
              cursor: 'grab',
              marginBottom: 6,
              transition: 'background 0.15s, border-color 0.15s',
              userSelect: 'none',
            }}
            className="hover:bg-white/[0.06] hover:border-white/20 active:cursor-grabbing"
            title={item.description}
          >
            {/* Color dot */}
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: item.gradient,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                {item.label}
              </p>
              <p style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Help tip */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)', margin: 0, lineHeight: 1.5 }}>
          Clique em um bloco para configurá-lo. Delete para remover.
        </p>
      </div>
    </aside>
  )
}
