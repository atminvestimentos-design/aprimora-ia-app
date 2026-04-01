'use client'

import { useEffect, useRef, useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function OnboardingPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentSummary, setCurrentSummary] = useState<string | null>(null)
  const [phase, setPhase] = useState<'chat' | 'review'>('chat')
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initial greeting
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
        console.error('[onboarding-panel] Error:', err)
      } finally {
        setIsStreaming(false)
      }
    }

    fetchGreeting()
  }, [])

  const detectUrl = (text: string) => {
    const urlRegex = /https?:\/\/[^\s]+/
    const match = text.match(urlRegex)
    if (match) {
      setWebsiteUrl(match[0])
      return text.replace(urlRegex, '').trim()
    }
    return text
  }

  const extractSummary = (text: string) => {
    const match = text.match(/\[RESUMO\]([\s\S]*?)\[\/RESUMO\]/)
    if (match) {
      const summary = match[1].trim()
      setCurrentSummary(summary)
      setPhase('review')
      return text.replace(/\[RESUMO\][\s\S]*?\[\/RESUMO\]/g, '').trim()
    }
    return text
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

    const textToSend = detectUrl(trimmed)
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
          websiteUrl,
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch response')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      let fullText = ''
      let assistantMessage: Message = { role: 'assistant', content: '' }
      let messageAdded = false
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
                assistantMessage.content = fullText

                if (!messageAdded) {
                  setMessages(prev => [...prev, assistantMessage])
                  messageAdded = true
                } else {
                  setMessages(prev => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1] = assistantMessage
                    return newMessages
                  })
                }
              }
            } catch {
              // parse error
            }
          }
        }
      }

      const cleanedText = extractSummary(fullText)
      if (cleanedText !== fullText) {
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1].content = cleanedText
          return newMessages
        })
      }
    } catch (err) {
      console.error('[onboarding-panel] Error:', err)
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
          structured_data: {},
        }),
      })

      if (!response.ok) throw new Error('Failed to save profile')

      // Reload para mostrar novo layout
      window.location.reload()
    } catch (err) {
      console.error('[onboarding-panel] Error saving:', err)
      alert('Erro ao aprovar resumo.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 px-4 py-2 rounded-lg border border-gray-700">
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
        <div className="border-t border-gray-700 p-3 bg-gray-800 max-h-24 overflow-y-auto">
          <h4 className="text-xs font-semibold text-gray-300 mb-2">📋 Resumo:</h4>
          <div className="bg-gray-900 p-2 rounded border border-gray-700 text-xs text-gray-100 line-clamp-3">
            {currentSummary}
          </div>
          <button
            onClick={handleApprove}
            disabled={isSaving}
            className="w-full mt-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-1 rounded text-xs font-medium transition"
          >
            {isSaving ? 'Salvando...' : '✅ Aprovar'}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-700 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Sua resposta..."
          disabled={isStreaming}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-medium transition"
        >
          →
        </button>
      </div>
    </div>
  )
}
