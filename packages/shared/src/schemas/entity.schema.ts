import { z } from 'zod'

export const entityDomainSchema = z.enum([
  'light',
  'sensor',
  'switch',
  'climate',
  'binary_sensor',
])

export const entityStateSchema = z.object({
  entity_id: z.string().min(1),
  domain: entityDomainSchema,
  state: z.string(),
  attributes: z.record(z.unknown()),
  last_changed: z.string().datetime(),
  last_updated: z.string().datetime(),
})

export const stateChangedEventSchema = z.object({
  entity_id: z.string().min(1),
  old_state: entityStateSchema.nullable(),
  new_state: entityStateSchema,
})

export type EntityDomainSchema = z.infer<typeof entityDomainSchema>
export type EntityStateSchema = z.infer<typeof entityStateSchema>
export type StateChangedEventSchema = z.infer<typeof stateChangedEventSchema>
