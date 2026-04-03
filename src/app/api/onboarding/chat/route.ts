import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { executePipeline } from '@/lib/agent-pipeline'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado.', { status: 401 })

  const body = await req.json().catch(() => ({}))
  let messages = body.messages ?? []
  const websiteUrl = body.websiteUrl
  const flowId = body.flowId

  console.log('[onboarding-chat] Recebido - websiteUrl:', websiteUrl, '| messages:', messages.length)

  // Se nenhuma mensagem, adiciona uma inicial para Claude responder com saudação
  if (!Array.isArray(messages) || messages.length === 0) {
    messages = [{ role: 'user', content: 'Olá, comece a conversa' }]
  }

  // Detecta tipo de URL (website vs social media)
  const isInstagram = websiteUrl?.includes('instagram.com') || websiteUrl?.includes('insta.')
  const isTikTok = websiteUrl?.includes('tiktok.com')

  // WebFetch sempre que tiver URL
  let siteContent = ''
  if (websiteUrl) {
    try {
      console.log('[onboarding-chat] 🌐 Acessando URL:', websiteUrl, `(${isInstagram ? 'Instagram' : isTikTok ? 'TikTok' : 'Website'})`)

      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })
      const html = await response.text()

      if (isInstagram) {
        // Para Instagram: extrai meta tags e qualquer informação disponível
        const username = websiteUrl.match(/instagram\.com\/([^/?]+)/)?.[1] || 'usuário'

        // Tenta extrair og:title (nome do perfil)
        const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/) ||
                          html.match(/<meta\s+name="description"\s+content="([^"]*)"/)

        // Tenta extrair og:description (bio)
        const bioMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/) ||
                        html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/)

        // Tenta extrair texto simples do HTML (para algum conteúdo)
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 500)

        siteContent = [
          `📱 Perfil Instagram: @${username}`,
          titleMatch?.[1] && `Perfil: ${titleMatch[1].substring(0, 100)}`,
          bioMatch?.[1] && `Info: ${bioMatch[1].substring(0, 150)}`,
          textContent && textContent.length > 50 && `Conteúdo extraído: ${textContent.substring(0, 200)}`,
          '',
          '💡 Nota: Para análise mais profunda, você pode:',
          '1. Compartilhar a bio do seu Instagram',
          '2. Descrever brevemente o que sua empresa faz',
          '3. Contar sobre seus últimos posts ou campanhas',
        ]
          .filter(Boolean)
          .join('\n')
      } else {
        // Para websites normais: extrai conteúdo de seções relevantes
        let extractedText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')  // Remove scripts
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')    // Remove styles
          .replace(/<!--[\s\S]*?-->/g, '')                   // Remove comentários
          .replace(/<[^>]+>/g, ' ')                           // Remove HTML tags
          .replace(/\s+/g, ' ')                              // Normalize whitespace
          .trim()

        // Tira conteúdo comum que não ajuda (bloat)
        extractedText = extractedText
          .replace(/cookie|privacy policy|terms of service|copyright|all rights reserved/gi, '')
          .slice(0, 6000)  // Aumenta limite para 6000 chars

        siteContent = extractedText

        // Se conseguiu pouco conteúdo, tenta extrair de meta tags
        if (extractedText.length < 300) {
          const metaDescription = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)
          const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/)
          const title = html.match(/<title>([^<]*)<\/title>/)

          siteContent = [
            title?.[1] && `Título: ${title[1]}`,
            ogDescription?.[1] && `Descrição: ${ogDescription[1]}`,
            metaDescription?.[1] && `Info: ${metaDescription[1]}`,
            extractedText.slice(0, 2000)
          ]
            .filter(Boolean)
            .join('\n')
        }
      }

      console.log('[onboarding-chat] ✅ Conteúdo extraído:', siteContent.length, 'chars')
      if (siteContent.length === 0) {
        console.log('[onboarding-chat] ⚠️ Pouco conteúdo extraído da URL')
      }
    } catch (err) {
      console.error('[onboarding-chat] ❌ WebFetch erro:', err instanceof Error ? err.message : String(err))
      if (isInstagram) {
        const username = websiteUrl.match(/instagram\.com\/([^/?]+)/)?.[1] || 'perfil'
        siteContent = [
          `📱 Perfil Instagram: @${username}`,
          '',
          '💡 Não consegui acessar todos os detalhes do Instagram. Sem problema!',
          'Para uma análise melhor, você pode:',
          '1. Compartilhar a bio do seu perfil (@${username})',
          '2. Descrever o que sua empresa faz',
          '3. Contar sobre seu serviço/produto principal',
          '',
          'Assim consigo entender melhor seu negócio! 🚀'
        ].join('\n')
      }
    }
  }

  // System prompt para Pri
  const systemParts = [
    `Você é Pri. Ajuda clientes a encontrar soluções automação.

COMUNICAÇÃO:
- CONCISO. Máximo 3 linhas por mensagem.
- DIRETO. Sem fluff, sem palavras desnecessárias.
- USE "\n\n" para separar CADA MENSAGEM (aparecerá como mensagens diferentes).
- Cada mensagem é curta, direta, natural.

FERRAMENTAS APRIMORA IA QUE VOCÊ CONHECE:
1. **Chat Inteligente** - Chatbot com IA para atender clientes 24/7
2. **Cobrança WhatsApp** - Automação de cobrança, acompanhamento de pagamentos
3. **Flow Builder** - Automação de fluxos/processos (decisões, caminhos)
4. **Análise de Dados** - Relatórios e insights

OBJETIVO:
Descobrir qual desses problemas o cliente tem:
- Muita demanda de suporte/atendimento? → Chat Inteligente
- Dificuldade em cobrar clientes? → Cobrança WhatsApp
- Processos manuais e repetitivos? → Flow Builder
- Precisa acompanhar dados/métricas? → Análise de Dados

═══════════════════════════════════════════════════════════════

FASE 1 — Apresentação + Coleta Rápida (use "\n\n" entre mensagens):
1. Comece: "E aí! Sou a Pri, aqui pra entender seu negócio e encontrar as melhores ferramentas pra você.\n\nQual é o nome da sua empresa?\n\nE o que vocês fazem?"
2. Depois de saber o que fazem: "Vocês têm site, Instagram ou LinkedIn pra eu dar uma olhada?\n\nAssim consigo entender melhor como vocês se apresentam."
3. Depois: "Qual é o maior problema do dia a dia?" (foco: descobrir a dor)
4. Com base no problema, sugira a solução

FASE 2 — Análise com URL (se fornecer site/Instagram):
"Analisando seu site...\n\nVejo que vocês [detalhe específico].\n\nComo funciona o fluxo de venda?"

Mantenha conciso. Extraia só o essencial.

FASE 3 — Descobrir a Ferramenta Certa:
Com base no problema, sugira:

Se falam de:
- "Muita demanda de suporte" ou "clientes mandando mensagem direto" → Chat Inteligente
- "Difícil cobrar" ou "acompanhar pagamentos" → Cobrança WhatsApp
- "Processo manual" ou "muito repetitivo" → Flow Builder
- "Preciso acompanhar vendas/dados" → Análise de Dados

EXEMPLO DE CONVERSA CONCISA:
Você: "Qual é o maior problema do seu dia a dia?"
Cliente: "Recebo 100 mensagens por dia e consigo responder só 20"
Você: "Entendi. Quantas pessoas na equipe fazem atendimento?\n\nPorcaria... então vocês precisam de um Chat Inteligente pra responder automaticamente essas mensagens. Quer que eu explique como funciona?"

FASE 4 — Gerar Resumo (quando tiver dados suficientes):
Após entender o negócio + o principal problema, gere o resumo:

[RESUMO]
## Perfil: {Nome da Empresa}

**O que faz:** [1 linha concisa]
**Principal problema:** [qual dor você identificou]
**Solução Aprimora:** [qual ferramenta resolve]
**Próximas ações:** [o que fazer agora]

[/RESUMO]

═══════════════════════════════════════════════════════════════

TOM: Colega experiente que quer ajudar, não consultora formal.
- Conciso. Uma frase, uma ideia.
- Direto. Sem fluff.
- Natural. "Porcaria..." "faz sentido" quando apropriado.
- Foco no PROBLEMA + SOLUÇÃO, não em categorias genéricas.

NUNCA:
- Faça mais de 1 pergunta por mensagem
- Deixe respostas vagas sem aprofundar
- Demore a sugerir a solução (Chat, Cobrança, Flow, etc)

SEMPRE:
- Use "\n\n" para separar mensagens
- Mostre que entendeu: "Então vocês recebem 100 mensagens..."
- Sugira a ferramenta quando identificar o problema`,
    siteContent
      ? `\n═══ CONTEÚDO ANALISADO (${isInstagram ? '📱 Instagram' : isTikTok ? '🎵 TikTok' : '🌐 Website'} - ${websiteUrl}) ═══\n${siteContent}\n\n✓ INSTRUÇÕES CRÍTICAS PARA ESTE CONTEÚDO:
• Use os detalhes encontrados em CADA pergunta (não só na primeira)
• Se encontrou que "vendem X", pergunte "e de X, vocês vendem para quem especificamente?"
• Mostre que realmente leu e entendeu os detalhes
• Se o conteúdo foi limitado, AINDA ASSIM pergunte sobre o que PARECE fazer sentido
• Faça o cliente CONFIRMAR ou CORRIGIR sua interpretação com detalhes adicionais`
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
      let isControllerClosed = false

      try {
        // Se flowId fornecido, usa pipeline de agents
        if (flowId) {
          console.log('[onboarding-chat] Usando pipeline flowId:', flowId)
          try {
            const results = await executePipeline({
              flowId,
              userInput: messages[messages.length - 1]?.content || 'Olá',
              siteContent,
              onStream: (chunk: string) => {
                if (!isControllerClosed) {
                  try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: chunk })}\n\n`))
                  } catch {
                    isControllerClosed = true
                  }
                }
              },
            })

            if (!isControllerClosed) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
            }
          } catch (pipelineErr) {
            console.error('[onboarding-chat] Pipeline error:', pipelineErr)
            if (!isControllerClosed) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'error', message: 'Erro ao executar pipeline.' })}\n\n`
                )
              )
            }
          }

          try {
            if (!isControllerClosed) controller.close()
          } catch {}
          return
        }

        // Fallback: usar Pri hardcoded
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
              if (!isControllerClosed) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: chunk })}\n\n`))
              }
            } catch {
              // cliente desconectou
              isControllerClosed = true
              break
            }
          }
        }

        if (!isControllerClosed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
        }
      } catch (err) {
        console.error('[onboarding-chat] Error:', err)
        if (!isControllerClosed) {
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', message: 'Erro ao processar resposta.' })}\n\n`
              )
            )
          } catch {
            // controller já fechou
          }
        }
      }

      try {
        if (!isControllerClosed) {
          controller.close()
        }
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
