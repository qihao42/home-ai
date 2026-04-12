import type { EntityState } from '../../types'
import { formatTimestamp } from '../../utils/format-value'
import { getBinarySensorType } from '../../utils/entity-icon'

interface MotionCardProps {
  entity: EntityState
}

export function MotionCard({ entity }: MotionCardProps) {
  const sensorType = getBinarySensorType(entity.attributes)
  const isActive = entity.state === 'on'

  if (sensorType === 'door') {
    return <DoorSensor entity={entity} />
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`relative flex h-12 w-12 items-center justify-center rounded-xl
              text-2xl transition-all duration-300
              ${
                isActive
                  ? 'bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-700/50'
              }`}
          >
            {isActive ? '🏃' : '🔕'}
            {isActive && (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full
                bg-amber-400 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-white">{entity.name}</h3>
            <p className={`text-sm font-medium ${
              isActive ? 'text-amber-400' : 'text-slate-400'
            }`}>
              {isActive ? 'Motion Detected' : 'Clear'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Last updated: {formatTimestamp(entity.lastChanged)}
      </div>
    </div>
  )
}

function DoorSensor({ entity }: { entity: EntityState }) {
  const isOpen = entity.state === 'on'

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl
              transition-all duration-300
              ${
                isOpen
                  ? 'bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-green-500/20'
              }`}
          >
            {isOpen ? '🚪' : '🔒'}
          </div>
          <div>
            <h3 className="font-medium text-white">{entity.name}</h3>
            <p className={`text-sm font-medium ${
              isOpen ? 'text-red-400' : 'text-green-400'
            }`}>
              {isOpen ? 'Open' : 'Closed'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Last changed: {formatTimestamp(entity.lastChanged)}
      </div>
    </div>
  )
}
