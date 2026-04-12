import { useState, useEffect, useCallback } from 'react'
import { fetchScenes, activateScene } from '../api/client'
import type { Scene } from '../types'

const ICON_MAP: Record<string, string> = {
  sunrise: '\u2600\uFE0F',
  moon: '\uD83C\uDF19',
  lock: '\uD83D\uDD12',
  film: '\uD83C\uDFAC',
}

function getSceneIcon(icon: string): string {
  return ICON_MAP[icon] ?? '\uD83C\uDFAD'
}

export function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [activatedId, setActivatedId] = useState<string | null>(null)

  const loadScenes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchScenes()
      setScenes(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load scenes'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadScenes()
  }, [loadScenes])

  const handleActivate = async (sceneId: string) => {
    try {
      setActivatingId(sceneId)
      await activateScene(sceneId)
      setActivatingId(null)
      setActivatedId(sceneId)
      setTimeout(() => {
        setActivatedId((current) => (current === sceneId ? null : current))
      }, 1500)
    } catch (err) {
      setActivatingId(null)
      const message = err instanceof Error ? err.message : 'Failed to activate scene'
      setError(message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          <span>Loading scenes...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <span className="text-4xl">&#x26A0;&#xFE0F;</span>
        <h3 className="mt-4 text-lg font-medium text-slate-300">Failed to load scenes</h3>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
        <button
          onClick={loadScenes}
          className="mt-4 rounded-lg bg-blue-500/20 px-4 py-2 text-sm text-blue-400 transition-colors hover:bg-blue-500/30"
        >
          Retry
        </button>
      </div>
    )
  }

  if (scenes.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <span className="text-5xl">&#x1F3AD;</span>
        <h3 className="mt-4 text-lg font-medium text-slate-300">No scenes found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Create scenes to control multiple devices with a single tap.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-lg font-semibold text-white">Scenes</h2>
        <span className="rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs text-slate-400">
          {scenes.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {scenes.map((scene) => {
          const isActivating = activatingId === scene.id
          const isActivated = activatedId === scene.id

          return (
            <button
              key={scene.id}
              onClick={() => handleActivate(scene.id)}
              disabled={isActivating}
              className={`
                group relative flex flex-col items-center gap-4 rounded-2xl border p-6
                text-center transition-all duration-300
                ${
                  isActivated
                    ? 'border-green-500/50 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                    : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600/50 hover:bg-slate-700/50'
                }
                ${isActivating ? 'cursor-wait opacity-70' : 'cursor-pointer'}
              `}
            >
              <div
                className={`
                  flex h-16 w-16 items-center justify-center rounded-2xl text-3xl
                  transition-all duration-300
                  ${
                    isActivated
                      ? 'bg-green-500/20 scale-110'
                      : 'bg-slate-700/50 group-hover:bg-slate-600/50 group-hover:scale-105'
                  }
                `}
              >
                {getSceneIcon(scene.icon)}
              </div>

              <div>
                <p className="text-base font-semibold text-white">{scene.name}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {scene.entities.length} device{scene.entities.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div
                className={`
                  rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300
                  ${
                    isActivated
                      ? 'bg-green-500/20 text-green-400'
                      : isActivating
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'
                  }
                `}
              >
                {isActivated ? 'Activated' : isActivating ? 'Activating...' : 'Activate'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
