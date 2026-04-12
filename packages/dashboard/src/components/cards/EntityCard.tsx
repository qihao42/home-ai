import type { EntityState } from '../../types'
import { LightCard } from './LightCard'
import { SensorCard } from './SensorCard'
import { SwitchCard } from './SwitchCard'
import { ThermostatCard } from './ThermostatCard'
import { MotionCard } from './MotionCard'
import { getEntityIcon } from '../../utils/entity-icon'

interface EntityCardProps {
  entity: EntityState
}

export function EntityCard({ entity }: EntityCardProps) {
  switch (entity.domain) {
    case 'light':
      return <LightCard entity={entity} />
    case 'sensor':
      return <SensorCard entity={entity} />
    case 'switch':
      return <SwitchCard entity={entity} />
    case 'climate':
      return <ThermostatCard entity={entity} />
    case 'binary_sensor':
      return <MotionCard entity={entity} />
    default:
      return <GenericCard entity={entity} />
  }
}

function GenericCard({ entity }: { entity: EntityState }) {
  const icon = getEntityIcon(entity.domain, entity.state)

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-2xl">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-white">{entity.name}</h3>
            <p className="text-sm text-slate-400 capitalize">{entity.state}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
