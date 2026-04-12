import { z } from 'zod'

export const sceneEntityStateSchema = z.object({
  entity_id: z.string().min(1),
  state: z.string().min(1),
  attributes: z.record(z.unknown()).optional(),
})

export const sceneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  entities: z.array(sceneEntityStateSchema).readonly(),
})

export type SceneEntityStateSchema = z.infer<typeof sceneEntityStateSchema>
export type SceneSchema = z.infer<typeof sceneSchema>
