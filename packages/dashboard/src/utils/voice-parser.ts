import type { EntityState } from '../types'

export type VoiceIntent =
  | { readonly kind: 'turn_on'; readonly target: string; readonly entityId?: string }
  | { readonly kind: 'turn_off'; readonly target: string; readonly entityId?: string }
  | { readonly kind: 'toggle'; readonly target: string; readonly entityId?: string }
  | { readonly kind: 'set_brightness'; readonly target: string; readonly entityId?: string; readonly brightness: number }
  | { readonly kind: 'adjust_brightness'; readonly target: string; readonly entityId?: string; readonly delta: number }
  | { readonly kind: 'activate_scene'; readonly sceneName: string }
  | { readonly kind: 'query_temperature' }
  | { readonly kind: 'query_humidity' }
  | { readonly kind: 'query_status' }
  | { readonly kind: 'unknown'; readonly text: string }

export interface ConversationContext {
  /** Last entity the user referenced, used for pronoun resolution */
  readonly lastEntityId?: string
  /** Last entity's friendly name */
  readonly lastEntityName?: string
  /** Last entity's domain */
  readonly lastEntityDomain?: string
}

export interface ParsedCommand {
  readonly intent: VoiceIntent
  readonly response: string
  readonly confidence: number
  /** Updated context for next turn */
  readonly nextContext: ConversationContext
}

/** Words that refer back to the previous entity (pronouns) */
const PRONOUN_WORDS = ['它', '这个', '那个', '那盏', '这盏', 'it', 'that', 'this']

/** "brighter" modifiers that imply increasing brightness */
const BRIGHTER_WORDS = ['再亮', '更亮', '亮一点', '亮点', 'brighter', 'brighten', 'lighter']
/** "dimmer" modifiers */
const DIMMER_WORDS = ['再暗', '暗一点', '暗点', '更暗', 'dimmer', 'darker', 'darken']
/** Exact percentage phrases (百分之X, X percent, X%) */
const PERCENT_RE = /(\d{1,3})\s*(?:%|percent|百分之|趴)/i
const PERCENT_CN_RE = /百分之\s*(\d{1,3})/


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

/** Helpers for building a command result with an updated context */
function rememberEntity(
  entity: { entityId: string; name: string; domain: string } | undefined | null,
  prev: ConversationContext
): ConversationContext {
  if (!entity) return prev
  return {
    lastEntityId: entity.entityId,
    lastEntityName: entity.name,
    lastEntityDomain: entity.domain,
  }
}

type Lang = 'zh' | 'en'

/** English/Chinese-aware response builder */
function r(lang: Lang, en: string, zh: string): string {
  return lang === 'en' ? en : zh
}

