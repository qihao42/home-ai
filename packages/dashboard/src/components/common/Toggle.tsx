interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
}: ToggleProps) {
  const sizeClasses = size === 'sm'
    ? { track: 'w-9 h-5', thumb: 'h-4 w-4', translate: 'translate-x-4' }
    : { track: 'w-12 h-6', thumb: 'h-5 w-5', translate: 'translate-x-6' }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
        focus:ring-offset-slate-800
        ${sizeClasses.track}
        ${checked ? 'bg-blue-500' : 'bg-slate-600'}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block transform rounded-full
          bg-white shadow-lg ring-0 transition-transform duration-200
          ${sizeClasses.thumb}
          ${checked ? sizeClasses.translate : 'translate-x-0'}
        `}
      />
    </button>
  )
}
