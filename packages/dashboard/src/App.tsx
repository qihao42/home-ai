import { useState, useEffect } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { DevicesPage } from './pages/DevicesPage'
import { ScenesPage } from './pages/ScenesPage'
import { AutomationsPage } from './pages/AutomationsPage'
import { HistoryPage } from './pages/HistoryPage'
import { OrbitalPage } from './pages/OrbitalPage'
import { useWebSocket } from './hooks/use-websocket'
import { useEntityStore } from './stores/entity-store'
import { ToastContainer } from './components/notifications/ToastContainer'
import { VoiceButton } from './components/voice/VoiceButton'
import type { PageId } from './types'

function getInitialPage(): PageId {
  const hash = window.location.hash.replace('#', '')
  const validPages: PageId[] = ['dashboard', 'devices', 'scenes', 'automations', 'history', 'orbital']
  return validPages.includes(hash as PageId) ? (hash as PageId) : 'dashboard'
}

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(getInitialPage)
  const { connected } = useWebSocket()
  const fetchAll = useEntityStore((s) => s.fetchAll)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    const handleHashChange = () => {
      const page = getInitialPage()
      setCurrentPage(page)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page)
    window.location.hash = page
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'devices':
        return <DevicesPage />
      case 'scenes':
        return <ScenesPage />
      case 'automations':
        return <AutomationsPage />
      case 'history':
        return <HistoryPage />
      case 'orbital':
        return <OrbitalPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <>
      <MainLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        connected={connected}
      >
        {renderPage()}
      </MainLayout>
      <VoiceButton />
      <ToastContainer />
    </>
  )
}
