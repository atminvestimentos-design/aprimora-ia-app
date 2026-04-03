import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { flowTemplates } from '@/lib/flow-templates'

export const dynamic = 'force-dynamic'

/**
 * POST /api/flows/templates
 * Cria os 3 templates padrão na conta do usuário
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const templates = Object.values(flowTemplates)
    const results = []

    for (const template of templates) {
      const { data, error } = await supabase
        .from('flows')
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          nodes: template.nodes,
          edges: template.edges,
          is_active: false
        })
        .select()
        .single()

      if (error) {
        console.error(`Erro ao criar template ${template.name}:`, error)
        results.push({ name: template.name, success: false, error: error.message })
      } else {
        results.push({ name: template.name, success: true, id: data.id })
      }
    }

    const allSuccess = results.every(r => r.success)
    const status = allSuccess ? 201 : 207

    return NextResponse.json(
      {
        message: allSuccess ? 'Todos os templates criados com sucesso!' : 'Alguns templates falharam',
        results
      },
      { status }
    )
  } catch (error) {
    console.error('Erro ao criar templates:', error)
    return NextResponse.json(
      { message: 'Erro ao criar templates' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/flows/templates
 * Lista os templates disponíveis (sem salvar no banco)
 */
export async function GET() {
  return NextResponse.json({
    templates: Object.entries(flowTemplates).map(([key, template]) => ({
      id: key,
      name: template.name,
      description: template.description
    }))
  })
}
