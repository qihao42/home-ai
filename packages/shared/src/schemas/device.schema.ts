import { z } from 'zod'
import { entityDomainSchema } from './entity.schema.js'

export const deviceCapabilitySchema = z.enum([
  'toggle',
  'brightness',
  'color',
  'temperature',
  'humidity',
  'motion',
  'contact',
  'hvac_mode',
  'target_temperature',
])

export const deviceConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  domain: entityDomainSchema,
  room: z.string().min(1),
  capabilities: z.array(deviceCapabilitySchema).readonly().optional().default([]),
})

export type DeviceCapabilitySchema = z.infer<typeof deviceCapabilitySchema>
export type DeviceConfigSchema = z.infer<typeof deviceConfigSchema>
