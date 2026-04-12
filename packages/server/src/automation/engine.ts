import type {
  AutomationRule,
  StateChangedEvent,
} from '@smarthome/shared'
import type { EventBus } from '../core/event-bus.js'
import type { EntityRegistry } from '../core/entity-registry.js'
import { createLogger } from '../core/logger.js'
import { ActionExecutor } from './action-executor.js'
import { TriggerManager } from './trigger-manager.js'
import { AutomationStore, generateId } from './automation-store.js'
import { evaluateConditions } from './rule-evaluator.js'

const logger = createLogger('AutomationEngine')

const MAX_EXECUTION_DEPTH = 3

export class AutomationEngine {
  private readonly eventBus: EventBus
  private readonly entityRegistry: EntityRegistry
  private readonly actionExecutor: ActionExecutor
  private readonly triggerManager: TriggerManager
  private readonly store: AutomationStore

  private readonly executionDepth: Map<string, number> = new Map()
  private stateChangeHandler: ((event: StateChangedEvent) => void) | null = null

  constructor(
    eventBus: EventBus,
    entityRegistry: EntityRegistry,
    actionExecutor: ActionExecutor,
  ) {
    this.eventBus = eventBus
    this.entityRegistry = entityRegistry
    this.actionExecutor = actionExecutor
    this.triggerManager = new TriggerManager()
    this.store = new AutomationStore()
  }

  getAllRules(): readonly AutomationRule[] {
    return this.store.getAll()
  }

  getRule(id: string): AutomationRule | undefined {
    return this.store.getById(id)
  }

  addRule(rule: Omit<AutomationRule, 'id'>): AutomationRule {
    const newRule: AutomationRule = Object.freeze({
      ...rule,
      id: generateId(),
    })

    this.store.save(newRule)

    if (newRule.enabled) {
      this.registerRuleTrigger(newRule)
    }

    logger.info(`Rule added: ${newRule.name}`, { id: newRule.id })
    return newRule
  }

  updateRule(
    id: string,
    partial: Partial<Omit<AutomationRule, 'id'>>,
  ): AutomationRule | undefined {
    const existing = this.store.getById(id)
    if (existing === undefined) {
      return undefined
    }

    const updated: AutomationRule = Object.freeze({
      ...existing,
      ...partial,
      id: existing.id,
    })

    this.store.save(updated)
    this.triggerManager.unregisterTrigger(id)

    if (updated.enabled) {
      this.registerRuleTrigger(updated)
    }

    logger.info(`Rule updated: ${updated.name}`, { id })
    return updated
  }

  removeRule(id: string): boolean {
    this.triggerManager.unregisterTrigger(id)
    const removed = this.store.remove(id)
    if (removed) {
      logger.info(`Rule removed`, { id })
    }
    return removed
  }

  async triggerRule(id: string): Promise<boolean> {
    const rule = this.store.getById(id)
    if (rule === undefined) {
      return false
    }

    return this.executeRule(rule)
  }

  start(): void {
    const rules = this.store.getAll()
    for (const rule of rules) {
      if (rule.enabled) {
        this.registerRuleTrigger(rule)
      }
    }

    this.stateChangeHandler = (event: StateChangedEvent) => {
      this.handleStateChange(event)
    }

    this.eventBus.on('state_changed', this.stateChangeHandler)
    logger.info('Automation engine started', {
      ruleCount: rules.length,
    })
  }

  stop(): void {
    if (this.stateChangeHandler !== null) {
      this.eventBus.off('state_changed', this.stateChangeHandler)
      this.stateChangeHandler = null
    }

    const rules = this.store.getAll()
    for (const rule of rules) {
      this.triggerManager.unregisterTrigger(rule.id)
    }

    this.executionDepth.clear()
    logger.info('Automation engine stopped')
  }

  private handleStateChange(event: StateChangedEvent): void {
    this.triggerManager.handleStateChange(event)
  }

  private registerRuleTrigger(rule: AutomationRule): void {
    this.triggerManager.registerTrigger(rule.id, rule.trigger, () => {
      this.onRuleTriggered(rule.id).catch((error) => {
        logger.error(`Failed to execute triggered rule ${rule.id}`, String(error))
      })
    })
  }

  private async onRuleTriggered(ruleId: string): Promise<void> {
    const currentDepth = this.executionDepth.get(ruleId) ?? 0

    if (currentDepth >= MAX_EXECUTION_DEPTH) {
      logger.warn(
        `Anti-loop protection: skipping rule ${ruleId} at depth ${String(currentDepth)}`,
      )
      return
    }

    const rule = this.store.getById(ruleId)
    if (rule === undefined || !rule.enabled) {
      return
    }

    await this.executeRule(rule)
  }

  private async executeRule(rule: AutomationRule): Promise<boolean> {
    const currentDepth = this.executionDepth.get(rule.id) ?? 0

    if (currentDepth >= MAX_EXECUTION_DEPTH) {
      logger.warn(
        `Anti-loop protection: refusing to execute rule ${rule.id} at depth ${String(currentDepth)}`,
      )
      return false
    }

    if (
      rule.conditions.length > 0 &&
      !evaluateConditions(rule.conditions, this.entityRegistry)
    ) {
      logger.info(`Conditions not met for rule ${rule.name}`, { id: rule.id })
      return false
    }

    this.executionDepth.set(rule.id, currentDepth + 1)

    try {
      await this.actionExecutor.executeActions(rule.actions)

      this.eventBus.emit('automation_triggered', Object.freeze({
        automation_id: rule.id,
        trigger_data: Object.freeze({ name: rule.name }),
      }))

      logger.info(`Rule executed: ${rule.name}`, { id: rule.id })
      return true
    } catch (error) {
      logger.error(`Rule execution failed: ${rule.name}`, {
        id: rule.id,
        error: String(error),
      })
      return false
    } finally {
      this.executionDepth.set(rule.id, currentDepth)
    }
  }
}
