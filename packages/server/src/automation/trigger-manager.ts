import type {
  Trigger,
  StateTrigger,
  NumericStateTrigger,
  StateChangedEvent,
} from '@smarthome/shared'
import { createLogger } from '../core/logger.js'
import { compareNumeric } from './condition-types.js'

const logger = createLogger('TriggerManager')

type TriggerCallback = () => void

interface RegisteredTrigger {
  readonly automationId: string
  readonly trigger: Trigger
  readonly callback: TriggerCallback
}

export class TriggerManager {
  private readonly triggers: Map<string, RegisteredTrigger> = new Map()

  registerTrigger(
    automationId: string,
    trigger: Trigger,
    callback: TriggerCallback,
  ): void {
    if (trigger.type === 'time') {
      logger.warn(
        `Time triggers are not implemented in v1, skipping registration for automation ${automationId}`,
      )
      return
    }

    this.triggers.set(automationId, Object.freeze({
      automationId,
      trigger,
      callback,
    }))

    logger.info(`Trigger registered for automation ${automationId}`, {
      type: trigger.type,
    })
  }

  unregisterTrigger(automationId: string): void {
    const existed = this.triggers.delete(automationId)
    if (existed) {
      logger.info(`Trigger unregistered for automation ${automationId}`)
    }
  }

  handleStateChange(event: StateChangedEvent): void {
    for (const registered of this.triggers.values()) {
      try {
        if (this.doesTriggerMatch(registered.trigger, event)) {
          registered.callback()
        }
      } catch (error) {
        logger.error(
          `Error evaluating trigger for automation ${registered.automationId}`,
          String(error),
        )
      }
    }
  }

  private doesTriggerMatch(
    trigger: Trigger,
    event: StateChangedEvent,
  ): boolean {
    switch (trigger.type) {
      case 'state':
        return this.matchStateTrigger(trigger, event)
      case 'numeric_state':
        return this.matchNumericStateTrigger(trigger, event)
      case 'time':
        return false
    }
  }

  private matchStateTrigger(
    trigger: StateTrigger,
    event: StateChangedEvent,
  ): boolean {
    if (trigger.entity_id !== event.entity_id) {
      return false
    }
    if (trigger.to !== undefined && event.new_state.state !== trigger.to) {
      return false
    }
    if (
      trigger.from !== undefined &&
      event.old_state?.state !== trigger.from
    ) {
      return false
    }
    return true
  }

  private matchNumericStateTrigger(
    trigger: NumericStateTrigger,
    event: StateChangedEvent,
  ): boolean {
    if (trigger.entity_id !== event.entity_id) {
      return false
    }

    const newValue = event.new_state.attributes[trigger.attribute]
    if (typeof newValue !== 'number') {
      return false
    }

    const oldValue = event.old_state?.attributes[trigger.attribute]
    const oldWasInRange =
      typeof oldValue === 'number' &&
      compareNumeric(oldValue, trigger.above, trigger.below)

    const newIsInRange = compareNumeric(newValue, trigger.above, trigger.below)

    return newIsInRange && !oldWasInRange
  }
}
