import mqtt, { type MqttClient } from "mqtt";
import type { DeviceConfig } from "./types.js";

export abstract class SimulatedDevice {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly room: string;
  protected mqttClient: MqttClient | null = null;
  private readonly mqttUrl: string;

  constructor(config: DeviceConfig, mqttUrl: string) {
    this.id = config.id;
    this.name = config.name;
    this.domain = config.domain;
    this.room = config.room;
    this.mqttUrl = mqttUrl;
  }

  async start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.mqttClient = mqtt.connect(this.mqttUrl, {
          clientId: `simulator_${this.id}`,
          clean: true,
        });

        this.mqttClient.on("connect", () => {
          this.log("Connected to MQTT broker");

          const configTopic = `smarthome/${this.domain}/${this.id}/config`;
          const configPayload = JSON.stringify({
            id: this.id,
            name: this.name,
            domain: this.domain,
            room: this.room,
          });
          this.mqttClient!.publish(configTopic, configPayload, { retain: true });

          this.publishState();

          const commandTopic = `smarthome/${this.domain}/${this.id}/set`;
          this.mqttClient!.subscribe(commandTopic, (err) => {
            if (err) {
              this.log(`Failed to subscribe to ${commandTopic}: ${err.message}`);
              reject(err);
              return;
            }
            this.log(`Subscribed to ${commandTopic}`);
            resolve();
          });

          this.mqttClient!.on("message", (_topic: string, message: Buffer) => {
            try {
              const command = JSON.parse(message.toString()) as Record<string, unknown>;
              this.handleCommand(command);
            } catch (error) {
              this.log(`Failed to parse command: ${error}`);
            }
          });
        });

        this.mqttClient.on("error", (err) => {
          this.log(`MQTT error: ${err.message}`);
          reject(err);
        });
      } catch (error) {
        this.log(`Failed to start: ${error}`);
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    if (this.mqttClient) {
      return new Promise<void>((resolve) => {
        this.log("Disconnecting from MQTT broker");
        this.mqttClient!.end(false, () => {
          this.mqttClient = null;
          resolve();
        });
      });
    }
  }

  abstract getState(): Record<string, unknown>;

  abstract handleCommand(command: Record<string, unknown>): void;

  protected publishState(): void {
    if (!this.mqttClient) {
      return;
    }
    const topic = `smarthome/${this.domain}/${this.id}/state`;
    const payload = JSON.stringify(this.getState());
    this.mqttClient.publish(topic, payload);
  }

  protected log(msg: string): void {
    const timestamp = new Date().toISOString();
    process.stdout.write(`[${timestamp}] [${this.name}] ${msg}\n`);
  }
}
