import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { LedMatrix } from '../components/orbital/LedMatrix'
import { Sphere3D } from '../components/orbital/Sphere3D'
import { AnimationEngine } from '../engine/AnimationEngine'
import { animations, smile, fire, welcome, night, wave, rainbow, refreshWeather } from '../engine/animations'
import type { Animation, Frame } from '../engine/types'
import { createEmptyFrame } from '../engine/types'
import { useEntityStore } from '../stores/entity-store'
import { callService } from '../api/client'
import { OrbitalBridge } from '../api/orbital-ws'
import type { EntityState } from '../types'

/** Map smart home events to LED animations */
function pickAnimationFromEntities(entities: Record<string, EntityState>): { animation: Animation; reason: string } {
  const list = Object.values(entities)

  // Priority 1: Any door/fridge open → Welcome animation
  const openDoor = list.find(
    (e) => e.domain === 'binary_sensor' &&
      (e.attributes.device_class === 'door' || e.attributes.device_class === 'contact') &&
      (e.state === 'on' || e.state === 'open')
  )
  if (openDoor) return { animation: welcome, reason: `${openDoor.name} opened` }

  // Priority 2: Motion detected → Smile (hello!)
  const motion = list.find(
    (e) => e.domain === 'binary_sensor' &&
      e.attributes.device_class === 'motion' &&
      e.state === 'on'
  )
  if (motion) return { animation: smile, reason: `Motion at ${motion.name}` }

  // Priority 3: High temperature → Fire warning
  const hotSensor = list.find(
    (e) => e.domain === 'sensor' &&
      e.attributes.device_class === 'temperature' &&
      parseFloat(e.state) > 35
  )
  if (hotSensor) return { animation: fire, reason: `${hotSensor.name}: ${hotSensor.state}°` }

  // Priority 4: High humidity → Wave
  const humid = list.find(
    (e) => e.domain === 'sensor' &&
      e.attributes.device_class === 'humidity' &&
      parseFloat(e.state) > 85
  )
  if (humid) return { animation: wave, reason: `${humid.name}: ${humid.state}%` }

  // Priority 5: All lights off → Night mode
  const lights = list.filter((e) => e.domain === 'light')
  const allOff = lights.length > 0 && lights.every((e) => e.state === 'off')
  if (allOff) return { animation: night, reason: 'All lights off — night mode' }

  // Priority 6: Any light on → Rainbow (party)
  const anyLightOn = lights.some((e) => e.state === 'on')
  if (anyLightOn) return { animation: rainbow, reason: 'Lights on — ambient mode' }

  // Default: Smile
  return { animation: smile, reason: 'Idle — standby' }
}

