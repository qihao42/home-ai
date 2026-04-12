interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  label?: string
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  label,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-xs font-medium text-slate-300">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full cursor-pointer appearance-none rounded-full bg-slate-600 h-2
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-blue-500
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:duration-150
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:bg-blue-500
          [&::-moz-range-thumb]:shadow-md
          disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #475569 ${percentage}%, #475569 100%)`,
        }}
      />
    </div>
  )
}
