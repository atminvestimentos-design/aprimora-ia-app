'use client'

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useReactFlow,
  BackgroundVariant,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCallback, useEffect, useRef } from 'react'
import { nodeTypes } from './nodes'
import { DEFAULT_NODE_DATA, type FlowNode, type FlowEdge, type BlockType } from './types'

interface FlowCanvasProps {
  nodes: FlowNode[]
  edges: FlowEdge[]
  onNodesChange: OnNodesChange<FlowNode>
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onNodeClick: NodeMouseHandler<FlowNode>
  onPaneClick: () => void
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>
  setEdges: React.Dispatch<React.SetStateAction<FlowEdge[]>>
}

const defaultEdgeOptions = {
  animated: false,
  style: { stroke: 'rgba(6,200,216,0.7)', strokeWidth: 2 },
  type: 'smoothstep' as const,
}

export default function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect: onConnectProp,
  onNodeClick,
  onPaneClick,
  setNodes,
  setEdges,
}: FlowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow()
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep a stable ref to screenToFlowPosition and setNodes
  const screenToFlowPositionRef = useRef(screenToFlowPosition)
  const setNodesRef = useRef(setNodes)
  useEffect(() => { screenToFlowPositionRef.current = screenToFlowPosition }, [screenToFlowPosition])
  useEffect(() => { setNodesRef.current = setNodes }, [setNodes])

  // Use native DOM listeners — React synthetic events don't reliably call
  // preventDefault() for HTML5 drag-and-drop in all browsers
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onDragOver(e: DragEvent) {
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    }

    function onDrop(e: DragEvent) {
      const type = e.dataTransfer?.getData('application/reactflow-type') as BlockType
      if (!type) return
      e.preventDefault()
      e.stopPropagation()

      const position = screenToFlowPositionRef.current({ x: e.clientX, y: e.clientY })
      const newNode: FlowNode = {
        id: crypto.randomUUID(),
        type,
        position,
        data: DEFAULT_NODE_DATA[type],
      }
      setNodesRef.current(nds => [...nds, newNode])
    }

    el.addEventListener('dragover', onDragOver)
    el.addEventListener('drop', onDrop)
    return () => {
      el.removeEventListener('dragover', onDragOver)
      el.removeEventListener('drop', onDrop)
    }
  }, [])

  const handleConnect: OnConnect = useCallback((connection) => {
    const newEdge: FlowEdge = {
      ...connection,
      id: `e-${connection.source}-${connection.sourceHandle ?? ''}-${connection.target}`,
      animated: false,
      style: { stroke: 'rgba(6,200,216,0.7)', strokeWidth: 2 },
      type: 'smoothstep',
    }
    setEdges(eds => addEdge(newEdge, eds))
    onConnectProp(connection)
  }, [setEdges, onConnectProp])

  return (
    <div ref={containerRef} style={{ flex: 1, minWidth: 0, height: '100%', background: '#0a1628' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        defaultViewport={{ x: 80, y: 80, zoom: 1 }}
        deleteKeyCode="Delete"
        style={{ background: '#0a1628' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        <Controls />
        <MiniMap
          style={{ background: '#060d1f', border: '1px solid rgba(255,255,255,0.08)' }}
          nodeColor="#06C8D8"
          maskColor="rgba(6,13,31,0.7)"
        />
      </ReactFlow>

      <style>{`
        .react-flow__controls button {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: rgba(255,255,255,0.6) !important;
          fill: rgba(255,255,255,0.6) !important;
        }
        .react-flow__controls button:hover {
          background: rgba(255,255,255,0.1) !important;
          color: #fff !important;
          fill: #fff !important;
        }
        .react-flow__controls {
          box-shadow: none !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }
        .react-flow__attribution { display: none !important; }
      `}</style>
    </div>
  )
}
