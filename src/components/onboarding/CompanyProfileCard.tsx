'use client'

import { useState } from 'react'

interface CompanyProfile {
  id: string
  company_name?: string
  industry?: string
  summary?: string
}

interface Props {
  profile: CompanyProfile
}

export default function CompanyProfileCard({ profile }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const summaryPreview = profile.summary
    ? profile.summary.slice(0, 150) + (profile.summary.length > 150 ? '...' : '')
    : 'Perfil do negócio'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center text-xl">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {profile.company_name || 'Perfil criado'}
              </h3>
              {profile.industry && (
                <p className="text-sm text-gray-400">{profile.industry}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition text-xl"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {/* Preview */}
        {!isExpanded && (
          <p className="text-sm text-gray-300 mb-4">{summaryPreview}</p>
        )}

        {/* Expanded */}
        {isExpanded && (
          <div className="bg-gray-900/50 rounded p-4 mb-4 max-h-64 overflow-y-auto">
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{profile.summary}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Perfil aprovado
          </div>
          <div>|</div>
          <button className="hover:text-white transition">
            Editar perfil
          </button>
        </div>
      </div>
    </div>
  )
}
