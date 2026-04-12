import { SimulatedDevice } from "../base-device.js";
import { fluctuate } from "../behaviors/fluctuator.js";
import type { DeviceConfig } from "../types.js";

interface TemperatureState {
  readonly temperature: number;
  readonly unit: "°C";
}

export class SimulatedTemperatureSensor extends SimulatedDevice {
  private currentState: TemperatureState;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Omit<DeviceConfig, "domain">, mqttUrl: string) {
    super({ ...config, domain: "sensor" }, mqttUrl);
    this.currentState = {
      temperature: 18 + Math.random() * 17,
      unit: "°C",
    };
  }

  async start(): Promise<void> {
    await super.start();
    this.intervalId = setInterval(() => {
      this.currentState = {
        ...this.currentState,
        temperature: parseFloat(
          fluctuate(this.currentState.temperature, 18, 35, 0.5).toFixed(1)
        ),
      };
      this.publishState();
    }, 5000);
  }

  async stop(): Promise<void> {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    await super.stop();
  }

  getState(): Record<string, unknown> {
    return { ...this.currentState };
  }

  handleCommand(_command: Record<string, unknown>): void {
    this.log("Read-only sensor, command ignored");
  }
}
