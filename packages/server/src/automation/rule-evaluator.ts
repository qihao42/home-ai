import type {
  Condition,
  StateCondition,
  NumericStateCondition,
  AndCondition,
  OrCondition,
} from '@smarthome/shared'
import type { EntityRegistry } from '../core/entity-registry.js'
import { compareNumeric, matchState } from './condition-types.js'

export function evaluateConditions(
  conditions: readonly Condition[],
  entityRegistry: EntityRegistry,
): boolean {
  return conditions.every((condition) =>
    evaluateCondition(condition, entityRegistry),
  )
}

export function evaluateCondition(
  condition: Condition,
  entityRegistry: EntityRegistry,
): boolean {
  switch (condition.type) {
    case 'state':
      return evaluateStateCondition(condition, entityRegistry)
    case 'numeric_state':
      return evaluateNumericStateCondition(condition, entityRegistry)
    case 'and':
      return evaluateAndCondition(condition, entityRegistry)
    case 'or':
      return evaluateOrCondition(condition, entityRegistry)
  }
}

function evaluateStateCondition(
  condition: StateCondition,
  entityRegistry: EntityRegistry,
): boolean {
  const entity = entityRegistry.getState(condition.entity_id)
  if (entity === undefined) {
    return false
  }
  return matchState(entity.state, condition.state)
}

function evaluateNumericStateCondition(
  condition: NumericStateCondition,
  entityRegistry: EntityRegistry,
): boolean {
  const entity = entityRegistry.getState(condition.entity_id)
  if (entity === undefined) {
    return false
  }
  const value = entity.attributes[condition.attribute]
  if (typeof value !== 'number') {
    return false
  }
  return compareNumeric(value, condition.above, condition.below)
}

function evaluateAndCondition(
  condition: AndCondition,
  entityRegistry: EntityRegistry,
): boolean {
  return condition.conditions.every((sub) =>
    evaluateCondition(sub, entityRegistry),
  )
}

function evaluateOrCondition(
  condition: OrCondition,
  entityRegistry: EntityRegistry,
): boolean {
  return condition.conditions.some((sub) =>
    evaluateCondition(sub, entityRegistry),
  )
}
