export type EventType =
  | 'state_changed'
  | 'automation_triggered'
  | 'service_called'
  | 'device_discovered'
  | 'device_removed'
  | 'scene_activated'

export interface SmartHomeEvent<T = unknown> {
  readonly type: EventType
  readonly timestamp: string
  readonly data: T
}
