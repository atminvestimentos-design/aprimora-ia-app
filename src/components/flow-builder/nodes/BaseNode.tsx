'use client'

import { Handle, Position } from '@xyflow/react'
import type { ReactNode } from 'react'

interface BaseNodeProps {
  selected: boolean
  color: string
  gradient: string
  label: string
  icon: ReactNode
  children?: ReactNode
  hideTargetHandle?: boolean
  hideSourceHandle?: boolean
  /** For Condição: render two bottom handles instead of one */
  dualSourceHandles?: boolean
}

export default function BaseNode({
  selected,
  color,
  gradient,
  label,
  icon,
  children,
  hideTargetHandle,
  hideSourceHandle,
  dualSourceHandles,
}: BaseNodeProps) {
  return (
    <div
      style={{
        minWidth: 200,
        background: 'rgba(10,22,40,0.95)',
        border: `1.5px solid ${selected ? color : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 14,
        boxShadow: selected ? `0 0 0 3px ${color}30` : '0 4px 24px rgba(0,0,0,0.4)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        background: gradient,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{ color: '#fff', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>
          {label}
        </span>
      </div>

      {/* Body */}
      {children && (
        <div style={{ padding: '10px 14px' }}>
          {children}
        </div>
      )}

      {/* Target handle (top) */}
      {!hideTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: color,
            width: 10,
            height: 10,
            border: '2px solid #0a1628',
            top: -5,
          }}
        />
      )}

      {/* Source handle(s) (bottom) */}
      {!hideSourceHandle && !dualSourceHandles && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: color,
            width: 10,
            height: 10,
            border: '2px solid #0a1628',
            bottom: -5,
          }}
        />
      )}

      {dualSourceHandles && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{
              background: '#059669',
              width: 10,
              height: 10,
              border: '2px solid #0a1628',
              bottom: -5,
              left: '28%',
            }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{
              background: '#ef4444',
              width: 10,
              height: 10,
              border: '2px solid #0a1628',
              bottom: -5,
              left: '72%',
            }}
          />
        </>
      )}
    </div>
  )
}
