import { z } from 'zod'

// --- Triggers ---

export const stateTriggerSchema = z.object({
  type: z.literal('state'),
  entity_id: z.string().min(1),
  to: z.string().optional(),
  from: z.string().optional(),
})

export const numericStateTriggerSchema = z.object({
  type: z.literal('numeric_state'),
  entity_id: z.string().min(1),
  attribute: z.string().min(1),
  above: z.number().optional(),
  below: z.number().optional(),
})

export const timeTriggerSchema = z.object({
  type: z.literal('time'),
  at: z.string().regex(/^\d{2}:\d{2}$/, 'Must be in HH:MM format'),
})

export const triggerSchema = z.discriminatedUnion('type', [
  stateTriggerSchema,
  numericStateTriggerSchema,
  timeTriggerSchema,
])

// --- Conditions ---

export const stateConditionSchema = z.object({
  type: z.literal('state'),
  entity_id: z.string().min(1),
  state: z.string(),
})

export const numericStateConditionSchema = z.object({
  type: z.literal('numeric_state'),
  entity_id: z.string().min(1),
  attribute: z.string().min(1),
  above: z.number().optional(),
  below: z.number().optional(),
})

// For recursive and/or conditions, use lazy evaluation
export const conditionSchema: z.ZodType = z.lazy(() =>
  z.discriminatedUnion('type', [
    stateConditionSchema,
    numericStateConditionSchema,
    z.object({
      type: z.literal('and'),
      conditions: z.array(conditionSchema).readonly(),
    }),
    z.object({
      type: z.literal('or'),
      conditions: z.array(conditionSchema).readonly(),
    }),
  ])
)

// --- Actions ---

export const callServiceActionSchema = z.object({
  type: z.literal('call_service'),
  domain: z.string().min(1),
  action: z.string().min(1),
  data: z.record(z.unknown()),
})

export const delayActionSchema = z.object({
  type: z.literal('delay'),
  seconds: z.number().int().min(0),
})

export const actionSchema = z.discriminatedUnion('type', [
  callServiceActionSchema,
  delayActionSchema,
])

// --- Automation Rule ---

export const automationRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  enabled: z.boolean(),
  trigger: triggerSchema,
  conditions: z.array(conditionSchema).readonly(),
  actions: z.array(actionSchema).readonly(),
})

// --- Inferred types ---

export type StateTriggerSchema = z.infer<typeof stateTriggerSchema>
export type NumericStateTriggerSchema = z.infer<typeof numericStateTriggerSchema>
export type TimeTriggerSchema = z.infer<typeof timeTriggerSchema>
export type TriggerSchema = z.infer<typeof triggerSchema>
export type StateConditionSchema = z.infer<typeof stateConditionSchema>
export type NumericStateConditionSchema = z.infer<typeof numericStateConditionSchema>
export type CallServiceActionSchema = z.infer<typeof callServiceActionSchema>
export type DelayActionSchema = z.infer<typeof delayActionSchema>
export type ActionSchema = z.infer<typeof actionSchema>
export type AutomationRuleSchema = z.infer<typeof automationRuleSchema>
