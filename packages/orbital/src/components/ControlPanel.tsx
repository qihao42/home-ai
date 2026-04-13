import { animations } from '../engine/animations';
import type { Animation } from '../engine/types';

interface ControlPanelProps {
  currentAnimation: Animation;
  onSelectAnimation: (anim: Animation) => void;
  brightness: number;
  onBrightnessChange: (val: number) => void;
  hue: number;
  onHueChange: (val: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function ControlPanel({
  currentAnimation,
  onSelectAnimation,
  brightness,
  onBrightnessChange,
  hue,
  onHueChange,
  isPlaying,
  onTogglePlay,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white/90">Control Panel</h2>
        <p className="text-sm text-white/40">Select animation & adjust settings</p>
      </div>

      {/* Animation Grid */}
      <div>
        <label className="block text-sm text-white/50 mb-2">Animations</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {animations.map((anim) => (
            <button
              key={anim.name}
              onClick={() => onSelectAnimation(anim)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all
                ${currentAnimation.name === anim.name
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white/90'
                }`}
            >
              <span className="text-lg">{anim.icon}</span>
              <span>{anim.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Playback */}
      <div>
        <button
          onClick={onTogglePlay}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all
            ${isPlaying
              ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
              : 'bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30'
            }`}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      {/* Brightness */}
      <div>
        <label className="flex justify-between text-sm text-white/50 mb-2">
          <span>Brightness</span>
          <span className="text-white/70">{Math.round(brightness * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(brightness * 100)}
          onChange={(e) => onBrightnessChange(Number(e.target.value) / 100)}
          className="w-full h-2 rounded-full appearance-none bg-white/10 accent-purple-500"
        />
      </div>

      {/* Hue / Color */}
      <div>
        <label className="flex justify-between text-sm text-white/50 mb-2">
          <span>Color Hue</span>
          <span className="text-white/70">{hue}°</span>
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={hue}
          onChange={(e) => onHueChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none accent-purple-500"
          style={{
            background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
          }}
        />
      </div>

      {/* Info */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex justify-between text-xs text-white/30">
          <span>FPS: {currentAnimation.fps}</span>
          <span>Grid: 8x8</span>
          <span>LEDs: 64</span>
        </div>
      </div>
    </div>
  );
}