export function OrbitalPage() {
  const engineRef = useRef<AnimationEngine | null>(null)
  const bridgeRef = useRef<OrbitalBridge | null>(null)
  const [frame, setFrame] = useState<Frame>(createEmptyFrame())
  const [currentAnimation, setCurrentAnimation] = useState<Animation>(animations[0])
  const [brightness, setBrightness] = useState(0.85)
  const [hue, setHue] = useState(50)
  const [isPlaying, setIsPlaying] = useState(true)
  const [autoMode, setAutoMode] = useState(true)
  const [autoReason, setAutoReason] = useState('')
  const [bridgeConnected, setBridgeConnected] = useState(false)
  const [matrixSize, setMatrixSize] = useState(320)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')

  const entities = useEntityStore((s) => s.entities)

  // Responsive matrix size based on viewport
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth
      if (w < 400) setMatrixSize(240)
      else if (w < 640) setMatrixSize(280)
      else setMatrixSize(320)
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  // Refresh weather data on mount and every 10 minutes for the Weather widget
  useEffect(() => {
    void refreshWeather()
    const interval = setInterval(() => {
      void refreshWeather()
    }, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Initialize engine
  useEffect(() => {
    const engine = new AnimationEngine()
    engineRef.current = engine
    engine.setOnFrame(setFrame)
    engine.setAnimation(currentAnimation)
    engine.setBrightness(brightness)
    engine.setParams({ hue })
    engine.start()
    return () => engine.stop()
  }, [])

  // Initialize Orbital WebSocket bridge (browser <-> ESP32 relay).
  useEffect(() => {
    const bridge = new OrbitalBridge()
    bridgeRef.current = bridge
    const unsubscribe = bridge.onStatus(setBridgeConnected)
    bridge.connect()
    return () => {
      unsubscribe()
      bridge.dispose()
      bridgeRef.current = null
    }
  }, [])

  // Broadcast initial + any change in animation/brightness/hue once the
  // bridge becomes available.
  useEffect(() => {
    const bridge = bridgeRef.current
    if (!bridge || !bridgeConnected) return
    bridge.send({ type: 'animation', payload: { name: currentAnimation.name, fps: currentAnimation.fps } })
    bridge.send({ type: 'brightness', payload: { value: brightness } })
    bridge.send({ type: 'color', payload: { hue } })
    bridge.send({ type: 'command', payload: { action: isPlaying ? 'play' : 'pause' } })
  }, [bridgeConnected, currentAnimation, brightness, hue, isPlaying])

  // Auto-mode: react to entity states (debounced to prevent flipping on sensor jitter).
  // Include currentAnimation.name and autoReason in deps so the closure stays fresh.
  useEffect(() => {
    if (!autoMode) return
    const handle = setTimeout(() => {
      const { animation, reason } = pickAnimationFromEntities(entities)
      if (animation.name !== currentAnimation.name) {
        setCurrentAnimation(animation)
        setAutoReason(reason)
        engineRef.current?.setAnimation(animation)
      } else if (reason !== autoReason) {
        setAutoReason(reason)
      }
    }, 400)
    return () => clearTimeout(handle)
  }, [entities, autoMode, currentAnimation.name, autoReason])

  const handleSelectAnimation = useCallback((anim: Animation) => {
    setAutoMode(false)
    setCurrentAnimation(anim)
    engineRef.current?.setAnimation(anim)
    if (!engineRef.current?.isRunning()) {
      setIsPlaying(true)
      engineRef.current?.start()
    }
  }, [])

  const handleBrightnessChange = useCallback((val: number) => {
    setBrightness(val)
    engineRef.current?.setBrightness(val)
  }, [])

  const handleHueChange = useCallback((val: number) => {
    setHue(val)
    engineRef.current?.setParams({ hue: val })
  }, [])

  const handleTogglePlay = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    if (engine.isRunning()) {
      engine.stop()
      setIsPlaying(false)
    } else {
      engine.start()
      setIsPlaying(true)
    }
  }, [])

  // Quick actions to test integration
  const quickActions = useMemo(() => [
    {
      label: 'Open Fridge',
      icon: '🚪',
      desc: 'Triggers Welcome animation',
      action: () => callService('binary_sensor', 'toggle', { entity_id: 'kitchen_fridge_door' }),
    },
    {
      label: 'Turn On Lights',
      icon: '💡',
      desc: 'Triggers Rainbow mode',
      action: async () => {
        await callService('light', 'turn_on', { entity_id: 'living_room_light_1' })
        await callService('light', 'turn_on', { entity_id: 'bedroom_light_1' })
      },
    },
    {
      label: 'All Lights Off',
      icon: '🌙',
      desc: 'Triggers Night mode',
      action: async () => {
        await callService('light', 'turn_off', { entity_id: 'living_room_light_1' })
        await callService('light', 'turn_off', { entity_id: 'living_room_light_2' })
        await callService('light', 'turn_off', { entity_id: 'bedroom_light_1' })
        await callService('light', 'turn_off', { entity_id: 'kitchen_light_1' })
      },
    },
  ], [])

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-lg font-semibold text-white">Orbital LED Sphere</h3>
        <p className="text-sm text-slate-400">
          8x8 LED matrix reacts to your smart home in real-time
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LED display - 2D matrix or 3D sphere */}
        <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
          <div
            className="relative rounded-2xl p-4 sm:p-6 border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            {/* 2D / 3D toggle */}
            <div className="absolute right-3 top-3 z-10 flex rounded-lg border border-slate-700/50 bg-slate-900/60 p-0.5 text-xs backdrop-blur">
              <button
                onClick={() => setViewMode('2d')}
                className={`px-2.5 py-1 rounded ${
                  viewMode === '2d' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-2.5 py-1 rounded ${
                  viewMode === '3d' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                3D
              </button>
            </div>
            {viewMode === '2d' ? (
              <LedMatrix frame={frame} size={matrixSize} />
            ) : (
              <Sphere3D frame={frame} size={matrixSize} />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-slate-400">
              {currentAnimation.icon} {currentAnimation.name} — {currentAnimation.fps}fps
            </span>
          </div>
          {autoMode && autoReason && (
            <div className="px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs text-purple-300">
              Auto: {autoReason}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${bridgeConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span className="text-slate-500">
              ESP32 bridge: {bridgeConnected ? 'connected' : 'offline'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-5">
          {/* Auto Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-white">Smart Auto Mode</p>
              <p className="text-xs text-slate-400">LED reacts to door, motion, lights, temperature</p>
            </div>
            <button
              onClick={() => setAutoMode(!autoMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoMode ? 'bg-purple-500' : 'bg-slate-600'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                autoMode ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          {/* Animation Grid */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Animations</label>
            <div className="grid grid-cols-4 gap-2">
              {animations.map((anim) => (
                <button
                  key={anim.name}
                  onClick={() => handleSelectAnimation(anim)}
                  className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-xs transition-all ${
                    currentAnimation.name === anim.name
                      ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{anim.icon}</span>
                  <span>{anim.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex gap-3">
            <button
              onClick={handleTogglePlay}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isPlaying
                  ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                  : 'bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30'
              }`}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>

          {/* Brightness */}
          <div>
            <label className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Brightness</span>
              <span className="text-slate-300">{Math.round(brightness * 100)}%</span>
            </label>
            <input
              type="range" min="0" max="100"
              value={Math.round(brightness * 100)}
              onChange={(e) => handleBrightnessChange(Number(e.target.value) / 100)}
              className="w-full h-2 rounded-full appearance-none bg-slate-700 accent-blue-500"
            />
          </div>

          {/* Hue */}
          <div>
            <label className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Color Hue</span>
              <span className="text-slate-300">{hue}°</span>
            </label>
            <input
              type="range" min="0" max="360" value={hue}
              onChange={(e) => handleHueChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none accent-blue-500"
              style={{
                background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
              }}
            />
          </div>

          {/* Quick Test Actions */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Quick Test Actions</label>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={qa.action}
                  className="flex flex-col items-center gap-1 px-3 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all text-xs"
                >
                  <span className="text-lg">{qa.icon}</span>
                  <span className="font-medium">{qa.label}</span>
                  <span className="text-slate-500 text-[10px]">{qa.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Entity Status */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Live Sensor Feed</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.values(entities)
                .filter((e) => ['sensor', 'binary_sensor'].includes(e.domain))
                .map((e) => (
                  <div
                    key={e.entityId}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/30"
                  >
                    <span className="text-slate-400 truncate">{e.name}</span>
                    <span className={`font-mono ${
                      e.state === 'on' || e.state === 'open' ? 'text-yellow-400' : 'text-slate-300'
                    }`}>
                      {e.state}{e.attributes.unit ? ` ${e.attributes.unit}` : ''}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
