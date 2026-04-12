export interface MqttClientApi {
  publish(topic: string, payload: string): Promise<void>
}
