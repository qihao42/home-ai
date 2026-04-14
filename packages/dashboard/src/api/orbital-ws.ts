/**
 * Thin WebSocket client that bridges the Dashboard's Orbital page to the
 * Orbital bridge server (packages/orbital/server/index.ts, default :3001).
 *
 * The server simply fans messages out to all other connected clients — in
 * production that's the ESP32 firmware or a Home Assistant add-on, so this
 * client only needs to *send*. It auto-reconnects with a capped backoff and
 * silently no-ops when the bridge isn't running.
 */

export type OrbitalMessageType = 'animation' | 'color' | 'brightness' | 'command'

export interface OrbitalMessage {
  readonly type: OrbitalMessageType
  readonly payload: unknown
}

const DEFAULT_URL =
  (typeof window !== 'undefined' &&
    (window as unknown as { __ORBITAL_WS_URL__?: string }).__ORBITAL_WS_URL__) ||
  'ws://localhost:3001'

const MAX_BACKOFF_MS = 10_000
const INITIAL_BACKOFF_MS = 500

export class OrbitalBridge {
  private ws: WebSocket | null = null
  private readonly url: string
  private backoff = INITIAL_BACKOFF_MS
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private disposed = false
  private statusListeners = new Set<(connected: boolean) => void>()

  constructor(url: string = DEFAULT_URL) {
    this.url = url
  }

  connect(): void {
    if (this.disposed || this.ws !== null) return
    try {
      const socket = new WebSocket(this.url)
      this.ws = socket

      socket.addEventListener('open', () => {
        this.backoff = INITIAL_BACKOFF_MS
        this.emitStatus(true)
      })
      socket.addEventListener('close', () => {
        this.ws = null
        this.emitStatus(false)
        this.scheduleReconnect()
      })
      socket.addEventListener('error', () => {
        // Let close handler drive reconnect; just avoid unhandled errors.
      })
    } catch {
      this.scheduleReconnect()
    }
  }

  send(message: OrbitalMessage): boolean {
    const socket = this.ws
    if (socket === null || socket.readyState !== WebSocket.OPEN) return false
    try {
      socket.send(JSON.stringify(message))
      return true
    } catch {
      return false
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  onStatus(listener: (connected: boolean) => void): () => void {
    this.statusListeners.add(listener)
    listener(this.isConnected())
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  dispose(): void {
    this.disposed = true
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws !== null) {
      try {
        this.ws.close()
      } catch {
        /* noop */
      }
      this.ws = null
    }
    this.statusListeners.clear()
  }

  private emitStatus(connected: boolean): void {
    for (const listener of this.statusListeners) {
      try {
        listener(connected)
      } catch {
        /* swallow listener errors */
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.disposed || this.reconnectTimer !== null) return
    const delay = this.backoff
    this.backoff = Math.min(this.backoff * 2, MAX_BACKOFF_MS)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }
}
