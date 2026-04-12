import type { EntityDomain, EntityState } from '@smarthome/shared'

interface RawPayload {
  readonly state?: string
  readonly brightness?: number
  readonly color?: string
  readonly value?: number
  readonly unit?: string
  readonly temperature?: number
  readonly humidity?: number
  readonly target_temperature?: number
  readonly current_temperature?: number
  readonly hvac_mode?: string
  readonly hvac_action?: string
  readonly mode?: string
  readonly motion?: boolean
  readonly contact?: boolean
  readonly last_triggered?: string
  readonly [key: string]: unknown
}

function buildLightAttributes(
  payload: RawPayload,
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    ...(payload.brightness !== undefined && { brightness: payload.brightness }),
    ...(payload.color !== undefined && { color: payload.color }),
  })
}

function buildSensorAttributes(
  payload: RawPayload,
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    ...(payload.temperature !== undefined && { temperature: payload.temperature }),
    ...(payload.humidity !== undefined && { humidity: payload.humidity }),
    ...(payload.value !== undefined && { value: payload.value }),
    ...(payload.unit !== undefined && { unit: payload.unit }),
  })
}

function buildClimateAttributes(
  payload: RawPayload,
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    ...(payload.current_temperature !== undefined && { current_temperature: payload.current_temperature }),
    ...(payload.temperature !== undefined && { current_temperature: payload.temperature }),
    ...(payload.target_temperature !== undefined && { target_temperature: payload.target_temperature }),
    ...(payload.hvac_mode !== undefined && { hvac_mode: payload.hvac_mode }),
    ...(payload.hvac_action !== undefined && { hvac_action: payload.hvac_action }),
    ...(payload.mode !== undefined && { hvac_mode: payload.mode }),
  })
}

function buildBinarySensorAttributes(
  payload: RawPayload,
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    ...(payload.motion !== undefined && { motion: payload.motion }),
    ...(payload.contact !== undefined && { contact: payload.contact }),
    ...(payload.last_triggered !== undefined && { last_triggered: payload.last_triggered }),
    ...(payload.value !== undefined && { value: payload.value }),
  })
}

function buildSwitchAttributes(
  _payload: RawPayload,
): Readonly<Record<string, unknown>> {
  return Object.freeze({})
}

const attributeBuilders: Readonly<
  Record<EntityDomain, (payload: RawPayload) => Readonly<Record<string, unknown>>>
> = Object.freeze({
  light: buildLightAttributes,
  sensor: buildSensorAttributes,
  climate: buildClimateAttributes,
  binary_sensor: buildBinarySensorAttributes,
  switch: buildSwitchAttributes,
})

function resolveState(domain: EntityDomain, payload: RawPayload): string {
  if (payload.state !== undefined) {
    return String(payload.state)
  }

  switch (domain) {
    case 'sensor':
      if (payload.temperature !== undefined) return String(payload.temperature)
      if (payload.humidity !== undefined) return String(payload.humidity)
      if (payload.value !== undefined) return String(payload.value)
      return 'unknown'
    case 'binary_sensor':
      if (payload.motion !== undefined) return payload.motion ? 'on' : 'off'
      if (payload.contact !== undefined) return payload.contact ? 'closed' : 'open'
      return 'unknown'
    case 'climate':
      if (payload.hvac_mode !== undefined) return String(payload.hvac_mode)
      if (payload.mode !== undefined) return String(payload.mode)
      return 'unknown'
    default:
      return 'unknown'
  }
}

export function mapPayloadToState(
  _entityId: string,
  domain: EntityDomain,
  payload: RawPayload,
): Omit<EntityState, 'entity_id' | 'last_updated'> {
  const builder = attributeBuilders[domain]
  const attributes = builder(payload)
  const now = new Date().toISOString()

  return Object.freeze({
    domain,
    state: resolveState(domain, payload),
    attributes,
    last_changed: now,
  })
}
