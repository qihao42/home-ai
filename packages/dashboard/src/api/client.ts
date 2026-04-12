import type {
  EntityState,
  AutomationRule,
  HistoryEntry,
  Scene,
  ApiResponse,
} from '../types'

const BASE_URL = '/api'

interface RawEntityState {
  entity_id: string
  domain: string
  state: string
  attributes: Record<string, unknown>
  last_updated: string
  last_changed: string
}

export function mapEntity(raw: RawEntityState): EntityState {
  return {
    entityId: raw.entity_id,
    domain: raw.domain,
    name: (raw.attributes.friendly_name as string) ?? raw.entity_id.split('.').pop() ?? raw.entity_id,
    state: raw.state,
    attributes: raw.attributes,
    lastUpdated: raw.last_updated,
    lastChanged: raw.last_changed,
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(options?.headers as Record<string, string> ?? {}),
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} - ${errorBody}`
    )
  }

  const json: ApiResponse<T> = await response.json()

  if (!json.success) {
    throw new Error(json.error ?? 'Unknown API error')
  }

  return json.data as T
}

export async function fetchEntities(): Promise<EntityState[]> {
  const raw = await request<RawEntityState[]>('/entities')
  return raw.map(mapEntity)
}

export async function fetchEntity(id: string): Promise<EntityState> {
  return request<EntityState>(`/entities/${encodeURIComponent(id)}`)
}

export async function callService(
  domain: string,
  action: string,
  data: Record<string, unknown>
): Promise<void> {
  await request<void>(`/services/${domain}/${action}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function fetchAutomations(): Promise<AutomationRule[]> {
  return request<AutomationRule[]>('/automations')
}

export async function createAutomation(
  rule: Omit<AutomationRule, 'id'>
): Promise<AutomationRule> {
  return request<AutomationRule>('/automations', {
    method: 'POST',
    body: JSON.stringify(rule),
  })
}

export async function updateAutomation(
  id: string,
  rule: Partial<AutomationRule>
): Promise<AutomationRule> {
  return request<AutomationRule>(
    `/automations/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(rule),
    }
  )
}

export async function deleteAutomation(id: string): Promise<void> {
  await request<void>(`/automations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function triggerAutomation(id: string): Promise<void> {
  await request<void>(
    `/automations/${encodeURIComponent(id)}/trigger`,
    { method: 'POST' }
  )
}

export async function fetchScenes(): Promise<Scene[]> {
  return request<Scene[]>('/scenes')
}

export async function activateScene(sceneId: string): Promise<void> {
  await request<void>(
    `/scenes/${encodeURIComponent(sceneId)}/activate`,
    { method: 'POST' }
  )
}

export async function fetchHistory(
  entityId: string,
  limit?: number
): Promise<HistoryEntry[]> {
  const params = limit !== undefined ? `?limit=${limit}` : ''
  return request<HistoryEntry[]>(`/history/${encodeURIComponent(entityId)}${params}`)
}
