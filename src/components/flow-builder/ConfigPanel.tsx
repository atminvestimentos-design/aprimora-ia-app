'use client'

import type { FlowNode, FlowNodeData } from './types'
import { AGENT_TEMPLATES } from '@/lib/agent-templates'

interface ConfigPanelProps {
  selectedNode: FlowNode | null
  onUpdate: (nodeId: string, data: Partial<FlowNodeData>) => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: '0.82rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: 6,
}

const fieldStyle: React.CSSProperties = { marginBottom: 16 }

export default function ConfigPanel({ selectedNode, onUpdate }: ConfigPanelProps) {
  if (!selectedNode) {
    return (
      <aside style={{
        width: 260,
        flexShrink: 0,
        background: '#060d1f',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.6 }}>
          Clique em um bloco no canvas para configurá-lo
        </p>
      </aside>
    )
  }

  const { id, data } = selectedNode

  function update(partial: Partial<FlowNodeData>) {
    onUpdate(id, partial)
  }

  function loadTemplate(templateKey: string) {
    if (data.type !== 'agente_ia') return
    if (templateKey === '' || templateKey === 'customizado') {
      update({ agentTemplate: undefined })
      return
    }
    const template = AGENT_TEMPLATES[templateKey as keyof typeof AGENT_TEMPLATES]
    if (template) {
      update({
        ...template,
        agentTemplate: templateKey,
      } as Partial<FlowNodeData>)
    }
  }

  return (
    <aside style={{
      width: 260,
      flexShrink: 0,
      background: '#060d1f',
      borderLeft: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          CONFIGURAR BLOCO
        </p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* ── Início ── */}
        {data.type === 'inicio' && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Canal de entrada</label>
            <select style={inputStyle} value={data.channel} onChange={e => update({ channel: e.target.value as 'whatsapp' })}>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        )}

        {/* ── Mensagem ── */}
        {data.type === 'mensagem' && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Texto da mensagem</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
              value={data.text}
              onChange={e => update({ text: e.target.value })}
              placeholder="Digite a mensagem que será enviada ao cliente..."
            />
          </div>
        )}

        {/* ── Agente IA ── */}
        {data.type === 'agente_ia' && (
          <>
            {/* Nome do Agente */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Nome do agente</label>
              <input
                style={inputStyle}
                value={data.name}
                onChange={e => update({ name: e.target.value })}
                placeholder="ex: Agente de Vendas"
              />
            </div>

            {/* Template */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Template</label>
              <select
                style={inputStyle}
                value={data.agentTemplate || ''}
                onChange={e => loadTemplate(e.target.value)}
              >
                <option value="">Sem template</option>
                <option value="triage">Triagem</option>
                <option value="sales">Vendas</option>
                <option value="support">Suporte</option>
                <option value="financial">Financeiro</option>
              </select>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginTop: 4, marginBottom: 0 }}>
                Seleciona um template para auto-preencher os campos
              </p>
            </div>

            {/* Prompt */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Prompt do agente</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
                value={data.prompt}
                onChange={e => update({ prompt: e.target.value })}
                placeholder="Descreva o comportamento e capacidades deste agente..."
              />
            </div>

            {/* Persona */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Personalidade</label>
              <select style={inputStyle} value={data.persona} onChange={e => update({ persona: e.target.value as AgenteIAData['persona'] })}>
                <option value="profissional">Profissional</option>
                <option value="amigavel">Amigável</option>
                <option value="formal">Formal</option>
                <option value="descontraido">Descontraído</option>
              </select>
            </div>

            {/* Restrições */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Restrições</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                value={data.restrictions}
                onChange={e => update({ restrictions: e.target.value })}
                placeholder="O que este agente NÃO pode fazer ou dizer..."
              />
            </div>

            {/* Qualidades de Foco */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Qualidades a focar</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                value={data.focusQualities}
                onChange={e => update({ focusQualities: e.target.value })}
                placeholder="ex: Empatia, clareza, urgência positiva..."
              />
            </div>

            {/* Condições de Handoff */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Condições de handoff</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                value={data.handoffConditions}
                onChange={e => update({ handoffConditions: e.target.value })}
                placeholder="Quando passar para outro agente ou humano..."
              />
            </div>

            {/* Arquivos de Referência */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Arquivos de referência</label>
              <button
                style={{ ...inputStyle, cursor: 'pointer', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(124, 58, 237, 0.5)' }}
                onClick={() => {
                  // TODO: Abrir file picker
                  console.log('TODO: Implementar file picker')
                }}
              >
                + Adicionar arquivo
              </button>
              {data.referenceFiles && data.referenceFiles.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {data.referenceFiles.map(file => (
                    <span
                      key={file}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 8px',
                        background: 'rgba(124, 58, 237, 0.15)',
                        border: '1px solid rgba(124, 58, 237, 0.3)',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      📄 {file}
                      <button
                        onClick={() => update({ referenceFiles: data.referenceFiles.filter(f => f !== file) })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '1rem', padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Coletar Dado ── */}
        {data.type === 'coletar_dado' && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Nome da variável</label>
              <input
                style={inputStyle}
                value={data.variableName}
                onChange={e => update({ variableName: e.target.value })}
                placeholder="ex: nome_cliente"
              />
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                Acesse depois como {`{{${data.variableName || 'variavel'}}}`}
              </p>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Pergunta ao cliente</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                value={data.question}
                onChange={e => update({ question: e.target.value })}
                placeholder="Qual a pergunta para coletar este dado?"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Tipo do dado</label>
              <select style={inputStyle} value={data.dataType} onChange={e => update({ dataType: e.target.value as ColetarDadoData['dataType'] })}>
                <option value="texto">Texto</option>
                <option value="numero">Número</option>
                <option value="email">E-mail</option>
                <option value="telefone">Telefone</option>
              </select>
            </div>
          </>
        )}

        {/* ── Condição ── */}
        {data.type === 'condicao' && (
          <>
            <div style={fieldStyle}>
              <label style={labelStyle}>Variável</label>
              <input
                style={inputStyle}
                value={data.variable}
                onChange={e => update({ variable: e.target.value })}
                placeholder="ex: nome_cliente"
              />
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                Use o nome sem chaves, ex: <em>motivo</em>
              </p>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Operador</label>
              <select style={inputStyle} value={data.operator} onChange={e => update({ operator: e.target.value as CondicaoData['operator'] })}>
                <option value="==">Igual a (==)</option>
                <option value="!=">Diferente de (!=)</option>
                <option value="contains">Contém</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Valor</label>
              <input
                style={inputStyle}
                value={data.value}
                onChange={e => update({ value: e.target.value })}
                placeholder="ex: comprar"
              />
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.6 }}>
                A seta verde vai para o caminho <strong style={{ color: '#059669' }}>SIM</strong> e a vermelha para o <strong style={{ color: '#ef4444' }}>NÃO</strong>
              </p>
            </div>
          </>
        )}

        {/* ── Humano ── */}
        {data.type === 'humano' && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Mensagem de transferência</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              value={data.message}
              onChange={e => update({ message: e.target.value })}
              placeholder="Mensagem enviada ao cliente antes de transferir..."
            />
          </div>
        )}

        {/* ── Finalizar ── */}
        {data.type === 'finalizar' && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Mensagem de despedida</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              value={data.farewell}
              onChange={e => update({ farewell: e.target.value })}
              placeholder="Mensagem final enviada ao cliente..."
            />
          </div>
        )}

      </div>
    </aside>
  )
}

// Local type re-imports for inline use
type AgenteIAData    = Extract<FlowNodeData, { type: 'agente_ia' }>
type ColetarDadoData = Extract<FlowNodeData, { type: 'coletar_dado' }>
type CondicaoData    = Extract<FlowNodeData, { type: 'condicao' }>
