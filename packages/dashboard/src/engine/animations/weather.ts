import type { Animation, Frame } from '../types'
import { GRID_SIZE, createEmptyFrame } from '../types'
import { hslToRgb } from '../../utils/color'

/**
 * Weather widget — visual representation of current weather.
 * Data is fetched externally and set via updateWeather(...). If no data,
 * shows a gentle rotating sun placeholder so it's never blank.
 */

interface WeatherState {
  /** WMO weather code from Open-Meteo (0 clear, 1-3 cloudy, 45-48 fog, 51-67 rain, 71-77 snow, 80-82 showers, 95-99 storm) */
  code: number
  /** Temperature in Celsius */
  tempC: number
  /** Unix ms when this was fetched */
  fetchedAt: number
}

let weatherState: WeatherState | null = null

export function updateWeather(state: WeatherState): void {
  weatherState = state
}

export function getWeather(): WeatherState | null {
  return weatherState
}

// ─── Patterns ───────────────────────────────────────────────────────────────

const SUN = [
  [0,0,0,1,1,0,0,0],
  [0,1,0,1,1,0,1,0],
  [0,0,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [0,0,1,1,1,1,0,0],
  [0,1,0,1,1,0,1,0],
  [0,0,0,1,1,0,0,0],
]

const CLOUD = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1],
  [0,0,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0],
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function drawPattern(
  frame: Frame,
  pattern: readonly (readonly number[])[],
  color: readonly [number, number, number]
): void {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (pattern[y][x]) frame[y][x] = [color[0], color[1], color[2]]
    }
  }
}

function drawRain(frame: Frame, tick: number, heavy: boolean): void {
  const cloud = hslToRgb(220, 15, 40)
  // Cloud on top 4 rows
  for (let y = 0; y < 3; y++) {
    for (let x = 1; x < 7; x++) {
      if ((y === 0 && x >= 2 && x <= 5) || (y === 1 && x >= 1 && x <= 6) || y === 2) {
        frame[y][x] = cloud
      }
    }
  }
  // Rain drops
  const drop = hslToRgb(210, 80, 55)
  const heavyStreak = hslToRgb(210, 90, 65)
  const drops = heavy ? 6 : 3
  for (let i = 0; i < drops; i++) {
    const x = (tick * 2 + i * 3) % GRID_SIZE
    const y = ((tick + i * 2) % 5) + 3
    if (y < GRID_SIZE && x >= 1 && x <= 6) {
      frame[y][x] = heavy ? heavyStreak : drop
      if (heavy && y + 1 < GRID_SIZE) frame[y + 1][x] = drop
    }
  }
}

function drawSnow(frame: Frame, tick: number): void {
  const cloud = hslToRgb(220, 10, 50)
  for (let y = 0; y < 3; y++) {
    for (let x = 1; x < 7; x++) {
      if ((y === 0 && x >= 2 && x <= 5) || (y === 1 && x >= 1 && x <= 6) || y === 2) {
        frame[y][x] = cloud
      }
    }
  }
  const flake = hslToRgb(200, 20, 90)
  for (let i = 0; i < 4; i++) {
    const x = (tick + i * 2) % GRID_SIZE
    const y = ((tick / 2 + i * 3) % 5) + 3
    if (y < GRID_SIZE) frame[Math.floor(y)][x] = flake
  }
}

function drawStorm(frame: Frame, tick: number): void {
  drawRain(frame, tick, true)
  // Lightning flash every ~20 ticks
  if (tick % 20 < 3) {
    const bolt = hslToRgb(55, 100, 70)
    frame[3][3] = bolt
    frame[4][3] = bolt
    frame[4][4] = bolt
    frame[5][4] = bolt
    frame[6][5] = bolt
  }
}

function colorForTemp(tempC: number): [number, number, number] {
  // Map temp to hue: cold (blue 210) → warm (red 0)
  const clamped = Math.max(-10, Math.min(40, tempC))
  const pct = (clamped - -10) / 50
  const hue = 210 - pct * 210
  return hslToRgb(hue, 80, 55)
}

// ─── Animation ──────────────────────────────────────────────────────────────

export const weather: Animation = {
  name: 'Weather',
  icon: '🌤️',
  fps: 4,
  generate(tick) {
    const frame = createEmptyFrame()
    const ws = weatherState

    if (!ws) {
      // Placeholder: slow pulsing sun
      const pulse = (Math.sin(tick * 0.2) + 1) / 2
      const lightness = 40 + pulse * 20
      drawPattern(frame, SUN, hslToRgb(50, 90, lightness))
      return frame
    }

    const { code, tempC } = ws
    const tempColor = colorForTemp(tempC)

    if (code === 0) {
      // Clear sky
      drawPattern(frame, SUN, tempColor)
    } else if (code >= 1 && code <= 3) {
      // Mostly cloudy gradient: partial sun + cloud
      drawPattern(frame, SUN, hslToRgb(50, 80, 45))
      drawPattern(frame, CLOUD, hslToRgb(220, 10, 55))
    } else if (code >= 45 && code <= 48) {
      // Fog
      const fog = hslToRgb(220, 5, 55)
      for (let y = 1; y < 7; y += 2) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const shift = Math.sin(tick * 0.2 + y) * 0.5 + 0.5
          if (shift > x / GRID_SIZE) frame[y][x] = fog
        }
      }
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      drawRain(frame, tick, code >= 63)
    } else if (code >= 71 && code <= 77) {
      drawSnow(frame, tick)
    } else if (code >= 95) {
      drawStorm(frame, tick)
    } else {
      drawPattern(frame, SUN, tempColor)
    }

    return frame
  },
}

// ─── Data fetching ──────────────────────────────────────────────────────────

/**
 * Fetch current weather via Open-Meteo (no API key needed) based on browser
 * geolocation. Falls back to a default city if geolocation is denied.
 * Call once, then periodically (every 10 min is plenty).
 */
export async function refreshWeather(fallbackLat = 3.139, fallbackLon = 101.6869): Promise<WeatherState | null> {
  const getCoords = (): Promise<{ lat: number; lon: number }> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: fallbackLat, lon: fallbackLon })
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve({ lat: fallbackLat, lon: fallbackLon }),
        { timeout: 5000, enableHighAccuracy: false, maximumAge: 30 * 60 * 1000 }
      )
    })

  try {
    const { lat, lon } = await getCoords()
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
    const res = await fetch(url)
    if (!res.ok) return null
    const json = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number }
    }
    const current = json.current
    if (!current || current.temperature_2m === undefined || current.weather_code === undefined) {
      return null
    }
    const state: WeatherState = {
      code: current.weather_code,
      tempC: current.temperature_2m,
      fetchedAt: Date.now(),
    }
    updateWeather(state)
    return state
  } catch {
    return null
  }
}
