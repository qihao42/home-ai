import { z } from 'zod'

const configSchema = z.object({
  port: z.number().int().min(1).max(65535).default(3000),
  mqttPort: z.number().int().min(1).max(65535).default(1883),
  dbPath: z.string().default('./data/smarthome.db'),
  historyMaxAge: z.number().int().default(7 * 24 * 60 * 60 * 1000),
  historyBufferSize: z.number().int().default(100),
})

export type Config = z.infer<typeof configSchema>

export function loadConfig(): Config {
  return configSchema.parse({
    port: Number(process.env.PORT) || undefined,
    mqttPort: Number(process.env.MQTT_PORT) || undefined,
    dbPath: process.env.DB_PATH || undefined,
  })
}
