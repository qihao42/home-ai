export interface SceneEntityState {
  readonly entity_id: string
  readonly state: string
  readonly attributes?: Readonly<Record<string, unknown>>
}

export interface Scene {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly entities: readonly SceneEntityState[]
}
