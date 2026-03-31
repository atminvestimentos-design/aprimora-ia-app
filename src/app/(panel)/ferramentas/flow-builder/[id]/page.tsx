import FlowEditor from '@/components/flow-builder/FlowEditor'

export default async function FlowEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <>
      {/* Mobile: not available */}
      <div className="flex md:hidden flex-col items-center justify-center h-full px-6 text-center gap-4" style={{ minHeight: '60vh' }}>
        <svg width="48" height="48" fill="none" stroke="rgba(255,255,255,0.2)" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
        </svg>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Editor disponível somente no computador</p>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
          O Flow Builder requer uma tela maior para funcionar corretamente. Acesse pelo computador.
        </p>
      </div>

      {/* Desktop: full editor */}
      <div className="hidden md:block" style={{ height: '100%', width: '100%' }}>
        <FlowEditor flowId={id} />
      </div>
    </>
  )
}
