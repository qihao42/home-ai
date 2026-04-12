import { SimulatedDevice } from "../base-device.js";
import { fluctuate } from "../behaviors/fluctuator.js";
import type { DeviceConfig } from "../types.js";

interface HumidityState {
  readonly humidity: number;
  readonly unit: "%";
}

export class SimulatedHumiditySensor extends SimulatedDevice {
  private currentState: HumidityState;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Omit<DeviceConfig, "domain">, mqttUrl: string) {
    super({ ...config, domain: "sensor" }, mqttUrl);
    this.currentState = {
      humidity: 30 + Math.random() * 50,
      unit: "%",
    };
  }

  async start(): Promise<void> {
    await super.start();
    this.intervalId = setInterval(() => {
      this.currentState = {
        ...this.currentState,
        humidity: parseFloat(
          fluctuate(this.currentState.humidity, 30, 80, 1.0).toFixed(1)
        ),
      };
      this.publishState();
    }, 8000);
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
