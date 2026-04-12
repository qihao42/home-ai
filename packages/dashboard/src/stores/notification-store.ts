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

    setTimeout(() => {
      useNotificationStore.getState().dismissNotification(notification.id)
    }, AUTO_DISMISS_MS)
  },

  dismissNotification(id) {
    set((prev) => ({
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, dismissed: true } : n
      ),
    }))
  },

  clearAll() {
    set({ notifications: [] })
  },
}))
