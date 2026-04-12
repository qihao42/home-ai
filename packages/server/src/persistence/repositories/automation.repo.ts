import type { AutomationRule } from '@smarthome/shared'
import type { DatabaseConnection } from '../database.js'

interface AutomationRow {
  readonly id: string
  readonly name: string
  readonly enabled: number
  readonly config: string
  readonly created_at: string | null
  readonly updated_at: string | null
}

function toAutomationRule(row: AutomationRow): AutomationRule {
  const config = JSON.parse(row.config) as {
    trigger: AutomationRule['trigger']
    conditions: AutomationRule['conditions']
    actions: AutomationRule['actions']
  }

  return {
    id: row.id,
    name: row.name,
    enabled: row.enabled === 1,
    trigger: config.trigger,
    conditions: config.conditions,
    actions: config.actions,
  }
}

function toConfigJson(rule: AutomationRule): string {
  return JSON.stringify({
    trigger: rule.trigger,
    conditions: rule.conditions,
    actions: rule.actions,
  })
}

export class AutomationRepository {
  private readonly db: DatabaseConnection

  constructor(db: DatabaseConnection) {
    this.db = db
  }

  findAll(): AutomationRule[] {
    const rows = this.db.all<AutomationRow>(
      'SELECT id, name, enabled, config, created_at, updated_at FROM automations',
    )
    return rows.map(toAutomationRule)
  }

  findById(id: string): AutomationRule | null {
    const row = this.db.get<AutomationRow>(
      'SELECT id, name, enabled, config, created_at, updated_at FROM automations WHERE id = ?',
      [id],
    )
    return row !== undefined ? toAutomationRule(row) : null
  }

  create(rule: AutomationRule): AutomationRule {
    const now = new Date().toISOString()
    this.db.run(
      'INSERT INTO automations (id, name, enabled, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [rule.id, rule.name, rule.enabled ? 1 : 0, toConfigJson(rule), now, now],
    )
    return { ...rule }
  }

  update(id: string, rule: AutomationRule): AutomationRule | null {
    const existing = this.findById(id)
    if (existing === null) {
      return null
    }

    const now = new Date().toISOString()
    this.db.run(
      'UPDATE automations SET name = ?, enabled = ?, config = ?, updated_at = ? WHERE id = ?',
      [rule.name, rule.enabled ? 1 : 0, toConfigJson(rule), now, id],
    )
    return { ...rule, id }
  }

  delete(id: string): boolean {
    const result = this.db.run(
      'DELETE FROM automations WHERE id = ?',
      [id],
    )
    return result.changes > 0
  }
}
