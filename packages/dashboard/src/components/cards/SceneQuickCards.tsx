import { useEffect, useState } from 'react'
import { fetchScenes, activateScene } from '../../api/client'
import type { Scene } from '../../types'
import { useNotificationStore } from '../../stores/notification-store'
import { useTranslation } from '../../i18n/useTranslation'

const ICON_MAP: Record<string, string> = {
  sunrise: '🌅',
  morning: '🌅',
  moon: '🌙',
  night: '🌙',
  lock: '🔒',
  away: '🔒',
  film: '🎬',
  movie: '🎬',
  party: '🎉',
  dinner: '🍽️',
  relax: '🛋️',
  work: '💼',
}

function iconFor(scene: Scene): string {
  return ICON_MAP[scene.icon.toLowerCase()] ?? '✨'
}

export function SceneQuickCards() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const { t } = useTranslation()

  useEffect(() => {
    let cancelled = false
    fetchScenes()
      .then((data) => {
        if (!cancelled) {
          setScenes(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleActivate = async (scene: Scene) => {
    if (activatingId) return
    setActivatingId(scene.id)
    if ('vibrate' in navigator) navigator.vibrate?.(12)
    try {
      await activateScene(scene.id)
      addNotification({
        type: 'success',
        title: 'Scene activated',
        message: scene.name,
      })
    } catch (err) {
      addNotification({
        type: 'alert',
        title: 'Failed',
        message: err instanceof Error ? err.message : 'Could not activate scene',
      })
    } finally {
      // Keep brief visual feedback before clearing
      setTimeout(() => setActivatingId(null), 600)
    }
  }

  if (loading) return null
  if (scenes.length === 0) return null

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {t('scenes.quickTitle')}
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {t('scenes.tapHint')}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {scenes.map((scene) => {
          const isActivating = activatingId === scene.id
          return (
            <button
              key={scene.id}
              onClick={() => handleActivate(scene)}
              disabled={isActivating}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all active:scale-95 ${
                isActivating ? 'shadow-lg shadow-blue-500/20' : ''
              }`}
              style={{
                backgroundColor: isActivating ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                borderColor: isActivating ? 'rgba(59, 130, 246, 0.6)' : 'var(--border)',
              }}
            >
              <span className="text-3xl">{iconFor(scene)}</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {scene.name}
              </span>
              {isActivating && (
                <span className="text-[10px] text-blue-300">{t('scenes.activating')}</span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
