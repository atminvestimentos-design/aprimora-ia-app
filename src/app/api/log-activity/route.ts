import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'

export const dynamic = 'force-dynamic'

interface LogEntry {
  timestamp: string
  action: string
  tool: 'claude' | 'ollama'
  tokens: number
  description: string
}

const MAX_LOG_ENTRIES = 100
const TOKEN_LOG_FILE = path.join(os.homedir(), '.claude', 'token-log.json')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { action, tool, tokens, description } = body

    // Validação
    if (!action || !tool || typeof tokens !== 'number' || !description) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      )
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      action,
      tool,
      tokens,
      description
    }

    // Garantir que diretório existe
    const dir = path.dirname(TOKEN_LOG_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Ler arquivo existente
    let logEntries: LogEntry[] = []
    if (fs.existsSync(TOKEN_LOG_FILE)) {
      try {
        const content = fs.readFileSync(TOKEN_LOG_FILE, 'utf-8')
        logEntries = JSON.parse(content)
      } catch (err) {
        console.error('Error reading token-log.json:', err)
        logEntries = []
      }
    }

    // Adicionar novo entry e manter últimas 100
    logEntries.push(entry)
    if (logEntries.length > MAX_LOG_ENTRIES) {
      logEntries = logEntries.slice(-MAX_LOG_ENTRIES)
    }

    // Salvar
    fs.writeFileSync(TOKEN_LOG_FILE, JSON.stringify(logEntries, null, 2))

    return NextResponse.json({ success: true, entry }, { status: 200 })
  } catch (err) {
    console.error('Error in log-activity:', err)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
