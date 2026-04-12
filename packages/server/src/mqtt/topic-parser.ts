export interface ParsedTopic {
  readonly domain: string
  readonly deviceId: string
  readonly suffix: string
}

const TOPIC_PREFIX = 'smarthome'
const SEGMENT_COUNT = 4

export function parseTopic(topic: string): ParsedTopic | null {
  const segments = topic.split('/')

  if (segments.length !== SEGMENT_COUNT) {
    return null
  }

  const [prefix, domain, deviceId, suffix] = segments

  if (prefix !== TOPIC_PREFIX || !domain || !deviceId || !suffix) {
    return null
  }

  return Object.freeze({ domain, deviceId, suffix })
}

export function buildTopic(
  domain: string,
  deviceId: string,
  suffix: string,
): string {
  return `${TOPIC_PREFIX}/${domain}/${deviceId}/${suffix}`
}
