// Types
export type {
  EntityDomain,
  EntityState,
  StateChangedEvent,
} from './types/entity.js'

export type {
  DeviceConfig,
  DeviceCapability,
} from './types/device.js'

export type {
  AutomationRule,
  Trigger,
  StateTrigger,
  NumericStateTrigger,
  TimeTrigger,
  Condition,
  StateCondition,
  NumericStateCondition,
  AndCondition,
  OrCondition,
  Action,
  CallServiceAction,
  DelayAction,
} from './types/automation.js'

export type {
  EventType,
  SmartHomeEvent,
} from './types/event.js'

export type {
  SceneEntityState,
  Scene,
} from './types/scene.js'

export type {
  ApiResponse,
  PaginationMeta,
} from './types/api.js'

// Schemas
export {
  entityDomainSchema,
  entityStateSchema,
  stateChangedEventSchema,
} from './schemas/entity.schema.js'

export type {
  EntityDomainSchema,
  EntityStateSchema,
  StateChangedEventSchema,
} from './schemas/entity.schema.js'

export {
  stateTriggerSchema,
  numericStateTriggerSchema,
  timeTriggerSchema,
  triggerSchema,
  stateConditionSchema,
  numericStateConditionSchema,
  conditionSchema,
  callServiceActionSchema,
  delayActionSchema,
  actionSchema,
  automationRuleSchema,
} from './schemas/automation.schema.js'

export type {
  StateTriggerSchema,
  NumericStateTriggerSchema,
  TimeTriggerSchema,
  TriggerSchema,
  StateConditionSchema,
  NumericStateConditionSchema,
  CallServiceActionSchema,
  DelayActionSchema,
  ActionSchema,
  AutomationRuleSchema,
} from './schemas/automation.schema.js'

export {
  deviceCapabilitySchema,
  deviceConfigSchema,
} from './schemas/device.schema.js'

export type {
  DeviceCapabilitySchema,
  DeviceConfigSchema,
} from './schemas/device.schema.js'

export {
  sceneEntityStateSchema,
  sceneSchema,
} from './schemas/scene.schema.js'

export type {
  SceneEntityStateSchema,
  SceneSchema,
} from './schemas/scene.schema.js'

// Constants
export {
  MQTT_TOPIC_STATE,
  MQTT_TOPIC_SET,
  MQTT_TOPIC_CONFIG,
  buildTopic,
  parseTopic,
} from './constants/mqtt-topics.js'

export {
  ENTITY_DOMAINS,
  ENTITY_DOMAIN_DISPLAY_NAMES,
  ENTITY_DOMAIN_ICONS,
} from './constants/entity-domains.js'
