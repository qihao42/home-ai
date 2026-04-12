export function getEntityIcon(domain: string, state?: string): string {
  switch (domain) {
    case 'light':
      return state === 'on' ? '💡' : '🔅'
    case 'switch':
      return state === 'on' ? '🔌' : '⭕'
    case 'sensor':
      return '📊'
    case 'binary_sensor':
      return state === 'on' ? '🔔' : '🔕'
    case 'climate':
      return '🌡️'
    case 'camera':
      return '📷'
    case 'lock':
      return state === 'locked' ? '🔒' : '🔓'
    case 'cover':
      return state === 'open' ? '🪟' : '🪟'
    case 'media_player':
      return '🎵'
    case 'fan':
      return '🌀'
    default:
      return '📦'
  }
}

export function getSensorIcon(attributes: Record<string, unknown>): string {
  const deviceClass = attributes.device_class as string | undefined
  const unit = attributes.unit as string | undefined

  if (deviceClass === 'temperature' || unit === '°C' || unit === '°F') {
    return '🌡️'
  }
  if (deviceClass === 'humidity' || unit === '%') {
    return '💧'
  }
  if (deviceClass === 'illuminance' || unit === 'lx') {
    return '☀️'
  }
  if (deviceClass === 'pressure') {
    return '🌪️'
  }
  if (deviceClass === 'battery') {
    return '🔋'
  }
  if (deviceClass === 'power' || unit === 'W') {
    return '⚡'
  }
  if (deviceClass === 'energy' || unit === 'kWh') {
    return '🔌'
  }
  if (deviceClass === 'motion') {
    return '🏃'
  }
  if (deviceClass === 'door') {
    return '🚪'
  }

  return '📊'
}

export function getBinarySensorType(
  attributes: Record<string, unknown>
): 'motion' | 'door' | 'generic' {
  const deviceClass = attributes.device_class as string | undefined
  if (deviceClass === 'motion' || deviceClass === 'occupancy') {
    return 'motion'
  }
  if (
    deviceClass === 'door' ||
    deviceClass === 'window' ||
    deviceClass === 'opening'
  ) {
    return 'door'
  }
  return 'generic'
}
