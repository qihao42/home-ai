import { Toggle } from '../common/Toggle'
import { StatusBadge } from '../common/StatusBadge'
import { formatTimestamp } from '../../utils/format-value'
import { useAutomationStore } from '../../stores/automation-store'
import type { AutomationRule } from '../../types'

interface AutomationListProps {
  automations: AutomationRule[]
  onEdit: (automation: AutomationRule) => void
}

export function AutomationList({ automations, onEdit }: AutomationListProps) {
  const { update, remove, trigger } = useAutomationStore()

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await update(id, { enabled })
    } catch {
      // Error handled by store
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
    } catch {
      // Error handled by store
    }
  }

  const handleTrigger = async (id: string) => {
    try {
      await trigger(id)
    } catch {
      // Error handled by store
    }
  }

  if (automations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed
        border-slate-600 py-12 text-center">
        <span className="text-4xl">⚡</span>
        <h3 className="mt-3 text-lg font-medium text-slate-300">No automations</h3>
        <p className="mt-1 text-sm text-slate-500">
          Create your first automation to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {automations.map((automation) => (
        <div
          key={automation.id}
          className="card flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Toggle
              checked={automation.enabled}
              onChange={(checked) => handleToggle(automation.id, checked)}
              size="sm"
            />
            <div>
              <h3 className="font-medium text-white">{automation.name}</h3>
              <div className="mt-1 flex items-center gap-3">
                <StatusBadge
                  variant={automation.enabled ? 'active' : 'idle'}
                  label={automation.enabled ? 'Enabled' : 'Disabled'}
                />
                {automation.lastTriggered && (
                  <span className="text-xs text-slate-500">
                    Last: {formatTimestamp(automation.lastTriggered)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTrigger(automation.id)}
              className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium
                text-slate-300 transition-colors hover:bg-slate-600"
              title="Trigger manually"
            >
              ▶ Run
            </button>
            <button
              onClick={() => onEdit(automation)}
              className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium
                text-slate-300 transition-colors hover:bg-slate-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(automation.id)}
              className="rounded-lg bg-red-900/30 px-3 py-1.5 text-xs font-medium
                text-red-400 transition-colors hover:bg-red-900/50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
