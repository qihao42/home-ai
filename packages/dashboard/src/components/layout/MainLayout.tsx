import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileBottomNav } from './MobileBottomNav'
import type { PageId } from '../../types'

interface MainLayoutProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  connected: boolean
  children: ReactNode
}

export function MainLayout({
  currentPage,
  onNavigate,
  connected,
  children,
}: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header currentPage={currentPage} connected={connected} />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {children}
        </main>
      </div>
      <MobileBottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  )
}
