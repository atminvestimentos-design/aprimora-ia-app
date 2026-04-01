import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado.', { status: 401 })

  const body = await req.json().catch(() => ({}))
  let messages = body.messages ?? []
  const websiteUrl = body.websiteUrl

  // Se nenhuma mensagem, adiciona uma inicial para Claude responder com saudação
  if (!Array.isArray(messages) || messages.length === 0) {
    messages = [{ role: 'user', content: 'Olá' }]
  }

  // Se primeira mensagem com URL: WebFetch do site
  let siteContent = ''
  if (websiteUrl && messages.length <= 1) {
    try {
      const response = await fetch(websiteUrl, {
        headers: { 'User-Agent': 'Aprimora IA Onboarding' },
      })
      const html = await response.text()
      // Strip HTML tags e pega primeiros ~3000 chars
      siteContent = html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 3000)
    } catch (err) {
      console.error('[onboarding-chat] WebFetch error:', err)
      // Continua sem o conteúdo do site
    }
  }

  // System prompt para Ana, consultora
  const systemParts = [
    `Você é Ana, consultora especializada em automação da Aprimora IA.
Seu objetivo: entender o negócio do cliente em conversa natural para criar um perfil.

FASE 1 — Coleta (1 pergunta por vez, nunca listas):
1. Comece pedindo o NOME da empresa
2. Depois pergunte: "Você tem um site ou rede social? (Instagram, LinkedIn)" - SE TIVER URL, VOCÊ DEVE ACESSÁ-LA E ANALISAR
3. Coleta restante: ramo, estágio (iniciando/crescendo/estabelecida), funcionários, setores internos, produtos/serviços, gargalos operacionais

FASE 2 — Análise de Site:
Se o cliente fornecer URL:
- MENCIONE que já analisou: "Vi que vocês fazem X, trabalham com Y..."
- Use detalhes do site para perguntas mais assertivas sobre automação
- Seja entusiasmado com o que encontrou

FASE 3 — Geração do resumo:
Após ~5 respostas substanciais, ofereça gerar o resumo.
Ao gerar, use EXATAMENTE este formato:
[RESUMO]
## Perfil do Negócio — {Nome da Empresa}
...conteúdo do resumo em tópicos estruturados...
[/RESUMO]

FASE 4 — Ajustes:
Se o cliente pedir mudanças, ajuste e gere um novo [RESUMO]...[/RESUMO].

TOM: profissional, acolhedor e entusiasmado com os detalhes do negócio.`,
    siteContent
      ? `\n✓ SITE ANALISADO (${websiteUrl}):\n${siteContent}\nVocê JÁ ANALISOU este conteúdo. Use naturalmente nas respostas, mencionando detalhes específicos.`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          system: systemParts,
          messages: messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        })

        for await (const event of messageStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk = event.delta.text
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: chunk })}\n\n`))
            } catch {
              // cliente desconectou
              break
            }
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
      } catch (err) {
        console.error('[onboarding-chat] Error:', err)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', message: 'Erro ao processar resposta.' })}\n\n`
          )
        )
      }

      try {
        controller.close()
      } catch {
        // já fechado
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
