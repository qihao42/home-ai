export interface AutomationRule {
  readonly id: string
  readonly name: string
  readonly enabled: boolean
  readonly trigger: Trigger
  readonly conditions: readonly Condition[]
  readonly actions: readonly Action[]
}

export type Trigger = StateTrigger | NumericStateTrigger | TimeTrigger

export interface StateTrigger {
  readonly type: 'state'
  readonly entity_id: string
  readonly to?: string
  readonly from?: string
}

export interface NumericStateTrigger {
  readonly type: 'numeric_state'
  readonly entity_id: string
  readonly attribute: string
  readonly above?: number
  readonly below?: number
}

export interface TimeTrigger {
  readonly type: 'time'
  readonly at: string // HH:MM format
}

export type Condition =
  | StateCondition
  | NumericStateCondition
  | AndCondition
  | OrCondition

export interface StateCondition {
  readonly type: 'state'
  readonly entity_id: string
  readonly state: string
}

export interface NumericStateCondition {
  readonly type: 'numeric_state'
  readonly entity_id: string
  readonly attribute: string
  readonly above?: number
  readonly below?: number
}

export interface AndCondition {
  readonly type: 'and'
  readonly conditions: readonly Condition[]
}

export interface OrCondition {
  readonly type: 'or'
  readonly conditions: readonly Condition[]
}

export type Action = CallServiceAction | DelayAction

export interface CallServiceAction {
  readonly type: 'call_service'
  readonly domain: string
  readonly action: string
  readonly data: Readonly<Record<string, unknown>>
}

export interface DelayAction {
  readonly type: 'delay'
  readonly seconds: number
}
