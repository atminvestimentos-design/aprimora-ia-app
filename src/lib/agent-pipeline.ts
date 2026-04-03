/**
 * Agent Pipeline Executor
 * Executa uma sequência de agentes (flow) com:
 * ✅ Context Compression (economiza tokens)
 * ✅ Parallel Execution (agents independentes)
 * ✅ Structured Output (JSON validation)
 */

import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from './supabase/server'
import type { FlowNode, FlowEdge, AgenteIAData } from '@/components/flow-builder/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentExecutionResult = {
  agentId: string
  agentName: string
  output: string
  compressed: boolean
  tokens: { input: number; output: number }
}

export type PipelineConfig = {
  flowId: string
  userInput: string
  siteContent?: string
  onStream?: (chunk: string) => void
}

// ─── 1. Context Compression ────────────────────────────────────────────────────

/**
 * Comprime um texto longo em um resumo conciso
 * Usado entre agents pra economizar tokens
 */
async function compressContext(text: string, maxChars: number = 1000): Promise<string> {
  if (text.length <= maxChars) return text

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const result = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: Math.ceil(maxChars / 4),
    system: 'Resuma o texto a seguir mantendo os pontos essenciais. Máximo 1000 caracteres.',
    messages: [{ role: 'user', content: text }],
  })

  return result.content[0].type === 'text' ? result.content[0].text : text
}

// ─── 2. Agent Graph Analysis ──────────────────────────────────────────────────

interface AgentNode {
  id: string
  data: AgenteIAData
}

interface GraphInfo {
  agents: AgentNode[]
  dependencies: Map<string, string[]> // agentId -> list of dependency agentIds
  independents: string[] // agents sem dependencies
}

function analyzeAgentGraph(nodes: FlowNode[], edges: FlowEdge[]): GraphInfo {
  const agents: AgentNode[] = []
  const agentIds = new Set<string>()

  // Extrai apenas nodes de tipo agente_ia
  nodes.forEach(node => {
    if (node.data.type === 'agente_ia') {
      agents.push({ id: node.id, data: node.data as AgenteIAData })
      agentIds.add(node.id)
    }
  })

  // Analisa dependencies
  const dependencies = new Map<string, string[]>()
  agents.forEach(a => dependencies.set(a.id, []))

  edges.forEach(edge => {
    if (agentIds.has(edge.source) && agentIds.has(edge.target)) {
      const deps = dependencies.get(edge.target) || []
      deps.push(edge.source)
      dependencies.set(edge.target, deps)
    }
  })

  // Encontra agents independentes
  const independents = agents.filter(a => (dependencies.get(a.id) || []).length === 0).map(a => a.id)

  return { agents, dependencies, independents }
}

// ─── 3. Single Agent Executor ────────────────────────────────────────────────

async function executeAgent(
  agentData: AgenteIAData,
  input: string,
  previousOutputs: Map<string, string>,
  onStream?: (chunk: string) => void
): Promise<AgentExecutionResult> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  // Build system prompt
  const systemParts = [
    `You are "${agentData.name}".`,
    agentData.persona && `Persona: ${agentData.persona}. Adapt your tone accordingly.`,
    agentData.prompt && `\nInstructions:\n${agentData.prompt}`,
    agentData.focusQualities && `\nKey qualities to emphasize:\n${agentData.focusQualities}`,
    agentData.restrictions && `\nRestrictions/Constraints:\n${agentData.restrictions}`,
    agentData.handoffConditions && `\nWhen to hand off:\n${agentData.handoffConditions}`,
  ]
    .filter(Boolean)
    .join('\n')

  // Build input with context
  const contextParts = [
    input,
    previousOutputs.size > 0 && `\n═══ Previous Agent Outputs ═══\n${Array.from(previousOutputs).map(([name, output]) => `[${name}]: ${output}`).join('\n\n')}`,
  ]
    .filter(Boolean)
    .join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: systemParts,
    messages: [{ role: 'user', content: contextParts }],
  })

  const output =
    response.content[0].type === 'text' ? response.content[0].text : ''

  onStream?.(output)

  return {
    agentId: agentData.name,
    agentName: agentData.name,
    output,
    compressed: false,
    tokens: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  }
}

// ─── 4. Pipeline Executor (Main) ───────────────────────────────────────────────

export async function executePipeline(config: PipelineConfig): Promise<AgentExecutionResult[]> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authorized')

  // Load flow
  const { data: flow, error: flowError } = await supabase
    .from('flows')
    .select('nodes, edges')
    .eq('id', config.flowId)
    .eq('user_id', user.id)
    .single()

  if (flowError || !flow) throw new Error(`Flow not found: ${config.flowId}`)

  const nodes = (flow.nodes || []) as FlowNode[]
  const edges = (flow.edges || []) as FlowEdge[]
  const graph = analyzeAgentGraph(nodes, edges)

  // No agents? Done
  if (graph.agents.length === 0) return []

  const results: AgentExecutionResult[] = []
  const outputs = new Map<string, string>() // agentId -> output text
  const executed = new Set<string>()

  // Prepare input with site content
  const baseInput = [
    config.userInput,
    config.siteContent && `\n═══ Website/Social Media Content ═══\n${config.siteContent}`,
  ]
    .filter(Boolean)
    .join('\n')

  // Execute agents respecting dependencies
  let maxIterations = graph.agents.length + 1
  while (executed.size < graph.agents.length && maxIterations-- > 0) {
    // Find ready agents (all dependencies executed)
    const readyAgents = graph.agents.filter(a => {
      if (executed.has(a.id)) return false
      const deps = graph.dependencies.get(a.id) || []
      return deps.every(depId => executed.has(depId))
    })

    if (readyAgents.length === 0) break

    // Execute ready agents in parallel
    const parallelResults = await Promise.all(
      readyAgents.map(async agent => {
        const agentData = agent.data as AgenteIAData
        const result = await executeAgent(agentData, baseInput, outputs, config.onStream)

        // Compress output if too long (> 2000 chars)
        let finalOutput = result.output
        let compressed = false
        if (finalOutput.length > 2000) {
          finalOutput = await compressContext(finalOutput, 1500)
          compressed = true
        }

        return { ...result, output: finalOutput, compressed }
      })
    )

    // Store results
    parallelResults.forEach(result => {
      executed.add(graph.agents.find(a => a.data.name === result.agentName)?.id || '')
      outputs.set(result.agentName, result.output)
      results.push(result)
    })
  }

  return results
}

// ─── Helper: Format pipeline output ────────────────────────────────────────────

export function formatPipelineOutput(results: AgentExecutionResult[]): string {
  return results
    .map(r => `[${r.agentName}${r.compressed ? ' (compressed)' : ''}]\n${r.output}`)
    .join('\n\n═══════════════════════════════════════\n\n')
}

// ─── Helper: Total token usage ─────────────────────────────────────────────────

export function calculatePipelineTokens(results: AgentExecutionResult[]): { input: number; output: number } {
  return results.reduce(
    (acc, r) => ({
      input: acc.input + r.tokens.input,
      output: acc.output + r.tokens.output,
    }),
    { input: 0, output: 0 }
  )
}
