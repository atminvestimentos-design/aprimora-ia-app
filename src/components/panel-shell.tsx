'use client'

import { useState } from 'react'
import Image from 'next/image'
import Sidebar from './sidebar'
import type { User } from '@supabase/supabase-js'

export default function PanelShell({ user, children }: { user: User; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#0a1628] overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 px-4 h-14 bg-[#060d1f] border-b border-white/5 md:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 hover:text-white transition-colors p-1 -ml-1"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Image src="/logo.png" alt="Aprimora IA" width={130} height={36} className="h-8 w-auto" />
        </header>

        <main
          className="flex-1 overflow-y-auto"
          style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
