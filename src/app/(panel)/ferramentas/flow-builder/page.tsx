import { createServerSupabaseClient } from '@/lib/supabase/server'
import NewFlowButton from './NewFlowButton'
import ImportTemplatesButton from './ImportTemplatesButton'
import FlowCard from './FlowCard'

interface Flow {
  id: string
  name: string
  description: string | null
  is_active: boolean
  updated_at: string
}

export default async function FlowBuilderListPage() {
  const supabase = await createServerSupabaseClient()
  const { data: flows = [] } = await supabase
    .from('flows')
    .select('id, name, description, is_active, updated_at')
    .order('updated_at', { ascending: false })

  return (
    <div className="px-4 py-8 md:px-10 md:py-12" style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#06C8D8', marginBottom: 8 }}>
            FERRAMENTAS
          </p>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            Flow Builder
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            Crie fluxos visuais de atendimento para o WhatsApp
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <ImportTemplatesButton />
          <NewFlowButton />
        </div>
      </div>

      {/* Empty state */}
      {(!flows || flows.length === 0) && (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
            background: 'rgba(6,200,216,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#06C8D8',
          }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
            Nenhum fluxo criado ainda
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 24px' }}>
            Clique em &ldquo;Novo Fluxo&rdquo; para criar seu primeiro fluxo de atendimento.
          </p>
          <NewFlowButton />
        </div>
      )}

      {/* Flow list */}
      {flows && flows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(flows as Flow[]).map(flow => (
            <FlowCard key={flow.id} flow={flow} />
          ))}
        </div>
      )}
    </div>
  )
}
