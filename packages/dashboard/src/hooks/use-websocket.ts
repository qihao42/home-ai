import { useEffect, useState, useCallback } from 'react'
import { connect, disconnect, isConnected } from '../api/websocket'

export function useWebSocket(): { connected: boolean } {
  const [connected, setConnected] = useState(false)

  const checkConnection = useCallback(() => {
    setConnected(isConnected())
  }, [])

  useEffect(() => {
    connect()

    const interval = setInterval(checkConnection, 1000)

    return () => {
      clearInterval(interval)
      disconnect()
    }
  }, [checkConnection])

  return { connected }
}
