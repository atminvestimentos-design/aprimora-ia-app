'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProfileSummaryModal from './ProfileSummaryModal'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function OnboardingChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentSummary, setCurrentSummary] = useState<string | null>(null)
  const [phase, setPhase] = useState<'chat' | 'review'>('chat')
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initial: enviar msg vazia para receber saudação
  useEffect(() => {
    const fetchGreeting = async () => {
      setIsStreaming(true)
      try {
        const response = await fetch('/api/onboarding/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [], websiteUrl: null }),
        })

        if (!response.ok) throw new Error('Failed to fetch greeting')

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader')

        let fullText = ''
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'text') {
                  fullText += data.text
                }
              } catch {
                // parse error
              }
            }
          }
        }

        if (fullText) {
          setMessages([{ role: 'assistant', content: fullText }])
        }
      } catch (err) {
        console.error('[onboarding-chat] Error fetching greeting:', err)
        setMessages([
          {
            role: 'assistant',
            content: 'Olá! Sou Ana, consultora de automação. Como posso ajudar você a otimizar seu negócio?',
          },
        ])
      } finally {
        setIsStreaming(false)
      }
    }

    fetchGreeting()
  }, [])

  // Detecta URL na input
  const detectUrl = (text: string) => {
    const urlRegex = /https?:\/\/[^\s]+/
    const match = text.match(urlRegex)
    if (match) {
      setWebsiteUrl(match[0])
      return text.replace(urlRegex, '').trim()
    }
    return text
  }

  // Detecta [RESUMO]...[/RESUMO]
  const extractSummary = (text: string) => {
    const match = text.match(/\[RESUMO\]([\s\S]*?)\[\/RESUMO\]/)
    if (match) {
      const summary = match[1].trim()
      setCurrentSummary(summary)

      // Extrai company name da linha "## Perfil: {name}"
      const companyMatch = summary.match(/##\s*Perfil:\s*(.+)/i)
      if (companyMatch) {
        setCompanyName(companyMatch[1].trim())
      }

      // Mostra modal
      setShowSummaryModal(true)
      setPhase('review')

      return text.replace(/\[RESUMO\][\s\S]*?\[\/RESUMO\]/g, '').trim()
    }
    return text
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

    // Regex para URL normal (site.com.br, www.site.com.br, https://site.com.br, etc)
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)*/

    // Regex para Instagram handle (@username)
    const instagramHandleRegex = /@([a-zA-Z0-9_.]+)/

    // Detectar WEBSITE primeiro (prioridade)
    const urlMatch = trimmed.match(urlRegex)
    let detectedUrl = null
    let textToSend = trimmed

    if (urlMatch) {
      // Se encontrou URL de website, usa ela
      detectedUrl = urlMatch[0]
      if (!detectedUrl.startsWith('http')) {
        detectedUrl = 'https://' + detectedUrl
      }
      textToSend = trimmed.replace(urlRegex, '').trim()
      console.log('[OnboardingChat] Website detectado:', detectedUrl)
    } else {
      // Se não encontrou website, procura Instagram handle
      const instagramMatch = trimmed.match(instagramHandleRegex)
      if (instagramMatch) {
        const handle = instagramMatch[1]
        detectedUrl = `https://instagram.com/${handle}`
        textToSend = trimmed.replace(instagramHandleRegex, '').trim()
        console.log('[OnboardingChat] Instagram handle detectado:', handle, '→', detectedUrl)
      }
    }

    console.log('[OnboardingChat] Input:', trimmed)
    console.log('[OnboardingChat] Detectado URL:', detectedUrl)
    console.log('[OnboardingChat] Text to send:', textToSend)

    // Se detectou URL, atualiza state
    if (detectedUrl) {
      setWebsiteUrl(detectedUrl)
    }

    // Adicionar mensagem do usuário
    const userMessage: Message = { role: 'user', content: textToSend || trimmed }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    try {
      const response = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          websiteUrl: detectedUrl || websiteUrl,  // Usa URL detectada agora, ou a anterior
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch response')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      let fullText = ''
      const decoder = new TextDecoder()

      // Acumula o texto completo primeiro
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'text') {
                fullText += data.text
              }
            } catch {
              // parse error
            }
          }
        }
      }

      // Divide o texto em "mensagens" separadas por quebra dupla (\n\n)
      const messageParts = fullText.split('\n\n').filter(part => part.trim().length > 0)

      // Envia cada parte como uma mensagem separada com "Pri está digitando..."
      for (const part of messageParts) {
        // Calcula delay proporcional: 1 segundo a cada 20 caracteres
        const characterCount = part.trim().length
        const delayMs = Math.max(500, (characterCount / 20) * 1000)

        // Aguarda um tempo proporcional ao tamanho da mensagem
        await new Promise(r => setTimeout(r, delayMs))

        // Cria a mensagem
        const assistantMessage: Message = { role: 'assistant', content: part.trim() }
        setMessages(prev => [...prev, assistantMessage])
      }

      // Detectar resumo no texto final
      const cleanedText = extractSummary(fullText)
      if (cleanedText !== fullText) {
        // Resumo foi encontrado, atualizar última mensagem
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1].content = cleanedText
          return newMessages
        })
      }
    } catch (err) {
      console.error('[onboarding-chat] Error:', err)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' },
      ])
    } finally {
      setIsStreaming(false)
    }
  }

  const handleApprove = async () => {
    if (!currentSummary) return
    setIsSaving(true)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: currentSummary,
          raw_conversation: messages,
          structured_data: {}, // pode ser preenchido depois
        }),
      })

      if (!response.ok) throw new Error('Failed to save profile')

      // Fechar modal após sucesso
      window.parent.postMessage({ type: 'onboarding-approved' }, '*')
    } catch (err) {
      console.error('[onboarding] Error saving profile:', err)
      alert('Erro ao aprovar resumo. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-md px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
              style={{ wordWrap: 'break-word' }}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-300 px-4 py-3 rounded-lg border border-gray-700 flex items-center gap-2">
              <span className="text-sm">Pri está digitando</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' } as any}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' } as any}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Summary Review */}
      {phase === 'review' && currentSummary && (
        <div className="border-t border-gray-700 p-4 bg-gray-800 max-h-48 overflow-y-auto">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">📋 Resumo do seu negócio:</h4>
            <div className="bg-gray-900 p-3 rounded border border-gray-700 text-sm text-gray-100 whitespace-pre-wrap">
              {currentSummary}
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3">Se quiser ajustar algo, é só me dizer!</p>
          <button
            onClick={handleApprove}
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded text-sm font-medium transition"
          >
            {isSaving ? 'Salvando...' : '✅ Aprovar resumo'}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-700 p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Digite sua mensagem..."
          disabled={isStreaming || phase === 'review'}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded text-sm font-medium transition"
        >
          {isStreaming ? '⏳' : '→'}
        </button>
      </div>

      {/* Profile Summary Modal */}
      <ProfileSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        summary={currentSummary || ''}
        companyName={companyName}
      />
    </div>
  )
}
