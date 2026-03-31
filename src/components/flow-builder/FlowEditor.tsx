'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type NodeMouseHandler,
} from '@xyflow/react'

import type { FlowNode, FlowEdge, FlowNodeData } from './types'
import FlowCanvas from './FlowCanvas'
import BlockPalette from './BlockPalette'
import ConfigPanel from './ConfigPanel'
import EditorToolbar from './EditorToolbar'

interface FlowEditorProps {
  flowId: string
}

function FlowEditorInner({ flowId }: FlowEditorProps) {
  const router = useRouter()

  // ── Canvas state (React Flow) ───────────────────────────────────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([])

  // ── App state ───────────────────────────────────────────────────────────────
  const [flowName, setFlowName]     = useState('Novo Fluxo')
  const [isActive, setIsActive]     = useState(false)
  const [isSaving, setIsSaving]     = useState(false)
  const [isDirty, setIsDirty]       = useState(false)
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  // ── Load flow ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/flows/${flowId}`)
      .then(r => r.json())
      .then(d => {
        if (d.message) { setError(d.message); return }
        setFlowName(d.name ?? 'Novo Fluxo')
        setIsActive(d.is_active ?? false)
        setNodes(Array.isArray(d.nodes) ? d.nodes : [])
        setEdges(Array.isArray(d.edges) ? d.edges : [])
      })
      .catch(() => setError('Erro ao carregar o fluxo.'))
      .finally(() => setLoading(false))
  }, [flowId, setNodes, setEdges])

  // ── Mark dirty on canvas changes (only after load) ──────────────────────────
  const markDirty = useCallback(() => {
    if (!loading) setIsDirty(true)
  }, [loading])

  const handleNodesChange: typeof onNodesChange = useCallback((changes) => {
    onNodesChange(changes)
    markDirty()
  }, [onNodesChange, markDirty])

  const handleEdgesChange: typeof onEdgesChange = useCallback((changes) => {
    onEdgesChange(changes)
    markDirty()
  }, [onEdgesChange, markDirty])

  // ── Node click ──────────────────────────────────────────────────────────────
  const handleNodeClick: NodeMouseHandler<FlowNode> = useCallback((_e, node) => {
    setSelectedNode(node)
  }, [])

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // ── Node data update (from ConfigPanel) ─────────────────────────────────────
  const handleNodeUpdate = useCallback((nodeId: string, partial: Partial<FlowNodeData>) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...partial } as FlowNodeData } : n
    ))
    setSelectedNode(prev => prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...partial } as FlowNodeData } : prev)
    setIsDirty(true)
  }, [setNodes])

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      // Strip runtime-only fields React Flow adds
      const cleanNodes = nodes.map(({ ...n }) => {
        const clean = { ...n }
        delete (clean as Record<string, unknown>).positionAbsolute
        delete (clean as Record<string, unknown>).measured
        return clean
      })

      const res = await fetch(`/api/flows/${flowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: flowName,
          nodes: cleanNodes,
          edges,
          is_active: isActive,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        alert(d.message ?? 'Erro ao salvar.')
        return
      }
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }, [flowId, flowName, nodes, edges, isActive])

  // ── Back ────────────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (isDirty && !confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) return
    router.push('/ferramentas/flow-builder')
  }, [isDirty, router])

  // ── Name / active changes ───────────────────────────────────────────────────
  const handleNameChange = useCallback((v: string) => {
    setFlowName(v)
    setIsDirty(true)
  }, [])

  const handleToggleActive = useCallback(() => {
    setIsActive(v => !v)
    setIsDirty(true)
  }, [])

  const onConnect: OnConnect = useCallback(() => {
    setIsDirty(true)
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
        Carregando fluxo...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <p style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{error}</p>
        <button onClick={() => router.push('/ferramentas/flow-builder')} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Voltar
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <EditorToolbar
        flowName={flowName}
        isActive={isActive}
        isSaving={isSaving}
        isDirty={isDirty}
        onNameChange={handleNameChange}
        onSave={handleSave}
        onToggleActive={handleToggleActive}
        onBack={handleBack}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <BlockPalette />
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          setNodes={setNodes}
          setEdges={setEdges}
        />
        <ConfigPanel selectedNode={selectedNode} onUpdate={handleNodeUpdate} />
      </div>
    </div>
  )
}

export default function FlowEditor({ flowId }: FlowEditorProps) {
  return (
    <ReactFlowProvider>
      <FlowEditorInner flowId={flowId} />
    </ReactFlowProvider>
  )
}
