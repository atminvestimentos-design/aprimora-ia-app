@AGENTS.md

## Busca e Exploração Eficiente de Código

**NUNCA use Explore agents para exploração genérica.** Custo: 20-30% da sessão vs Read/Grep/Glob = 2-3%.

- ✅ **Use Read/Grep/Glob** para: buscas rápidas em texto, filtragem por nome/conteúdo
- ✅ **Use mcp_ollama_read_relevant** para: extrair seções relevantes de arquivos grandes
- ✅ **Use Explore agents APENAS para:** análise profunda com múltiplas dependências complexas (justificar)
- ❌ **NUNCA explore cegamente**: sempre cheque MEMORY.md + plan file antes

**Checklist antes de chamar Agent:**
1. Tenho contexto do plano anterior ou session summary?
2. Posso ler 2-3 files específicos direto?
3. Devo perguntar ao usuário em vez de explorar?

---

## Uso do MCP Ollama

Sempre que possível, usar as tools abaixo para economizar tokens do Claude.

| Tool | Quando usar | Custo |
|------|------------|-------|
| `mcp_ollama_read_relevant` | Arquivo >300 linhas e preciso de seção específica | ~1% sessão |
| `mcp_ollama_generate_code` | Código repetitivo/boilerplate (node, route, componente, migration) | ~0% sessão |
| `Read` direto | Arquivo pequeno (<300 linhas) ou preciso ler tudo | ~2-3% sessão |

**mcp_ollama_read_relevant — exemplos:**
```
// ✅ Em vez de ler flow-executor.ts inteiro (275 linhas):
mcp_ollama_read_relevant("src/lib/flow-executor.ts", "como callClaude usa o system prompt")

// ✅ Em vez de ler ConfigPanel.tsx inteiro:
mcp_ollama_read_relevant("src/components/flow-builder/ConfigPanel.tsx", "campos do agente_ia")
```

**mcp_ollama_generate_code — exemplos:**
```
// ✅ Para gerar API route novo (boilerplate repetitivo):
mcp_ollama_generate_code("Next.js API route GET/POST para tabela business_profiles, padrão do projeto")

// ✅ Para gerar migration SQL:
mcp_ollama_generate_code("Supabase migration SQL para tabela business_profiles com RLS")

// ✅ Para gerar componente React com estrutura conhecida:
mcp_ollama_generate_code("React client component modal de onboarding, tema escuro, mesmo padrão do FlowEditor")
```

**Regra:** Se for gerar >50 linhas de código novo → use mcp_ollama_generate_code primeiro, depois ajuste.

---

## Modo de Operação

- **Preferência: Plan Mode** — força parada para pensar antes de executar
- **Em plan mode:** use Read/Grep/Glob + perguntas, NÃO Explore agents genéricos
- **Decisão automática:** se tem contexto anterior, não explore