export function parseVoiceCommand(
  rawText: string,
  entities: Record<string, EntityState>,
  context: ConversationContext = {},
  lang: Lang = 'zh'
): ParsedCommand {
  const text = norm(rawText)
  if (!text) {
    return {
      intent: { kind: 'unknown', text: rawText },
      response: '',
      confidence: 0,
      nextContext: context,
    }
  }

  // Scene activation - always clears context since scene touches many entities
  const sceneMatch = matchScene(text, lang)
  if (sceneMatch) {
    return {
      intent: { kind: 'activate_scene', sceneName: sceneMatch.name },
      response: sceneMatch.response,
      confidence: 0.95,
      nextContext: {}, // reset after scene
    }
  }

  // Queries don't change context
  if (text.includes('温度') || text.includes('多少度') || text.includes('temperature')) {
    return { intent: { kind: 'query_temperature' }, response: '', confidence: 0.9, nextContext: context }
  }
  if (text.includes('湿度') || text.includes('humidity')) {
    return { intent: { kind: 'query_humidity' }, response: '', confidence: 0.9, nextContext: context }
  }
  if (text.includes('状态') || text.includes('怎么样') || text.includes('status')) {
    return { intent: { kind: 'query_status' }, response: '', confidence: 0.8, nextContext: context }
  }

  const isOn = containsAny(text, ON_WORDS)
  const isOff = containsAny(text, OFF_WORDS)
  const isToggle = containsAny(text, TOGGLE_WORDS)
  const mentionsLight = containsAny(text, LIGHT_WORDS)
  const mentionsAll = containsAny(text, ALL_WORDS)
  const mentionsFridge = containsAny(text, FRIDGE_WORDS)
  const mentionsPronoun = containsAny(text, PRONOUN_WORDS)
  const mentionsBrighter = containsAny(text, BRIGHTER_WORDS)
  const mentionsDimmer = containsAny(text, DIMMER_WORDS)

  // --- Follow-up: brightness adjustments referring to the last light ---
  if ((mentionsBrighter || mentionsDimmer) && context.lastEntityId && context.lastEntityDomain === 'light') {
    const delta = mentionsBrighter ? 40 : -40
    return {
      intent: {
        kind: 'adjust_brightness',
        target: context.lastEntityName ?? '灯',
        entityId: context.lastEntityId,
        delta,
      },
      response: `${context.lastEntityName} ${mentionsBrighter ? '亮一点' : '暗一点'}`,
      confidence: 0.9,
      nextContext: context,
    }
  }

  // --- Set brightness to explicit percentage ---
  const pctMatch = text.match(PERCENT_RE) ?? text.match(PERCENT_CN_RE)
  if (pctMatch && mentionsLight) {
    const pct = Math.max(0, Math.min(100, parseInt(pctMatch[1], 10)))
    const room = findRoomInText(text)
    const lightEntity =
      matchEntity(
        entities,
        (e) =>
          e.domain === 'light' &&
          (room === null || ((e.attributes.room as string) ?? '').toLowerCase() === room.toLowerCase())
      ) ??
      (context.lastEntityDomain === 'light'
        ? (Object.values(entities).find((e) => e.entityId === context.lastEntityId) ?? null)
        : null)
    const label = lightEntity?.name ?? '灯'
    return {
      intent: {
        kind: 'set_brightness',
        target: label,
        entityId: lightEntity?.entityId,
        brightness: Math.round((pct / 100) * 255),
      },
      response: `${label} 亮度 ${pct}%`,
      confidence: lightEntity ? 0.9 : 0.6,
      nextContext: rememberEntity(lightEntity ?? undefined, context),
    }
  }

  // --- Pronoun resolution: "it/them/that" without explicit target ---
  if (mentionsPronoun && !mentionsLight && !mentionsFridge && !mentionsAll && context.lastEntityId) {
    if (isOn) {
      return {
        intent: { kind: 'turn_on', target: context.lastEntityName ?? '它', entityId: context.lastEntityId },
        response: `打开${context.lastEntityName}`,
        confidence: 0.85,
        nextContext: context,
      }
    }
    if (isOff) {
      return {
        intent: { kind: 'turn_off', target: context.lastEntityName ?? '它', entityId: context.lastEntityId },
        response: `关闭${context.lastEntityName}`,
        confidence: 0.85,
        nextContext: context,
      }
    }
    if (isToggle) {
      return {
        intent: { kind: 'toggle', target: context.lastEntityName ?? '它', entityId: context.lastEntityId },
        response: `切换${context.lastEntityName}`,
        confidence: 0.8,
        nextContext: context,
      }
    }
  }

  // --- Implicit follow-up: "关掉" / "打开" with NO target at all ---
  // If the previous turn referenced something, assume they mean that.
  const hasExplicitTarget = mentionsLight || mentionsFridge || mentionsAll
  if (!hasExplicitTarget && context.lastEntityId && (isOn || isOff || isToggle)) {
    const kind = isOn ? 'turn_on' : isOff ? 'turn_off' : 'toggle'
    return {
      intent: { kind, target: context.lastEntityName ?? '它', entityId: context.lastEntityId },
      response: `${kind === 'turn_on' ? '打开' : kind === 'turn_off' ? '关闭' : '切换'}${context.lastEntityName}`,
      confidence: 0.7,
      nextContext: context,
    }
  }

  // Fridge-specific
  if (mentionsFridge) {
    const fridge = matchEntity(
      entities,
      (e) => e.attributes.device_class === 'contact' || e.entityId.includes('fridge')
    )
    const fridgeLabel = fridge?.name ?? '冰箱门'
    const next = rememberEntity(fridge ?? undefined, context)
    if (isOn || text.includes('打开')) {
      return {
        intent: { kind: 'turn_on', target: fridgeLabel, entityId: fridge?.entityId },
        response: '打开' + fridgeLabel,
        confidence: 0.85,
        nextContext: next,
      }
    }
    if (isOff || text.includes('关')) {
      return {
        intent: { kind: 'turn_off', target: fridgeLabel, entityId: fridge?.entityId },
        response: '关闭' + fridgeLabel,
        confidence: 0.85,
        nextContext: next,
      }
    }
    return {
      intent: { kind: 'toggle', target: fridgeLabel, entityId: fridge?.entityId },
      response: '切换' + fridgeLabel,
      confidence: 0.7,
      nextContext: next,
    }
  }

  // All lights
  if (mentionsLight && mentionsAll) {
    if (isOn)
      return {
        intent: { kind: 'turn_on', target: '所有灯' },
        response: '打开所有灯',
        confidence: 0.9,
        nextContext: {}, // "all" is not a single entity
      }
    if (isOff)
      return {
        intent: { kind: 'turn_off', target: '所有灯' },
        response: '关闭所有灯',
        confidence: 0.9,
        nextContext: {},
      }
  }

  // Specific room light
  if (mentionsLight) {
    const room = findRoomInText(text)
    const lightEntity = matchEntity(
      entities,
      (e) =>
        e.domain === 'light' &&
        (room === null || ((e.attributes.room as string) ?? '').toLowerCase() === room.toLowerCase())
    )

    const label = lightEntity?.name ?? (room ? `${room} 的灯` : '灯')
    const next = rememberEntity(lightEntity ?? undefined, context)

    if (isOn) {
      return {
        intent: { kind: 'turn_on', target: label, entityId: lightEntity?.entityId },
        response: `打开${label}`,
        confidence: lightEntity ? 0.9 : 0.6,
        nextContext: next,
      }
    }
    if (isOff) {
      return {
        intent: { kind: 'turn_off', target: label, entityId: lightEntity?.entityId },
        response: `关闭${label}`,
        confidence: lightEntity ? 0.9 : 0.6,
        nextContext: next,
      }
    }
    if (isToggle) {
      return {
        intent: { kind: 'toggle', target: label, entityId: lightEntity?.entityId },
        response: `切换${label}`,
        confidence: 0.8,
        nextContext: next,
      }
    }
  }

  return {
    intent: { kind: 'unknown', text: rawText },
    response: `没听懂：${rawText}`,
    confidence: 0,
    nextContext: context,
  }
}

interface SceneMatch {
  readonly name: string
  readonly response: string
}

function matchScene(text: string, lang: Lang): SceneMatch | null {
  if (text.includes('晚安') || text.includes('good night') || text.includes('night mode'))
    return { name: 'Good Night', response: r(lang, 'Good night, switching to night mode', '晚安，切换到夜间模式') }
  if (text.includes('早安') || text.includes('早上好') || text.includes('good morning'))
    return { name: 'Good Morning', response: r(lang, 'Good morning! Starting morning scene', '早安！启动晨间场景') }
  if (text.includes('看电影') || text.includes('movie') || text.includes('电影模式'))
    return { name: 'Movie Time', response: r(lang, 'Switching to movie mode', '切换到观影模式') }
  if (text.includes('出门') || text.includes('离家') || text.includes('away'))
    return { name: 'Away', response: r(lang, 'Switching to away mode', '切换到离家模式') }
  return null
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
