import Aedes from 'aedes'
import { createServer, type Server } from 'node:net'
import { createLogger } from '../core/logger.js'

const logger = createLogger('MqttBroker')

export interface BrokerHandle {
  readonly broker: Aedes
  readonly server: Server
}

let activeBroker: BrokerHandle | null = null

export function startBroker(port: number): Promise<BrokerHandle> {
  return new Promise((resolve, reject) => {
    const broker = new Aedes()
    const server = createServer(broker.handle)

    broker.on('client', (client) => {
      logger.info(`Client connected: ${client.id}`)
    })

    broker.on('clientDisconnect', (client) => {
      logger.info(`Client disconnected: ${client.id}`)
    })

    broker.on('clientError', (_client, error) => {
      logger.error('Client error', error.message)
    })

    server.listen(port, () => {
      logger.info(`MQTT broker listening on port ${port}`)
      const handle: BrokerHandle = Object.freeze({ broker, server })
      activeBroker = handle
      resolve(handle)
    })

    server.on('error', (error) => {
      logger.error('Broker server error', error.message)
      reject(error)
    })
  })
}

export function stopBroker(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (activeBroker === null) {
      resolve()
      return
    }

    const { broker, server } = activeBroker

    broker.close(() => {
      server.close((error) => {
        activeBroker = null
        if (error) {
          logger.error('Error stopping broker', error.message)
          reject(error)
        } else {
          logger.info('MQTT broker stopped')
          resolve()
        }
      })
    })
  })
}
