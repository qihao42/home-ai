export interface ParsedTopic {
  readonly domain: string
  readonly deviceId: string
  readonly suffix: string
  /** Original prefix: "smarthome" (our native) or "homeassistant" (HA-compatible) */
  readonly prefix: string
}

const NATIVE_PREFIX = 'smarthome'
const HA_PREFIX = 'homeassistant'
const SEGMENT_COUNT = 4

export function parseTopic(topic: string): ParsedTopic | null {
  const segments = topic.split('/')

  if (segments.length !== SEGMENT_COUNT) {
    return null
  }

  const [prefix, domain, deviceId, suffix] = segments

  if ((prefix !== NATIVE_PREFIX && prefix !== HA_PREFIX) || !domain || !deviceId || !suffix) {
    return null
  }

  return Object.freeze({ prefix, domain, deviceId, suffix })
}

export function buildTopic(
  domain: string,
  deviceId: string,
  suffix: string,
): string {
  return `${NATIVE_PREFIX}/${domain}/${deviceId}/${suffix}`
}

export function isHomeAssistantTopic(topic: string): boolean {
  return topic.startsWith(`${HA_PREFIX}/`)
}
