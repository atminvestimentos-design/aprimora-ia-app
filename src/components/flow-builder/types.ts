import type { Node, Edge } from '@xyflow/react'

// ─── Block types ─────────────────────────────────────────────────────────────

export type BlockType =
  | 'inicio'
  | 'mensagem'
  | 'agente_ia'
  | 'coletar_dado'
  | 'condicao'
  | 'roteamento'
  | 'humano'
  | 'finalizar'

// ─── Per-block data ───────────────────────────────────────────────────────────

export type InicioData = {
  type: 'inicio'
  channel: 'whatsapp'
}

export type MensagemData = {
  type: 'mensagem'
  text: string
}

export type AgenteIAData = {
  type: 'agente_ia'
  name: string
  prompt: string
  persona: 'profissional' | 'amigavel' | 'formal' | 'descontraido'
  restrictions: string
  handoffConditions: string
  focusQualities: string
  referenceFiles: string[]
  agentTemplate?: string
}

export type ColetarDadoData = {
  type: 'coletar_dado'
  variableName: string
  question: string
  dataType: 'texto' | 'email' | 'telefone' | 'numero'
}

export type CondicaoData = {
  type: 'condicao'
  variable: string
  operator: '==' | '!=' | 'contains'
  value: string
}

export type RoteamentoData = {
  type: 'roteamento'
  prompt: string
  routes: Array<{
    id: string
    label: string
    condition: string
    targetAgent?: string
  }>
}

export type HumanoData = {
  type: 'humano'
  message: string
}

export type FinalizarData = {
  type: 'finalizar'
  farewell: string
}

export type FlowNodeData =
  | InicioData
  | MensagemData
  | AgenteIAData
  | ColetarDadoData
  | CondicaoData
  | RoteamentoData
  | HumanoData
  | FinalizarData

export type FlowNode = Node<FlowNodeData>
export type FlowEdge = Edge

// ─── Default data per block type ─────────────────────────────────────────────

export const DEFAULT_NODE_DATA: Record<BlockType, FlowNodeData> = {
  inicio:      { type: 'inicio', channel: 'whatsapp' },
  mensagem:    { type: 'mensagem', text: '' },
  agente_ia:   {
    type: 'agente_ia',
    name: 'Agente IA',
    prompt: '',
    persona: 'profissional',
    restrictions: '',
    handoffConditions: '',
    focusQualities: '',
    referenceFiles: [],
    agentTemplate: undefined,
  },
  coletar_dado:{ type: 'coletar_dado', variableName: '', question: '', dataType: 'texto' },
  condicao:    { type: 'condicao', variable: '', operator: '==', value: '' },
  roteamento:  {
    type: 'roteamento',
    prompt: 'Para qual agente devo rotear esta conversa?',
    routes: [],
  },
  humano:      { type: 'humano', message: 'Aguarde, vou transferir para um atendente.' },
  finalizar:   { type: 'finalizar', farewell: 'Obrigado pelo contato! Até logo.' },
}

// ─── Palette items ────────────────────────────────────────────────────────────

export type PaletteItem = {
  type: BlockType
  label: string
  description: string
  color: string
  gradient: string
}

export const BLOCK_PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'inicio',
    label: 'Início',
    description: 'Ponto de entrada do fluxo',
    color: '#06C8D8',
    gradient: 'linear-gradient(135deg, #06C8D8, #0891b2)',
  },
  {
    type: 'mensagem',
    label: 'Mensagem',
    description: 'Envia texto fixo ao cliente',
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
  },
  {
    type: 'agente_ia',
    label: 'Agente IA',
    description: 'IA responde com prompt customizado',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
  },
  {
    type: 'coletar_dado',
    label: 'Coletar Dado',
    description: 'Pede informação ao cliente',
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
  },
  {
    type: 'condicao',
    label: 'Condição',
    description: 'Ramifica o fluxo (se/senão)',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #14b8a6)',
  },
  {
    type: 'roteamento',
    label: 'Roteamento',
    description: 'Decide qual agente deve atender',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
  },
  {
    type: 'humano',
    label: 'Atendente',
    description: 'Transfere para humano',
    color: '#db2777',
    gradient: 'linear-gradient(135deg, #db2777, #ec4899)',
  },
  {
    type: 'finalizar',
    label: 'Finalizar',
    description: 'Encerra a conversa',
    color: '#6b7280',
    gradient: 'linear-gradient(135deg, #4b5563, #6b7280)',
  },
]

export const PALETTE_MAP = Object.fromEntries(
  BLOCK_PALETTE_ITEMS.map(i => [i.type, i])
) as Record<BlockType, PaletteItem>
