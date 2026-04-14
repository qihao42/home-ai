import type { EntityState } from '../types'

export type VoiceIntent =
  | { readonly kind: 'turn_on'; readonly target: string; readonly entityId?: string }
  | { readonly kind: 'turn_off'; readonly target: string; readonly entityId?: string }
  | { readonly kind: 'toggle'; readonly target: string; readonly entityId?: string }
  | { readonly kind: 'activate_scene'; readonly sceneName: string }
  | { readonly kind: 'query_temperature' }
  | { readonly kind: 'query_humidity' }
  | { readonly kind: 'query_status' }
  | { readonly kind: 'unknown'; readonly text: string }

export interface ParsedCommand {
  readonly intent: VoiceIntent
  readonly response: string
  readonly confidence: number
}

interface LocationMatch {
  readonly keywords: readonly string[]
  readonly roomHint: string
}

const LOCATIONS: readonly LocationMatch[] = [
  { keywords: ['客厅', '起居室', 'living room', 'living'], roomHint: 'Living Room' },
  { keywords: ['卧室', '房间', 'bedroom'], roomHint: 'Bedroom' },
  { keywords: ['厨房', 'kitchen'], roomHint: 'Kitchen' },
  { keywords: ['走廊', '玄关', '过道', 'hallway', 'hall'], roomHint: 'Hallway' },
]

const ON_WORDS = ['开', '打开', '亮', 'turn on', 'switch on', 'on ', 'open']
const OFF_WORDS = ['关', '关闭', '熄灭', '熄', 'turn off', 'switch off', 'off ', 'close']
const TOGGLE_WORDS = ['切换', 'toggle']

const LIGHT_WORDS = ['灯', 'light', 'lights', 'lamp']
const FRIDGE_WORDS = ['冰箱', '冰箱门', 'fridge', 'refrigerator']
const ALL_WORDS = ['所有', '全部', '全', 'all', 'every']

function norm(text: string): string {
  return text.toLowerCase().trim().replace(/[，。,.!?？！]/g, ' ')
}

function containsAny(text: string, words: readonly string[]): boolean {
  return words.some((w) => text.includes(w))
}

function findRoomInText(text: string): string | null {
  for (const loc of LOCATIONS) {
    if (containsAny(text, loc.keywords)) return loc.roomHint
  }
  return null
}

function matchEntity(
  entities: Record<string, EntityState>,
  predicate: (e: EntityState) => boolean
): EntityState | null {
  const matches = Object.values(entities).filter(predicate)
  return matches[0] ?? null
}

