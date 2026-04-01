/**
 * Motor de execução de fluxos do Flow Builder.
 * Chamado pelo webhook a cada mensagem de texto recebida.
 *
 * Modelo de estado:
 *   current_node_id = nó onde o fluxo está PAUSADO aguardando resposta do usuário.
 *   Nós que pausam: coletar_dado (aguarda dado), agente_ia (loop multi-turno).
 *   Nós que avançam automaticamente: inicio, mensagem, condicao.
 *   Nós terminais: humano (handed_off), finalizar (completed).
 */

import Anthropic from '@anthropic-ai/sdk'
import { createServiceSupabaseClient } from './supabase/service'
import { sendMessage } from './whatsapp'

// ── Tipos internos ─────────────────────────────────────────────────────────────

interface FlowNode {
  id: string
  type: string
  data: Record<string, unknown>
}

interface FlowEdge {
  source: string
  sourceHandle?: string | null
  target: string
}

interface ActiveSession {
  id: string
  current_node_id: string
  variables: Record<string, string>
  flow: { nodes: FlowNode[]; edges: FlowEdge[] }
}

// ── Entrada pública ────────────────────────────────────────────────────────────

export async function executeFlow({
  userId,
  phone,
  debtorId,
  incomingMessage,
}: {
  userId: string
  phone: string
  debtorId: string | null
  incomingMessage: string
}): Promise<void> {
  const text = incomingMessage.trim()
  // Ignora mensagens de mídia (sem texto útil para o fluxo)
  if (!text || text.startsWith('[')) return

  const supabase = createServiceSupabaseClient()

  // 1. Busca sessão ativa para este tenant + telefone
  const { data: sessionRow } = await supabase
    .from('flow_sessions')
    .select('id, current_node_id, variables, flow:flow_id(nodes, edges)')
    .eq('user_id', userId)
    .eq('phone', phone)
    .eq('status', 'active')
    .maybeSingle()

  let session = sessionRow as ActiveSession | null

  // 2. Se não há sessão ativa, procura o fluxo ativo do tenant e inicia
  if (!session) {
    const { data: flow } = await supabase
      .from('flows')
      .select('id, nodes, edges')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (!flow) return

    const nodes = flow.nodes as FlowNode[]
    const inicioNode = nodes.find(n => n.type === 'inicio')
    if (!inicioNode) return

    const { data: newSession, error } = await supabase
      .from('flow_sessions')
      .insert({
        user_id: userId,
        flow_id: flow.id,
        debtor_id: debtorId,
        phone,
        current_node_id: inicioNode.id,
        variables: {},
        status: 'active',
      })
      .select('id, current_node_id, variables')
      .single()

    if (error || !newSession) {
      console.error('[flow-executor] Erro ao criar sessão:', error?.message)
      return
    }

    session = {
      ...newSession,
      variables: {},
      flow: { nodes: flow.nodes as FlowNode[], edges: flow.edges as FlowEdge[] },
    }
  }

  // 3. Busca contexto do negócio do cliente (se aprovado)
  const { data: bizProfile } = await supabase
    .from('business_profiles')
    .select('summary')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .maybeSingle()

  const companyContext = bizProfile?.summary ?? null

  // 4. Monta helpers de navegação
  const nodeMap = new Map(session.flow.nodes.map(n => [n.id, n]))
  const edges   = session.flow.edges
  let variables = { ...(session.variables ?? {}) } as Record<string, string>

  function nextNode(nodeId: string, handle?: string | null): FlowNode | null {
    const edge = handle != null
      ? edges.find(e => e.source === nodeId && e.sourceHandle === handle)
      : edges.find(e => e.source === nodeId)
    return edge ? (nodeMap.get(edge.target) ?? null) : null
  }

  function sub(t: string): string {
    return t.replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] ?? `{{${k}}}`)
  }

  async function saveAt(nodeId: string) {
    await supabase
      .from('flow_sessions')
      .update({ current_node_id: nodeId, variables, updated_at: new Date().toISOString() })
      .eq('id', session!.id)
  }

  async function endSession(status: 'completed' | 'handed_off') {
    await supabase
      .from('flow_sessions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', session!.id)
  }

  // 5. Determina primeiro nó a processar com base no estado atual
  let current = nodeMap.get(session.current_node_id) ?? null
  if (!current) return

  if (current.type === 'coletar_dado') {
    // Resposta do usuário é o dado coletado → avança
    variables[current.data.variableName as string] = text
    current = nextNode(current.id)

  } else if (current.type === 'agente_ia') {
    // Loop multi-turno: passa mensagem para a IA, responde e permanece neste nó
    const aiReply = await callClaude({
      prompt:             sub(current.data.prompt as string),
      persona:            current.data.persona as string,
      userMessage:        text,
      restrictions:       current.data.restrictions as string | undefined,
      focusQualities:     current.data.focusQualities as string | undefined,
      handoffConditions:  current.data.handoffConditions as string | undefined,
      referenceFiles:     current.data.referenceFiles as string[] | undefined,
      companyContext,
    })
    await sendMessage(userId, phone, aiReply)
    await saveAt(current.id)
    return

  } else if (current.type === 'inicio') {
    // Primeiro contato — avança para o próximo nó
    current = nextNode(current.id)
  }

  // 6. Executa nós em sequência até pausar ou terminar
  while (current) {
    const { type, data } = current

    if (type === 'mensagem') {
      await sendMessage(userId, phone, sub(data.text as string))
      current = nextNode(current.id)

    } else if (type === 'agente_ia') {
      const aiReply = await callClaude({
        prompt:             sub(data.prompt as string),
        persona:            data.persona as string,
        userMessage:        text,
        restrictions:       data.restrictions as string | undefined,
        focusQualities:     data.focusQualities as string | undefined,
        handoffConditions:  data.handoffConditions as string | undefined,
        referenceFiles:     data.referenceFiles as string[] | undefined,
        companyContext,
      })
      await sendMessage(userId, phone, aiReply)
      await saveAt(current.id)
      return // pausa — aguarda próxima mensagem do usuário

    } else if (type === 'coletar_dado') {
      await sendMessage(userId, phone, sub(data.question as string))
      await saveAt(current.id)
      return // pausa — aguarda resposta do usuário

    } else if (type === 'condicao') {
      const val = variables[data.variable as string] ?? ''
      let met = false
      if      (data.operator === '==')       met = val === (data.value as string)
      else if (data.operator === '!=')       met = val !== (data.value as string)
      else if (data.operator === 'contains') met = val.toLowerCase().includes((data.value as string).toLowerCase())
      current = nextNode(current.id, met ? 'true' : 'false')

    } else if (type === 'humano') {
      if (data.message) await sendMessage(userId, phone, sub(data.message as string))
      await endSession('handed_off')
      return

    } else if (type === 'finalizar') {
      if (data.farewell) await sendMessage(userId, phone, sub(data.farewell as string))
      await endSession('completed')
      return

    } else {
      current = nextNode(current.id)
    }
  }

  // Chegou ao fim do grafo sem nó finalizar
  await endSession('completed')
}

