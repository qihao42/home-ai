import { useState, useEffect } from 'react'
import { useAutomationStore } from '../stores/automation-store'
import { AutomationList } from '../components/automations/AutomationList'
import { AutomationEditor } from '../components/automations/AutomationEditor'
import type { AutomationRule } from '../types'

export function AutomationsPage() {
  const { automations, loading, error, fetchAll } = useAutomationStore()
  const [editing, setEditing] = useState<AutomationRule | undefined>(undefined)
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleCreate = () => {
    setEditing(undefined)
    setShowEditor(true)
  }

  const handleEdit = (automation: AutomationRule) => {
    setEditing(automation)
    setShowEditor(true)
  }

  const handleClose = () => {
    setEditing(undefined)
    setShowEditor(false)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          <span>Loading automations...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {automations.length} automation{automations.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!showEditor && (
          <button onClick={handleCreate} className="btn-primary">
            + New Automation
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showEditor ? (
        <AutomationEditor automation={editing} onClose={handleClose} />
      ) : (
        <AutomationList automations={automations} onEdit={handleEdit} />
      )}
    </div>
  )
}
