export function formatValue(value: unknown, unit?: string): string {
  if (value === null || value === undefined) {
    return 'N/A'
  }

  if (typeof value === 'number') {
    const formatted = Number.isInteger(value)
      ? value.toString()
      : value.toFixed(1)
    return unit ? `${formatted}${unit}` : formatted
  }

  if (typeof value === 'boolean') {
    return value ? 'On' : 'Off'
  }

  const str = String(value)
  return unit ? `${str}${unit}` : str
}

export function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
      return 'Just now'
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Unknown'
  }
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}
