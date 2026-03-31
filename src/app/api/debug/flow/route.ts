/**
 * Endpoint de diagnóstico do Flow Builder.
 * Remove este arquivo após depurar.
 * GET  /api/debug/flow          → estado geral (flows ativos, sessões, config)
 * POST /api/debug/flow          → simula chegada de mensagem e roda o executor
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { executeFlow } from '@/lib/flow-executor'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServiceSupabaseClient()

  // Todos os flows ativos
  const { data: flows, error: flowsErr } = await supabase
    .from('flows')
    .select('id, name, is_active, user_id, nodes, edges')
    .eq('is_active', true)

  // Sessões abertas
  const { data: sessions, error: sessErr } = await supabase
    .from('flow_sessions')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10)

  // Config WhatsApp de cada tenant
  const { data: configs } = await supabase
    .from('tenant_whatsapp_config')
    .select('user_id, evolution_instance, is_connected, connected_phone')

  return NextResponse.json({
    active_flows: flows ?? [],
    flows_error: flowsErr?.message ?? null,
    active_sessions: sessions ?? [],
    sessions_error: sessErr?.message,
    whatsapp_configs: configs ?? [],
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { phone, message, user_id } = body as { phone?: string; message?: string; user_id?: string }

  if (!phone || !message || !user_id) {
    return NextResponse.json(
      { error: 'Forneça: phone, message, user_id no body JSON' },
      { status: 400 }
    )
  }

  try {
    await executeFlow({
      userId: user_id,
      phone,
      debtorId: null,
      incomingMessage: message,
    })
    return NextResponse.json({ ok: true, message: 'Executor rodou sem exceção' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message, stack: (err as Error).stack }, { status: 500 })
  }
}
