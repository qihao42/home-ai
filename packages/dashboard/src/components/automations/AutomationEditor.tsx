import { useState, useCallback, useMemo } from 'react'
import type {
  AutomationRule,
  AutomationTrigger,
  AutomationCondition,
  AutomationAction,
} from '../../types'
import { useAutomationStore } from '../../stores/automation-store'
import { useEntityStore } from '../../stores/entity-store'

interface AutomationEditorProps {
  automation?: AutomationRule
  onClose: () => void
}

const emptyTrigger: AutomationTrigger = {
  platform: 'state',
  entityId: '',
  to: '',
}

const emptyCondition: AutomationCondition = {
  type: 'state',
  entityId: '',
  state: '',
}

const emptyAction: AutomationAction = {
  domain: '',
  action: '',
  entityId: '',
}

/**
 * The server persists automations in a snake_case + `type` shape whereas the
 * editor UI works in camelCase + `platform`. Normalize inbound data so existing
 * automations can be opened for editing without crashing.
 */
type ServerTriggerShape = { type?: string; entity_id?: string; above?: number; below?: number; at?: string; from?: string; to?: string }
type ServerActionShape = { domain?: string; action?: string; entity_id?: string; data?: { device_id?: string; entity_id?: string } }

function normalizeTrigger(t: unknown): AutomationTrigger {
  if (!t || typeof t !== 'object') return { ...emptyTrigger }
  const raw = t as ServerTriggerShape & Partial<AutomationTrigger>
  const platform = (raw.platform ?? (raw.type as AutomationTrigger['platform']) ?? 'state') as AutomationTrigger['platform']
  return {
    platform,
    entityId: raw.entityId ?? raw.entity_id ?? '',
    from: raw.from,
    to: raw.to,
    above: raw.above,
    below: raw.below,
    at: raw.at,
  }
}

function normalizeAction(a: unknown): AutomationAction {
  if (!a || typeof a !== 'object') return { ...emptyAction }
  const raw = a as ServerActionShape & Partial<AutomationAction>
  return {
    domain: raw.domain ?? '',
    action: raw.action ?? '',
    entityId: raw.entityId ?? raw.entity_id ?? raw.data?.entity_id ?? raw.data?.device_id ?? '',
    data: (raw as { data?: Record<string, unknown> }).data,
  }
}

function normalizeCondition(c: unknown): AutomationCondition {
  if (!c || typeof c !== 'object') return { ...emptyCondition }
  const raw = c as { type?: string; entity_id?: string; state?: string; above?: number; below?: number; after?: string; before?: string } & Partial<AutomationCondition>
  return {
    type: (raw.type as AutomationCondition['type']) ?? 'state',
    entityId: raw.entityId ?? raw.entity_id ?? '',
    state: raw.state,
    above: raw.above,
    below: raw.below,
    after: raw.after,
    before: raw.before,
  }
}

