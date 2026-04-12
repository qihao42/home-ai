import type { SceneStore } from '../scenes/scene-store.js'
import type { SceneExecutor } from '../scenes/scene-executor.js'

export interface MqttClientApi {
  publish(topic: string, payload: string): Promise<void>
}

export interface SceneDependencies {
  readonly sceneStore: SceneStore
  readonly sceneExecutor: SceneExecutor
}
