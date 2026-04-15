import { useEntityStore } from '../../stores/entity-store'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import { SettingsMenu } from './SettingsMenu'
import type { PageId } from '../../types'

interface HeaderProps {
  currentPage: PageId
  connected: boolean
}

const pageTitleKeys: Record<PageId, TranslationKey> = {
  dashboard: 'header.dashboard',
  devices: 'header.devices',
  scenes: 'header.scenes',
  automations: 'header.automations',
  history: 'header.history',
  orbital: 'header.orbital',
  features: 'header.features',
}

export function Header({ currentPage, connected }: HeaderProps) {
  const entityCount = useEntityStore((s) => Object.keys(s.entities).length)
  const { t } = useTranslation()

  return (
    <header
      className="flex h-16 items-center justify-between gap-3 border-b px-4 md:px-8"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl md:hidden">🏠</span>
        <h2 className="text-base font-semibold truncate md:text-xl" style={{ color: 'var(--text-primary)' }}>
          {t(pageTitleKeys[currentPage])}
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        <div className="hidden sm:block text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {entityCount}
          </span>{' '}
          {t('header.entities')}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
              connected
                ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                : 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            }`}
          />
          <span className="hidden text-xs sm:inline md:text-sm" style={{ color: 'var(--text-secondary)' }}>
            {connected ? t('header.connected') : t('header.offline')}
          </span>
        </div>

        <SettingsMenu />
      </div>
    </header>
  )
}
