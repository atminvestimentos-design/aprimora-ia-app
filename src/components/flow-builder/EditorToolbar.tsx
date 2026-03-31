'use client'

interface EditorToolbarProps {
  flowName: string
  isActive: boolean
  isSaving: boolean
  isDirty: boolean
  onNameChange: (v: string) => void
  onSave: () => void
  onToggleActive: () => void
  onBack: () => void
}

export default function EditorToolbar({
  flowName,
  isActive,
  isSaving,
  isDirty,
  onNameChange,
  onSave,
  onToggleActive,
  onBack,
}: EditorToolbarProps) {
  return (
    <div style={{
      height: 52,
      flexShrink: 0,
      background: '#060d1f',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 16px',
    }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 7,
          background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
        }}
        className="hover:text-white/80 hover:border-white/20 transition-colors"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      {/* Flow name */}
      <input
        value={flowName}
        onChange={e => onNameChange(e.target.value)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#fff',
          fontSize: '0.92rem',
          fontWeight: 700,
          fontFamily: 'inherit',
          minWidth: 0,
        }}
        placeholder="Nome do fluxo"
      />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* is_active toggle */}
      <button
        onClick={onToggleActive}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 12px', borderRadius: 7,
          background: isActive ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.04)',
          border: isActive ? '1px solid rgba(5,150,105,0.4)' : '1px solid rgba(255,255,255,0.1)',
          color: isActive ? '#34d399' : 'rgba(255,255,255,0.4)',
          fontSize: '0.75rem', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
          transition: 'all 0.15s',
        }}
      >
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: isActive ? '#34d399' : 'rgba(255,255,255,0.2)',
          flexShrink: 0,
          boxShadow: isActive ? '0 0 6px #34d399' : 'none',
        }} />
        {isActive ? 'Ativo' : 'Inativo'}
      </button>

      {/* Save */}
      <button
        onClick={onSave}
        disabled={isSaving || !isDirty}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 16px', borderRadius: 8,
          background: isDirty && !isSaving ? 'linear-gradient(135deg, #06C8D8, #2563EB)' : 'rgba(255,255,255,0.08)',
          border: 'none',
          color: isDirty && !isSaving ? '#fff' : 'rgba(255,255,255,0.3)',
          fontSize: '0.82rem', fontWeight: 700,
          cursor: isDirty && !isSaving ? 'pointer' : 'default',
          fontFamily: 'inherit', flexShrink: 0,
          transition: 'all 0.15s',
        }}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
            Salvando...
          </>
        ) : 'Salvar'}
      </button>
    </div>
  )
}
