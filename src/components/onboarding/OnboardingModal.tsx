'use client'

import { useEffect, useState } from 'react'
import OnboardingChat from './OnboardingChat'

interface OnboardingModalProps {
  hasProfile: boolean
}

export default function OnboardingModal({ hasProfile }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showButton, setShowButton] = useState(false)

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
        setIsOpen(false)
        sessionStorage.setItem('onboarding-closed-session', 'true')
        setShowButton(false)
        // Reload para mostrar novo layout
        setTimeout(() => window.location.reload(), 500)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem('onboarding-closed-session', 'true')
    setShowButton(true)
  }

  // Botão de reabrir (quando modal foi fechado)
  if (!isOpen && showButton && !hasProfile) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          setShowButton(false)
        }}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition flex items-center gap-2 font-medium"
      >
        <span>🤖</span>
        Retomar briefing
      </button>
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal centrado */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header com contexto */}
          <div className="border-b border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Vamos começar!</h2>
                <p className="text-sm text-gray-400 mt-1">Preciso entender seu negócio para otimizar a IA</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-lg"
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