export function parseVoiceCommand(
  rawText: string,
  entities: Record<string, EntityState>
): ParsedCommand {
  const text = norm(rawText)
  if (!text) {
    return { intent: { kind: 'unknown', text: rawText }, response: '', confidence: 0 }
  }

  // Scene activation: "晚安" / "good night" / "早安" / "good morning" / "回家" / "away"
  if (text.includes('晚安') || text.includes('good night') || text.includes('night mode')) {
    return {
      intent: { kind: 'activate_scene', sceneName: 'Good Night' },
      response: '晚安，切换到夜间模式',
      confidence: 0.95,
    }
  }
  if (text.includes('早安') || text.includes('早上好') || text.includes('good morning')) {
    return {
      intent: { kind: 'activate_scene', sceneName: 'Good Morning' },
      response: '早安！启动晨间场景',
      confidence: 0.95,
    }
  }
  if (text.includes('看电影') || text.includes('movie') || text.includes('电影模式')) {
    return {
      intent: { kind: 'activate_scene', sceneName: 'Movie Time' },
      response: '切换到观影模式',
      confidence: 0.9,
    }
  }
  if (text.includes('出门') || text.includes('离家') || text.includes('away')) {
    return {
      intent: { kind: 'activate_scene', sceneName: 'Away' },
      response: '切换到离家模式',
      confidence: 0.9,
    }
  }

  // Queries
  if (text.includes('温度') || text.includes('多少度') || text.includes('temperature')) {
    return {
      intent: { kind: 'query_temperature' },
      response: '',
      confidence: 0.9,
    }
  }
  if (text.includes('湿度') || text.includes('humidity')) {
    return {
      intent: { kind: 'query_humidity' },
      response: '',
      confidence: 0.9,
    }
  }
  if (text.includes('状态') || text.includes('怎么样') || text.includes('status')) {
    return {
      intent: { kind: 'query_status' },
      response: '',
      confidence: 0.8,
    }
  }

  // Light control
  const isOn = containsAny(text, ON_WORDS)
  const isOff = containsAny(text, OFF_WORDS)
  const isToggle = containsAny(text, TOGGLE_WORDS)
  const mentionsLight = containsAny(text, LIGHT_WORDS)
  const mentionsAll = containsAny(text, ALL_WORDS)
  const mentionsFridge = containsAny(text, FRIDGE_WORDS)

  // Fridge-specific
  if (mentionsFridge) {
    const fridge = matchEntity(entities, (e) =>
      e.attributes.device_class === 'contact' ||
      e.entityId.includes('fridge')
    )
    if (isOn || text.includes('打开')) {
      return {
        intent: { kind: 'turn_on', target: '冰箱门', entityId: fridge?.entityId },
        response: '打开冰箱门',
        confidence: 0.85,
      }
    }
    if (isOff || text.includes('关')) {
      return {
        intent: { kind: 'turn_off', target: '冰箱门', entityId: fridge?.entityId },
        response: '关闭冰箱门',
        confidence: 0.85,
      }
    }
    return {
      intent: { kind: 'toggle', target: '冰箱门', entityId: fridge?.entityId },
      response: '切换冰箱门状态',
      confidence: 0.7,
    }
  }

  // All lights on/off
  if (mentionsLight && mentionsAll) {
    if (isOn) {
      return {
        intent: { kind: 'turn_on', target: '所有灯' },
        response: '打开所有灯',
        confidence: 0.9,
      }
    }
    if (isOff) {
      return {
        intent: { kind: 'turn_off', target: '所有灯' },
        response: '关闭所有灯',
        confidence: 0.9,
      }
    }
  }

  // Room light
  if (mentionsLight) {
    const room = findRoomInText(text)
    const lightEntity = matchEntity(entities, (e) =>
      e.domain === 'light' &&
      (room === null || (e.attributes.room as string)?.toLowerCase() === room.toLowerCase())
    )

    const label = room ? `${room} 的灯` : (lightEntity?.name ?? '灯')

    if (isOn) {
      return {
        intent: { kind: 'turn_on', target: label, entityId: lightEntity?.entityId },
        response: `打开${label}`,
        confidence: lightEntity ? 0.9 : 0.6,
      }
    }
    if (isOff) {
      return {
        intent: { kind: 'turn_off', target: label, entityId: lightEntity?.entityId },
        response: `关闭${label}`,
        confidence: lightEntity ? 0.9 : 0.6,
      }
    }
    if (isToggle) {
      return {
        intent: { kind: 'toggle', target: label, entityId: lightEntity?.entityId },
        response: `切换${label}`,
        confidence: 0.8,
      }
    }
  }

  return {
    intent: { kind: 'unknown', text: rawText },
    response: `没听懂：${rawText}`,
    confidence: 0,
  }
}

/** Build a conversational answer for a query intent given live entity state */
export function answerQuery(
  intent: VoiceIntent,
  entities: Record<string, EntityState>
): string {
  const list = Object.values(entities)

  if (intent.kind === 'query_temperature') {
    const temps = list.filter(
      (e) => e.domain === 'sensor' && e.attributes.device_class === 'temperature'
    )
    if (temps.length === 0) return '没有温度传感器数据'
    const parts = temps.map((t) => `${t.name} ${parseFloat(t.state).toFixed(1)}度`)
    return '当前温度：' + parts.join('，')
  }

  if (intent.kind === 'query_humidity') {
    const hums = list.filter(
      (e) => e.domain === 'sensor' && e.attributes.device_class === 'humidity'
    )
    if (hums.length === 0) return '没有湿度传感器数据'
    const parts = hums.map((t) => `${t.name} 百分之${Math.round(parseFloat(t.state))}`)
    return '当前湿度：' + parts.join('，')
  }

  if (intent.kind === 'query_status') {
    const lights = list.filter((e) => e.domain === 'light')
    const onCount = lights.filter((e) => e.state === 'on').length
    const motions = list.filter(
      (e) => e.domain === 'binary_sensor' && e.attributes.device_class === 'motion' && e.state === 'on'
    )
    const parts: string[] = []
    parts.push(`${onCount} 盏灯亮着`)
    if (motions.length > 0) parts.push(`${motions.length} 处检测到动态`)
    else parts.push('家中静止')
    return parts.join('，')
  }

  return ''
}
