import mqtt from 'mqtt'
import type { IClientOptions, MqttClient as MqttLibClient } from 'mqtt'
import { createLogger } from '../core/logger.js'

const logger = createLogger('MqttClient')

type MessageHandler = (topic: string, payload: string) => void

export interface MqttClient {
  readonly subscribe: (topic: string) => Promise<void>
  readonly publish: (topic: string, payload: string) => Promise<void>
  readonly onMessage: (handler: MessageHandler) => void
  readonly disconnect: () => Promise<void>
}

export function createMqttClient(port: number): Promise<MqttClient> {
  return new Promise((resolve, reject) => {
    const options: IClientOptions = {
      clientId: `smarthome-internal-${Date.now()}`,
      clean: true,
    }

    const client: MqttLibClient = mqtt.connect(`mqtt://localhost:${String(port)}`, options)
    const handlers: MessageHandler[] = []

    client.on('connect', () => {
      logger.info(`Connected to MQTT broker on port ${String(port)}`)

      client.on('message', (topic, message) => {
        const payload = message.toString()
        for (const handler of handlers) {
          try {
            handler(topic, payload)
          } catch (error) {
            logger.error('Message handler error', { topic, error: String(error) })
          }
        }
      })

      const mqttClient: MqttClient = Object.freeze({
        subscribe(topic: string): Promise<void> {
          return new Promise((res, rej) => {
            client.subscribe(topic, (error) => {
              if (error) {
                logger.error(`Subscribe failed: ${topic}`, error.message)
                rej(error)
              } else {
                logger.info(`Subscribed to: ${topic}`)
                res()
              }
            })
          })
        },

        publish(topic: string, payload: string): Promise<void> {
          return new Promise((res, rej) => {
            client.publish(topic, payload, (error) => {
              if (error) {
                logger.error(`Publish failed: ${topic}`, error.message)
                rej(error)
              } else {
                res()
              }
            })
          })
        },

        onMessage(handler: MessageHandler): void {
          handlers.push(handler)
        },

        disconnect(): Promise<void> {
          return new Promise((res) => {
            client.end(false, () => {
              logger.info('MQTT client disconnected')
              res()
            })
          })
        },
      })

      resolve(mqttClient)
    })

    client.on('error', (error) => {
      logger.error('MQTT client error', error.message)
      reject(error)
    })
  })
}
