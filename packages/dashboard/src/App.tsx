import { useState, useEffect } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { DevicesPage } from './pages/DevicesPage'
import { ScenesPage } from './pages/ScenesPage'
import { AutomationsPage } from './pages/AutomationsPage'
import { HistoryPage } from './pages/HistoryPage'
import { OrbitalPage } from './pages/OrbitalPage'
import { FeaturesPage } from './pages/FeaturesPage'
import { useWebSocket } from './hooks/use-websocket'
import { useEntityStore } from './stores/entity-store'
import { useSettingsStore } from './stores/settings-store'
import { ToastContainer } from './components/notifications/ToastContainer'
import { VoiceButton } from './components/voice/VoiceButton'
import { ErrorBoundary } from './components/ErrorBoundary'
import type { PageId } from './types'

function getInitialPage(): PageId {
  const hash = window.location.hash.replace('#', '').split('?')[0]
  const validPages: PageId[] = [
    'dashboard', 'devices', 'scenes', 'automations', 'history', 'orbital', 'features',
  ]
  return validPages.includes(hash as PageId) ? (hash as PageId) : 'dashboard'
}

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(getInitialPage)
  const { connected } = useWebSocket()
  const fetchAll = useEntityStore((s) => s.fetchAll)
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Apply theme class + meta theme-color to the document
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta instanceof HTMLMetaElement) {
      meta.content = theme === 'dark' ? '#0f172a' : '#ffffff'
    }
  }, [theme])

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
      case 'features':
        return <FeaturesPage />
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
        {/* A fresh boundary per page — key by currentPage so navigating
            resets the error state automatically. */}
        <ErrorBoundary key={currentPage}>{renderPage()}</ErrorBoundary>
      </MainLayout>
      <VoiceButton />
      <ToastContainer />
    </>
  )
}
