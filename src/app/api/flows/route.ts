import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })

  const { data, error } = await supabase
    .from('flows')
    .select('id, name, description, is_active, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const name = body.name ?? 'Novo Fluxo'

  const { data, error } = await supabase
    .from('flows')
    .insert({ user_id: user.id, name, nodes: [], edges: [] })
    .select()
    .single()

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
