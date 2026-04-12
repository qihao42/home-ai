import { useEntityStore } from '../stores/entity-store'
import { mapEntity } from './client'

let socket: WebSocket | null = null
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let intentionalClose = false

const MAX_RECONNECT_DELAY = 30000
const BASE_DELAY = 1000

function getReconnectDelay(): number {
  const delay = Math.min(
    BASE_DELAY * Math.pow(2, reconnectAttempts),
    MAX_RECONNECT_DELAY
  )
  return delay
}

function getWsUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/api/ws`
}

export function connect(): void {
  if (socket?.readyState === WebSocket.OPEN) {
    return
  }

  intentionalClose = false
  const url = getWsUrl()

  try {
    socket = new WebSocket(url)
  } catch {
    scheduleReconnect()
    return
  }

  socket.onopen = () => {
    reconnectAttempts = 0
    socket?.send(JSON.stringify({ type: 'subscribe_events' }))
  }

  socket.onmessage = (event) => {
    try {
      const message: ServerWsMessage = JSON.parse(event.data as string)
      handleMessage(message)
    } catch {
      // Ignore malformed messages
    }
  }

  socket.onclose = () => {
    socket = null
    if (!intentionalClose) {
      scheduleReconnect()
    }
  }

  socket.onerror = () => {
    socket?.close()
  }
}

function scheduleReconnect(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }
  const delay = getReconnectDelay()
  reconnectAttempts += 1
  reconnectTimer = setTimeout(() => {
    connect()
  }, delay)
}

interface ServerWsMessage {
  type: string
  event_type?: string
  data?: {
    entity_id: string
    old_state: unknown
    new_state: {
      entity_id: string
      domain: string
      state: string
      attributes: Record<string, unknown>
      last_updated: string
      last_changed: string
    }
  }
}

function handleMessage(message: ServerWsMessage): void {
  if (message.type === 'event' && message.event_type === 'state_changed' && message.data?.new_state) {
    const mapped = mapEntity(message.data.new_state)
    useEntityStore.getState().updateEntity(mapped.entityId, mapped)
  }
}

export function disconnect(): void {
  intentionalClose = true
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (socket) {
    socket.close()
    socket = null
  }
  reconnectAttempts = 0
}

export function isConnected(): boolean {
  return socket?.readyState === WebSocket.OPEN
}
