import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { summary, company_name, industry, website_url, social_media } = body

  if (!summary || !company_name) {
    return NextResponse.json(
      { message: 'Campos obrigatórios: summary, company_name' },
      { status: 400 }
    )
  }

  // Extrair [RESUMO] se existir
  const resumoMatch = summary.match(/\[RESUMO\]([\s\S]*?)\[\/RESUMO\]/i)
  const resumoText = resumoMatch ? resumoMatch[1].trim() : summary

  // Upsert na tabela business_profiles
  const { data, error } = await supabase
    .from('business_profiles')
    .upsert(
      {
        user_id: user.id,
        company_name,
        industry: industry || null,
        website_url: website_url || null,
        social_media: social_media || null,
        summary: resumoText,
        status: 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('id')
    .single()

  if (error) {
    console.error('[save-profile] Error:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, profileId: data.id }, { status: 201 })
}