export function AutomationEditor({ automation, onClose }: AutomationEditorProps) {
  const { create, update } = useAutomationStore()
  // Select the stable reference from the store, then derive the array via
  // useMemo. A bare `(s) => Object.values(s.entities)` selector returns a new
  // array every render and triggers Zustand's "getSnapshot should be cached"
  // infinite-loop error.
  const entitiesMap = useEntityStore((s) => s.entities)
  const entities = useMemo(() => Object.values(entitiesMap), [entitiesMap])

  const [name, setName] = useState(automation?.name ?? '')
  const [enabled, _setEnabled] = useState(automation?.enabled ?? true)
  const [trigger, setTrigger] = useState<AutomationTrigger>(() =>
    automation ? normalizeTrigger(automation.trigger) : { ...emptyTrigger }
  )
  const [conditions, setConditions] = useState<AutomationCondition[]>(() =>
    automation?.conditions ? automation.conditions.map(normalizeCondition) : []
  )
  const [actions, setActions] = useState<AutomationAction[]>(() =>
    automation?.actions && automation.actions.length > 0
      ? automation.actions.map(normalizeAction)
      : [{ ...emptyAction }]
  )
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (automation) {
        await update(automation.id, { name, enabled, trigger, conditions, actions })
      } else {
        await create({ name, enabled, trigger, conditions, actions })
      }
      onClose()
    } catch {
      // Error handled by store
    } finally {
      setSaving(false)
    }
  }, [automation, name, enabled, trigger, conditions, actions, create, update, onClose])

  const updateTrigger = (patch: Partial<AutomationTrigger>) => {
    setTrigger((prev) => ({ ...prev, ...patch }))
  }

  const addCondition = () => {
    setConditions((prev) => [...prev, { ...emptyCondition }])
  }

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, patch: Partial<AutomationCondition>) => {
    setConditions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
    )
  }

  const addAction = () => {
    setActions((prev) => [...prev, { ...emptyAction }])
  }

  const removeAction = (index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateAction = (index: number, patch: Partial<AutomationAction>) => {
    setActions((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...patch } : a))
    )
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-[var(--bg-secondary)] p-6">
      <h3 className="text-lg font-semibold text-white mb-6">
        {automation ? 'Edit Automation' : 'New Automation'}
      </h3>

      {/* Name */}
      <div className="mb-6">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My automation"
          className="input-field"
        />
      </div>

      {/* Trigger */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-slate-300 uppercase tracking-wider">
          Trigger
        </h4>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Platform</label>
            <select
              value={trigger.platform}
              onChange={(e) =>
                updateTrigger({
                  platform: e.target.value as AutomationTrigger['platform'],
                })
              }
              className="select-field"
            >
              <option value="state">State Change</option>
              <option value="numeric_state">Numeric State</option>
              <option value="time">Time</option>
            </select>
          </div>

          {(trigger.platform === 'state' || trigger.platform === 'numeric_state') && (
            <div>
              <label className="mb-1 block text-xs text-slate-400">Entity</label>
              <select
                value={trigger.entityId ?? ''}
                onChange={(e) => updateTrigger({ entityId: e.target.value })}
                className="select-field"
              >
                <option value="">Select entity...</option>
                {entities.map((e) => (
                  <option key={e.entityId} value={e.entityId}>
                    {e.name} ({e.entityId})
                  </option>
                ))}
              </select>
            </div>
          )}

          {trigger.platform === 'state' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">From</label>
                <input
                  type="text"
                  value={trigger.from ?? ''}
                  onChange={(e) => updateTrigger({ from: e.target.value })}
                  placeholder="Any"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">To</label>
                <input
                  type="text"
                  value={trigger.to ?? ''}
                  onChange={(e) => updateTrigger({ to: e.target.value })}
                  placeholder="Any"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {trigger.platform === 'numeric_state' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Above</label>
                <input
                  type="number"
                  value={trigger.above ?? ''}
                  onChange={(e) =>
                    updateTrigger({
                      above: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Below</label>
                <input
                  type="number"
                  value={trigger.below ?? ''}
                  onChange={(e) =>
                    updateTrigger({
                      below: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
          )}

          {trigger.platform === 'time' && (
            <div>
              <label className="mb-1 block text-xs text-slate-400">At</label>
              <input
                type="time"
                value={trigger.at ?? ''}
                onChange={(e) => updateTrigger({ at: e.target.value })}
                className="input-field"
              />
            </div>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wider">
            Conditions
          </h4>
          <button onClick={addCondition} className="text-xs text-blue-400 hover:text-blue-300">
            + Add condition
          </button>
        </div>
        {conditions.length === 0 && (
          <p className="text-sm text-slate-500 italic">No conditions (always runs)</p>
        )}
        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <select
                  value={condition.type}
                  onChange={(e) =>
                    updateCondition(index, {
                      type: e.target.value as AutomationCondition['type'],
                    })
                  }
                  className="select-field w-auto"
                >
                  <option value="state">State</option>
                  <option value="numeric_state">Numeric State</option>
                  <option value="time">Time</option>
                </select>
                <button
                  onClick={() => removeCondition(index)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>

              {(condition.type === 'state' || condition.type === 'numeric_state') && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Entity</label>
                    <select
                      value={condition.entityId ?? ''}
                      onChange={(e) =>
                        updateCondition(index, { entityId: e.target.value })
                      }
                      className="select-field"
                    >
                      <option value="">Select entity...</option>
                      {entities.map((e) => (
                        <option key={e.entityId} value={e.entityId}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {condition.type === 'state' && (
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">State</label>
                      <input
                        type="text"
                        value={condition.state ?? ''}
                        onChange={(e) =>
                          updateCondition(index, { state: e.target.value })
                        }
                        className="input-field"
                      />
                    </div>
                  )}
                  {condition.type === 'numeric_state' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-slate-400">Above</label>
                        <input
                          type="number"
                          value={condition.above ?? ''}
                          onChange={(e) =>
                            updateCondition(index, {
                              above: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-400">Below</label>
                        <input
                          type="number"
                          value={condition.below ?? ''}
                          onChange={(e) =>
                            updateCondition(index, {
                              below: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="input-field"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {condition.type === 'time' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">After</label>
                    <input
                      type="time"
                      value={condition.after ?? ''}
                      onChange={(e) =>
                        updateCondition(index, { after: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Before</label>
                    <input
                      type="time"
                      value={condition.before ?? ''}
                      onChange={(e) =>
                        updateCondition(index, { before: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wider">
            Actions
          </h4>
          <button onClick={addAction} className="text-xs text-blue-400 hover:text-blue-300">
            + Add action
          </button>
        </div>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-slate-300">
                  Action {index + 1}
                </span>
                {actions.length > 1 && (
                  <button
                    onClick={() => removeAction(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Domain</label>
                    <input
                      type="text"
                      value={action.domain}
                      onChange={(e) =>
                        updateAction(index, { domain: e.target.value })
                      }
                      placeholder="light, switch, climate..."
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Action</label>
                    <input
                      type="text"
                      value={action.action}
                      onChange={(e) =>
                        updateAction(index, { action: e.target.value })
                      }
                      placeholder="turn_on, turn_off..."
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Entity</label>
                  <select
                    value={action.entityId}
                    onChange={(e) =>
                      updateAction(index, { entityId: e.target.value })
                    }
                    className="select-field"
                  >
                    <option value="">Select entity...</option>
                    {entities.map((e) => (
                      <option key={e.entityId} value={e.entityId}>
                        {e.name} ({e.entityId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-700/50 pt-4">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'Saving...' : automation ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}
