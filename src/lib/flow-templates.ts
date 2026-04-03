/**
 * Templates padrão de Flows
 * Usados como exemplos/starters no Flow Builder
 */

export const flowTemplates = {
  briefingInteligente: {
    name: "Briefing Inteligente",
    description: "Chatbot que coleta informações da empresa e gera um resumo estruturado",
    nodes: [
      {
        id: "start-1",
        type: "Inicio",
        position: { x: 50, y: 50 },
        data: {}
      },
      {
        id: "agent-1",
        type: "AgenteIA",
        position: { x: 300, y: 100 },
        data: {
          role: "Consultor de Negócios",
          systemPrompt: "Você é um consultor experiente. Faça perguntas estratégicas sobre o negócio do cliente e compile um briefing conciso.",
          temperature: 0.7,
          model: "claude-3-5-sonnet-20241022"
        }
      },
      {
        id: "message-1",
        type: "Mensagem",
        position: { x: 550, y: 100 },
        data: {
          content: "✅ Briefing gerado com sucesso!"
        }
      },
      {
        id: "end-1",
        type: "Finalizar",
        position: { x: 800, y: 100 },
        data: {}
      }
    ],
    edges: [
      { id: "edge-1", source: "start-1", target: "agent-1" },
      { id: "edge-2", source: "agent-1", target: "message-1" },
      { id: "edge-3", source: "message-1", target: "end-1" }
    ]
  },

  consultoria: {
    name: "Consultoria Estratégica",
    description: "Fluxo com análise profunda + coleta de dados + roteamento para humano",
    nodes: [
      {
        id: "start-2",
        type: "Inicio",
        position: { x: 50, y: 50 },
        data: {}
      },
      {
        id: "agent-2",
        type: "AgenteIA",
        position: { x: 250, y: 150 },
        data: {
          role: "Analista Estratégico",
          systemPrompt: "Você é um analista estratégico. Analise o contexto e identifique os principais pontos de melhoria.",
          temperature: 0.6,
          model: "claude-3-5-sonnet-20241022"
        }
      },
      {
        id: "collect-1",
        type: "ColetarDado",
        position: { x: 500, y: 150 },
        data: {
          label: "Coletar Feedback"
        }
      },
      {
        id: "agent-3",
        type: "AgenteIA",
        position: { x: 750, y: 150 },
        data: {
          role: "Relatório Executivo",
          systemPrompt: "Compile um relatório executivo com recomendações actionáveis.",
          temperature: 0.5,
          model: "claude-3-5-sonnet-20241022"
        }
      },
      {
        id: "end-2",
        type: "Finalizar",
        position: { x: 1000, y: 150 },
        data: {}
      }
    ],
    edges: [
      { id: "edge-4", source: "start-2", target: "agent-2" },
      { id: "edge-5", source: "agent-2", target: "collect-1" },
      { id: "edge-6", source: "collect-1", target: "agent-3" },
      { id: "edge-7", source: "agent-3", target: "end-2" }
    ]
  },

  cobranca: {
    name: "Automação de Cobrança",
    description: "Segue prospectos e valida status de pagamento",
    nodes: [
      {
        id: "start-3",
        type: "Inicio",
        position: { x: 50, y: 50 },
        data: {}
      },
      {
        id: "agent-4",
        type: "AgenteIA",
        position: { x: 250, y: 150 },
        data: {
          role: "Gerente de Cobrança",
          systemPrompt: "Você é responsável por acompanhar cobranças. Valide o status e recomende as próximas ações.",
          temperature: 0.5,
          model: "claude-3-5-sonnet-20241022"
        }
      },
      {
        id: "collect-2",
        type: "ColetarDado",
        position: { x: 500, y: 150 },
        data: {
          label: "Verificar Pagamento"
        }
      },
      {
        id: "message-2",
        type: "Mensagem",
        position: { x: 750, y: 100 },
        data: {
          content: "✅ Pagamento Confirmado"
        }
      },
      {
        id: "human-1",
        type: "Humano",
        position: { x: 750, y: 200 },
        data: {
          label: "Escalar para Humano"
        }
      },
      {
        id: "end-3",
        type: "Finalizar",
        position: { x: 1000, y: 150 },
        data: {}
      }
    ],
    edges: [
      { id: "edge-8", source: "start-3", target: "agent-4" },
      { id: "edge-9", source: "agent-4", target: "collect-2" },
      { id: "edge-10", source: "collect-2", target: "message-2" },
      { id: "edge-11", source: "collect-2", target: "human-1" },
      { id: "edge-12", source: "message-2", target: "end-3" },
      { id: "edge-13", source: "human-1", target: "end-3" }
    ]
  }
}

export type FlowTemplate = typeof flowTemplates[keyof typeof flowTemplates]
