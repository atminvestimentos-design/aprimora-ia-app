'use client'

import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'

type ProfileSummaryModalProps = {
  isOpen: boolean
  onClose: () => void
  summary: string
  companyName: string
}

export default function ProfileSummaryModal({ isOpen, onClose, summary, companyName }: ProfileSummaryModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  if (!isOpen) return null

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/onboarding/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          company_name: companyName,
        }),
      })

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => {
          setSaveSuccess(false)
          onClose()
        }, 2000)
      }
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Resumo do Briefing</h2>

        <div className="bg-gray-800 rounded p-4 mb-6 text-gray-100 prose prose-invert max-w-none">
          <Markdown>{summary}</Markdown>
        </div>

        {saveSuccess ? (
          <div className="bg-green-900/30 border border-green-500 text-green-400 p-4 rounded mb-6">
            ✅ Perfil salvo com sucesso!
          </div>
        ) : null}

        <div className="flex gap-4">
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            {isSaving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
