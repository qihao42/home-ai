import type {
  Trigger,
  StateTrigger,
  NumericStateTrigger,
  TimeTrigger,
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

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export class TriggerManager {
  private readonly triggers: Map<string, RegisteredTrigger> = new Map()
  private readonly timeTimers: Map<string, NodeJS.Timeout> = new Map()

  registerTrigger(
    automationId: string,
    trigger: Trigger,
    callback: TriggerCallback,
  ): void {
    this.triggers.set(automationId, Object.freeze({
      automationId,
      trigger,
      callback,
    }))

    if (trigger.type === 'time') {
      this.scheduleTimeTrigger(automationId, trigger, callback)
    }

    logger.info(`Trigger registered for automation ${automationId}`, {
      type: trigger.type,
    })
  }

  unregisterTrigger(automationId: string): void {
    const existed = this.triggers.delete(automationId)
    this.clearTimeTimer(automationId)
    if (existed) {
      logger.info(`Trigger unregistered for automation ${automationId}`)
    }
  }

  /** For tests / shutdown: clear all pending time timers. */
  clearAllTimers(): void {
    for (const id of [...this.timeTimers.keys()]) {
      this.clearTimeTimer(id)
    }
  }

  private clearTimeTimer(automationId: string): void {
    const timer = this.timeTimers.get(automationId)
    if (timer !== undefined) {
      clearTimeout(timer)
      this.timeTimers.delete(automationId)
    }
  }

  private scheduleTimeTrigger(
    automationId: string,
    trigger: TimeTrigger,
    callback: TriggerCallback,
    now: Date = new Date(),
  ): void {
    const match = TIME_PATTERN.exec(trigger.at)
    if (match === null) {
      logger.warn(
        `Invalid time trigger "${trigger.at}" for automation ${automationId} (expected HH:MM)`,
      )
      return
    }

    const hour = Number(match[1])
    const minute = Number(match[2])
    const next = new Date(now)
    next.setHours(hour, minute, 0, 0)
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1)
    }

    const delay = next.getTime() - now.getTime()
    const timer = setTimeout(() => {
      this.timeTimers.delete(automationId)
      try {
        callback()
      } catch (error) {
        logger.error(
          `Time trigger callback failed for automation ${automationId}`,
          String(error),
        )
      }
      // Re-schedule for the next day, unless unregistered in the meantime.
      if (this.triggers.has(automationId)) {
        this.scheduleTimeTrigger(automationId, trigger, callback, new Date())
      }
    }, delay)

    // Don't keep the event loop alive just for a daily alarm.
    if (typeof timer.unref === 'function') {
      timer.unref()
    }

    this.timeTimers.set(automationId, timer)

    logger.info(
      `Time trigger scheduled for automation ${automationId} at ${trigger.at} (fires in ${String(Math.round(delay / 1000))}s)`,
    )
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
