import type { EntityDomain } from '../types/entity.js'

export const ENTITY_DOMAINS: readonly EntityDomain[] = [
  'light',
  'sensor',
  'switch',
  'climate',
  'binary_sensor',
] as const

export const ENTITY_DOMAIN_DISPLAY_NAMES: Readonly<Record<EntityDomain, string>> = {
  light: 'Light',
  sensor: 'Sensor',
  switch: 'Switch',
  climate: 'Climate',
  binary_sensor: 'Binary Sensor',
} as const

export const ENTITY_DOMAIN_ICONS: Readonly<Record<EntityDomain, string>> = {
  light: 'lightbulb',
  sensor: 'gauge',
  switch: 'toggle-left',
  climate: 'thermometer',
  binary_sensor: 'activity',
} as const
