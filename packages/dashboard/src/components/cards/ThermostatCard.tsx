import { useCallback } from 'react'
import type { EntityState } from '../../types'
import { callService } from '../../api/client'

interface ThermostatCardProps {
  entity: EntityState
}

type HvacMode = 'heat' | 'cool' | 'auto' | 'off'

const modeColors: Record<HvacMode, string> = {
  heat: 'text-orange-400',
  cool: 'text-blue-400',
  auto: 'text-green-400',
  off: 'text-slate-400',
}

const modeBgColors: Record<HvacMode, string> = {
  heat: 'bg-orange-500/20 border-orange-500/30',
  cool: 'bg-blue-500/20 border-blue-500/30',
  auto: 'bg-green-500/20 border-green-500/30',
  off: 'bg-slate-700/50 border-slate-600/30',
}

const modeIcons: Record<HvacMode, string> = {
  heat: '🔥',
  cool: '❄️',
  auto: '🔄',
  off: '⏻',
}

const modes: HvacMode[] = ['heat', 'cool', 'auto', 'off']

export function ThermostatCard({ entity }: ThermostatCardProps) {
  const currentTemp = entity.attributes.current_temperature as number ?? 0
  const targetTemp = entity.attributes.target_temperature as number ?? 20
  const mode = (entity.state as HvacMode) || 'off'
  const hvacAction = entity.attributes.hvac_action as string | undefined
  const unit = (entity.attributes.unit as string) ?? '°C'

  const handleTempChange = useCallback(async (delta: number) => {
    try {
      await callService('climate', 'set_temperature', {
        entity_id: entity.entityId,
        temperature: targetTemp + delta,
      })
    } catch {
      // Error handled by API client
    }
  }, [entity.entityId, targetTemp])

  const handleModeChange = useCallback(async (newMode: HvacMode) => {
    try {
      await callService('climate', 'set_hvac_mode', {
        entity_id: entity.entityId,
        hvac_mode: newMode,
      })
    } catch {
      // Error handled by API client
    }
  }, [entity.entityId])

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-white">{entity.name}</h3>
          {hvacAction && hvacAction !== 'idle' && (
            <span className={`text-xs ${modeColors[mode]}`}>
              {hvacAction === 'heating' ? '🔥 Heating' : '❄️ Cooling'}
            </span>
          )}
          {(!hvacAction || hvacAction === 'idle') && mode !== 'off' && (
            <span className="text-xs text-slate-400">Idle</span>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg
            ${modeBgColors[mode]}`}
        >
          {modeIcons[mode]}
        </div>
      </div>

      {/* Temperature display */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Current</p>
          <p className={`text-3xl font-bold ${modeColors[mode]}`}>
            {currentTemp.toFixed(1)}{unit}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Target</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTempChange(-0.5)}
              className="flex h-8 w-8 items-center justify-center rounded-lg
                bg-slate-700 text-slate-300 transition-colors hover:bg-slate-600"
            >
              −
            </button>
            <span className="w-16 text-center text-xl font-semibold text-white">
              {targetTemp.toFixed(1)}
            </span>
            <button
              onClick={() => handleTempChange(0.5)}
              className="flex h-8 w-8 items-center justify-center rounded-lg
                bg-slate-700 text-slate-300 transition-colors hover:bg-slate-600"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="mt-4 flex gap-1.5">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium
              capitalize transition-all duration-150
              ${
                mode === m
                  ? modeBgColors[m] + ' ' + modeColors[m]
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}
