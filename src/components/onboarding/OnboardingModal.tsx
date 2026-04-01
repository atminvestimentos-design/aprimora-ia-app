'use client'

import { useEffect, useState } from 'react'
import OnboardingChat from './OnboardingChat'

interface OnboardingModalProps {
  hasProfile: boolean
}

export default function OnboardingModal({ hasProfile }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionClosed, setSessionClosed] = useState(false)

  // Abre modal automaticamente no primeiro login se sem perfil
  useEffect(() => {
    const sessionKey = 'onboarding-closed-session'
    const wasClosed = sessionStorage.getItem(sessionKey)

    if (!hasProfile && !wasClosed) {
      // Delay para suavizar transição
      const timer = setTimeout(() => setIsOpen(true), 800)
      return () => clearTimeout(timer)
    }
  }, [hasProfile])

  // Escuta mensagem de aprovação vinda do chat
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'onboarding-approved') {
        // Fechar modal e marcar como fechado nessa sessão
        sessionStorage.setItem('onboarding-closed-session', 'true')
        setIsOpen(false)
        // Opcional: recarregar para mostrar que não tem mais perfil a completar
        setTimeout(() => window.location.reload(), 500)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem('onboarding-closed-session', 'true')
    setSessionClosed(true)
  }

  if (!isOpen || sessionClosed) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <h2 className="text-xl font-bold text-white">Análise do seu negócio</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition p-1"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Chat Container */}
          <div className="flex-1 overflow-hidden">
            <OnboardingChat />
          </div>
        </div>
      </div>
    </>
  )
}
