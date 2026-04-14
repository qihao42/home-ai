import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
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
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}
