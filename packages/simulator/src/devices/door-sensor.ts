import { SimulatedDevice } from "../base-device.js";
import { createInterval } from "../behaviors/scheduler.js";
import type { DeviceConfig } from "../types.js";

interface DoorState {
  readonly contact: boolean;
}

export class SimulatedDoorSensor extends SimulatedDevice {
  private currentState: DoorState;
  private scheduler: { start(): void; stop(): void } | null = null;

  constructor(config: Omit<DeviceConfig, "domain">, mqttUrl: string) {
    super({ ...config, domain: "binary_sensor" }, mqttUrl);
    this.currentState = {
      contact: true,
    };
  }

  async start(): Promise<void> {
    await super.start();
    this.scheduler = createInterval(
      () => {
        this.currentState = { contact: !this.currentState.contact };
        this.log(`Door ${this.currentState.contact ? "closed" : "opened"}`);
        this.publishState();
      },
      30_000,
      120_000
    );
    this.scheduler.start();
  }

  async stop(): Promise<void> {
    if (this.scheduler) {
      this.scheduler.stop();
      this.scheduler = null;
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
