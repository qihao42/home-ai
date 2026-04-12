import EventEmitter from 'eventemitter3'
import type { StateChangedEvent } from '@smarthome/shared'
import type { DeviceConfig } from '@smarthome/shared'

export interface AutomationTriggeredEvent {
  readonly automation_id: string
  readonly trigger_data: Readonly<Record<string, unknown>>
}

export interface ServiceCalledEvent {
  readonly domain: string
  readonly action: string
  readonly data: Readonly<Record<string, unknown>>
}

export interface DeviceDiscoveredEvent {
  readonly device_id: string
  readonly domain: string
  readonly config: Readonly<DeviceConfig>
}

export interface DeviceRemovedEvent {
  readonly device_id: string
}

export interface SceneActivatedEvent {
  readonly scene_id: string
  readonly scene_name: string
}

export interface EventMap {
  state_changed: [StateChangedEvent]
  automation_triggered: [AutomationTriggeredEvent]
  service_called: [ServiceCalledEvent]
  device_discovered: [DeviceDiscoveredEvent]
  device_removed: [DeviceRemovedEvent]
  scene_activated: [SceneActivatedEvent]
}

export class EventBus {
  private readonly emitter: EventEmitter<EventMap>

  constructor() {
    this.emitter = new EventEmitter<EventMap>()
  }

  on<K extends keyof EventMap>(
    event: K,
    listener: (...args: EventMap[K]) => void,
  ): void {
    this.emitter.on(event, listener)
  }

  off<K extends keyof EventMap>(
    event: K,
    listener: (...args: EventMap[K]) => void,
  ): void {
    this.emitter.off(event, listener)
  }

  emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]): void {
    const frozenArgs = args.map((arg) =>
      Object.freeze({ ...arg }),
    ) as unknown as EventMap[K]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(this.emitter.emit as any)(event, ...frozenArgs)
  }
}
