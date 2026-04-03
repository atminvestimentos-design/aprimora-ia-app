@AGENTS.md

# Estratégia Claude + Ollama — Máxima Eficiência de Tokens

**Objetivo:** Usar Claude (pago) apenas para decisões e síntese. Ollama (gratuito) para tudo que é mecânico.

## 🎯 Regra de Ouro

**Antes de qualquer ação, sempre perguntar: "Isso pode ser feito com Ollama?"**

| Atividade | Quem faz | Economia |
|-----------|----------|----------|
| Gerar código (>50 linhas) | Ollama | ~$0.50-1.00 por task |
| Ler arquivo grande (>300 linhas, seção específica) | Ollama | ~70% vs Read direto |
| Exploração inicial / refatorações | Ollama | ~80% vs Explore agents |
| Decisões, síntese, debugging | Claude | Necessário, não economiza |

---

## 📋 Checklist Antes de Cada Ação

```
1. ☐ Vou gerar código novo? → mcp_ollama_generate_code
2. ☐ Vou ler arquivo >300 linhas? → mcp_ollama_read_relevant (seção específica)
3. ☐ Vou fazer multiple Reads/Globs? → Combinar em 1 call
4. ☐ Estou em plan mode e preciso explorar? → Usar Ollama, NÃO Read/Grep blindly
5. ☐ Vou criar arquivo novo? → Gerar com Ollama ANTES, depois Write uma vez
6. ☐ Vou editar arquivo existente? → Se >1 mudança, Read-Ollama-Edit-Edit (batch changes)
```

---

## 🛠️ Ferramentas Ollama (Grátis)

### 1️⃣ `mcp_ollama_generate_code` — Código novo

**Custo:** ~0% sessão (local)  
**Quando usar:** Gerar >50 linhas de código novo

**Padrão:**
```javascript
mcp_ollama_generate_code({
  task: "Descrição clara do que gerar, incluindo contexto/padrões do projeto"
  // Exemplo: "Node.js HTTP server na porta 9999 que serve HTML e API JSON, padrão do projeto"
})
```

**Regra:** Se vou criar arquivo novo com código, use Ollama PRIMEIRO para gerar, depois ajuste com Edit/Write.

---

### 2️⃣ `mcp_ollama_read_relevant` — Leitura inteligente

**Custo:** ~1% sessão (vs ~2-3% com Read direto)  
**Quando usar:** Arquivo >300 linhas E preciso de seção específica

**Padrão:**
```javascript
mcp_ollama_read_relevant({
  filePath: "c:\\Users\\AntônioRC\\Desktop\\aprimora-ia-app\\src\\lib\\flow-executor.ts",
  query: "como callClaude usa o system prompt e passa contexto" // Descrição do que procuro
})
```

**Exemplo real:**
```
// ❌ ANTES (7% tokens):
Read("src/lib/flow-executor.ts") // 275 linhas, lê tudo

// ✅ DEPOIS (1% tokens):
mcp_ollama_read_relevant("src/lib/flow-executor.ts", "como callClaude passa business context no system prompt")
```

---

## 🚫 O que NÃO fazer

| Ação | Por quê | Alternativa |
|------|--------|-------------|
| `Read` arquivo >300 linhas inteiro | Gasta 2-3% tokens desnecessários | `mcp_ollama_read_relevant` |
| Chamar Explore agent genericamente | 20-30% tokens em 1 call | Específico: "Explore agent para Y" |
| Chamar `mcp_ollama_read_relevant` sem query específica | Impreciso, perde vantagem | "query: 'função X e como ela usa Y'" |
| Fazer 5 `mcp_ollama_generate_code` separados | Overhead | Gerar tudo junto, depois ajustar |
| Usar Read/Glob em plan mode | Custa 7% em plan | Usar Ollama ou perguntar ao usuário |

---

## 📊 Exemplo Real: Implementar Feature

**Cenário:** Implementar novo endpoint API + componente React + migration SQL

**❌ Jeito errado (gastaria ~15% sessão):**
```
1. Read src/app/api/flows/route.ts (entender padrão) → 2%
2. Read src/components/FlowEditor.tsx (entender padrão) → 3%
3. Read supabase/migrations/003_*.sql (ver padrão) → 2%
4. mcp_ollama_generate_code (gerar 3 arquivos) → 0%
5. Write (criar arquivos) → 3%
6. Edit (ajustar) → 3%
= **15% sessão**
```

**✅ Jeito certo (gastaria ~5% sessão):**
```
1. mcp_ollama_read_relevant("src/app/api/flows/route.ts", "estrutura de endpoint GET/POST") → 1%
2. mcp_ollama_read_relevant("src/components/FlowEditor.tsx", "props e estado") → 1%
3. mcp_ollama_generate_code("3 arquivos: API route + React component + migration SQL, padrões encontrados") → 0%
4. Revisar output visualmente, corrigir se needed
5. Write (1 call para os 3 arquivos) → 1%
6. Edit (ajustes se necessário) → 2%
= **~5% sessão** (3x mais eficiente!)
```

---

## 🎯 Fluxo de Decisão

```
Preciso de código novo?
├─ Sim, >50 linhas
│  ├─ Preciso ler padrões do projeto primeiro?
│  │  ├─ Sim → mcp_ollama_read_relevant (seção específica) + mcp_ollama_generate_code
│  │  └─ Não → Direto para mcp_ollama_generate_code
│  └─ <50 linhas → Escrever direto
│
├─ Preciso ler arquivo?
│  ├─ >300 linhas E seção específica?
│  │  └─ Sim → mcp_ollama_read_relevant
│  └─ Não → Read direto (pequeno)
│
└─ Preciso explorar/entender código?
   ├─ Complexo, múltiplas dependências?
   │  └─ Sim, use Explore (justifique) OU mcp_ollama_read_relevant
   └─ Simples → Grep/Glob específico
```

---

## 📝 Padrão de Instruções para Ollama

Sempre inclua contexto no `task`:

**Bom:**
```
"Node.js HTTP server (porta 9999, ~150 linhas) que:
- Serve HTML dashboard
- GET /data → retorna JSON de ~/.claude/token-log.json
- GET /clear → limpa log
Usar Node.js built-in http module, sem dependências externas."
```

**Ruim:**
```
"Fazer um server"
```

---

## 🔄 Em Plan Mode

**Regra especial:** Plan Mode também gasta tokens claudeando explorações desnecessárias.

- ✅ Use `mcp_ollama_read_relevant` para exploração de código
- ✅ Use Glob/Grep para buscas rápidas
- ❌ NUNCA Explore agents genéricos em plan mode
- ❌ NUNCA ler arquivos inteiros quando precisa de seção

**Antes de plan mode:** Sempre leia MEMORY.md + plan file anterior (contexto grátis)

---

## 💾 Integração com Token Dashboard

Dashboard em `~/.claude/token-dashboard/` monitora consumo em tempo real. Hook em `settings.json` registra cada ação.

**Para otimizar visualizado no dashboard:**
- Muitos "Read" vermelhos? → Trocar por `mcp_ollama_read_relevant`
- Muitos "Write"? → Batch code generation com Ollama
- Proporção Claude/Ollama ruim? → Revisar checklist acima
