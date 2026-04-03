import { useState } from 'react'

interface LogActivityProps {
  action: string
  tool: 'claude' | 'ollama'
  tokens: number
  description: string
}

interface LogResponse {
  success: boolean
  entry?: {
    timestamp: string
    action: string
    tool: string
    tokens: number
    description: string
  }
  message?: string
}

export function useActivityLogger() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const log = async (props: LogActivityProps) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props)
      })

      const data: LogResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to log activity')
      }

      return data.entry
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error('[useActivityLogger]', errorMsg)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { log, loading, error }
}
