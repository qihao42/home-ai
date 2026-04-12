import type { EntityDomain } from './entity.js'

export interface DeviceConfig {
  readonly id: string
  readonly name: string
  readonly domain: EntityDomain
  readonly room: string
  readonly capabilities: readonly DeviceCapability[]
}

export type DeviceCapability =
  | 'toggle'
  | 'brightness'
  | 'color'
  | 'temperature'
  | 'humidity'
  | 'motion'
  | 'contact'
  | 'hvac_mode'
  | 'target_temperature'
