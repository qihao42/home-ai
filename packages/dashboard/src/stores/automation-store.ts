import { create } from 'zustand'
import type { AutomationRule } from '../types'
import {
  fetchAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  triggerAutomation,
} from '../api/client'

interface AutomationStore {
  automations: AutomationRule[]
  loading: boolean
  error: string | null
  fetchAll(): Promise<void>
  create(rule: Omit<AutomationRule, 'id'>): Promise<void>
  update(id: string, rule: Partial<AutomationRule>): Promise<void>
  remove(id: string): Promise<void>
  trigger(id: string): Promise<void>
}

export const useAutomationStore = create<AutomationStore>((set, get) => ({
  automations: [],
  loading: false,
  error: null,

  async fetchAll() {
    set({ loading: true, error: null })
    try {
      const automations = await fetchAutomations()
      set({ automations, loading: false })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch automations'
      set({ error: message, loading: false })
    }
  },

  async create(rule) {
    try {
      const created = await createAutomation(rule)
      set((prev) => ({
        automations: [...prev.automations, created],
      }))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create automation'
      set({ error: message })
      throw err
    }
  },

  async update(id, rule) {
    try {
      const updated = await updateAutomation(id, rule)
      set((prev) => ({
        automations: prev.automations.map((a) =>
          a.id === id ? updated : a
        ),
      }))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update automation'
      set({ error: message })
      throw err
    }
  },

  async remove(id) {
    try {
      await deleteAutomation(id)
      set((prev) => ({
        automations: prev.automations.filter((a) => a.id !== id),
      }))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete automation'
      set({ error: message })
      throw err
    }
  },

  async trigger(id) {
    try {
      await triggerAutomation(id)
      const { automations } = get()
      set({
        automations: automations.map((a) =>
          a.id === id
            ? { ...a, lastTriggered: new Date().toISOString() }
            : a
        ),
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to trigger automation'
      set({ error: message })
      throw err
    }
  },
}))
