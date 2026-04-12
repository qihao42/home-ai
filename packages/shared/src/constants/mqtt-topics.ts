export const MQTT_TOPIC_STATE = 'smarthome/{domain}/{device_id}/state'
export const MQTT_TOPIC_SET = 'smarthome/{domain}/{device_id}/set'
export const MQTT_TOPIC_CONFIG = 'smarthome/{domain}/{device_id}/config'

export function buildTopic(
  template: string,
  params: Readonly<Record<string, string>>
): string {
  return Object.entries(params).reduce(
    (topic, [key, value]) => topic.replace(`{${key}}`, value),
    template
  )
}

export function parseTopic(
  topic: string
): { readonly domain: string; readonly deviceId: string; readonly suffix: string } | null {
  const match = topic.match(/^smarthome\/([^/]+)\/([^/]+)\/([^/]+)$/)
  if (!match) return null
  return { domain: match[1]!, deviceId: match[2]!, suffix: match[3]! }
}
