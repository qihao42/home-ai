import { useNotificationStore } from '../../stores/notification-store'
import type { Notification } from '../../stores/notification-store'

const BORDER_COLORS: Record<Notification['type'], string> = {
  info: 'border-l-blue-500',
  warning: 'border-l-amber-500',
  success: 'border-l-green-500',
  alert: 'border-l-red-500',
}

const ICON_MAP: Record<Notification['type'], string> = {
  info: '\u2139\uFE0F',
  warning: '\u26A0\uFE0F',
  success: '\u2705',
  alert: '\uD83D\uDEA8',
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function Toast({
  notification,
  onDismiss,
}: {
  notification: Notification
  onDismiss: (id: string) => void
}) {
  const borderColor = BORDER_COLORS[notification.type]

  return (
    <div
      className={`flex w-full items-start gap-3 rounded-xl border-l-4 ${borderColor} bg-slate-800 p-4 shadow-lg shadow-black/20 animate-slide-in-right`}
    >
      <span className="mt-0.5 text-lg">{ICON_MAP[notification.type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-white text-sm">{notification.title}</h4>
          <button
            onClick={() => onDismiss(notification.id)}
            className="shrink-0 text-slate-400 hover:text-white transition-colors"
            aria-label="Dismiss notification"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p className="text-sm text-slate-400 mt-0.5">{notification.message}</p>
        <p className="text-xs text-slate-500 mt-1">{formatTimestamp(notification.timestamp)}</p>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const notifications = useNotificationStore((s) => s.notifications)
  const dismissNotification = useNotificationStore((s) => s.dismissNotification)

  const visible = notifications
    .filter((n) => !n.dismissed)
    .slice(0, 5)

  if (visible.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2 max-sm:left-4 max-sm:right-4 max-sm:w-auto">
      {visible.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  )
}
