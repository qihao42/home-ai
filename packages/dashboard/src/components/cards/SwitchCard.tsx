import { useCallback } from 'react'
import type { EntityState } from '../../types'
import { Toggle } from '../common/Toggle'
import { callService } from '../../api/client'

interface SwitchCardProps {
  entity: EntityState
}

export function SwitchCard({ entity }: SwitchCardProps) {
  const isOn = entity.state === 'on'
  const power = entity.attributes.power as number | undefined

  const handleToggle = useCallback(async (checked: boolean) => {
    try {
      await callService('switch', checked ? 'turn_on' : 'turn_off', {
        entity_id: entity.entityId,
      })
    } catch {
      // Error handled by API client
    }
  }, [entity.entityId])

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl
              transition-all duration-300 ${
                isOn
                  ? 'bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'bg-slate-700/50'
              }`}
          >
            {isOn ? '🔌' : '⭕'}
          </div>
          <div>
            <h3 className="font-medium text-white">{entity.name}</h3>
            <p className="text-sm text-slate-400">
              {isOn ? 'On' : 'Off'}
            </p>
          </div>
        </div>
        <Toggle checked={isOn} onChange={handleToggle} />
      </div>

      {isOn && power !== undefined && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-700/30 px-3 py-2">
          <span className="text-sm">⚡</span>
          <span className="text-sm text-slate-300">
            {power}W
          </span>
        </div>
      )}
    </div>
  )
}