// ── Chamada ao Claude ──────────────────────────────────────────────────────────

const PERSONA_TEXT: Record<string, string> = {
  profissional: 'Seja profissional e objetivo.',
  amigavel:     'Seja amigável e acolhedor.',
  formal:       'Use linguagem formal e respeitosa.',
  descontraido: 'Use linguagem casual e descontraída.',
}

async function callClaude({
  prompt,
  persona,
  userMessage,
  restrictions,
  focusQualities,
  handoffConditions,
  referenceFiles,
  companyContext,
}: {
  prompt:               string
  persona:              string
  userMessage:          string
  restrictions?:        string
  focusQualities?:      string
  handoffConditions?:   string
  referenceFiles?:      string[]
  companyContext?:      string | null
}): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Monta system prompt com todos os campos
  const systemParts = [
    prompt,
    PERSONA_TEXT[persona] ?? '',
    restrictions ? `\n📋 Restrições:\n${restrictions}` : '',
    focusQualities ? `\n⭐ Enfatizar:\n${focusQualities}` : '',
    handoffConditions ? `\n🔄 Transferir se:\n${handoffConditions}` : '',
    referenceFiles && referenceFiles.length > 0 ? `\n📚 Base de conhecimento disponível: ${referenceFiles.length} arquivo(s)` : '',
    companyContext ? `\n🏢 Contexto da empresa:\n${companyContext}` : '',
  ]
  const system = systemParts.filter(Boolean).join('\n')

  try {
    const res = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system,
      messages:   [{ role: 'user', content: userMessage }],
    })
    const block = res.content[0]
    return block.type === 'text' ? block.text : ''
  } catch (err) {
    console.error('[flow-executor] Erro Claude:', err)
    return 'Desculpe, ocorreu um erro. Tente novamente em instantes.'
  }
}
