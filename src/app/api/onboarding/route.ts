import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })

  const { data, error } = await supabase
    .from('business_profiles')
    .select('id, company_name, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })

  return NextResponse.json({
    exists: !!data?.id,
    profile: data ?? null,
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { summary, structured_data, raw_conversation } = body

  // Upsert: cria se não existe, atualiza se existe
  const { data, error } = await supabase
    .from('business_profiles')
    .upsert({
      user_id: user.id,
      summary,
      structured_data,
      raw_conversation,
      status: 'approved',
    }, { onConflict: 'user_id' })
    .select('id, status')
    .single()

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
