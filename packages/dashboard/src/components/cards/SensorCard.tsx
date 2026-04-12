import type { EntityState } from '../../types'
import { formatValue } from '../../utils/format-value'
import { getSensorIcon } from '../../utils/entity-icon'

interface SensorCardProps {
  entity: EntityState
}

function getValueColor(attributes: Record<string, unknown>, value: number): string {
  const deviceClass = attributes.device_class as string | undefined

  if (deviceClass === 'temperature') {
    if (value < 15) return 'text-blue-400'
    if (value < 25) return 'text-green-400'
    if (value < 35) return 'text-orange-400'
    return 'text-red-400'
  }

  if (deviceClass === 'humidity') {
    if (value < 30) return 'text-amber-400'
    if (value < 60) return 'text-green-400'
    return 'text-blue-400'
  }

  if (deviceClass === 'battery') {
    if (value < 20) return 'text-red-400'
    if (value < 50) return 'text-amber-400'
    return 'text-green-400'
  }

  return 'text-blue-400'
}

export function SensorCard({ entity }: SensorCardProps) {
  const unit = entity.attributes.unit as string | undefined
  const numericValue = parseFloat(entity.state)
  const isNumeric = !isNaN(numericValue)
  const icon = getSensorIcon(entity.attributes)
  const colorClass = isNumeric
    ? getValueColor(entity.attributes, numericValue)
    : 'text-blue-400'

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{entity.name}</p>
          <div className={`mt-1 text-3xl font-bold ${colorClass}`}>
            {formatValue(isNumeric ? numericValue : entity.state, unit)}
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-2xl">
          {icon}
        </div>
      </div>

      {entity.attributes.device_class && (
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-slate-400">
            {entity.attributes.device_class as string}
          </span>
        </div>
      )}
    </div>
  )
}
