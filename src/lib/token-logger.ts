/**
 * Token Logger - Rastreia gasto de tokens Claude vs Ollama
 * Objetivo: entender custos efetivos do plano Pro
 */

interface TokenEntry {
  timestamp: Date
  type: 'read' | 'edit' | 'write' | 'api_call' | 'ollama_generate' | 'ollama_read'
  filepath?: string
  tool: 'Read' | 'Edit' | 'Write' | 'API' | 'Ollama'
  tokens_claude: number
  tokens_ollama: number
  description: string
}

interface TokenBreakdown {
  read: number
  edit: number
  write: number
  api: number
  ollama: number
}

class TokenLogger {
  private entries: TokenEntry[] = []
  private sessionStart: Date = new Date()

  /**
   * Log quando usa Read tool (custa tokens Claude)
   */
  logRead(filepath: string, lines: number, estimated_tokens?: number) {
    const tokens = estimated_tokens || Math.ceil(lines * 2.5)
    this.entries.push({
      timestamp: new Date(),
      type: 'read',
      filepath,
      tool: 'Read',
      tokens_claude: tokens,
      tokens_ollama: 0,
      description: `Read ${filepath} (${lines} linhas)`,
    })
  }

  /**
   * Log quando usa Edit tool (custa tokens Claude)
   */
  logEdit(filepath: string, estimated_tokens?: number) {
    const tokens = estimated_tokens || 300
    this.entries.push({
      timestamp: new Date(),
      type: 'edit',
      filepath,
      tool: 'Edit',
      tokens_claude: tokens,
      tokens_ollama: 0,
      description: `Edit ${filepath}`,
    })
  }

  /**
   * Log quando usa Write tool (custa tokens Claude)
   */
  logWrite(filepath: string, lines: number, estimated_tokens?: number) {
    const tokens = estimated_tokens || Math.ceil(lines * 10)
    this.entries.push({
      timestamp: new Date(),
      type: 'write',
      filepath,
      tool: 'Write',
      tokens_claude: tokens,
      tokens_ollama: 0,
      description: `Write ${filepath} (${lines} linhas)`,
    })
  }

  /**
   * Log quando usa Ollama (0 tokens Claude)
   */
  logOllamaGenerate(task: string, estimated_tokens?: number) {
    const tokens = estimated_tokens || 500
    this.entries.push({
      timestamp: new Date(),
      type: 'ollama_generate',
      tool: 'Ollama',
      tokens_claude: 0,
      tokens_ollama: tokens,
      description: `Ollama generate: ${task.substring(0, 50)}...`,
    })
  }

  /**
   * Log quando usa mcp_ollama_read_relevant (0 tokens Claude)
   */
  logOllamaRead(filepath: string, query: string, estimated_tokens?: number) {
    const tokens = estimated_tokens || 100
    this.entries.push({
      timestamp: new Date(),
      type: 'ollama_read',
      filepath,
      tool: 'Ollama',
      tokens_claude: 0,
      tokens_ollama: tokens,
      description: `Ollama read: ${filepath} (query: ${query.substring(0, 30)}...)`,
    })
  }

  /**
   * Log quando faz chamada API (custa tokens Claude)
   */
  logApiCall(endpoint: string, input_tokens: number, output_tokens: number) {
    this.entries.push({
      timestamp: new Date(),
      type: 'api_call',
      tool: 'API',
      tokens_claude: input_tokens + output_tokens,
      tokens_ollama: 0,
      description: `API call: ${endpoint} (in:${input_tokens} out:${output_tokens})`,
    })
  }

  /**
   * Calcula total de tokens
   */
  getTotal(): { claude: number; ollama: number } {
    const totals = this.entries.reduce(
      (acc, entry) => ({
        claude: acc.claude + entry.tokens_claude,
        ollama: acc.ollama + entry.tokens_ollama,
      }),
      { claude: 0, ollama: 0 }
    )
    return totals
  }

  /**
   * Breakdown por tipo de atividade
   */
  getBreakdown(): TokenBreakdown {
    return this.entries.reduce(
      (acc, entry) => {
        if (entry.type === 'read') acc.read += entry.tokens_claude
        else if (entry.type === 'edit') acc.edit += entry.tokens_claude
        else if (entry.type === 'write') acc.write += entry.tokens_claude
        else if (entry.type === 'api_call') acc.api += entry.tokens_claude
        else if (entry.type === 'ollama_generate' || entry.type === 'ollama_read') acc.ollama += entry.tokens_ollama
        return acc
      },
      { read: 0, edit: 0, write: 0, api: 0, ollama: 0 }
    )
  }

  /**
   * Gera relatório em markdown
   */
  generateReport(): string {
    const totals = this.getTotal()
    const breakdown = this.getBreakdown()
    const totalAllTokens = totals.claude + totals.ollama
    const economySavings = breakdown.ollama > 0 ? `\n✅ **Economia com Ollama**: ${breakdown.ollama} tokens (${((breakdown.ollama / (totalAllTokens || 1)) * 100).toFixed(1)}% do total)` : ''

    let report = `# Token Usage Report

**Sessão iniciada**: ${this.sessionStart.toLocaleString('pt-BR')}

## Totais
- **Claude (Pago)**: ${totals.claude.toLocaleString()} tokens
- **Ollama (Grátis)**: ${totals.ollama.toLocaleString()} tokens
- **Total**: ${totalAllTokens.toLocaleString()} tokens
${economySavings}

## Breakdown por Tipo
| Tipo | Tokens | % |
|------|--------|---|
| Read | ${breakdown.read.toLocaleString()} | ${((breakdown.read / (totalAllTokens || 1)) * 100).toFixed(1)}% |
| Edit | ${breakdown.edit.toLocaleString()} | ${((breakdown.edit / (totalAllTokens || 1)) * 100).toFixed(1)}% |
| Write | ${breakdown.write.toLocaleString()} | ${((breakdown.write / (totalAllTokens || 1)) * 100).toFixed(1)}% |
| API Calls | ${breakdown.api.toLocaleString()} | ${((breakdown.api / (totalAllTokens || 1)) * 100).toFixed(1)}% |
| Ollama | ${breakdown.ollama.toLocaleString()} | ${((breakdown.ollama / (totalAllTokens || 1)) * 100).toFixed(1)}% |

## Detalhes das Atividades
${this.entries.map(e => `- **[${e.timestamp.toLocaleTimeString('pt-BR')}]** ${e.tool}: ${e.description} (${e.tokens_claude + e.tokens_ollama} tokens)`).join('\n')}

## Estimativa de Custo (Plano Pro)
- **Taxa Claude**: ~$0.003 por 1k tokens (input)
- **Custo estimado**: $${(totals.claude * 0.003 / 1000).toFixed(2)}
`

    return report
  }

  /**
   * Exibe relatório no console
   */
  printReport() {
    console.log('\n' + '='.repeat(60))
    console.log(this.generateReport())
    console.log('='.repeat(60) + '\n')
  }

  /**
   * Retorna entries para análise
   */
  getEntries(): TokenEntry[] {
    return [...this.entries]
  }
}

// Singleton global
let globalLogger: TokenLogger | null = null

export function getTokenLogger(): TokenLogger {
  if (!globalLogger) {
    globalLogger = new TokenLogger()
  }
  return globalLogger
}

export default TokenLogger
