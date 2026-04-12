import { useCallback, useRef } from 'react'
import type { EntityState } from '../../types'
import { Toggle } from '../common/Toggle'
import { Slider } from '../common/Slider'
import { callService } from '../../api/client'

interface LightCardProps {
  entity: EntityState
}

export function LightCard({ entity }: LightCardProps) {
  const isOn = entity.state === 'on'
  const brightness = (entity.attributes.brightness as number) ?? 0
  const brightnessPercent = Math.round((brightness / 255) * 100)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const handleToggle = useCallback(async (checked: boolean) => {
    try {
      await callService('light', checked ? 'turn_on' : 'turn_off', {
        entity_id: entity.entityId,
      })
    } catch {
      // Error handled by API client
    }
  }, [entity.entityId])

  const handleBrightness = useCallback((value: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(async () => {
      try {
        await callService('light', 'turn_on', {
          entity_id: entity.entityId,
          brightness: value,
        })
      } catch {
        // Error handled by API client
      }
    }, 200)
  }, [entity.entityId])

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl
              transition-all duration-300 ${
                isOn
                  ? 'bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-700/50'
              }`}
          >
            {isOn ? '💡' : '🔅'}
          </div>
          <div>
            <h3 className="font-medium text-white">{entity.name}</h3>
            <p className="text-sm text-slate-400">
              {isOn ? `${brightnessPercent}% brightness` : 'Off'}
            </p>
          </div>
        </div>
        <Toggle checked={isOn} onChange={handleToggle} />
      </div>

      {isOn && (
        <div className="mt-4">
          <Slider
            value={brightness}
            min={0}
            max={255}
            step={5}
            onChange={handleBrightness}
            label="Brightness"
          />
        </div>
      )}
    </div>
  )
}
