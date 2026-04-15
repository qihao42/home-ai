import { create } from 'zustand'

export interface Notification {
  readonly id: string
  readonly type: 'info' | 'warning' | 'success' | 'alert'
  readonly title: string
  readonly message: string
  readonly timestamp: string
  readonly dismissed: boolean
}

interface NotificationStore {
  notifications: readonly Notification[]
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'dismissed'>): void
  dismissNotification(id: string): void
  clearAll(): void
}

const MAX_NOTIFICATIONS = 50
const AUTO_DISMISS_MS = 8000

// Track pending auto-dismiss timers so we can cancel them on manual dismiss
// or clearAll(). Without this the timeouts leak and can fire after the
// notification is already gone, causing orphaned store writes.
const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>()

function cancelTimer(id: string): void {
  const timer = dismissTimers.get(id)
  if (timer !== undefined) {
    clearTimeout(timer)
    dismissTimers.delete(id)
  }
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification(incoming) {
    const notification: Notification = Object.freeze({
      ...incoming,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      dismissed: false,
    })

    set((prev) => {
      const updated = [notification, ...prev.notifications].slice(0, MAX_NOTIFICATIONS)
      return { notifications: updated }
    })

    const timer = setTimeout(() => {
      dismissTimers.delete(notification.id)
      useNotificationStore.getState().dismissNotification(notification.id)
    }, AUTO_DISMISS_MS)
    dismissTimers.set(notification.id, timer)
  },

  dismissNotification(id) {
    cancelTimer(id)
    set((prev) => ({
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, dismissed: true } : n
      ),
    }))
  },

  clearAll() {
    for (const id of dismissTimers.keys()) cancelTimer(id)
    set({ notifications: [] })
  },
}))
