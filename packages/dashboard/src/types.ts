export interface EntityState {
  entityId: string
  domain: string
  name: string
  state: string
  attributes: Record<string, unknown>
  lastUpdated: string
  lastChanged: string
}

export interface AutomationTrigger {
  platform: 'state' | 'numeric_state' | 'time'
  entityId?: string
  from?: string
  to?: string
  above?: number
  below?: number
  at?: string
}

export interface AutomationCondition {
  type: 'state' | 'numeric_state' | 'time'
  entityId?: string
  state?: string
  above?: number
  below?: number
  after?: string
  before?: string
}

export interface AutomationAction {
  domain: string
  action: string
  entityId: string
  data?: Record<string, unknown>
}

export interface AutomationRule {
  id: string
  name: string
  enabled: boolean
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  lastTriggered?: string
}

export interface HistoryEntry {
  entityId: string
  state: string
  attributes: Record<string, unknown>
  timestamp: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

export interface WebSocketMessage {
  type: string
  data?: unknown
  entityId?: string
  state?: EntityState
}

export interface SceneEntityState {
  entityId: string
  state: string
  attributes?: Record<string, unknown>
}

export interface Scene {
  id: string
  name: string
  icon: string
  entities: SceneEntityState[]
}

export type PageId = 'dashboard' | 'devices' | 'scenes' | 'automations' | 'history'
