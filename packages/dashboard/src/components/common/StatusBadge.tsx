type BadgeVariant = 'online' | 'offline' | 'active' | 'idle' | 'warning'

interface StatusBadgeProps {
  variant: BadgeVariant
  label?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  online: 'bg-green-500/20 text-green-400 border-green-500/30',
  offline: 'bg-red-500/20 text-red-400 border-red-500/30',
  active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  idle: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

const variantDot: Record<BadgeVariant, string> = {
  online: 'bg-green-400',
  offline: 'bg-red-400',
  active: 'bg-blue-400',
  idle: 'bg-slate-400',
  warning: 'bg-amber-400',
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  const defaultLabels: Record<BadgeVariant, string> = {
    online: 'Online',
    offline: 'Offline',
    active: 'Active',
    idle: 'Idle',
    warning: 'Warning',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5
        text-xs font-medium ${variantStyles[variant]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${variantDot[variant]}
          ${variant === 'online' || variant === 'active' ? 'animate-pulse' : ''}`}
      />
      {label ?? defaultLabels[variant]}
    </span>
  )
}
